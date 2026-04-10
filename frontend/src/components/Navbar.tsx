// src/components/Navbar.tsx
import logo from '../assets/logo.png';
import minimizeIcon from '../assets/share.png';
import maximizeIcon from '../assets/screen.png';
import closeIcon from '../assets/exit.png';

interface NavbarProps {
  hideMinimize?: boolean;
  userName?: string;      // ФИО пользователя (отображается сверху, если передан)
  title?: string;         // основной текст (если не передан, используется стандартный)
}

export function Navbar({ hideMinimize = false, userName, title }: NavbarProps) {
  const handleMinimize = () => console.log("Свернуть");
  const handleMaximize = () => console.log("Развернуть");
  const handleClose = () => console.log("Закрыть");

  const mainText = title || "ПОДГОТОВКА ПЕРЕВОЗОЧНЫХ ДОКУМЕНТОВ";

  return (
    <nav className="bg-[#2860F0] px-6 py-4 flex justify-between items-center">
      {/* Левая часть: логотип + тексты */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Documentob Diplom" className="h-8 w-auto" />
        <div className="flex flex-col">
          {userName && (
            <span className="text-white text-sm font-medium opacity-90">
              {userName}
            </span>
          )}
          <span className="text-white font-semibold text-lg tracking-wide">
            {mainText}
          </span>
        </div>
      </div>

      {/* Правая часть: кнопки управления окном */}
      <div className="flex gap-3">
        {!hideMinimize && (
          <button
            onClick={handleMinimize}
            className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <img src={minimizeIcon} alt="Свернуть" className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleMaximize}
          className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <img src={maximizeIcon} alt="Развернуть" className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <img src={closeIcon} alt="Закрыть" className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}