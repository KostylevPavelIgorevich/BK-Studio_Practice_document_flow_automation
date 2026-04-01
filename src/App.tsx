import { useState } from 'react';
import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { UserDashboard } from './pages/UserDashboard';
import './app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogin = (role: 'admin' | 'user', email: string, id: number) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    const name = email.split('@')[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setUserId(null);
  };

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