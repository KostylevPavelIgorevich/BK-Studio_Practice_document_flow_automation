import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface LoginProps {
  onLogin: (role: 'admin' | 'user', email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Временная логика: если email содержит "admin" — вход как админ
      if (email.toLowerCase().includes('admin')) {
        onLogin('admin', email);
      } else {
        onLogin('user', email);
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
              Демо: введите любой email с "admin" для входа как админ<br />
              Любой другой email — вход как пользователь
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}