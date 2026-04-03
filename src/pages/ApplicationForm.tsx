import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { WaybillFormPage } from './WaybillFormPage';

interface ApplicationFormProps {
  onBack: () => void;
  onLogout: () => void;
}

// Типы документов
const documentTypes = [
  { id: 'gu12', name: 'Заявка на перевозку грузов ГУ-12' },
  { id: 'gu13', name: 'Распоряжение о внутрихозяйственных перевозках ГУ-13' },
  { id: 'gu27', name: 'Требование на перемещение порожнего вагона ГУ-27' },
  { id: 'gu45', name: 'Памятка приемосдатчика ГУ-45' },
];

// Конфигурация полей для каждого типа документа
const fieldsConfig: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string }>> = {
  gu12: [
    { key: 'registrationDate', label: 'Дата регистрации', type: 'date' },
    { key: 'carrierName', label: 'Наименование перевозчика', type: 'text', placeholder: 'Введите наименование перевозчика' },
    { key: 'stationDeparture', label: 'Станция отправления', type: 'text', placeholder: 'Введите станцию отправления' },
    { key: 'destinationStation', label: 'Станция назначения', type: 'text', placeholder: 'Введите станцию назначения' },
    { key: 'cargoName', label: 'Наименование груза', type: 'text', placeholder: 'Введите наименование груза' },
    { key: 'weight', label: 'Вес груза (тонн)', type: 'number', placeholder: '0' },
    { key: 'wagonCount', label: 'Количество вагонов', type: 'number', placeholder: '0' },
  ],
  gu13: [
    { key: 'orderNumber', label: 'Номер распоряжения', type: 'text', placeholder: 'Введите номер' },
    { key: 'orderDate', label: 'Дата распоряжения', type: 'date' },
    { key: 'sender', label: 'Отправитель', type: 'text', placeholder: 'Введите отправителя' },
    { key: 'receiver', label: 'Получатель', type: 'text', placeholder: 'Введите получателя' },
    { key: 'cargoName', label: 'Наименование груза', type: 'text', placeholder: 'Введите наименование груза' },
  ],
  gu27: [
    { key: 'wagonNumber', label: 'Номер вагона', type: 'text', placeholder: 'Введите номер вагона' },
    { key: 'wagonType', label: 'Род вагона', type: 'text', placeholder: 'Введите род вагона' },
    { key: 'loadCapacity', label: 'Грузоподъемность', type: 'number', placeholder: '0' },
    { key: 'departureStation', label: 'Станция отправления', type: 'text', placeholder: 'Введите станцию отправления' },
    { key: 'arrivalStation', label: 'Станция прибытия', type: 'text', placeholder: 'Введите станцию прибытия' },
    { key: 'distance', label: 'Расстояние (км)', type: 'number', placeholder: '0' },
  ],
  gu45: [
    { key: 'documentNumber', label: 'Номер документа', type: 'text', placeholder: 'Введите номер' },
    { key: 'documentDate', label: 'Дата документа', type: 'date' },
    { key: 'senderName', label: 'Наименование отправителя', type: 'text', placeholder: 'Введите отправителя' },
    { key: 'receiverName', label: 'Наименование получателя', type: 'text', placeholder: 'Введите получателя' },
    { key: 'cargoDescription', label: 'Описание груза', type: 'textarea', placeholder: 'Введите описание груза' },
  ],
};

export function ApplicationForm({ onBack, onLogout }: ApplicationFormProps) {
  // Состояния
  const [selectedDocType, setSelectedDocType] = useState('gu12');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [showWaybillForm, setShowWaybillForm] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Загрузка сохранённых данных
  useEffect(() => {
    const saved = localStorage.getItem('applicationForm');
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedDocType(data.selectedDocType || 'gu12');
      setFormData(data.formData || {});
    }
  }, []);

  // Сохранение данных
  const handleSave = () => {
    const saveData = {
      selectedDocType,
      formData,
    };
    localStorage.setItem('applicationForm', JSON.stringify(saveData));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    console.log('Сохранено:', saveData);
  };

  // Обработчик изменения полей
  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Открыть модальное окно печати
  const handleOpenPrintModal = () => {
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
  };

  // Выполнить печать
  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Документ</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Times New Roman', 'Georgia', serif; background: white; padding: 40px; margin: 0; }
              .document { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { text-align: center; padding: 30px 30px 20px; border-bottom: 2px solid #2860F0; }
              .header h1 { font-size: 24px; font-weight: bold; color: #1a2c3e; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
              .header .form-number { font-size: 14px; color: #666; margin-top: 5px; }
              .header .date { font-size: 12px; color: #999; margin-top: 10px; }
              .content { padding: 30px; }
              .info-row { display: flex; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e0e0e0; }
              .info-label { width: 180px; font-weight: 600; color: #2c3e50; font-size: 14px; }
              .info-value { flex: 1; color: #1a2c3e; font-size: 14px; line-height: 1.5; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 11px; color: #999; }
              .stamp { margin-top: 30px; display: flex; justify-content: space-between; padding: 0 20px; }
              .stamp div { text-align: center; font-size: 12px; color: #666; }
              .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 5px; }
              @media print { body { padding: 0; } .document { box-shadow: none; border: none; } }
            </style>
          </head>
          <body>
            <div class="document">
              <div class="header">
                <h1>ЗАЯВКА НА ПЕРЕВОЗКУ ГРУЗОВ</h1>
                <div class="form-number">Форма ГУ-12</div>
                <div class="date">Дата формирования: ${new Date().toLocaleDateString('ru-RU')}</div>
              </div>
              <div class="content">
                ${printContent.innerHTML}
                <div class="stamp">
                  <div><div>М.П.</div><div class="signature-line"></div><div>Подпись отправителя</div></div>
                  <div><div>М.П.</div><div class="signature-line"></div><div>Подпись перевозчика</div></div>
                </div>
              </div>
              <div class="footer">Настоящий документ является официальным и имеет юридическую силу<br>Система электронного документооборота "Documentob Diplom"</div>
            </div>
            <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setShowPrintModal(false);
  };

  // Открытие модального окна перехода к накладной
  const handleOpenWaybillModal = () => {
    setShowWaybillModal(true);
  };

  const handleCloseWaybillModal = () => {
    setShowWaybillModal(false);
  };

  const handleConfirmWaybill = () => {
    setShowWaybillModal(false);
    setShowWaybillForm(true);
  };

  const handleBackFromWaybill = () => {
    setShowWaybillForm(false);
  };

  // Форматирование даты для отображения
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  // Получение названия выбранного документа
  const getSelectedDocName = () => {
    const doc = documentTypes.find(d => d.id === selectedDocType);
    return doc?.name || 'Документ';
  };

  // Получение полей для текущего типа документа
  const currentFields = fieldsConfig[selectedDocType] || [];

  // Компонент предварительного просмотра
  const DocumentPreview = () => {
    const docName = getSelectedDocName();
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 font-serif">
        <div className="text-center border-b-2 border-[#2860F0] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">{docName}</h2>
        </div>
        
        <div className="space-y-3">
          {currentFields.map((field) => (
            <div key={field.key} className="flex py-2 border-b border-dashed border-gray-200">
              <div className="w-40 font-semibold text-gray-700">{field.label}:</div>
              <div className="flex-1 text-gray-800">
                {field.type === 'date' 
                  ? formatDateForDisplay(formData[field.key] || '') 
                  : formData[field.key] || '—'}
              </div>
            </div>
          ))}
          
          {currentFields.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Выберите тип документа
            </div>
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
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          Документ сформирован автоматически
        </div>
      </div>
    );
  };

  // Если открыта страница накладной
  if (showWaybillForm) {
    return <WaybillFormPage onBack={handleBackFromWaybill} onLogout={onLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Скрытый блок для печати */}
      <div className="hidden" id="print-content">
        {currentFields.map((field) => (
          <div key={field.key} className="info-row">
            <div className="info-label">{field.label}:</div>
            <div className="info-value">
              {field.type === 'date' 
                ? formatDateForDisplay(formData[field.key] || '') 
                : formData[field.key] || '—'}
            </div>
          </div>
        ))}
      </div>
      
      {/* Кнопки навигации */}
      <div className="absolute top-4 left-6 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          В начало
        </button>
      </div>

      <div className="absolute top-4 right-6 z-10">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Выход
        </button>
      </div>

      {/* Уведомление о сохранении */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#3ABC96] text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          ✅ Данные сохранены!
        </div>
      )}

      {/* Модальное окно печати */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-[#C9D9FF] px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Предварительный просмотр печати</h3>
              <p className="text-xs text-gray-600 mt-1">Проверьте документ перед печатью</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <DocumentPreview />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button onClick={handlePrint} className="flex-1 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg">🖨️ Печать</button>
              <button onClick={handleClosePrintModal} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">✖️ Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно предупреждения для перехода к накладной */}
      {showWaybillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[450px] bg-[#8778C3] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#E4E0FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Внимание!</h3>
            </div>
            <div className="p-6">
              <p className="text-white text-center">
                Вы переходите к заполнению накладной -<br />
                после перехода заявку распечатать будет невозможно
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleConfirmWaybill} className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg">Принять</button>
              <button onClick={handleCloseWaybillModal} className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент - две колонки */}
      <div className="pt-20 px-6 pb-6 h-screen flex gap-6 overflow-hidden">
        {/* Левая колонка - поля для ввода (50%) */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Оформление документа
          </h2>
          
          <div className="space-y-4">
            {/* Выбор типа документа */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип документа</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                {documentTypes.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>
            
            {/* Динамические поля в зависимости от выбранного типа документа */}
            {currentFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
                  />
                )}
              </div>
            ))}
            
            {currentFields.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                Выберите тип документа
              </div>
            )}
          </div>
        </div>
        
        {/* Правая колонка - предварительный просмотр (50%) */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-[#C9D9FF] py-2 px-4 rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Предварительный просмотр документа</h3>
            <p className="text-xs text-gray-600">Данные обновляются автоматически при вводе</p>
          </div>
          <div ref={printRef} className="flex-1 bg-[#EFECF9] rounded-b-lg p-4 overflow-y-auto">
            <DocumentPreview />
          </div>
          
          {/* Кнопки действий */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-[#4475F7] hover:bg-[#3662d9] text-white font-medium rounded-lg transition-colors"
            >
              💾 Сохранить
            </button>
            <button
              onClick={handleOpenPrintModal}
              className="flex-1 py-3 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors"
            >
              🖨️ Печать
            </button>
            <button
              onClick={handleOpenWaybillModal}
              className="flex-1 py-3 bg-[#7C5CFC] hover:bg-[#6a48e8] text-white font-medium rounded-lg transition-colors"
            >
              📄 В накладную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}