import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon: Icon,
  className,
}) => {
  const variants = {
    primary: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    secondary: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const dotColors = {
    primary: 'bg-brand-500',
    secondary: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-xs transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};
