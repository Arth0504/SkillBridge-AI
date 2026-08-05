import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from './Dropdown';
import { Avatar } from './Avatar';

export const Topbar = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: <UserIcon className="w-4 h-4" />,
      onClick: () => navigate(`/${role}/profile`),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon className="w-4 h-4" />,
      onClick: () => navigate(`/${role}/settings`),
    },
    {
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 glass-panel border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize tracking-tight">
          Welcome, {user?.fullName || user?.companyName || 'User'}
        </h2>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10 uppercase tracking-wider">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/30"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate(`/${role}/notifications`)}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/30"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>

        {/* User Menu Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/20 transition-all duration-200 cursor-pointer">
              <Avatar
                src={user?.avatarUrl || user?.logoUrl}
                name={user?.fullName || user?.companyName}
                size="sm"
              />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};

