import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Checkbox = React.forwardRef(
  (
    {
      label,
      description,
      error,
      className,
      containerClassName,
      id,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1', containerClassName)}>
        <label htmlFor={checkboxId} className="inline-flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5 shrink-0">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              checked={checked}
              onChange={onChange}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center',
                'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700',
                'peer-checked:bg-brand-600 peer-checked:border-brand-600 dark:peer-checked:bg-brand-500 dark:peer-checked:border-brand-500 text-white',
                'group-hover:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
                error && 'border-rose-500',
                className
              )}
            >
              <Check className={cn('w-3.5 h-3.5 stroke-[3] transition-transform duration-150', checked ? 'scale-100' : 'scale-0')} />
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-rose-500 font-medium ml-8">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
