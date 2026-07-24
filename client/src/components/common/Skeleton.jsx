import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className, count = 1 }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/80',
            className
          )}
        />
      ))}
    </>
  );
};
