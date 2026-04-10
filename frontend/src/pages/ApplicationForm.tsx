// pages/ApplicationForm.tsx
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { WaybillNewPage } from './WaybillNewPage';
import { createDocument } from '../services/api';
import { getApplicationsFromTemplates } from '../services/api';

interface ApplicationFormProps {
  onBack: () => void;
  onLogout: () => void;
  userName?: string;
  userId?: number;
}

interface Template {
  filename: string;
  name: string;
  type: string;
  fields: FieldConfig[];
  html_content: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  validation?: string;
  required: boolean;
}

// Данные для передачи в накладную
interface WaybillTransferData {
  template: Template;
  formData: Record<string, any>;
  option: string;
  waybillType: string;
}

export function ApplicationForm({ onBack, onLogout, userName, userId }: ApplicationFormProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [showWaybillNew, setShowWaybillNew] = useState(false);
  const [printStyleModalOpen, setPrintStyleModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'gu12' | 'gu114'>('gu12');
  const [waybillTransferData, setWaybillTransferData] = useState<WaybillTransferData | null>(null);

  // Загрузка шаблонов заявок
  useEffect(() => {
    loadApplicationTemplates();
  }, []);

  // Валидация в реальном времени
  useEffect(() => {
    if (selectedTemplate) {
      const errors: Record<string, string> = {};
      selectedTemplate.fields.forEach(field => {
        const error = validateField(field, formData[field.key]);
        if (error) errors[field.key] = error;
      });
      setFieldErrors(errors);
    }
  }, [formData, selectedTemplate]);

  const loadApplicationTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getApplicationsFromTemplates();
      if (response && response.success) {
        const applicationsData = response.applications || [];
        setTemplates(applicationsData);
        if (applicationsData.length > 0) {
          setSelectedTemplate(applicationsData[0]);
          const initialData: Record<string, any> = {};
          applicationsData[0].fields.forEach((field: FieldConfig) => {
            initialData[field.key] = '';
          });
          setFormData(initialData);
        }
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
      alert('Ошибка загрузки списка заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (filename: string) => {
    const template = templates.find(t => t.filename === filename);
    if (template) {
      setSelectedTemplate(template);
      const newFormData: Record<string, any> = {};
      template.fields.forEach(field => {
        newFormData[field.key] = '';
      });
      setFormData(newFormData);
      setFieldErrors({});
    }
  };

  // ========== ВАЛИДАЦИЯ ==========
  const validateField = (field: FieldConfig, value: any): string => {
    const strValue = String(value ?? '').trim();
    if (!strValue) return `Поле "${field.label}" обязательно для заполнения`;

    if (field.type === 'date') {
      const date = new Date(value);
      if (isNaN(date.getTime())) return `Поле "${field.label}" должно содержать корректную дату`;
      const minDate = new Date(1900, 0, 1);
      if (date < minDate) return 'Дата не может быть раньше 01.01.1900';
    }

    if (field.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return `Поле "${field.label}" должно быть числом`;
      if (num <= 0) return `Поле "${field.label}" должно быть больше 0`;
      if (field.key === 'weight' && num > 100000) return 'Вес не может превышать 100000 т';
      if (field.key === 'distance' && num > 20000) return 'Расстояние не может превышать 20000 км';
    }

    if (field.key.toLowerCase().includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(strValue)) return `Поле "${field.label}" должно содержать корректный email`;
    }

    if (field.key.toLowerCase().includes('phone') || field.key.toLowerCase().includes('tel')) {
      const phoneRegex = /^[\d\s\+\(\)\-]{10,20}$/;
      if (!phoneRegex.test(strValue)) return `Поле "${field.label}" должно содержать корректный номер телефона`;
    }

    if (strValue.length > 255) return `Поле "${field.label}" не может быть длиннее 255 символов`;

    return '';
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldBlur = (field: FieldConfig, value: any) => {
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field.key]: error }));
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate) return false;
    const errors: Record<string, string> = {};
    let hasErrors = false;
    selectedTemplate.fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        errors[field.key] = error;
        hasErrors = true;
      }
    });
    setFieldErrors(errors);
    return !hasErrors;
  };

  const hasErrors = Object.values(fieldErrors).some(error => error && error.length > 0);

  // Сохранение заявки
  const handleSave = async () => {
    if (!selectedTemplate) {
      alert('Выберите тип заявки');
      return;
    }
    if (!validateForm()) {
      const errorMessages = Object.values(fieldErrors).join('\n');
      alert(`Пожалуйста, исправьте ошибки:\n${errorMessages}`);
      return;
    }
    try {
      await createDocument(1, {
        ...formData,
        template_name: selectedTemplate.filename,
        document_type_name: selectedTemplate.name,
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      alert('✅ Документ успешно сохранён!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении документа');
    }
  };

  // ========== ПЕЧАТЬ ==========
  const generatePrintHtml = (style: 'gu12' | 'gu114') => {
    if (!selectedTemplate) return '';
    const docName = selectedTemplate.name;
    const fieldsHtml = selectedTemplate.fields
      .map(field => {
        const value = formData[field.key];
        if (!value) return '';
        const displayValue = field.type === 'date' ? new Date(value).toLocaleDateString('ru-RU') : value;
        return `<div class="info-row"><div class="info-label">${field.label}:</div><div class="info-value">${displayValue}</div></div>`;
      })
      .join('');
    const styleGu12 = `.header { border-bottom-color: #2860F0; }`;
    const styleGu114 = `.header { border-bottom-color: #E36756; background: #fff0ee; }`;
    const activeStyle = style === 'gu12' ? styleGu12 : styleGu114;
    return `<!DOCTYPE html>
    <html><head><title>${docName}</title><meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Times New Roman', Georgia, serif; background: white; padding: 40px; }
      .document { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { text-align: center; padding: 30px; border-bottom: 2px solid #2860F0; }
      .header h1 { font-size: 24px; text-transform: uppercase; }
      .header .date { font-size: 12px; color: #999; margin-top: 10px; }
      .content { padding: 30px; }
      .info-row { display: flex; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e0e0e0; }
      .info-label { width: 200px; font-weight: 600; }
      .info-value { flex: 1; }
      .stamp { margin-top: 30px; display: flex; justify-content: space-between; }
      .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 5px; }
      .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
      ${activeStyle}
    </style>
    </head><body>
    <div class="document"><div class="header"><h1>${docName}</h1><div class="date">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div></div>
    <div class="content">${fieldsHtml || '<p>Нет данных</p>'}
    <div class="stamp"><div><div>М.П.</div><div class="signature-line"></div><div>Подпись отправителя</div></div>
    <div><div>М.П.</div><div class="signature-line"></div><div>Подпись перевозчика</div></div></div></div>
    <div class="footer">Система электронного документооборота "Documentob Diplom"</div>
    </div>
    <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
    </body></html>`;
  };

  const handlePrintWithStyle = (style: 'gu12' | 'gu114') => {
    if (hasErrors) {
      alert('Пожалуйста, исправьте ошибки в форме перед печатью');
      return;
    }
    const printHtml = generatePrintHtml(style);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      alert('Разрешите всплывающие окна');
    }
    setPrintStyleModalOpen(false);
  };

  // ========== ПЕРЕХОД В НАКЛАДНУЮ ==========
  const canGoToWaybill = (template: Template | null): boolean => {
    if (!template) return false;
    const allowed = ['gu12', 'gu13'];
    const filename = template.filename.toLowerCase();
    return allowed.some(code => filename.includes(code));
  };

  const handleOpenWaybillModal = () => {
    if (hasErrors) {
      alert('Пожалуйста, исправьте ошибки в форме перед переходом к накладной');
      return;
    }
    setShowWaybillModal(true);
  };

  const handleCloseWaybillModal = () => setShowWaybillModal(false);

  const handleConfirmWaybill = () => {
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    if (selectedTemplate) {
      setWaybillTransferData({
        template: selectedTemplate,
        formData: formData,
        option: 'gu12',       // по умолчанию, при желании можно вынести в выбор пользователя
        waybillType: '90',
      });
    }
    setShowWaybillModal(false);
    setShowWaybillNew(true);
  };

  const handleBackFromWaybillNew = () => {
    setShowWaybillNew(false);
    setWaybillTransferData(null);
  };

  // ========== РЕНДЕР ПОЛЯ ==========
  const renderField = (field: FieldConfig) => {
    const value = formData[field.key] || '';
    const error = fieldErrors[field.key];
    const baseClass = `w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] text-black ${
      error ? 'border-red-500' : 'border-[#919191]'
    }`;
    return (
      <div key={field.key}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} <span className="text-red-500">*</span>
        </label>
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field, value)}
            rows={3}
            className={baseClass}
          />
        ) : field.type === 'date' ? (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field, value)}
            className={baseClass}
          />
        ) : field.type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field, value)}
            className={baseClass}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field, value)}
            className={baseClass}
          />
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  // ========== ПРЕДПРОСМОТР ДОКУМЕНТА ==========
  const DocumentPreview = () => {
    if (!selectedTemplate) return null;
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 font-serif">
        <div className="text-center border-b-2 border-[#2860F0] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">{selectedTemplate.name}</h2>
        </div>
        <div className="space-y-3">
          {selectedTemplate.fields.map((field) => {
            const value = formData[field.key];
            if (!value) return null;
            return (
              <div key={field.key} className="flex py-2 border-b border-dashed border-gray-200">
                <div className="w-40 font-semibold text-gray-700">{field.label}:</div>
                <div className="flex-1 text-gray-800">
                  {field.type === 'date' ? new Date(value).toLocaleDateString('ru-RU') : value}
                </div>
              </div>
            );
          })}
          {selectedTemplate.fields.every(f => !formData[f.key]) && (
            <div className="text-center text-gray-400 py-4">Заполните поля формы</div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex justify-between px-4">
            <div className="text-center"><div className="text-xs text-gray-500">М.П.</div><div className="w-32 h-px bg-gray-400 mt-1"></div><div className="text-xs text-gray-500 mt-1">Подпись отправителя</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">М.П.</div><div className="w-32 h-px bg-gray-400 mt-1"></div><div className="text-xs text-gray-500 mt-1">Подпись перевозчика</div></div>
          </div>
        </div>
      </div>
    );
  };

  // ========== УСЛОВНЫЕ РЕНДЕРЫ ==========
  if (showWaybillNew) {
    return (
      <WaybillNewPage
        onBack={handleBackFromWaybillNew}
        onLogout={onLogout}
        userId={userId || 1}
        fromApplication={true}
        userName={userName}
        initialWaybillData={waybillTransferData || undefined}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2860F0] mb-4"></div>
          <p className="text-gray-600">Загрузка форм документов...</p>
        </div>
      </div>
    );
  }

  // ========== ОСНОВНОЙ РЕНДЕР ==========
  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize={true} userName={userName} title="Оформление заявки на перевозку грузов" />

      <div className="absolute top-4 right-6 z-10 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          В начало
        </button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>

      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3ABC96] text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          ✅ Данные сохранены!
        </div>
      )}

      {/* Модальное окно выбора печатной формы */}
      {printStyleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[450px] rounded-2xl shadow-xl p-6" style={{ backgroundColor: '#6990F5', border: '1px solid #C9D9FF' }}>
            <div className="-mt-6 -mx-6 mb-4 px-6 py-3 rounded-t-2xl" style={{ backgroundColor: '#C9D9FF' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#2860F0' }}>Выберите печатную форму</h3>
            </div>
            <div className="space-y-3 text-black">
              <label className="flex items-center gap-2">
                <input type="radio" name="printStyle" value="gu12" checked={selectedStyle === 'gu12'} onChange={() => setSelectedStyle('gu12')} />
                <span>ГУ-12 (стандартная форма)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="printStyle" value="gu114" checked={selectedStyle === 'gu114'} onChange={() => setSelectedStyle('gu114')} />
                <span>ГУ-114 (альтернативная форма)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handlePrintWithStyle(selectedStyle)} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg border border-white">Принять</button>
              <button onClick={() => setPrintStyleModalOpen(false)} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg border border-white">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно предупреждения перед переходом в накладную */}
      {showWaybillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[450px] bg-[#8778C3] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3"><h3 className="text-lg font-semibold text-gray-800">Внимание!</h3></div>
            <div className="p-6"><p className="text-white text-center">Вы переходите к заполнению накладной – после перехода заявку распечатать будет невозможно</p></div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleConfirmWaybill} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg">Принять</button>
              <button onClick={handleCloseWaybillModal} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент: форма + предпросмотр */}
      <div className="pt-[37px] px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        {/* Левая колонка – форма */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Оформление документа</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа *</label>
              <select
                value={selectedTemplate?.filename || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                {templates.map(template => (
                  <option key={template.filename} value={template.filename}>{template.name}</option>
                ))}
              </select>
              {templates.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Нет доступных шаблонов. Добавьте HTML-файлы в папку public/templates/</p>
              )}
            </div>
            {selectedTemplate && selectedTemplate.fields.map(field => renderField(field))}
          </div>
        </div>

        {/* Правая колонка – предпросмотр */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Предварительный просмотр документа</h3>
            <p className="text-xs text-gray-600">Данные обновляются автоматически при вводе</p>
          </div>
          <div className="flex-1 bg-[#EFECF9] rounded-b-lg p-4 overflow-y-auto">
            <DocumentPreview />
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              disabled={hasErrors}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                hasErrors ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#4475F7] hover:bg-[#3662d9] text-white'
              }`}
            >
              💾 Сохранить
            </button>
            <button
              onClick={() => setPrintStyleModalOpen(true)}
              disabled={hasErrors}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                hasErrors ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#2860F0] hover:bg-[#1e4bc2] text-white'
              }`}
            >
              🖨️ Печать
            </button>
            {/* Кнопка «В накладную» показывается только для ГУ‑12 и ГУ‑13 */}
            {canGoToWaybill(selectedTemplate) && (
              <button
                onClick={handleOpenWaybillModal}
                disabled={hasErrors}
                className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                  hasErrors ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#7C5CFC] hover:bg-[#6a48e8] text-white'
                }`}
              >
                📄 В накладную
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}