import React from 'react';
import { cn } from '../../utils/cn';

export const Radio = React.forwardRef(
  (
    {
      label,
      options = [],
      name,
      value,
      onChange,
      error,
      className,
      containerClassName,
      direction = 'vertical',
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full flex flex-col gap-2', containerClassName)}>
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex gap-4',
            direction === 'vertical' ? 'flex-col gap-2.5' : 'flex-row items-center flex-wrap'
          )}
        >
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            const desc = typeof opt === 'object' ? opt.description : null;
            const optId = `${name}-${val}-${idx}`;
            const isSelected = value === val;

            return (
              <label
                key={idx}
                htmlFor={optId}
                className={cn(
                  'flex items-start gap-3 cursor-pointer group p-2.5 rounded-xl border transition-all duration-200',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                  className
                )}
              >
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input
                    type="radio"
                    id={optId}
                    ref={ref}
                    name={name}
                    value={val}
                    checked={isSelected}
                    onChange={() => onChange && onChange(val)}
                    className="sr-only"
                    {...props}
                  />
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200',
                      isSelected
                        ? 'border-brand-600 dark:border-brand-500'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-brand-500'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-500" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {lbl}
                  </span>
                  {desc && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {desc}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
