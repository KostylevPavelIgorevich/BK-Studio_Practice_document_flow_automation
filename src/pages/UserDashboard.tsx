import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ApplicationForm } from './ApplicationForm';
import { Documents } from './Documents';  // <-- ЭТОТ ИМПОРТ НУЖЕН

interface UserDashboardProps {
  userName: string;
  userId?: number;
  onLogout: () => void;
}

export function UserDashboard({ userName, userId, onLogout }: UserDashboardProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  // Функции для навигации
  const handleNavigateToApplication = () => {
    setCurrentPage('application');
  };

  const handleNavigateToCalculation = () => {
    console.log('Переход на страницу расчета провозной платы');
  };

  const handleNavigateToWaybill = () => {
    console.log('Переход на страницу оформления накладной');
  };

  const handleNavigateToOther = () => {
    console.log('Переход на страницу прочих форм');
  };

  const handleNavigateToBaggage = () => {
    console.log('Переход на страницу багажных форм');
  };

  const handleNavigateToPrint = () => {
    console.log('Переход на страницу печатных форм');
  };

  const handleNavigateToMyDocuments = () => {
    setCurrentPage('myDocuments');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Проверка страниц
  if (currentPage === 'application') {
    return <ApplicationForm onBack={handleBackToDashboard} onLogout={onLogout} />;
  }

  if (currentPage === 'myDocuments') {
    return (
      <Documents
        userName={userName}
        userId={userId || 1}
        userRole="user"
        onBack={handleBackToDashboard}
        onLogout={onLogout}
      />
    );
  }

  // Размеры кнопок для ровного прямоугольника
  const buttons = [
    // Первая строка
    {
      id: 'application',
      title: 'Оформление заявки\nна перевозку грузов',
      width: 'w-[400px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#7C5CFC]',
      hoverBg: 'bg-[#E4E0FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#7C5CFC]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#7C5CFC]',
      row: 1,
      onClick: handleNavigateToApplication,
    },
    {
      id: 'calculation',
      title: 'Расчет провозной\nплаты',
      width: 'w-[300px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#2860F0]',
      hoverBg: 'bg-[#C9D9FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#2860F0]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#2860F0]',
      row: 1,
      onClick: handleNavigateToCalculation,
    },
    {
      id: 'waybill',
      title: 'Оформление накладной\nна перевозку груза',
      width: 'w-[400px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#7C5CFC]',
      hoverBg: 'bg-[#E4E0FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#7C5CFC]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#7C5CFC]',
      row: 1,
      onClick: handleNavigateToWaybill,
    },
    // Вторая строка
    {
      id: 'other',
      title: 'Прочие',
      width: 'w-[300px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#2860F0]',
      hoverBg: 'bg-[#C9D9FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#2860F0]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#2860F0]',
      row: 2,
      onClick: handleNavigateToOther,
    },
    {
      id: 'baggage',
      title: 'Багажные формы',
      width: 'w-[400px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#7C5CFC]',
      hoverBg: 'bg-[#E4E0FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#7C5CFC]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#7C5CFC]',
      row: 2,
      onClick: handleNavigateToBaggage,
    },
    {
      id: 'print',
      title: 'Печатные формы',
      width: 'w-[300px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#2860F0]',
      hoverBg: 'bg-[#C9D9FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#2860F0]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#2860F0]',
      row: 2,
      onClick: handleNavigateToPrint,
    },
    // Третья строка - Мои документы
    {
      id: 'myDocuments',
      title: 'Мои\nдокументы',
      width: 'w-[400px]',
      height: 'h-[260px]',
      defaultBg: 'bg-[#7C5CFC]',
      hoverBg: 'bg-[#E4E0FF]',
      defaultText: 'text-white',
      hoverText: 'text-[#7C5CFC]',
      defaultBorder: 'border-transparent',
      hoverBorder: 'border-2 border-[#7C5CFC]',
      row: 3,
      onClick: handleNavigateToMyDocuments,
    },
  ];

  const firstRowButtons = buttons.filter(btn => btn.row === 1);
  const secondRowButtons = buttons.filter(btn => btn.row === 2);
  const thirdRowButtons = buttons.filter(btn => btn.row === 3);

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      {/* Кнопка выхода */}
      <div className="absolute top-4 right-6 z-20">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-[#E36756] hover:bg-[#d55a48] text-white font-medium rounded-lg transition-colors shadow-md"
        >
          Выход
        </button>
      </div>

      {/* Приветствие */}
      <div className="pt-20 px-6 pb-8">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Добро пожаловать!
          </h1>
          <p className="text-gray-600">
            Пользователь: <span className="font-semibold text-[#2860F0]">{userName}</span>
          </p>
        </div>
      </div>

      {/* Контейнер для кнопок */}
      <div className="px-6 pb-12">
        <div className="max-w-[1100px] mx-auto">
          {/* Первая строка кнопок */}
          <div className="flex gap-6 justify-center mb-6">
            {firstRowButtons.map((button) => {
              const isHovered = hoveredButton === button.id;
              return (
                <button
                  key={button.id}
                  onClick={button.onClick}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`
                    ${button.width}
                    ${button.height}
                    ${isHovered ? button.hoverBg : button.defaultBg}
                    ${isHovered ? button.hoverText : button.defaultText}
                    ${isHovered ? button.hoverBorder : button.defaultBorder}
                    rounded-2xl shadow-lg transition-all duration-300
                    flex items-center justify-center text-center font-bold text-xl
                    whitespace-pre-line relative z-10
                    ${isHovered ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-2xl'}
                  `}
                  style={{
                    boxShadow: isHovered 
                      ? '0 0 0 4px white, 0 0 0 8px rgba(0,0,0,0.1)' 
                      : undefined
                  }}
                >
                  {button.title}
                </button>
              );
            })}
          </div>

          {/* Вторая строка кнопок */}
          <div className="flex gap-6 justify-center mb-6">
            {secondRowButtons.map((button) => {
              const isHovered = hoveredButton === button.id;
              return (
                <button
                  key={button.id}
                  onClick={button.onClick}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`
                    ${button.width}
                    ${button.height}
                    ${isHovered ? button.hoverBg : button.defaultBg}
                    ${isHovered ? button.hoverText : button.defaultText}
                    ${isHovered ? button.hoverBorder : button.defaultBorder}
                    rounded-2xl shadow-lg transition-all duration-300
                    flex items-center justify-center text-center font-bold text-xl
                    whitespace-pre-line relative z-10
                    ${isHovered ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-2xl'}
                  `}
                  style={{
                    boxShadow: isHovered 
                      ? '0 0 0 4px white, 0 0 0 8px rgba(0,0,0,0.1)' 
                      : undefined
                  }}
                >
                  {button.title}
                </button>
              );
            })}
          </div>

          {/* Третья строка кнопок - Мои документы */}
          <div className="flex gap-6 justify-center">
            {thirdRowButtons.map((button) => {
              const isHovered = hoveredButton === button.id;
              return (
                <button
                  key={button.id}
                  onClick={button.onClick}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`
                    ${button.width}
                    ${button.height}
                    ${isHovered ? button.hoverBg : button.defaultBg}
                    ${isHovered ? button.hoverText : button.defaultText}
                    ${isHovered ? button.hoverBorder : button.defaultBorder}
                    rounded-2xl shadow-lg transition-all duration-300
                    flex items-center justify-center text-center font-bold text-xl
                    whitespace-pre-line relative z-10
                    ${isHovered ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-2xl'}
                  `}
                  style={{
                    boxShadow: isHovered 
                      ? '0 0 0 4px white, 0 0 0 8px rgba(0,0,0,0.1)' 
                      : undefined
                  }}
                >
                  {button.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Затемнение фона при наведении */}
      {hoveredButton && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-0 transition-all duration-300" />
      )}
    </div>
  );
}