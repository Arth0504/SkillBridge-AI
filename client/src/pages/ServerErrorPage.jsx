import React from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ServerErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="p-5 rounded-2xl bg-amber-500/10 text-amber-500 mb-6 shadow-inner">
        <ServerCrash className="w-16 h-16" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">500</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Server Error</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        SkillBridge AI server encountered an unexpected error. Our engineering team has been notified.
      </p>
      <Button onClick={() => window.location.reload()} variant="primary">
        <RefreshCw className="w-4 h-4 mr-2" /> Reload Page
      </Button>
    </div>
  );
};
