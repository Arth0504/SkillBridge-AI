import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#0B0F19]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6 glass-panel p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Get Started with <span className="gradient-text">SkillBridge AI</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of professionals and hiring managers using AI-driven matching.
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
