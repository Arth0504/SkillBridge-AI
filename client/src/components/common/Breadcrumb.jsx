import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
      <Link
        to="/"
        className="hover:text-brand-500 transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
