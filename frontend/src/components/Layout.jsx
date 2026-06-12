import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Folder, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md safe-top flex justify-between items-center">
        <h1 className="text-xl font-bold">FlexSheet AI</h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm font-medium">{user.name}</span>}
          <button onClick={handleLogout} className="p-1 hover:bg-blue-700 rounded transition-colors hide-on-print">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-surface border-t border-gray-200 fixed bottom-0 w-full flex justify-around p-3 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
