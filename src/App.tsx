import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { UserDashboard } from './pages/UserDashboard';
import { login as apiLogin, fetchCsrfToken } from './services/api';
import './app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка сохранённых данных при загрузке + получение CSRF токена
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // 1. Получаем CSRF токен при старте приложения (ВАЖНО!)
      try {
        await fetchCsrfToken();
        console.log('✅ CSRF токен получен');
      } catch (error) {
        console.error('❌ Ошибка получения CSRF токена:', error);
      }
      
      // 2. Проверяем сохранённого пользователя
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          // Проверяем, что данные не устарели (можно добавить проверку токена)
          if (user.id && user.role) {
            setUserId(user.id);
            setUserName(user.fullName?.split(' ')[0] || user.login);
            setUserRole(user.role);
            setIsAuthenticated(true);
            console.log('✅ Пользователь восстановлен из localStorage');
          } else {
            // Данные повреждены - удаляем
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
        // 1. Сначала получаем CSRF токен (на всякий случай ещё раз)
        await fetchCsrfToken();
        
        // 2. Выполняем вход
        const user = await apiLogin(login, password);
        
        // 3. Сохраняем данные пользователя
        localStorage.setItem('user', JSON.stringify(user));
        
        // 4. Обновляем состояние
        setUserId(user.id);
        setUserName(user.fullName.split(' ')[0]);
        setUserRole(user.role);
        setIsAuthenticated(true);
        
        console.log('✅ Вход выполнен успешно');
        
        // 5. 🚀 РЕДИРЕКТ В ЗАВИСИМОСТИ ОТ РОЛИ
        if (user.role === 'admin') {
            // Админ → админ-панель
            window.location.href = '/admin';
            // или если используешь react-router:
            // navigate('/admin');
        } else {
            // Пользователь → дашборд
            window.location.href = '/dashboard';
            // или: navigate('/dashboard');
        }
        
    } catch (error: any) {
        console.error('Ошибка входа:', error);
        alert(error.message || 'Неверный логин или пароль');
    }
};

  const handleLogout = async () => {
    try {
      // Пытаемся вызвать logout на сервере (опционально)
      const { logout } = await import('./services/api');
      await logout().catch(() => {});
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      // Очищаем локальные данные
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName('');
      setUserId(null);
      
      console.log('✅ Выход выполнен');
    }
  };

  // Показываем загрузку при инициализации
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