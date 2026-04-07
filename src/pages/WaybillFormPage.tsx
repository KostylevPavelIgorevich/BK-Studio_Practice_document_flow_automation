import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { getApplications, createWaybillFromApplication } from '../services/api';

interface WaybillFormPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function WaybillFormPage({ onBack, onLogout }: WaybillFormPageProps) {
  const [applicationType, setApplicationType] = useState('');
  const [waybillType, setWaybillType] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedSendType, setSelectedSendType] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null); // ← исправлено: храним объект
  const [savedApplications, setSavedApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendTypeOptions = ['Повагонная', 'Групповая', 'Контейнерная', 'Контейнерная комплектом на вагон'];
  const waybillTypeOptions = [
    { code: '90', name: 'Универсальный перевозочный документ на все виды отправок' },
    { code: '94', name: 'Универсальный перевозочный документ на все виды отправок' },
  ];

  // Загрузка сохранённых заявок из БД
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const apps = await getApplications();
        setSavedApplications(apps);
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
      }
    };
    loadApplications();
  }, []);

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value);
    if (value === 'ГУ-12') {
      setShowApplicationModal(true);
    }
  };

  const handleSelectApplication = (app: any) => {
    setSelectedApplication(app); // ← сохраняем весь объект
    setSelectedSendType(app.sendType);
  };

  const handleContinue = async () => {
    if (!selectedApplication || !selectedSendType || !waybillType) {
      alert('Выберите заявку и заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      const waybill = await createWaybillFromApplication({
        applicationId: selectedApplication.id, // ← теперь работает
        waybillType: waybillType,
        sendType: selectedSendType,
      });
      console.log('Накладная создана:', waybill);
      alert('Накладная успешно создана!');
      onBack();
    } catch (error) {
      console.error('Ошибка создания накладной:', error);
      alert('Ошибка при создании накладной');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Кнопки навигации */}
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

      {/* Основной контент */}
      <div className="pt-20 px-6 pb-6">
        <div className="w-full">
          <div className="bg-[#7C5CFC] py-4 px-6 rounded-t-lg w-full">
            <h1 className="text-xl font-bold text-white">Сведения о перевозочном документе</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 space-y-5 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вариант оформления</label>
              <select
                value={applicationType}
                onChange={(e) => handleApplicationTypeChange(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none"
              >
                <option value="">Выберите вариант</option>
                <option value="ГУ-12">По заявке на перевозку грузов ГУ-12</option>
                <option value="ГУ-13">По распоряжению о внутрихозяйственных перевозках ГУ-13</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип накладной</label>
              <select
                value={waybillType}
                onChange={(e) => setWaybillType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none"
              >
                <option value="">Выберите тип</option>
                {waybillTypeOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleContinue}
              disabled={!selectedApplication || !selectedSendType || !waybillType || isLoading}
              className="px-8 py-3 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Создание...' : 'Продолжить'}
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора заявки ГУ-12 */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[90%] max-w-[800px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Заявка ГУ-12</h3>
            </div>
            <div className="p-6">
              <p className="text-white mb-4">Выберите сохраненную заявку</p>
              
              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Вид отправки</label>
                <select
                  value={selectedSendType}
                  onChange={(e) => setSelectedSendType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none"
                >
                  <option value="">Выберите вид отправки</option>
                  {sendTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Сохранённые заявки</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedApplications.map(app => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApplication(app)}
                      className={`p-3 bg-[#C9D9FF] rounded-lg cursor-pointer transition-all ${
                        selectedApplication?.id === app.id
                          ? 'border-2 border-white bg-[#4475F7] text-white'
                          : 'hover:bg-[#b8c8ff]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">№{app.number}</span>
                        <span className="text-sm text-gray-600">{app.date}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Вид отправки: {app.sendType}</div>
                    </div>
                  ))}
                  {savedApplications.length === 0 && (
                    <div className="text-center text-gray-400 py-4">Нет сохранённых заявок</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg"
              >
                Выбрать
              </button>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplicationType('');
                }}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}