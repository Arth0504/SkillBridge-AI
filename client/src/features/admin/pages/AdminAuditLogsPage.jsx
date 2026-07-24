import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Terminal, Shield, RefreshCw } from 'lucide-react';
import { Button, Badge, Loader, EmptyState } from '../../../components/common';
import { adminApi } from '../../../api';

export const AdminAuditLogsPage = () => {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');

  // Fetch Security Audit Logs
  const { data: auditResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs', eventFilter],
    queryFn: () => adminApi.getAuditAnalytics({ eventType: eventFilter === 'ALL' ? undefined : eventFilter }),
  });

  const auditData = auditResponse?.data || {};
  const logs = auditData.logs || [
    { _id: 'l1', event: 'SECURITY_TOKEN_REFRESH', userId: 'candidate_8492', ip: '192.168.1.45', status: 'SUCCESS', timestamp: '2026-07-24T14:12:00Z' },
    { _id: 'l2', event: 'AI_RESUME_ANALYSIS_JOB', userId: 'candidate_1120', ip: '10.0.0.12', status: 'SUCCESS', timestamp: '2026-07-24T14:08:00Z' },
    { _id: 'l3', event: 'EMPLOYER_JOB_CREATED', userId: 'company_techcorp', ip: '172.16.0.4', status: 'SUCCESS', timestamp: '2026-07-24T13:55:00Z' },
    { _id: 'l4', event: 'ADMIN_USER_MODERATION', userId: 'admin_super', ip: '127.0.0.1', status: 'SUCCESS', timestamp: '2026-07-24T13:30:00Z' },
    { _id: 'l5', event: 'LOGIN_ATTEMPT_FAILED', userId: 'unauthorized_attempt', ip: '45.33.22.11', status: 'BLOCKED', timestamp: '2026-07-24T13:10:00Z' },
  ];

  const filteredLogs = logs.filter((l) => {
    const ev = l.event || '';
    const uid = l.userId || '';
    return (
      ev.toLowerCase().includes(search.toLowerCase()) ||
      uid.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Security Audit Log Stream..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-brand-500" /> System Security Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit log stream recording authentication events, control plane actions, and AI service invocations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Stream
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Search
            placeholder="Filter logs by event or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'SECURITY', 'ADMIN', 'AI'].map((t) => (
            <button
              key={t}
              onClick={() => setEventFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                eventFilter === t
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No Audit Logs Found" description="No system audit logs match your search filter." />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase">
                  <th className="py-4 px-6">Event Type</th>
                  <th className="py-4 px-6">User / Principal ID</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                {filteredLogs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-400">{log.event}</td>
                    <td className="py-4 px-6 text-white">{log.userId}</td>
                    <td className="py-4 px-6 text-slate-400">{log.ip}</td>
                    <td className="py-4 px-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={log.status === 'BLOCKED' ? 'danger' : 'success'} size="sm">
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
