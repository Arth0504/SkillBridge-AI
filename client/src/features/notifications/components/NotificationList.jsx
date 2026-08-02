import React from 'react';
import { Bell } from 'lucide-react';
import { EmptyState } from '../../../components/common';

export const NotificationList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No Notifications"
        description="You have no notifications at this time."
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <div
          key={n.id || n._id}
          className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
            !n.isRead
              ? 'bg-slate-100/90 dark:bg-slate-800/80 border-brand-500/30'
              : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50'
          }`}
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
              <span className="text-[11px] text-slate-400">
                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.time || ''}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{n.message || n.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
