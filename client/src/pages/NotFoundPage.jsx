import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#0B0F19]">
      <div className="p-5 rounded-2xl bg-brand-500/10 text-brand-500 mb-6 shadow-inner">
        <FileQuestion className="w-16 h-16 animate-bounce" />
      </div>
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        The requested page does not exist or has been relocated to another address.
      </p>
      <Link to="/">
        <Button variant="primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Home
        </Button>
      </Link>
    </div>
  );
};
