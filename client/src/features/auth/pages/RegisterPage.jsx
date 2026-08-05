import React, { useState } from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { InteractiveMascot } from '../components/InteractiveMascot';

export const RegisterPage = () => {
  const [mascotState, setMascotState] = useState('idle');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-bg transition-colors duration-300 font-sans">
      {/* Left Column: Premium Mascot Branding Showcase */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-[#131926] to-[#0A0D15] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="flex flex-col items-center max-w-sm text-center space-y-6 z-10">
          <InteractiveMascot state={mascotState} />
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Unlock Your AI Potential</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a candidate profile to automate your applications or set up an employer workspace to run screening evaluations.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Glass card for RegisterForm */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] space-y-6 glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl my-6"
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
              Create Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join thousands of professionals and hiring managers using AI-driven matching.
            </p>
          </div>

          <RegisterForm setMascotState={setMascotState} />

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

