import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { UserDashboard } from './pages/UserDashboard';
import { WaybillFormAuto } from './pages/WaybillFormAuto';
import { login as apiLogin, fetchCsrfToken } from './services/api';
import './app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      try {
        await fetchCsrfToken();
        console.log('✅ CSRF токен получен');
      } catch (error) {
        console.error('❌ Ошибка получения CSRF токена:', error);
      }
      
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.id && user.role) {
            setUserId(user.id);
            setUserName(user.fullName || user.login);
            setUserRole(user.role);
            setIsAuthenticated(true);
            console.log('✅ Пользователь восстановлен из localStorage');
          } else {
            localStorage.removeItem('user');
          }
        } catch (e) {
          console.error('Ошибка парсинга сохранённого пользователя');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };
    
    initApp();
  }, []);

  const handleLogin = async (login: string, password: string) => {
    try {
        await fetchCsrfToken();
        const user = await apiLogin(login, password);
        localStorage.setItem('user', JSON.stringify(user));
        setUserId(user.id);
        setUserName(user.fullName); 
        setUserRole(user.role);
        setIsAuthenticated(true);
        console.log('✅ Вход выполнен успешно');
        
        if (user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
        
    } catch (error: any) {
        console.error('Ошибка входа:', error);
        alert(error.message || 'Неверный логин или пароль');
    }
  };

  const handleLogout = async () => {
    try {
      const { logout } = await import('./services/api');
      await logout().catch(() => {});
    } catch (error) {
    } finally {
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName('');
      setUserId(null);
      console.log('✅ Выход выполнен');
    }
  };

  const handleBackFromWaybillFormAuto = () => {
    window.location.href = '/dashboard';
  };

  // Проверяем путь для страницы накладной
  const pathname = window.location.pathname;
  
  if (pathname === '/waybill-form-auto') {
    return <WaybillFormAuto 
      onBack={handleBackFromWaybillFormAuto} 
      onLogout={handleLogout} 
      userId={userId || 1} 
      userName={userName} 
    />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2860F0] mb-4"></div>
          <p className="text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (userRole === 'user') {
    return <UserDashboard userName={userName} userId={userId || 1} onLogout={handleLogout} />;
  }

  return null;
}

export default App;