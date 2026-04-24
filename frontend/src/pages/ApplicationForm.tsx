// pages/ApplicationForm.tsx
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { WaybillNewPage } from './WaybillNewPage';
import { createDocument } from '../services/api';

interface ApplicationFormProps {
  onBack: () => void;
  onLogout: () => void;
  userName?: string;
  userId?: number;
}

interface Template {
  id: number;
  filename: string;
  name: string;
  type: 'application' | 'waybill';
  fields: FieldConfig[];
  html_content?: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

// Функция для получения CSRF токена (если нужно)
function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) {
    return meta.getAttribute('content') || '';
  }
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return '';
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return headers;
}

function renderTemplate(html: string, data: Record<string, any>, filename: string): string {
  let result = html;
  result = result.replace(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:;([^}]*))?\s*}}/g, (_, key) => {
    const value = data[key];
    if (value === undefined || value === null) return '';
    if (key.toLowerCase().includes('date') && value) {
      try { return new Date(value).toLocaleDateString('ru-RU'); } catch { return String(value); }
    }
    return String(value);
  });
  result = result.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return data[key] ? content : '';
  });
  const originalStyles = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi)?.join('\n') || '';
  const bodyMatch = result.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : result;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body, div, section, table, tr, td, th, h1, h2, h3, p, span, input, button {
      all: revert;
    }
    body {
      margin: 0;
      padding: 20px;
      background: white;
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 14px;
      color: black;
      line-height: 1.4;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
    }
    td, th {
      border: 1px solid black;
      padding: 4px 8px;
      vertical-align: top;
    }
    th {
      font-weight: bold;
      background: #f5f5f5;
    }
    ${originalStyles}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

export function ApplicationForm({ onBack, onLogout, userName, userId }: ApplicationFormProps) {
  const [applications, setApplications] = useState<Template[]>([]);
  const [waybills, setWaybills] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [templateHtml, setTemplateHtml] = useState('');
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [showWaybillNew, setShowWaybillNew] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const loadAllTemplates = async () => {
    setIsLoading(true);
    try {
      // Получаем ВСЕ шаблоны (уже с id из БД)
      const response = await fetch('/templates/list', {
        headers: getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      
      const allTemplates = await response.json();
      
      const apps: Template[] = [];
      const wbs: Template[] = [];
      
      for (const template of allTemplates) {
        if (template.type === 'application') {
          apps.push(template);
        } else {
          wbs.push(template);
        }
      }
      
      setApplications(apps);
      setWaybills(wbs);
      
      const all = [...apps, ...wbs];
      if (all.length > 0) {
        setSelected(all[0]);
        const initial: Record<string, any> = {};
        all[0].fields.forEach((f: FieldConfig) => { initial[f.key] = ''; });
        setFormData(initial);
        if (all[0].html_content) {
          setTemplateHtml(all[0].html_content);
        } else {
          loadHtml(all[0].filename);
        }
        setFormKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Ошибка загрузки шаблонов:', err);
      alert('Не удалось загрузить список шаблонов. Проверьте соединение с сервером.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHtml = async (filename: string) => {
    try {
      const res = await fetch(`/templates/${filename}`);
      if (res.ok) setTemplateHtml(await res.text());
      else setTemplateHtml('<p>Шаблон не найден</p>');
    } catch (e) {
      setTemplateHtml('<p>Ошибка загрузки шаблона</p>');
    }
  };

  const handleSelect = (template: Template) => {
    setSelected(template);
    const initial: Record<string, any> = {};
    template.fields.forEach(f => { initial[f.key] = ''; });
    setFormData(initial);
    setErrors({});
    if (template.html_content) {
      setTemplateHtml(template.html_content);
    } else {
      loadHtml(template.filename);
    }
    setFormKey(prev => prev + 1);
  };

  const validate = () => {
    if (!selected) return false;
    const newErrors: Record<string, string> = {};
    let hasError = false;
    selected.fields.forEach(f => {
      const val = formData[f.key];
      if (f.required && (!val || String(val).trim() === '')) {
        newErrors[f.key] = `Поле "${f.label}" обязательно`;
        hasError = true;
      } else if (f.type === 'date' && val && isNaN(new Date(val).getTime())) {
        newErrors[f.key] = 'Некорректная дата';
        hasError = true;
      } else if (f.type === 'number' && val && isNaN(Number(val))) {
        newErrors[f.key] = 'Введите число';
        hasError = true;
      }
    });
    setErrors(newErrors);
    return !hasError;
  };

 const handleSave = async () => {
  if (!selected) return;
  if (!validate()) {
    alert('Исправьте ошибки в форме');
    return;
  }
  if (!selected.id) {
    alert('Тип документа не зарегистрирован в системе. Обратитесь к администратору.');
    return;
  }
  
  // Фильтруем ТОЛЬКО те поля, которые есть в selected.fields
  const filteredFormData: Record<string, any> = {};
  selected.fields.forEach(field => {
    if (formData[field.key] !== undefined && formData[field.key] !== null && formData[field.key] !== '') {
      filteredFormData[field.key] = formData[field.key];
    }
  });
  
  try {
    await createDocument(selected.id, {
      ...filteredFormData,
      template_name: selected.filename,
      document_type_name: selected.name,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    alert('✅ Документ сохранён');
  } catch (err) {
    console.error(err);
    alert('Ошибка сохранения');
  }
};
  useEffect(() => {
    if (!selected || !templateHtml || !iframeRef.current) return;
    const rendered = renderTemplate(templateHtml, formData, selected.filename);
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(rendered);
      doc.close();
    }
  }, [formData, templateHtml, selected]);

  const renderField = (field: FieldConfig) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];
    return (
      <div key={field.key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
          className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">Загрузка форм документов...</div>
      </div>
    );
  }

  if (showWaybillNew) {
    return (
      <WaybillNewPage
        onBack={() => setShowWaybillNew(false)}
        onLogout={onLogout}
        userId={userId || 1}
        fromApplication
        userName={userName}
      />
    );
  }

  const allTemplates = [...applications, ...waybills];

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize userName={userName} title="Оформление заявки на перевозку грузов" />
      <div className="absolute top-4 right-6 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] text-white rounded">В начало</button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] text-white rounded">Выход</button>
      </div>
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow animate-pulse z-50">
          ✅ Данные сохранены!
        </div>
      )}
      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Оформление документа</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Тип документа *</label>
            <select
              value={selected?.filename || ''}
              onChange={e => {
                const filename = e.target.value;
                const tpl = allTemplates.find(t => t.filename === filename);
                if (tpl) handleSelect(tpl);
              }}
              className="w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg"
            >
              <optgroup label="📋 ЗАЯВКИ">
                {applications.map(t => (
                  <option key={t.filename} value={t.filename}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📄 НАКЛАДНЫЕ">
                {waybills.map(t => (
                  <option key={t.filename} value={t.filename}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div key={formKey} className="space-y-4">
            {selected?.fields.map(renderField)}
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg">
            <h3 className="font-semibold">Предварительный просмотр документа</h3>
            <p className="text-xs text-gray-600">Данные обновляются автоматически при вводе</p>
          </div>
          <div className="flex-1 bg-white rounded-b-lg overflow-hidden">
            <iframe ref={iframeRef} title="preview" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={handleSave} className="flex-1 py-3 bg-[#4475F7] text-white rounded">💾 Сохранить</button>
            <button
              onClick={() => alert('Печать будет доступна после сохранения')}
              className="flex-1 py-3 bg-[#2860F0] text-white rounded"
            >
              🖨️ Печать
            </button>
            {selected?.type === 'application' && waybills.length > 0 && (
              <button
                onClick={() => setShowWaybillModal(true)}
                className="flex-1 py-3 bg-[#7C5CFC] text-white rounded"
              >
                📄 В накладную
              </button>
            )}
          </div>
        </div>
      </div>

      {showWaybillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[450px] bg-[#8778C3] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white text-center mb-4">Внимание!</h3>
            <p className="text-white text-center mb-6">Вы переходите к заполнению накладной</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWaybillModal(false);
                  setShowWaybillNew(true);
                }}
                className="flex-1 py-2 bg-[#3ABC96] text-white rounded"
              >
                Принять
              </button>
              <button onClick={() => setShowWaybillModal(false)} className="flex-1 py-2 bg-[#E36756] text-white rounded">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}