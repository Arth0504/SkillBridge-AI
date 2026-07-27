import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, ShieldAlert, AlertTriangle, Info, Check } from 'lucide-react';
import { Button, Badge, Loader, EmptyState } from '../../../components/common';
import { adminApi } from '../../../api';
import toast from 'react-hot-toast';

export const AdminNotificationsPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  // Fetch Admin Notifications
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', filter],
    queryFn: () => adminApi.getNotifications({ unreadOnly: filter === 'UNREAD' ? true : undefined }),
  });

  const alerts = data?.data?.notifications ?? [];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'SECURITY':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-brand-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Admin Alerts..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-brand-500" /> Admin Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System control warnings, employer verification notices, and security lockout events.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => toast.success('All alerts marked as read')}>
          <CheckCheck className="w-4 h-4 mr-2" /> Mark All as Read
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'UNREAD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {f === 'ALL' ? 'All Alerts' : 'Unread Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No Admin Alerts" description="System is running smoothly with no alerts." />
      ) : (
        <div className="space-y-4">
          {alerts.map((item, idx) => (
            <motion.div
              key={item._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-6 rounded-3xl border flex items-start justify-between gap-4 transition-all ${
                !item.isRead ? 'border-brand-500/30 bg-brand-500/5' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-2xl bg-slate-900 shrink-0">
                  {getAlertIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    {!item.isRead && <Badge variant="danger" size="sm">Unread Alert</Badge>}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    {new Date(item.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
