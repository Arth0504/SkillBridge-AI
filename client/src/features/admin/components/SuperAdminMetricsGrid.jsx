import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building,
  Briefcase,
  FileText,
  Video,
  Code2,
  Sparkles,
  Globe,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  Database
} from 'lucide-react';
import { Badge } from '../../../components/common';

export const SuperAdminMetricsGrid = ({
  totalUsers = 1420,
  activeUsers = 890,
  totalCompanies = 180,
  totalCandidates = 1240,
  totalJobs = 450,
  totalApplications = 3820,
  totalInterviews = 640,
  totalCodingTests = 510,
  totalResumeBuilds = 890,
  totalPortfolioBuilds = 430,
  totalAiRequests = 12400,
  cpuUsage = 24,
  ramUsage = 42,
  diskUsage = 38,
  apiLatency = 45,
  dbHealth = 100
}) => {
  const metrics = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-brand-400', border: 'border-brand-500/30' },
    { label: 'Active Users', value: activeUsers.toLocaleString(), icon: Activity, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Companies', value: totalCompanies.toLocaleString(), icon: Building, color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Candidates', value: totalCandidates.toLocaleString(), icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'Active Jobs', value: totalJobs.toLocaleString(), icon: Briefcase, color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'Applications', value: totalApplications.toLocaleString(), icon: FileText, color: 'text-pink-400', border: 'border-pink-500/30' },
    { label: 'AI Interviews', value: totalInterviews.toLocaleString(), icon: Video, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'Coding Tests', value: totalCodingTests.toLocaleString(), icon: Code2, color: 'text-blue-400', border: 'border-blue-500/30' },
    { label: 'Resume Builds', value: totalResumeBuilds.toLocaleString(), icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Portfolio Websites', value: totalPortfolioBuilds.toLocaleString(), icon: Globe, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'AI Requests', value: totalAiRequests.toLocaleString(), icon: Sparkles, color: 'text-rose-400', border: 'border-rose-500/30' },
    { label: 'API Response Latency', value: `${apiLatency}ms`, icon: Clock, color: 'text-emerald-400', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-4">
      {/* Server Health Status Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs font-bold text-white block">System Health: 99.9% Uptime</span>
            <span className="text-[10px] text-slate-400">All microservices, MongoDB, & Socket.IO operational</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-slate-400">CPU:</span>
            <span className="text-white font-bold">{cpuUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">RAM:</span>
            <span className="text-white font-bold">{ramUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Disk:</span>
            <span className="text-white font-bold">{diskUsage}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">DB:</span>
            <span className="text-emerald-400 font-bold">100% Healthy</span>
          </div>
        </div>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-3.5 rounded-xl bg-slate-900/80 border ${m.border} space-y-1 hover:border-brand-500/50 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{m.label}</span>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className="text-lg font-black text-white font-mono">{m.value}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
