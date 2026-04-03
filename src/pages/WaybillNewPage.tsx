import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { WaybillDetailsPage } from './WaybillDetailsPage';

interface WaybillNewPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export function WaybillNewPage({ onBack, onLogout }: WaybillNewPageProps) {
  const [applicationType, setApplicationType] = useState('');
  const [waybillType, setWaybillType] = useState('');
  const [formType, setFormType] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const formTypeOptions = [
    'Повагонная',
    'Групповая',
    'Контейнерная',
    'Контейнерная комплектом на вагон',
  ];
  
  const waybillTypeOptions = [
    { code: '90', name: 'Универсальный перевозочный документ на все виды отправок' },
    { code: '94', name: 'Универсальный перевозочный документ на все виды отправок' },
  ];

  const handleContinue = () => {
    if (applicationType && waybillType && formType) {
      setShowDetails(true);
    }
  };

  if (showDetails) {
    return (
      <WaybillDetailsPage
        onBack={() => setShowDetails(false)}
        onLogout={onLogout}
        applicationType={applicationType}
        waybillType={waybillType}
        formType={formType}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
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

      <div className="pt-20 px-6 pb-6">
        <div className="w-full">
          <div className="bg-[#7C5CFC] py-4 px-6 rounded-t-lg w-full">
            <h1 className="text-xl font-bold text-white">Оформление накладной на перевозку груза</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 space-y-5 w-full">
            {/* Вариант оформления */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вариант оформления</label>
              <select
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none"
              >
                <option value="">Выберите вариант</option>
                <option value="ГУ-12">По заявке на перевозку грузов ГУ-12</option>
                <option value="ГУ-13">По распоряжению о внутрихозяйственных перевозках ГУ-13</option>
              </select>
            </div>

            {/* Тип накладной */}
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

            {/* Форма накладной */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Форма накладной</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-4 py-2 bg-[#E4E0FF] border border-[#919191] rounded-lg text-gray-900 focus:outline-none"
              >
                <option value="">Выберите форму</option>
                {formTypeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleContinue}
              disabled={!applicationType || !waybillType || !formType}
              className="px-8 py-3 bg-[#4475F7] hover:bg-[#3662d9] disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}