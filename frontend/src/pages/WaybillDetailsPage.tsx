import { useState, useRef, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { saveWaybillData, printWaybill } from '../services/api';

interface WaybillDetailsPageProps {
  onBack: () => void;
  onLogout: () => void;
  applicationType: string;
  waybillType: string;
  formType: string;
  waybillId: number;
 
  fieldsConfig: Array<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
  formData: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
}

export function WaybillDetailsPage({ 
  onBack, 
  onLogout, 
  applicationType, 
  waybillType, 
  formType,
  waybillId,
  fieldsConfig,
  formData: externalFormData,
  onFormDataChange
}: WaybillDetailsPageProps) {
 
  const [localFormData, setLocalFormData] = useState<Record<string, any>>(externalFormData);
  const [showNotification, setShowNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
 
  const [selectedSection, setSelectedSection] = useState('Основные сведения');
  
 
  const sectionOptions = ['Основные сведения', 'Отправитель', 'Получатель', 'Перевозка'];
  
  const getFieldsForSection = (section: string) => {
   
    return fieldsConfig;
  };

  useEffect(() => {
    
    setLocalFormData(externalFormData);
  }, [externalFormData]);

  const handleFieldChange = (key: string, value: any) => {
    const newData = { ...localFormData, [key]: value };
    setLocalFormData(newData);
    if (onFormDataChange) onFormDataChange(newData);
  };

  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveData = {
        formData: localFormData,
        formType,
        applicationType,
        waybillType,
      };
      await saveWaybillData(waybillId, saveData);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
    }
  };

  
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const { html } = await printWaybill(waybillId);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.onafterprint = () => printWindow.close();
        };
      }
    } catch (error) {
      console.error('Ошибка печати:', error);
      alert('Ошибка при печати документа');
    } finally {
      setIsPrinting(false);
    }
  };

  
  const DocumentPreview = () => {
    // Берём только заполненные поля
    const filledFields = fieldsConfig.filter(field => {
      const value = localFormData[field.key];
      return value !== undefined && value !== null && value !== '';
    });

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 font-serif">
        <div className="text-center border-b-2 border-[#2860F0] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">НАКЛАДНАЯ НА ПЕРЕВОЗКУ ГРУЗА</h2>
          <p className="text-gray-500 text-sm mt-1">{formType}</p>
        </div>
        <div className="space-y-3">
          {filledFields.map((field) => (
            <div key={field.key} className="flex py-2 border-b border-dashed border-gray-200">
              <div className="w-40 font-semibold text-gray-700">{field.label}:</div>
              <div className="flex-1 text-gray-800">
                {field.type === 'date' && localFormData[field.key]
                  ? new Date(localFormData[field.key]).toLocaleDateString('ru-RU')
                  : localFormData[field.key]}
              </div>
            </div>
          ))}
          {filledFields.length === 0 && (
            <div className="text-center text-gray-400 py-4">Заполните поля формы</div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex justify-between px-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">М.П.</div>
              <div className="w-32 h-px bg-gray-400 mt-1"></div>
              <div className="text-xs text-gray-500 mt-1">Подпись отправителя</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">М.П.</div>
              <div className="w-32 h-px bg-gray-400 mt-1"></div>
              <div className="text-xs text-gray-500 mt-1">Подпись перевозчика</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  const renderFields = () => {
    const fieldsToShow = getFieldsForSection(selectedSection);
    return (
      <div className="space-y-4">
        {fieldsToShow.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={localFormData[field.key] || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
            />
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
   
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3ABC96] text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          ✅ Данные сохранены!
        </div>
      )}
      
      <div className="absolute top-4 left-6 z-10">
        <button onClick={onBack} className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </button>
      </div>

      <div className="absolute top-4 right-6 z-10">
        <button onClick={onLogout} className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg shadow-md">
          Выход
        </button>
      </div>

      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        {/* Левая колонка - поля формы */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Заполнение данных
          </h2>
          <div className="space-y-4">
           
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Раздел</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg"
              >
                {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div> */}
            {renderFields()}
          </div>
        </div>
        
        {/* Правая колонка - предпросмотр (как в заявке) */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Предварительный просмотр документа</h3>
            <p className="text-xs text-gray-600">Данные обновляются автоматически при вводе</p>
          </div>
          <div className="flex-1 bg-[#EFECF9] rounded-b-lg p-4 overflow-y-auto">
            <DocumentPreview />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
              {isSaving ? 'Сохранение...' : '💾 Сохранить'}
            </button>
            <button onClick={handlePrint} disabled={isPrinting} className="flex-1 py-3 bg-[#2860F0] hover:bg-[#1e4bc2] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
              {isPrinting ? 'Подготовка...' : '🖨️ Печать'}
            </button>
            <button onClick={() => console.log('В накладную')} className="flex-1 py-3 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg transition-colors">
              📄 В накладную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}