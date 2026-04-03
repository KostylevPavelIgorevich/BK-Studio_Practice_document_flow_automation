import { useState, useRef } from 'react';
import { Navbar } from '../components/Navbar';

interface WaybillDetailsPageProps {
  onBack: () => void;
  onLogout: () => void;
  applicationType: string;
  waybillType: string;
  formType: string;
}

export function WaybillDetailsPage({ onBack, onLogout, applicationType, waybillType, formType }: WaybillDetailsPageProps) {
  const [selectedSection, setSelectedSection] = useState('Сведения о вагоне');
  const [showNotification, setShowNotification] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Данные для полей
  const [wagonData, setWagonData] = useState({
    wagonNumber: '',
    wagonType: '',
    loadCapacity: '',
  });
  const [senderData, setSenderData] = useState({
    name: '',
    station: '',
    okpo: '',
  });
  const [receiverData, setReceiverData] = useState({
    name: '',
    station: '',
    okpo: '',
  });
  const [transportData, setTransportData] = useState({
    cargoName: '',
    weight: '',
    distance: '',
  });

  const sectionOptions = [
    'Сведения о вагоне',
    'Сведения об отправителе и станции отправления',
    'Сведения о получателе и станции назначения',
    'Сведения о перевозке',
  ];

  // Сохранение данных
  const handleSave = () => {
    const saveData = {
      wagonData,
      senderData,
      receiverData,
      transportData,
      formType,
      applicationType,
      waybillType,
    };
    localStorage.setItem('waybillData', JSON.stringify(saveData));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    console.log('Сохранено:', saveData);
  };

  // Печать
  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Накладная</title>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Times New Roman', serif; padding: 40px; }
              .print-container { max-width: 800px; margin: 0 auto; }
              .field-row { margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed #ccc; display: flex; }
              .field-label { width: 200px; font-weight: bold; }
              .field-value { flex: 1; }
              h1 { text-align: center; border-bottom: 2px solid #2860F0; padding-bottom: 10px; margin-bottom: 20px; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h1>НАКЛАДНАЯ НА ПЕРЕВОЗКУ ГРУЗА</h1>
              ${printContent.innerHTML}
            </div>
            <script>window.onload = () => { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // В накладную
  const handleToWaybill = () => {
    console.log('Переход к накладной');
    // Здесь будет логика перехода
  };

  // Рендер полей в зависимости от выбранной секции
  const renderFields = () => {
    switch (selectedSection) {
      case 'Сведения о вагоне':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер вагона</label>
              <input type="text" value={wagonData.wagonNumber} onChange={(e) => setWagonData({...wagonData, wagonNumber: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Род вагона</label>
              <input type="text" value={wagonData.wagonType} onChange={(e) => setWagonData({...wagonData, wagonType: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Грузоподъемность (тонн)</label>
              <input type="number" value={wagonData.loadCapacity} onChange={(e) => setWagonData({...wagonData, loadCapacity: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
          </div>
        );
      case 'Сведения об отправителе и станции отправления':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наименование отправителя</label>
              <input type="text" value={senderData.name} onChange={(e) => setSenderData({...senderData, name: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Станция отправления</label>
              <input type="text" value={senderData.station} onChange={(e) => setSenderData({...senderData, station: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Код ОКПО</label>
              <input type="text" value={senderData.okpo} onChange={(e) => setSenderData({...senderData, okpo: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
          </div>
        );
      case 'Сведения о получателе и станции назначения':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наименование получателя</label>
              <input type="text" value={receiverData.name} onChange={(e) => setReceiverData({...receiverData, name: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Станция назначения</label>
              <input type="text" value={receiverData.station} onChange={(e) => setReceiverData({...receiverData, station: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Код ОКПО</label>
              <input type="text" value={receiverData.okpo} onChange={(e) => setReceiverData({...receiverData, okpo: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
          </div>
        );
      case 'Сведения о перевозке':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза</label>
              <input type="text" value={transportData.cargoName} onChange={(e) => setTransportData({...transportData, cargoName: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вес груза (тонн)</label>
              <input type="number" value={transportData.weight} onChange={(e) => setTransportData({...transportData, weight: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Расстояние (км)</label>
              <input type="number" value={transportData.distance} onChange={(e) => setTransportData({...transportData, distance: e.target.value})} className="w-full px-4 py-2 bg-[#E4E0FF} border border-[#919191] rounded-lg text-gray-900" />
            </div>
          </div>
        );
      default:
        return <div className="text-gray-400">Выберите раздел для заполнения</div>;
    }
  };

  // Предпросмотр документа
  const DocumentPreview = () => {
    let previewData: { label: string; value: string }[] = [];
    
    if (selectedSection === 'Сведения о вагоне') {
      previewData = [
        { label: 'Номер вагона', value: wagonData.wagonNumber || '—' },
        { label: 'Род вагона', value: wagonData.wagonType || '—' },
        { label: 'Грузоподъемность', value: wagonData.loadCapacity ? `${wagonData.loadCapacity} т` : '—' },
      ];
    } else if (selectedSection === 'Сведения об отправителе и станции отправления') {
      previewData = [
        { label: 'Отправитель', value: senderData.name || '—' },
        { label: 'Станция отправления', value: senderData.station || '—' },
        { label: 'Код ОКПО', value: senderData.okpo || '—' },
      ];
    } else if (selectedSection === 'Сведения о получателе и станции назначения') {
      previewData = [
        { label: 'Получатель', value: receiverData.name || '—' },
        { label: 'Станция назначения', value: receiverData.station || '—' },
        { label: 'Код ОКПО', value: receiverData.okpo || '—' },
      ];
    } else if (selectedSection === 'Сведения о перевозке') {
      previewData = [
        { label: 'Груз', value: transportData.cargoName || '—' },
        { label: 'Вес', value: transportData.weight ? `${transportData.weight} т` : '—' },
        { label: 'Расстояние', value: transportData.distance ? `${transportData.distance} км` : '—' },
      ];
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 font-serif">
        <div className="text-center border-b-2 border-[#2860F0] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">НАКЛАДНАЯ НА ПЕРЕВОЗКУ ГРУЗА</h2>
          <p className="text-gray-500 text-sm mt-1">{formType}</p>
        </div>
        
        <div className="space-y-3">
          {previewData.map((item, idx) => (
            <div key={idx} className="flex py-2 border-b border-dashed border-gray-200">
              <div className="w-40 font-semibold text-gray-700">{item.label}:</div>
              <div className="flex-1 text-gray-800">{item.value}</div>
            </div>
          ))}
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

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Скрытый блок для печати */}
      <div className="hidden" id="print-content">
        <div className="space-y-3">
          {selectedSection === 'Сведения о вагоне' && (
            <>
              <div className="field-row"><div className="field-label">Номер вагона:</div><div className="field-value">{wagonData.wagonNumber || '—'}</div></div>
              <div className="field-row"><div className="field-label">Род вагона:</div><div className="field-value">{wagonData.wagonType || '—'}</div></div>
              <div className="field-row"><div className="field-label">Грузоподъемность:</div><div className="field-value">{wagonData.loadCapacity ? `${wagonData.loadCapacity} т` : '—'}</div></div>
            </>
          )}
          {selectedSection === 'Сведения об отправителе и станции отправления' && (
            <>
              <div className="field-row"><div className="field-label">Отправитель:</div><div className="field-value">{senderData.name || '—'}</div></div>
              <div className="field-row"><div className="field-label">Станция отправления:</div><div className="field-value">{senderData.station || '—'}</div></div>
              <div className="field-row"><div className="field-label">Код ОКПО:</div><div className="field-value">{senderData.okpo || '—'}</div></div>
            </>
          )}
          {selectedSection === 'Сведения о получателе и станции назначения' && (
            <>
              <div className="field-row"><div className="field-label">Получатель:</div><div className="field-value">{receiverData.name || '—'}</div></div>
              <div className="field-row"><div className="field-label">Станция назначения:</div><div className="field-value">{receiverData.station || '—'}</div></div>
              <div className="field-row"><div className="field-label">Код ОКПО:</div><div className="field-value">{receiverData.okpo || '—'}</div></div>
            </>
          )}
          {selectedSection === 'Сведения о перевозке' && (
            <>
              <div className="field-row"><div className="field-label">Груз:</div><div className="field-value">{transportData.cargoName || '—'}</div></div>
              <div className="field-row"><div className="field-label">Вес:</div><div className="field-value">{transportData.weight ? `${transportData.weight} т` : '—'}</div></div>
              <div className="field-row"><div className="field-label">Расстояние:</div><div className="field-value">{transportData.distance ? `${transportData.distance} км` : '—'}</div></div>
            </>
          )}
        </div>
      </div>

      {/* Уведомление о сохранении */}
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
        {/* Левая колонка - выбор секции и поля */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            Заполнение данных
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сведения</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                {sectionOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            {renderFields()}
          </div>
        </div>
        
        {/* Правая колонка - предпросмотр */}
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
              onClick={handlePrint}
              className="flex-1 py-3 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors"
            >
              🖨️ Печать
            </button>
            <button
              onClick={handleToWaybill}
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