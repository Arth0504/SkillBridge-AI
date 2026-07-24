import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon, LogIn, Menu, X, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const NavbarLanding = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Find Jobs', href: '/jobs', isPage: true },
    { label: 'Features', href: '/#features', isPage: false },
    { label: 'Solutions', href: '/#how-it-works', isPage: false },
    { label: 'AI Suite', href: '/#ai-showcase', isPage: false },
    { label: 'Pricing', href: '/#pricing', isPage: false },
    { label: 'FAQ', href: '/#faq', isPage: false },
  ];

  const getDashboardPath = () => {
    if (role === 'company') return '/company/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-panel border-b border-slate-200/80 dark:border-slate-800/80 shadow-md py-3'
          : 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              SkillBridge <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isPage ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              title="Toggle Theme"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => navigate(getDashboardPath())}>
                  <User className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth/register')}>
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Open Mobile Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-slate-200 dark:border-slate-800 px-4 pt-4 pb-6 space-y-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="primary" onClick={() => { setMobileOpen(false); navigate(getDashboardPath()); }}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setMobileOpen(false); navigate('/auth/login'); }}>
                    Sign In
                  </Button>
                  <Button variant="primary" onClick={() => { setMobileOpen(false); navigate('/auth/register'); }}>
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
