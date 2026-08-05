import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const OfflinePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="p-5 rounded-2xl bg-slate-500/10 text-slate-500 mb-6 shadow-inner">
        <WifiOff className="w-16 h-16 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">You are Offline</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Please check your internet connection and try refreshing the application.
      </p>
      <Button onClick={() => window.location.reload()} variant="primary">
        <RefreshCw className="w-4 h-4 mr-2" /> Check Connection
      </Button>
    </div>
  );
};
