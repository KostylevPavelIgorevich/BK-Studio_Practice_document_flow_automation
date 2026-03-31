import { useState } from 'react';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import './app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  const handleLogin = (role: 'admin' | 'user') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Пока только админ-панель, потом добавим страницу для пользователя
  if (userRole === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  // Заглушка для пользовательской страницы
  return (
    <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">Страница пользователя</h1>
        <p className="mt-4">Здесь будет интерфейс для обычного пользователя</p>
        <button 
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-[#E36756] text-white rounded-lg"
        >
          Выход
        </button>
      </div>
    </div>
  );
}

export default App;