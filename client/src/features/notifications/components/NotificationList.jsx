import React from 'react';
import { Bell, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/common';

export const NotificationList = () => {
  const notifications = [
    { id: 1, title: 'Interview Scheduled', desc: 'Nexus Labs invited you for a Technical Interview on Jan 28.', time: '10m ago', unread: true, type: 'success' },
    { id: 2, title: 'AI Resume Score Updated', desc: 'Your updated resume achieved a 92/100 matching score.', time: '1h ago', unread: true, type: 'purple' },
    { id: 3, title: 'New Job Recommendation', desc: 'Senior AI Engineer at TechCorp AI matches your tech stack.', time: '1d ago', unread: false, type: 'info' },
  ];

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
            n.unread
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
              <span className="text-[11px] text-slate-400">{n.time}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{n.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
