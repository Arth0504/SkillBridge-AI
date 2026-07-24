import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Failed to load content. Please check your internet connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
      <AlertTriangle className="w-10 h-10 mb-3" />
      <h4 className="text-base font-bold mb-1">{title}</h4>
      <p className="text-xs text-rose-500/80 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </Button>
      )}
    </div>
  );
};
