import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ApplicationForm } from './ApplicationForm';
import { Documents } from './Documents';
import { WaybillNewPage } from './WaybillNewPage';


interface UserDashboardProps {
  userName: string;
  userId?: number;
  onLogout: () => void;
}

export function UserDashboard({ userName, userId, onLogout }: UserDashboardProps) {
  console.log('UserDashboard received userName:', userName); 
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [showWaybillNewPage, setShowWaybillNewPage] = useState(false);

  // Навигация
  const handleNavigateToApplication = () => setCurrentPage('application');
  const handleNavigateToCalculation = () => console.log('Расчет провозной платы');
  const handleNavigateToOther = () => console.log('Прочие формы');
  const handleNavigateToBaggage = () => console.log('Багажные формы');
  const handleNavigateToPrint = () => setCurrentPage('myDocuments');
  const handleNavigateToWaybillNew = () => setShowWaybillNewPage(true);
  const handleBackToDashboard = () => setCurrentPage('dashboard');

  // Проверка страниц
if (showWaybillNewPage) {
    return <WaybillNewPage onBack={() => setShowWaybillNewPage(false)} onLogout={onLogout} userId={userId || 1} userName={userName} />;
}
if (currentPage === 'application') {
  return <ApplicationForm onBack={handleBackToDashboard} onLogout={onLogout} userName={userName} userId={userId} />;
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

  // Кнопки (размеры уже заданы)
  const buttons = [
    // Первая строка
    { id: 'application', title: 'Оформление заявки\nна перевозку грузов', width: 'w-[400px]', height: 'h-[260px]', defaultBg: 'bg-[#7C5CFC]', hoverBg: 'bg-[#E4E0FF]', defaultText: 'text-white', hoverText: 'text-[#7C5CFC]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#7C5CFC]', row: 1, onClick: handleNavigateToApplication },
    { id: 'calculation', title: 'Расчет провозной\nплаты', width: 'w-[300px]', height: 'h-[260px]', defaultBg: 'bg-[#2860F0]', hoverBg: 'bg-[#C9D9FF]', defaultText: 'text-white', hoverText: 'text-[#2860F0]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#2860F0]', row: 1, onClick: handleNavigateToCalculation },
    { id: 'waybill', title: 'Оформление накладной\nна перевозку груза', width: 'w-[400px]', height: 'h-[260px]', defaultBg: 'bg-[#7C5CFC]', hoverBg: 'bg-[#E4E0FF]', defaultText: 'text-white', hoverText: 'text-[#7C5CFC]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#7C5CFC]', row: 1, onClick: handleNavigateToWaybillNew },
    // Вторая строка
    { id: 'other', title: 'Прочие', width: 'w-[300px]', height: 'h-[260px]', defaultBg: 'bg-[#2860F0]', hoverBg: 'bg-[#C9D9FF]', defaultText: 'text-white', hoverText: 'text-[#2860F0]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#2860F0]', row: 2, onClick: handleNavigateToOther },
    { id: 'baggage', title: 'Багажные формы', width: 'w-[400px]', height: 'h-[260px]', defaultBg: 'bg-[#7C5CFC]', hoverBg: 'bg-[#E4E0FF]', defaultText: 'text-white', hoverText: 'text-[#7C5CFC]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#7C5CFC]', row: 2, onClick: handleNavigateToBaggage },
    { id: 'print', title: 'Печатные формы', width: 'w-[400px]', height: 'h-[260px]', defaultBg: 'bg-[#2860F0]', hoverBg: 'bg-[#C9D9FF]', defaultText: 'text-white', hoverText: 'text-[#2860F0]', defaultBorder: 'border-transparent', hoverBorder: 'border-2 border-[#2860F0]', row: 2, onClick: handleNavigateToPrint },
  ];

  const firstRowButtons = buttons.filter(btn => btn.row === 1);
  const secondRowButtons = buttons.filter(btn => btn.row === 2);

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
    <Navbar hideMinimize={true} userName={userName} />

      {/* Кнопка выхода (остаётся на месте) */}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Добро пожаловать!</h1>
          <p className="text-gray-600">
            Пользователь: <span className="font-semibold text-[#2860F0]">{userName}</span>
          </p>
        </div>
      </div>

      {/* Контейнер для кнопок */}
      <div className="px-6 pb-12">
        <div className="max-w-[1100px] mx-auto">
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
        ${button.width} ${button.height}
        ${isHovered ? button.hoverBg : button.defaultBg}
        ${isHovered ? button.hoverText : button.defaultText}
        ${isHovered ? button.hoverBorder : button.defaultBorder}
        rounded-2xl shadow-lg transition-all duration-[1000ms]
        flex items-center justify-center text-center font-bold text-xl
        whitespace-pre-line relative z-10
        ${isHovered ? 'shadow-xl' : 'hover:shadow-xl'}
      `}
    >
      {button.title}
    </button>
  );
})}
          </div>
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
        ${button.width} ${button.height}
        ${isHovered ? button.hoverBg : button.defaultBg}
        ${isHovered ? button.hoverText : button.defaultText}
        ${isHovered ? button.hoverBorder : button.defaultBorder}
        rounded-2xl shadow-lg transition-all duration-[1000ms]
        flex items-center justify-center text-center font-bold text-xl
        whitespace-pre-line relative z-10
        ${isHovered ? 'shadow-xl' : 'hover:shadow-xl'}
      `}
    >
      {button.title}
    </button>
  );
})}
          </div>
        </div>
      </div>

{hoveredButton && <div className="fixed inset-0 bg-black bg-opacity-20 z-0 transition-all duration-500 delay-1000 backdrop-blur-sm" />}  </div>
  );
}