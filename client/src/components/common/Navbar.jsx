import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon, LogIn, User, Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';
import { Dropdown } from './Dropdown';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (role === 'company') return '/company/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  const userMenuItems = [
    {
      label: 'Dashboard',
      icon: <Briefcase className="w-4 h-4" />,
      onClick: () => navigate(getDashboardLink()),
    },
    {
      label: 'Logout',
      icon: <LogIn className="w-4 h-4" />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-md shadow-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-slate-900 dark:text-white">
              SkillBridge <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/jobs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">
              Find Jobs
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">
              About
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">
              Enterprise
            </Link>
          </div>

          {/* Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-xs">
                      {user?.fullName?.[0] || user?.companyName?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 pr-2">
                      {user?.fullName || user?.companyName}
                    </span>
                  </div>
                }
                items={userMenuItems}
              />
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
