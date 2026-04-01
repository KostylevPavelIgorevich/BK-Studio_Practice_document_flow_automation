import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface LoginProps {
  onLogin: (role: 'admin' | 'user', email: string, userId: number) => void;
}

// Временная заглушка для ID пользователей
const mockUsers: Record<string, { role: 'admin' | 'user'; id: number }> = {
  'admin@test.com': { role: 'admin', id: 0 },
  'user@test.com': { role: 'user', id: 1 },
  'alekseev@test.com': { role: 'user', id: 1 },
  'borisova@test.com': { role: 'user', id: 2 },
  'vladimirov@test.com': { role: 'user', id: 3 },
};

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Проверяем, есть ли такой email в заглушке
      const user = mockUsers[email];
      
      if (user) {
        // Если email есть в заглушке, используем его роль и ID
        onLogin(user.role, email, user.id);
      } else if (email.toLowerCase().includes('admin')) {
        // Если email содержит "admin" но нет в заглушке
        onLogin('admin', email, 0);
      } else {
        // Для всех остальных email — пользователь с ID = 1
        onLogin('user', email, 1);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#E4E9F8]">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 mx-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Авторизация
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логин
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#2860F0] focus:ring-1 focus:ring-[#2860F0] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2860F0] hover:bg-[#1e4bc2] disabled:bg-[#7a9ef0] text-white font-medium rounded-lg transition-colors mt-4"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </form>
            
            <p className="text-center text-gray-400 text-xs mt-4">
              Демо-пользователи:<br />
              admin@test.com — Администратор<br />
              alekseev@test.com — Алексеев (ID 1)<br />
              borisova@test.com — Борисова (ID 2)<br />
              vladimirov@test.com — Владимиров (ID 3)<br />
              Любой другой email — пользователь (ID 1)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}