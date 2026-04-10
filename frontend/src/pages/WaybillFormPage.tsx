import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { createDocument, getDocumentTypes } from '../services/api';

interface WaybillFormProps {
  onBack: () => void;
  onLogout: () => void;
  userId: number;
  option: string;
  type: string;
  form: string;
  fieldsConfig: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  htmlTemplate: string;
  initialData?: Record<string, any>;
}

export function WaybillForm({
  onBack,
  onLogout,
  userId,
  option,
  type,
  form,
  fieldsConfig,
  htmlTemplate,
  initialData = {},
}: WaybillFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [printFormModalOpen, setPrintFormModalOpen] = useState(false);
  const [selectedPrintForm, setSelectedPrintForm] = useState<'gu12' | 'gu114'>('gu12');

  useEffect(() => {
    const initial: Record<string, any> = {};
    fieldsConfig.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      } else if (initialData && initialData[field.key] !== undefined) {
        initial[field.key] = initialData[field.key];
      } else {
        initial[field.key] = '';
      }
    });
    setFormData(initial);
    validateAllFields(initial);
  }, [fieldsConfig, initialData]);

  const validateField = (field: any, value: any): string => {
    const strValue = String(value ?? '').trim();
    if (field.required && !strValue) {
      return `Поле "${field.label}" обязательно для заполнения`;
    }
    if (!strValue) return '';

    if (field.type === 'date' || field.type === 'datetime-local') {
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Введите корректную дату';
      const minDate = new Date(1900, 0, 1);
      if (date < minDate) return 'Дата не может быть раньше 01.01.1900';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) return 'Дата не может быть позже сегодняшнего дня';
      return '';
    }

    if (field.type === 'number') {
      if (isNaN(Number(value))) return 'Введите число';
      if (Number(value) < 0) return 'Значение не может быть отрицательным';
      if (field.key === 'weight' && Number(value) > 100000) return 'Вес не может превышать 100000 т';
      if (field.key === 'distance' && Number(value) > 20000) return 'Расстояние не может превышать 20000 км';
      return '';
    }

    if (strValue.length > 255) return 'Превышена максимальная длина (255 символов)';
    return '';
  };

  const validateAllFields = (data: Record<string, any>) => {
    const errors: Record<string, string> = {};
    fieldsConfig.forEach(field => {
      if (field.type === 'hidden') return;
      const error = validateField(field, data[field.key]);
      if (error) errors[field.key] = error;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = () => validateAllFields(formData);

  const validateFieldOnBlur = (field: any, value: any) => {
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field.key]: error }));
  };

  const handleFieldChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    setFieldErrors(prev => ({ ...prev, [key]: '' }));
  };

  const hasErrors = Object.values(fieldErrors).some(error => error && error.length > 0);

  const renderTemplate = (template: string, data: Record<string, any>) => {
    let html = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const value = data[key] !== undefined && data[key] !== null ? String(data[key]) : '—';
      html = html.replace(regex, value);
    });
    html = html.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
      return data[key] ? content : '';
    });
    return html;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    const visibleRequired = fieldsConfig.filter(f => f.required && f.type !== 'hidden');
    const missing = visibleRequired.filter(f => !formData[f.key]);
    if (missing.length > 0) {
      alert(`Заполните обязательные поля:\n${missing.map(f => f.label).join('\n')}`);
      return;
    }
    setIsSaving(true);
    try {
      const types = await getDocumentTypes();
      const typeCode = `waybill_${form}`;
      const docType = types.find(t => t.code === typeCode);
      if (!docType) throw new Error(`Тип документа ${typeCode} не найден`);
      await createDocument(docType.id, formData);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка при сохранении накладной');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPrintModal = () => setPrintFormModalOpen(true);
  const handleClosePrintModal = () => setPrintFormModalOpen(false);

  const handlePrintWithForm = (printForm: 'gu12' | 'gu114') => {
    const visibleFields = fieldsConfig.filter(f => f.type !== 'hidden');
    const filledFields = visibleFields.filter(field => {
      const value = formData[field.key];
      return value !== undefined && value !== null && value !== '';
    });
    const filledFieldsHtml = filledFields.map(field => `
      <div class="info-row">
        <div class="info-label">${field.label}:</div>
        <div class="info-value">${field.type === 'date' ? new Date(formData[field.key]).toLocaleDateString('ru-RU') : formData[field.key]}</div>
      </div>
    `).join('');

    const customStyle = printForm === 'gu12'
      ? `/* ГУ-12 стиль */
        .document { border-color: #2860F0; }
        .header { background: #f0f4ff; }
      `
      : `/* ГУ-114 стиль */
        .document { border-color: #E36756; }
        .header { background: #fff0ee; }
      `;

    const docName = `Накладная на перевозку груза (${printForm === 'gu12' ? 'ГУ-12' : 'ГУ-114'})`;

    const printHtml = `
      <!DOCTYPE html>
      <html><head><title>${docName}</title><meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', 'Georgia', serif; background: white; padding: 40px; margin: 0; }
        .document { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 30px 30px 20px; border-bottom: 2px solid #2860F0; }
        .header h1 { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .header .date { font-size: 12px; color: #999; margin-top: 10px; }
        .content { padding: 30px; }
        .info-row { display: flex; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e0e0e0; }
        .info-label { width: 200px; font-weight: 600; }
        .info-value { flex: 1; }
        .stamp { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 11px; color: #999; }
        ${customStyle}
      </style>
      </head><body>
      <div class="document">
        <div class="header">
          <h1>${docName}</h1>
          <div class="date">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
        <div class="content">
          ${filledFieldsHtml}
          <div class="stamp">
            <div><div>М.П.</div><div class="signature-line"></div><div>Подпись отправителя</div></div>
            <div><div>М.П.</div><div class="signature-line"></div><div>Подпись перевозчика</div></div>
          </div>
        </div>
        <div class="footer">Настоящий документ является официальным и имеет юридическую силу<br>Система электронного документооборота "Documentob Diplom"</div>
      </div>
      <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
    }
    setPrintFormModalOpen(false);
  };

  const DocumentPreview = () => {
    const formNames: Record<string, string> = {
      wagon: 'Накладная на перевозку груза (повагонная)',
      group: 'Накладная на перевозку груза (групповая)',
      container: 'Накладная на перевозку груза (контейнерная)',
      container_set: 'Накладная на перевозку груза (контейнерная комплектом)',
    };
    const docName = formNames[form] || 'Накладная на перевозку груза';
    const visibleFields = fieldsConfig.filter(f => f.type !== 'hidden');
    const filledFields = visibleFields.filter(field => {
      const value = formData[field.key];
      return value !== undefined && value !== null && value !== '';
    });
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 font-serif">
        <div className="text-center border-b-2 border-[#2860F0] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">{docName}</h2>
        </div>
        <div className="space-y-3">
          {filledFields.map((field) => (
            <div key={field.key} className="flex py-2 border-b border-dashed border-gray-200">
              <div className="w-48 font-semibold text-gray-700">{field.label}:</div>
              <div className="flex-1 text-gray-800">
                {field.type === 'date' ? (formData[field.key] ? new Date(formData[field.key]).toLocaleDateString('ru-RU') : '—') : (formData[field.key] || '—')}
              </div>
            </div>
          ))}
          {filledFields.length === 0 && <div className="text-center text-gray-400 py-4">Заполните поля формы</div>}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex justify-between px-4">
            <div className="text-center"><div className="text-xs text-gray-500">М.П.</div><div className="w-32 h-px bg-gray-400 mt-1"></div><div className="text-xs text-gray-500 mt-1">Подпись отправителя</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">М.П.</div><div className="w-32 h-px bg-gray-400 mt-1"></div><div className="text-xs text-gray-500 mt-1">Подпись перевозчика</div></div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">Документ сформирован автоматически</div>
      </div>
    );
  };

  const visibleFields = fieldsConfig.filter(f => f.type !== 'hidden');

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      <div className="hidden" id="print-content">
        {visibleFields.filter(field => {
          const value = formData[field.key];
          return value !== undefined && value !== null && value !== '';
        }).map((field) => (
          <div key={field.key} className="info-row">
            <div className="info-label">{field.label}:</div>
            <div className="info-value">{field.type === 'date' ? (formData[field.key] ? new Date(formData[field.key]).toLocaleDateString('ru-RU') : '—') : (formData[field.key] || '—')}</div>
          </div>
        ))}
      </div>
      <div className="absolute top-4 left-6 z-10">
        <button onClick={onBack} className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Назад</button>
      </div>
      <div className="absolute top-4 right-6 z-10">
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>
      {showNotification && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3ABC96] text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">✅ Накладная сохранена!</div>}
      {printFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[450px] bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Выберите печатную форму</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="printForm"
                  value="gu12"
                  checked={selectedPrintForm === 'gu12'}
                  onChange={() => setSelectedPrintForm('gu12')}
                />
                <span>ГУ-12 (стандартная форма)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="printForm"
                  value="gu114"
                  checked={selectedPrintForm === 'gu114'}
                  onChange={() => setSelectedPrintForm('gu114')}
                />
                <span>ГУ-114 (альтернативная форма)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handlePrintWithForm(selectedPrintForm)}
                className="flex-1 py-2 bg-green-600 text-white rounded"
              >
                Принять
              </button>
              <button
                onClick={() => setPrintFormModalOpen(false)}
                className="flex-1 py-2 bg-red-600 text-white rounded"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Заполнение накладной</h2>
          <div className="space-y-4">
            {visibleFields.map((field) => {
              const error = fieldErrors[field.key];
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      onBlur={() => validateFieldOnBlur(field, formData[field.key])}
                      rows={3}
                      className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] text-black ${
                        error ? 'border-red-500' : 'border-[#919191]'
                      }`}
                    />
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      onBlur={() => validateFieldOnBlur(field, formData[field.key])}
                      className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] text-black ${
                        error ? 'border-red-500' : 'border-[#919191]'
                      }`}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      onBlur={() => validateFieldOnBlur(field, formData[field.key])}
                      className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] text-black ${
                        error ? 'border-red-500' : 'border-[#919191]'
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      onBlur={() => validateFieldOnBlur(field, formData[field.key])}
                      className={`w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg focus:outline-none focus:shadow-[0_0_10px_0_#3300FF] text-black ${
                        error ? 'border-red-500' : 'border-[#919191]'
                      }`}
                    />
                  )}
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg"><h3 className="font-semibold text-gray-800">Предварительный просмотр документа</h3><p className="text-xs text-gray-600">Данные обновляются автоматически при вводе</p></div>
          <div ref={printRef} className="flex-1 bg-[#EFECF9] rounded-b-lg p-4 overflow-y-auto"><DocumentPreview /></div>
          <div className="flex gap-4 mt-4">
            <button onClick={handleSave} disabled={hasErrors || isSaving} className="flex-1 py-3 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">{isSaving ? 'Сохранение...' : '💾 Сохранить'}</button>
            <button onClick={handleOpenPrintModal} disabled={hasErrors} className="flex-1 py-3 bg-[#2860F0] hover:bg-[#1e4bc2] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">🖨️ Печать</button>
          </div>
        </div>
      </div>
    </div>
  );
}