import React from 'react';
import { cn } from '../../utils/cn';

export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      value,
      className,
      containerClassName,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={textareaId} className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
              {label}
            </label>
          )}
          {maxLength && typeof value === 'string' && (
            <span className="text-[11px] text-slate-400">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-4 py-2.5 rounded-2xl text-sm transition-all duration-200 focus:outline-none resize-y',
            'bg-white dark:bg-[#121A2A]/40 text-slate-900 dark:text-slate-100',
            'border border-slate-200 dark:border-slate-800/80',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:border-brand-500/80 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-500/80 dark:focus:ring-brand-500/10',
            'shadow-premium dark:shadow-none',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-500 font-semibold mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

