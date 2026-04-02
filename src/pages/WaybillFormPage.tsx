import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface WaybillFormPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function WaybillFormPage({ onBack, onLogout }: WaybillFormPageProps) {
  const [applicationType, setApplicationType] = useState('');
  const [waybillType, setWaybillType] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedSendType, setSelectedSendType] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');

  // Заглушка для сохранённых заявок (потом из БД)
  const savedApplications = [
    { id: 1, number: 'ЗАЯВКА-001', date: '01.04.2025 14:30', sendType: 'Повагонная' },
    { id: 2, number: 'ЗАЯВКА-002', date: '01.04.2025 15:45', sendType: 'Контейнерная' },
    { id: 3, number: 'ЗАЯВКА-003', date: '02.04.2025 09:15', sendType: 'Групповая' },
  ];

  const sendTypeOptions = ['Повагонная', 'Групповая', 'Контейнерная', 'Контейнерная комплектом на вагон'];
  const waybillTypeOptions = [
    { code: '90', name: 'Универсальный перевозочный документ на все виды отправок' },
    { code: '94', name: 'Универсальный перевозочный документ на все виды отправок' },
  ];

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value);
    if (value === 'ГУ-12') {
      setShowApplicationModal(true);
    }
  };

  const handleSelectApplication = (app: typeof savedApplications[0]) => {
    setSelectedApplication(`${app.number} от ${app.date}`);
    setSelectedSendType(app.sendType);
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Кнопки навигации */}
      <div className="absolute top-4 left-6 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#2860F0] hover:bg-[#1e4bc2] text-white font-medium rounded-lg transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
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

      {/* Основной контент */}
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="bg-[#7C5CFC] py-4 px-6 rounded-t-lg">
            <h1 className="text-xl font-bold text-white">Сведения о перевозочном документе</h1>
          </div>

          {/* Форма */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 space-y-5">
            {/* Вариант оформления */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вариант оформления
              </label>
              <select
                value={applicationType}
                onChange={(e) => handleApplicationTypeChange(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                <option value="">Выберите вариант</option>
                <option value="ГУ-12">По заявке на перевозку грузов ГУ-12</option>
                <option value="ГУ-13">По распоряжению о внутрихозяйственных перевозках ГУ-13</option>
              </select>
            </div>

            {/* Тип накладной */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип накладной
              </label>
              <select
                value={waybillType}
                onChange={(e) => setWaybillType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none focus:shadow-[0_0_10px_0_#3300FF]"
              >
                <option value="">Выберите тип</option>
                {waybillTypeOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} - {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => console.log('Создать накладную')}
              className="flex-1 py-3 bg-[#4475F7] hover:bg-[#3662d9] text-white font-medium rounded-lg transition-colors"
            >
              Создать накладную
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора заявки ГУ-12 */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[550px] bg-[#6990F5] rounded-lg overflow-hidden shadow-xl">
            <div className="bg-[#C9D9FF] px-6 py-3">
              <h3 className="text-lg font-semibold text-gray-800">Заявка ГУ-12</h3>
            </div>
            <div className="p-6">
              <p className="text-white mb-4">Выберите сохраненную заявку</p>
              
              {/* Вид отправки */}
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

              {/* Сохранённые заявки */}
              <div className="mb-4">
                <label className="block text-white text-sm mb-1">Сохранённые заявки</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedApplications.map(app => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApplication(app)}
                      className={`p-3 bg-[#C9D9FF] rounded-lg cursor-pointer transition-all ${
                        selectedApplication.includes(app.number)
                          ? 'border-2 border-white bg-[#4475F7] text-white'
                          : 'hover:bg-[#b8c8ff]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">№{app.number}</span>
                        <span className="text-sm">{app.date}</span>
                      </div>
                      <div className="text-sm mt-1">Вид отправки: {app.sendType}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  // Здесь будет логика выбранной заявки
                }}
                className="flex-1 py-2 bg-[#3ABC96] hover:bg-[#32a07e] text-white font-medium rounded-lg transition-colors"
              >
                Выбрать
              </button>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplicationType('');
                }}
                className="flex-1 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors"
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