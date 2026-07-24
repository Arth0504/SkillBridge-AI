import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from './Dropdown';

export const Topbar = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">
          Welcome, {user?.fullName || user?.companyName || 'User'}
        </h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 capitalize">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {/* User Menu Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
                {user?.fullName?.[0] || user?.companyName?.[0] || 'U'}
              </div>
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};
