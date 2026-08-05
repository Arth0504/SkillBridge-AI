import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Check, Filter, Sparkles, Briefcase, Calendar, Info, Video } from 'lucide-react';
import { Button, Badge, Loader, EmptyState } from '../../../components/common';
import { candidateApi, companyApi, adminApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const [readFilter, setReadFilter] = useState('ALL');

  const activeApi = role === 'company' ? companyApi : role === 'admin' ? adminApi : candidateApi;
  const queryKey = [`${role || 'candidate'}-notifications`, readFilter];

  // Fetch Notifications
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      activeApi.getNotifications({
        unreadOnly: readFilter === 'UNREAD' ? true : undefined,
      }),
  });

  const notifications = data?.data?.notifications ?? [];

  // Mark Single as Read
  const markReadMutation = useMutation({
    mutationFn: (id) => activeApi.markNotificationAsRead(id),
    onSuccess: () => {
      toast.success('Notification marked as read.');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mark All as Read
  const markAllReadMutation = useMutation({
    mutationFn: () => activeApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read.');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete Notification
  const deleteMutation = useMutation({
    mutationFn: (id) => activeApi.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification removed.');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const getIcon = (type) => {
    switch (type) {
      case 'APPLICATION':
        return <Briefcase className="w-5 h-5 text-brand-400" />;
      case 'INTERVIEW':
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      case 'AI_MATCH':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-accent-cyan" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Notifications..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-brand-500" /> Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline updates, AI candidate match alerts, and interview reminders.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          isLoading={markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
        >
          <CheckCheck className="w-4 h-4 mr-2" /> Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'UNREAD'].map((f) => (
            <button
              key={f}
              onClick={() => setReadFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                readFilter === f
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
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications Found"
          description="You are all caught up! No notifications in this tab."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-6 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                !notif.isRead
                  ? 'border-brand-500/30 bg-brand-500/5'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-2xl bg-slate-800/80 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    {!notif.isRead && <Badge variant="danger" size="sm">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  {(notif.metadata?.roomId || notif.metadata?.meetingLink || notif.metadata?.interviewId) && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const targetId = notif.metadata?.roomId || (notif.metadata?.meetingLink ? notif.metadata.meetingLink.replace('/interview/room/', '') : notif.metadata?.interviewId);
                          navigate(`/interview/room/${targetId}`);
                        }}
                      >
                        <Video className="w-3.5 h-3.5 mr-1" /> Join Private Interview Room
                      </Button>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block pt-1">
                    {new Date(notif.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(notif._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(notif._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
