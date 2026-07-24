import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  className,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  const getInitials = (str) => {
    if (!str) return '';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover border border-slate-200 dark:border-slate-800',
            sizes[size]
          )}
        />
      ) : name ? (
        <div
          className={cn(
            'rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan text-white font-bold flex items-center justify-center border border-white/20 shadow-md',
            sizes[size]
          )}
        >
          {initials}
        </div>
      ) : (
        <div
          className={cn(
            'rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center',
            sizes[size]
          )}
        >
          <User className="w-1/2 h-1/2" />
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900',
            statusSizes[size],
            statusColors[status] || statusColors.online
          )}
        />
      )}
    </div>
  );
};
