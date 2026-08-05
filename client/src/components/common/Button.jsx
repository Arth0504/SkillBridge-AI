import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 dark:focus:ring-offset-[#080B10] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none';

    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-500 text-white shadow-premium dark:bg-brand-500 dark:hover:bg-brand-600 border border-brand-700/10 hover:border-brand-500/25',
      secondary:
        'bg-slate-100 hover:bg-slate-200/90 text-slate-800 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/50',
      outline:
        'border border-slate-300 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-premium border border-rose-700/10 hover:border-rose-500/25',
      success:
        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-premium border border-emerald-700/10 hover:border-emerald-500/25',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-5 text-sm gap-2',
      lg: 'h-12 px-7 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

