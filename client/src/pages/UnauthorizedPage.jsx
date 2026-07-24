import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="p-5 rounded-3xl bg-rose-500/10 text-rose-500 mb-6 shadow-inner">
        <ShieldX className="w-16 h-16" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">403</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Access Denied</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        You do not have permission to view this section of SkillBridge AI.
      </p>
      <Link to="/">
        <Button variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Safety
        </Button>
      </Link>
    </div>
  );
};
