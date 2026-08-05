import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(
  (
    {
      label,
      options = [],
      error,
      helperText,
      placeholder = 'Select an option',
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-2xl text-sm appearance-none cursor-pointer transition-all duration-200 focus:outline-none pr-10',
              'bg-white dark:bg-[#121A2A]/40 text-slate-900 dark:text-slate-100',
              'border border-slate-200 dark:border-slate-800/80',
              'focus:border-brand-500/80 focus:ring-4 focus:ring-brand-500/10 dark:focus:border-brand-500/80 dark:focus:ring-brand-500/10',
              'shadow-premium dark:shadow-none',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={idx} value={val} className="bg-white dark:bg-[#0F1622] text-slate-900 dark:text-slate-100">
                  {lbl}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-semibold mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

