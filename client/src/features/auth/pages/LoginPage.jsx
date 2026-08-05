import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveMascot } from '../components/InteractiveMascot';

export const LoginPage = () => {
  const [mascotState, setMascotState] = useState('idle');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Left Column: Premium Mascot Branding Showcase */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-[#131926] to-[#0A0D15] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="flex flex-col items-center max-w-sm text-center space-y-6 z-10">
          <InteractiveMascot state={mascotState} />
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Join the Future of Hiring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SkillBridge AI connects tech talent with top companies through automated ATS resume auditing and video screening assessments.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Glass card for LoginForm */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-6 glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl"
        >
          {/* Mobile Mascot Header */}
          <div className="flex md:hidden justify-center mb-4">
            <InteractiveMascot state={mascotState} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credential details to access your workspace.
            </p>
          </div>

          <LoginForm setMascotState={setMascotState} />

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/40 flex flex-col gap-2.5 text-center text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Forgot your password?{' '}
              <Link to="/auth/forgot-password" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Reset it here
              </Link>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign up now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

