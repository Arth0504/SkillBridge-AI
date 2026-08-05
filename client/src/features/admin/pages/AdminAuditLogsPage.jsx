import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Globe,
  Monitor,
  Eye,
  EyeOff,
  Download,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Database
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState } from '../../../components/common';
import { adminApi } from '../../../api';
import { useSocket } from '../../../context/SocketContext';

// Self-contained time formatting utility
const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

export const AdminAuditLogsPage = () => {
  const { socket } = useSocket();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // Local list to allow append and prepending of real-time socket records
  const [logs, setLogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);

  // Fetch Security Audit Logs
  const { isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-audit-logs', roleFilter, statusFilter, moduleFilter, startDate, endDate, page],
    queryFn: async () => {
      const response = await adminApi.getAuditLogs({
        page,
        limit: 15,
        search: search || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        module: moduleFilter === 'ALL' ? undefined : moduleFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (response?.success && response?.data) {
        const newLogs = response.data.logs || [];
        
        if (page === 1) {
          setLogs(newLogs);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
        }
        
        setHasMore(newLogs.length === 15);
      }
      return response;
    },
  });

  // Handle free text search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isFirstLoad.current) {
        setPage(1);
        refetch();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    isFirstLoad.current = false;
  }, []);

  // Listen to realtime Socket.IO audit events
  useEffect(() => {
    if (!socket) return;

    const handleNewAudit = (payload) => {
      console.log('🔌 [Socket timeline] Prepending realtime audit event:', payload);
      const newLog = payload?.data;
      if (newLog) {
        setLogs((prev) => {
          // Check if it already exists in state
          if (prev.some((l) => l._id === newLog._id)) return prev;
          return [newLog, ...prev];
        });
      }
    };

    socket.on('audit:new', handleNewAudit);
    socket.on('timeline:new', handleNewAudit);

    return () => {
      socket.off('audit:new', handleNewAudit);
      socket.off('timeline:new', handleNewAudit);
    };
  }, [socket]);

  // Export handlers
  const handleExport = (format) => {
    const token = localStorage.getItem('accessToken') || '';
    const queryParams = new URLSearchParams({
      token,
      search,
      role: roleFilter,
      status: statusFilter,
      module: moduleFilter,
      startDate,
      endDate,
    });
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const exportUrl = `${baseUrl}/api/v1/audit-logs/export/${format}?${queryParams.toString()}`;
    window.open(exportUrl, '_blank');
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setModuleFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setTimeout(() => refetch(), 0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-brand-500" /> Enterprise Activity Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Production-grade activity tracing system logging platform actions, security profiles, and microservice status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" /> Export PDF / Report
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setPage(1); refetch(); }}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Control Board */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/60 dark:border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Search Details</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search action, IP, location..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-white focus:border-brand-500 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Actor Role */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Actor Role</label>
            <select
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 focus:border-brand-500 focus:outline-none"
              value={roleFilter}
              onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}
            >
              <option value="ALL">All Roles</option>
              <option value="candidate">Candidate</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Module */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Module</label>
            <select
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 focus:border-brand-500 focus:outline-none"
              value={moduleFilter}
              onChange={(e) => { setPage(1); setModuleFilter(e.target.value); }}
            >
              <option value="ALL">All Collections</option>
              <option value="Job">Job Positions</option>
              <option value="Application">Job Applications</option>
              <option value="Interview">Interviews</option>
              <option value="OfferLetter">Offers</option>
              <option value="Candidate">Candidate Profiles</option>
              <option value="Company">Company Profiles</option>
              <option value="Notification">Notifications</option>
              <option value="AuditLog">Audit Log</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Log Status</label>
            <select
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 focus:border-brand-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>
        </div>

        {/* Date Ranges & Reset */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">From:</span>
              <input
                type="date"
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 focus:outline-none"
                value={startDate}
                onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">To:</span>
              <input
                type="date"
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 focus:outline-none"
                value={endDate}
                onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Reset All Filters
          </Button>
        </div>
      </div>

      {/* Main Timeline View */}
      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader size="lg" text="Loading security timeline streams..." />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Logs Recorded"
          description="We couldn't find any enterprise audit logs matching the active criteria."
        />
      ) : (
        <div className="relative pl-6 md:pl-8 space-y-6">
          {/* Vertical Timeline Track Line */}
          <div className="absolute left-[11px] md:left-[15px] top-4 bottom-4 w-[2px] bg-dashed bg-gradient-to-b from-brand-500 via-slate-800 to-brand-500 opacity-60 border-l border-dashed border-slate-700/80" />

          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const isExpanded = expandedLogId === log._id;
              const locationText = log.city && log.country ? `${log.city}, ${log.country}` : 'System Location';
              const isSecurity = log.action?.includes('SECURITY') || log.action?.includes('LOGIN');

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  {/* Timeline Node Point indicator */}
                  <div className={`absolute -left-[30px] md:-left-[34px] top-1.5 w-[10px] h-[10px] rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
                    log.status === 'FAILURE' 
                      ? 'bg-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                      : log.status === 'WARNING'
                        ? 'bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'bg-brand-500 border-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                  }`} />

                  {/* Card Panel wrapper */}
                  <div className={`glass-panel p-5 rounded-2xl border transition-all duration-300 ${
                    isExpanded 
                      ? 'border-brand-500/50 bg-slate-900/60' 
                      : 'border-slate-200/50 dark:border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/20'
                  }`}>
                    {/* Collapsed view structure */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-blue-500 font-mono tracking-tight uppercase">
                            {log.action?.replace(/_/g, ' ')}
                          </h4>
                          <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'WARNING' ? 'warning' : 'danger'} size="sm">
                            {log.status}
                          </Badge>
                          <Badge variant="secondary" size="sm" className="font-mono">
                            {log.targetCollection || 'General'}
                          </Badge>
                        </div>

                        {/* Event action descriptions */}
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          Principal <strong className="font-bold text-slate-800 dark:text-slate-200">{log.userId || 'System'}</strong> ({log.role || 'system'}) initiated query in collection <strong className="font-semibold">{log.targetCollection || 'General'}</strong>
                        </p>

                        {/* Metadata pills */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {formatDateTime(log.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" /> {locationText} (IP: {log.ipAddress || '127.0.0.1'})
                          </span>
                          {log.deviceInfo && (
                            <span className="flex items-center gap-1">
                              <Monitor className="w-3 h-3 text-slate-400" /> {log.deviceInfo.browser} ({log.deviceInfo.os})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand / Details control */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Collapse Details
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect telemetry
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Expanded JSON diff drawer */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Request Identification Trace</span>
                              <div className="grid grid-cols-[80px_1fr] gap-1.5">
                                <span className="text-slate-500">Request ID:</span>
                                <span className="text-slate-300 select-all">{log.requestId || 'N/A'}</span>
                                <span className="text-slate-500">Device UA:</span>
                                <span className="text-slate-400 truncate max-w-[280px]" title={log.userAgent}>{log.userAgent || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Principal Details</span>
                              <div className="grid grid-cols-[80px_1fr] gap-1.5">
                                <span className="text-slate-500">Principal ID:</span>
                                <span className="text-slate-300 select-all">{log.userId || 'System/Autonomous'}</span>
                                <span className="text-slate-500">Model Ref:</span>
                                <span className="text-slate-300">{log.userModel || 'Autonomous'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Data Diffs JSON Block */}
                          {(log.beforeData || log.afterData) && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Data State Diffs (Jira / GitHub style)</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.beforeData && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Before modification state</span>
                                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-rose-400 overflow-x-auto max-h-[160px] font-mono leading-normal">
                                      {JSON.stringify(log.beforeData, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.afterData && (
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">After modification state</span>
                                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto max-h-[160px] font-mono leading-normal">
                                      {JSON.stringify(log.afterData, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Additional Metadata context</span>
                              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto font-mono leading-normal">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="pt-4 pb-8 text-center">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Fetching more activities...
                  </>
                ) : (
                  'Load More Activities'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminAuditLogsPage;
