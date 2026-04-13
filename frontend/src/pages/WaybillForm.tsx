// pages/WaybillForm.tsx
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { createDocument } from '../services/api';

interface WaybillFormProps {
  onBack: () => void;
  onLogout: () => void;
  userId: number;
  option: string;
  type: string;
  form: string;
  documentTypeId: number;   // ← добавить
  fieldsConfig: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    validation?: string;
    defaultValue?: any;
  }>;
  htmlTemplate: string;
  initialData?: Record<string, any>;
  userName?: string;
}

export function WaybillForm({
  onBack,
  onLogout,
  userId,
  option,
  type,
  form,
  documentTypeId,
  fieldsConfig,
  htmlTemplate,
  initialData = {},
  userName,
}: WaybillFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, any> = {};
    fieldsConfig.forEach(field => {
      if (initialData && initialData[field.key] !== undefined && initialData[field.key] !== '') {
        initial[field.key] = initialData[field.key];
      } else if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      } else {
        initial[field.key] = '';
      }
    });
    setFormData(initial);
  }, [fieldsConfig, initialData]);

  useEffect(() => {
    const errors: Record<string, string> = {};
    fieldsConfig.forEach(field => {
      if (field.type === 'hidden') return;
      const error = validateField(field, formData[field.key]);
      if (error) errors[field.key] = error;
    });
    setFieldErrors(errors);
  }, [formData]);

  const validateField = (field: any, value: any): string => {
    const strValue = String(value ?? '').trim();
    if (!strValue) return `Поле "${field.label}" обязательно для заполнения`;
    if (field.type === 'date' || field.key.toLowerCase().includes('date')) {
      const date = new Date(value);
      if (isNaN(date.getTime())) return `Поле "${field.label}" должно содержать корректную дату`;
    }
    if (field.type === 'number' || ['weight', 'count', 'distance'].some(k => field.key.includes(k))) {
      const num = Number(value);
      if (isNaN(num)) return `Поле "${field.label}" должно быть числом`;
      if (num <= 0) return `Поле "${field.label}" должно быть больше 0`;
    }
    return '';
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;
    fieldsConfig.forEach(field => {
      if (field.type === 'hidden') return;
      const error = validateField(field, formData[field.key]);
      if (error) {
        errors[field.key] = error;
        hasErrors = true;
      }
    });
    setFieldErrors(errors);
    if (hasErrors) {
      alert('Пожалуйста, исправьте ошибки в форме');
      return false;
    }
    return true;
  };

  const hasErrors = Object.values(fieldErrors).some(error => error && error.length > 0);

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      await createDocument(documentTypeId, formData);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      alert('✅ Накладная успешно сохранена!');
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка при сохранении накладной');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const visibleFields = fieldsConfig.filter(f => f.type !== 'hidden');
    const filledFieldsHtml = visibleFields
      .filter(field => formData[field.key])
      .map(field => `
        <div class="info-row">
          <div class="info-label">${field.label}:</div>
          <div class="info-value">${formData[field.key]}</div>
        </div>
      `).join('');
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Накладная</title><meta charset="UTF-8"></head>
        <body>
          <div class="document">
            <div class="header"><h1>Накладная на перевозку груза</h1></div>
            <div class="content">${filledFieldsHtml}</div>
          </div>
          <script>window.print();window.close();<\/script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key] || '';
    const error = fieldErrors[field.key];
    const baseClass = `w-full px-4 py-2 bg-[#E4E0FF] border rounded-lg text-black ${
      error ? 'border-red-500' : 'border-[#919191]'
    }`;
    return (
      <div key={field.key}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} <span className="text-red-500">*</span>
        </label>
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={baseClass}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar hideMinimize={true} userName={userName} title="Заполнение накладной" />
      <div className="absolute top-4 right-6 z-10 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 bg-[#3ABC96] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md">Назад</button>
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">Выход</button>
      </div>
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3ABC96] text-white px-6 py-3 rounded-lg shadow-lg">
          ✅ Накладная сохранена!
        </div>
      )}
      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Заполнение накладной</h2>
          <div className="space-y-4">
            {fieldsConfig.filter(f => f.type !== 'hidden').map(field => renderField(field))}
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Предварительный просмотр</h3>
          </div>
          <div className="flex-1 bg-[#EFECF9] rounded-b-lg p-4 overflow-y-auto">
            <div className=" rounded-lg shadow-lg p-6">
              {fieldsConfig.filter(f => f.type !== 'hidden').map(field => (
                <div key={field.key} className="flex py-2 border-b border-dashed">
                  <div className="w-40 font-semibold">{field.label}:</div>
                  <div className="flex-1">{formData[field.key] || '—'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={handleSave} disabled={hasErrors || isSaving} className="flex-1 py-3 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg">
              {isSaving ? 'Сохранение...' : '💾 Сохранить'}
            </button>
            <button onClick={handlePrint} disabled={hasErrors} className="flex-1 py-3 bg-[#2860F0] hover:bg-[#1e4bc2] disabled:bg-gray-400 text-white font-medium rounded-lg">
              🖨️ Печать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}