import React from 'react';
import { cn } from '../../utils/cn';

export const Loader = ({ fullScreen = false, size = 'md', className }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-brand-500 border-t-transparent',
        sizes[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md">
        {spinner}
        <p className="mt-4 text-sm font-medium text-slate-200 animate-pulse">
          Loading SkillBridge AI...
        </p>
      </div>
    );
  }

  return spinner;
};
