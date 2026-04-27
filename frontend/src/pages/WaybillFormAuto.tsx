// pages/WaybillFormAuto.tsx
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { createDocument } from '../services/api';

interface WaybillFormAutoProps {
  onBack: () => void;
  onLogout: () => void;
  userId: number;
  userName?: string;
}

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

function renderCombinedTemplate(
  waybillHtml: string,
  sourceData: Record<string, any>,
  extraFields: Record<string, any>
): string {
  let result = waybillHtml;

  // Замена плейсхолдеров
  result = result.replace(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:;([^}]*))?\s*}}/g, (_, key) => {
    const value = sourceData[key];
    if (value === undefined || value === null) return '';
    if (key.toLowerCase().includes('date') && value) {
      try { return new Date(value).toLocaleDateString('ru-RU'); } catch { return String(value); }
    }
    return String(value);
  });

  // Условные блоки
  result = result.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return sourceData[key] ? content : '';
  });

  // Добавляем дополнительные поля в конец body
  const extraFieldsHtml = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #2860F0; font-family: 'Times New Roman', serif;">
      <h4 style="text-align: center; margin-bottom: 15px;">Дополнительные сведения</h4>
      <div style="display: flex; margin-bottom: 8px;">
        <div style="width: 200px; font-weight: bold;">Тип накладной:</div>
        <div style="flex: 1;">${extraFields.waybillType || ''}</div>
      </div>
      <div style="display: flex; margin-bottom: 8px;">
        <div style="width: 200px; font-weight: bold;">Основание:</div>
        <div style="flex: 1;">${extraFields.sourceName || ''}</div>
      </div>
    </div>
  `;

  // Проверяем, есть ли тег </body>
  if (result.includes('</body>')) {
    result = result.replace('</body>', extraFieldsHtml + '</body>');
  } else {
    // Если нет </body>, добавляем в конец
    result = result + extraFieldsHtml;
  }

  return result;
}

function extractFieldsFromHtml(html: string): any[] {
  const pattern = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:;([^}]*))?\s*}}/g;
  const fieldsMap = new Map();
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const key = match[1];
    const label = match[2]?.trim() || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (!fieldsMap.has(key)) {
      fieldsMap.set(key, { key, label, type: detectFieldType(key), required: true });
    }
  }
  return Array.from(fieldsMap.values());
}

function detectFieldType(key: string): string {
  const k = key.toLowerCase();
  if (k.includes('date')) return 'date';
  if (k.includes('weight') || k.includes('count') || k.includes('sum')) return 'number';
  return 'text';
}

export function WaybillFormAuto({ onBack, onLogout, userId, userName }: WaybillFormAutoProps) {
  const [waybillHtml, setWaybillHtml] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [extraFields, setExtraFields] = useState<Record<string, any>>({});
  const [documentTypeId, setDocumentTypeId] = useState(0);
  const [documentName, setDocumentName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const params = new URLSearchParams(window.location.search);
      const waybillFile = params.get('waybillFile');
      const waybillType = params.get('waybillType') || '';
      const sourceName = params.get('sourceName') || 'Заявка';
      const sourceDataStr = params.get('sourceData') || '{}';
      
      let sourceData = {};
      try {
        sourceData = JSON.parse(decodeURIComponent(sourceDataStr));
      } catch(e) {
        console.error('Ошибка парсинга sourceData:', e);
      }
      
      setExtraFields({
        waybillType: waybillType,
        sourceName: sourceName,
      });
      setFormData(sourceData);
      setDocumentName(`Накладная (${sourceName})`);
      
      if (waybillFile) {
        try {
          const res = await fetch(`/templates/${waybillFile}`);
          if (res.ok) {
            const html = await res.text();
            setWaybillHtml(html);
            const extractedFields = extractFieldsFromHtml(html);
            setFields(extractedFields);
            
            // Автоматическое получение или создание типа документа
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            let docName = titleMatch ? titleMatch[1] : '';
            if (!docName) {
              const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              docName = h1Match ? h1Match[1] : waybillFile.replace('.html', '').replace(/_/g, ' ');
            }
            
            const typesRes = await fetch(`/document-types`, { credentials: 'include' });
            const types = await typesRes.json();
            
            let foundType = types.find((t: any) => t.name === docName);
            
            if (!foundType) {
              const createRes = await fetch(`/document-types`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                  code: `waybill_${Date.now()}`,
                  name: docName,
                  html_template: waybillFile,
                  fields_config: null,
                })
              });
              if (createRes.ok) {
                const newType = await createRes.json();
                setDocumentTypeId(newType.id);
                console.log(`✅ Создан новый тип документа: ${docName} (ID: ${newType.id})`);
              } else {
                setDocumentTypeId(1);
              }
            } else {
              setDocumentTypeId(foundType.id);
              console.log(`✅ Найден существующий тип документа: ${docName} (ID: ${foundType.id})`);
            }
          } else {
            alert('Ошибка: шаблон накладной не найден');
            window.location.href = '/dashboard';
            return;
          }
        } catch (err) {
          console.error('Ошибка загрузки шаблона:', err);
          alert('Ошибка загрузки шаблона накладной');
          window.location.href = '/dashboard';
          return;
        }
      } else {
        alert('Ошибка: не указан файл накладной');
        window.location.href = '/dashboard';
        return;
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!waybillHtml) return;
    console.log('🎨 Рендерим шаблон с доп. полями:', extraFields);
    const rendered = renderCombinedTemplate(waybillHtml, formData, extraFields);
    console.log('📄 Готовый HTML длина:', rendered.length);
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(rendered);
        doc.close();
      }
    }
  }, [waybillHtml, formData, extraFields]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const val = formData[field.key];
      if (field.required && (!val || String(val).trim() === '')) {
        newErrors[field.key] = `Поле "${field.label}" обязательно`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Исправьте ошибки в форме');
      return;
    }
    if (!documentTypeId) {
      alert('Тип документа не найден в системе');
      return;
    }

    try {
      await createDocument(documentTypeId, {
        ...formData,
        ...extraFields,
        document_name: documentName,
        source_application_name: extraFields.sourceName,
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      alert('✅ Накладная сохранена!');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];
    return (
      <div key={field.key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} <span className="text-red-500">*</span>
        </label>
        <input
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={e => handleFieldChange(field.key, e.target.value)}
          className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">Загрузка формы накладной...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize userName={userName} title="Оформление накладной" />
      <div className="absolute top-4 right-6 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] text-white rounded">Назад</button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] text-white rounded">Выход</button>
      </div>

      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow animate-pulse z-50">
          ✅ Накладная сохранена!
        </div>
      )}

      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Заполнение накладной</h2>
          <p className="text-sm text-gray-500 mb-4">
            Документ будет сохранён как: <span className="font-semibold">{documentName}</span>
          </p>
          {fields.map(renderField)}
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
            <button onClick={handleSave} className="flex-1 py-3 bg-[#4475F7] text-white rounded">💾 Сохранить накладную</button>
          </div>
        </div>
      </div>
    </div>
  );
}