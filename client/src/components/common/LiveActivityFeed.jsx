import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Shield, User, Globe, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import { useSocket } from '../../context/SocketContext';
import axios from '../../api/axios';

// Self-contained time formatting utility
const getRelativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

export const LiveActivityFeed = ({ limit = 6, userFilter = null }) => {
  const { socket } = useSocket();
  const [activities, setActivities] = useState([]);
  const [unreadIds, setUnreadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch initial audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get('/audit-logs', {
          params: { page: 1, limit },
        });
        if (data?.success && data?.data?.logs) {
          setActivities(data.data.logs);
        }
      } catch (err) {
        console.warn('Failed to load initial audit activity feed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [limit]);

  // Handle auto-updating timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger state update to force re-render and recalculate relative timestamps
      setActivities((prev) => [...prev]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for realtime Socket.IO audit events
  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (payload) => {
      console.log('🔌 [Socket Feed] New activity event:', payload);
      const newLog = payload?.data;
      if (newLog) {
        // Enforce basic candidate/company role constraints on client side as double-safety
        if (userFilter) {
          if (userFilter.role === 'candidate' && String(newLog.userId) !== String(userFilter.id)) {
            return; // Candidate doesn't see other candidates' logs
          }
          if (userFilter.role === 'company') {
            const matchesCompany =
              String(newLog.userId) === String(userFilter.id) ||
              newLog.metadata?.companyId === String(userFilter.id) ||
              newLog.beforeData?.companyId === String(userFilter.id) ||
              newLog.afterData?.companyId === String(userFilter.id);
            if (!matchesCompany) return; // Company only sees their organization logs
          }
        }

        setActivities((prev) => {
          // Prepend and cap length
          const updated = [newLog, ...prev];
          if (updated.length > limit * 2) {
            updated.pop();
          }
          return updated;
        });

        // Mark as unread
        setUnreadIds((prev) => {
          const next = new Set(prev);
          next.add(newLog._id || String(Math.random()));
          return next;
        });
      }
    };

    socket.on('activity:new', handleNewActivity);
    socket.on('timeline:new', handleNewActivity);

    return () => {
      socket.off('activity:new', handleNewActivity);
      socket.off('timeline:new', handleNewActivity);
    };
  }, [socket, limit, userFilter]);

  // Mark all as read when hovered
  const handleMouseEnter = () => {
    if (unreadIds.size > 0) {
      setUnreadIds(new Set());
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 text-slate-400">
        <Activity className="w-6 h-6 animate-pulse text-brand-500" />
        <span className="text-xs">Loading Live Activity Center...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-500 text-center">
        <Activity className="w-7 h-7 text-slate-700/60" />
        <h4 className="text-xs font-bold">No Activity Recorded</h4>
        <p className="text-[10px]">Real-time system activities will appear here as they occur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-1" onMouseEnter={handleMouseEnter}>
      <AnimatePresence initial={false}>
        {activities.slice(0, limit).map((act) => {
          const isUnread = unreadIds.has(act._id);
          const timestamp = act.createdAt || new Date();
          const relativeTime = getRelativeTime(timestamp);
          const locationText = act.city && act.country ? `${act.city}, ${act.country}` : 'System';

          // Set status tags
          let statusBadge = null;
          if (act.status === 'WARNING') {
            statusBadge = <Badge variant="warning" size="xs">Warn</Badge>;
          } else if (act.status === 'FAILURE') {
            statusBadge = <Badge variant="danger" size="xs">Fail</Badge>;
          }

          // Clean verb descriptions
          let actionDesc = act.action ? act.action.replace(/_/g, ' ') : 'General Update';
          
          return (
            <motion.div
              key={act._id || String(Math.random())}
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-4 ${
                isUnread
                  ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-950/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80'
              }`}
            >
              <div className="flex gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isUnread
                    ? 'bg-brand-500/20 text-brand-400'
                    : act.status === 'FAILURE'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
                }`}>
                  {act.action?.includes('SECURITY') || act.action?.includes('LOGIN') ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {actionDesc}
                    </span>
                    {statusBadge}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {act.userModel === 'System' ? 'System process' : `Principal role [${act.role}]`} updated {act.targetCollection || 'telemetry'}
                  </p>

                  <div className="flex items-center gap-3 pt-0.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {relativeTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-500" /> {locationText}
                    </span>
                  </div>
                </div>
              </div>
              
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-brand-500 ring-4 ring-brand-500/20 shrink-0 mt-2" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
export default LiveActivityFeed;
