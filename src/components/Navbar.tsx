interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "Documentob Diplom" }: NavbarProps) {
  // Функции для кнопок (потом подключим реальные)
  const handleMinimize = () => {
    console.log("Свернуть");
    // Здесь будет вызов Tauri API для сворачивания окна
  };

  const handleMaximize = () => {
    console.log("Развернуть");
    // Здесь будет вызов Tauri API для разворачивания окна
  };

  const handleClose = () => {
    console.log("Закрыть");
    // Здесь будет вызов Tauri API для закрытия окна
  };

  return (
    <nav className="bg-[#2860F0] px-6 py-4 flex justify-between items-center">
      {/* Логотип */}
      <div className="text-white font-bold text-xl">
        {title}
      </div>
      
      {/* Три иконки справа */}
      <div className="flex gap-3">
        {/* Иконка 1 - свернуть */}
        <button 
          onClick={handleMinimize}
          className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4 text-[#2860F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        {/* Иконка 2 - во весь экран */}
        <button 
          onClick={handleMaximize}
          className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4 text-[#2860F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        {/* Иконка 3 - закрыть */}
        <button 
          onClick={handleClose}
          className="w-8 h-8 bg-[#E4E9F8] rounded-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg className="w-4 h-4 text-[#2860F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}