import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Download, Search, FileText, Filter } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const SuperAdminSystemLogs = () => {
  const [logCategory, setLogCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([
    { id: 1, type: 'security', level: 'WARN', msg: 'Failed login attempt from IP 192.168.1.45 (Invalid password)', timestamp: '2026-08-05 10:48:12' },
    { id: 2, type: 'audit', level: 'INFO', msg: 'Candidate Profile updated for user arth@skillbridge.ai', timestamp: '2026-08-05 10:42:01' },
    { id: 3, type: 'api', level: 'INFO', msg: 'POST /api/candidate/suggest-content 200 OK (320ms)', timestamp: '2026-08-05 10:39:15' },
    { id: 4, type: 'error', level: 'ERROR', msg: 'Socket.IO connection timeout for client session #4512', timestamp: '2026-08-05 10:30:22' },
    { id: 5, type: 'login', level: 'INFO', msg: 'User admin@skillbridge.ai authenticated via JWT Bearer', timestamp: '2026-08-05 10:15:00' },
  ]);

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "system_audit_logs.json");
    downloadAnchor.click();
    toast.success('Exported system audit logs to JSON!');
  };

  const filteredLogs = logs.filter((l) => {
    const matchesCategory = logCategory === 'all' || l.type === logCategory;
    const matchesSearch = l.msg.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Audit & Security Logs</h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            value={logCategory}
            onChange={(e) => setLogCategory(e.target.value)}
          >
            <option value="all">All Log Types</option>
            <option value="error">Error Logs</option>
            <option value="security">Security Logs</option>
            <option value="audit">Audit Logs</option>
            <option value="login">Login Logs</option>
            <option value="api">API Logs</option>
          </select>

          <Button variant="outline" size="xs" onClick={handleExportLogs}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Log Entries Container */}
      <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto custom-scrollbar">
        {filteredLogs.map((l) => (
          <div
            key={l.id}
            className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${
              l.level === 'ERROR'
                ? 'border-rose-800/60 bg-rose-950/20 text-rose-300'
                : l.level === 'WARN'
                ? 'border-amber-800/60 bg-amber-950/20 text-amber-300'
                : 'border-slate-800 bg-slate-950/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${l.level === 'ERROR' ? 'bg-rose-900 text-rose-200' : l.level === 'WARN' ? 'bg-amber-900 text-amber-200' : 'bg-slate-800 text-slate-300'}`}>
                {l.level}
              </span>
              <span className="truncate">{l.msg}</span>
            </div>
            <span className="text-[10px] text-slate-500 shrink-0">{l.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
