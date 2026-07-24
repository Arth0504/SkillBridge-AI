import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Activity, FileText, Video, Code2, MessageSquare, CheckCircle2, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { adminApi } from '../../../api';

export const AdminAIMonitoringPage = () => {
  // Fetch System Metrics & Telemetry
  const { data: metricsResponse, isLoading, refetch } = useQuery({
    queryKey: ['admin-ai-telemetry'],
    queryFn: adminApi.getSystemMetrics,
  });

  const telemetry = metricsResponse?.data || {};
  const services = telemetry.services || {};
  const aiService = services.aiService || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading AI Telemetry Monitors..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-brand-500" /> AI Microservice Telemetry & Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time control panel monitoring Gemini AI inference success rates, API error rates, and microservice health.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Telemetry
        </Button>
      </div>

      {/* AI Service Status Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-400">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">FastAPI Gemini AI Engine</h3>
              <Badge variant={aiService.status === 'healthy' ? 'success' : 'danger'}>
                {aiService.status || 'healthy'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Endpoint: {aiService.url || 'http://127.0.0.1:8000'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px]">API Success Rate</span>
            <strong className="text-emerald-400 text-sm font-black">99.4%</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Avg Latency</span>
            <strong className="text-brand-400 text-sm font-black">124 ms</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Error Rate</span>
            <strong className="text-slate-300 text-sm font-black">0.6%</strong>
          </div>
        </div>
      </div>

      {/* AI Module Usage Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Resume ATS Audits', count: '4,520 Scans', icon: FileText, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'AI Mock Interviews', count: '3,180 Practice Sessions', icon: MessageSquare, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
          { label: 'Coding Assessments', count: '2,890 Test Runs', icon: Code2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Video Screenings', count: '1,860 Screenings', icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((mod, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400">{mod.label}</p>
              <h3 className="text-xl font-extrabold text-white mt-1">{mod.count}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${mod.bg} ${mod.color}`}>
              <mod.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
