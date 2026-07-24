import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Building, Briefcase, Award, Sparkles } from 'lucide-react';
import { Badge, Loader } from '../../../components/common';
import { adminApi } from '../../../api';

export const AdminAnalyticsPage = () => {
  const { data: metricsResponse, isLoading } = useQuery({
    queryKey: ['admin-growth-analytics'],
    queryFn: adminApi.getSystemMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Growth & Platform Analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-500" /> Platform Growth & Analytics Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          System-wide analytics reporting candidate growth, employer adoption, top demanded skills, and hiring funnels.
        </p>
      </div>

      {/* Growth Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Candidate Growth Rate', value: '+34% / Mo', icon: Users, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Employer Company Growth', value: '+28% / Mo', icon: Building, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Job Postings Growth', value: '+42% / Mo', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((gr, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400">{gr.label}</p>
              <h3 className="text-2xl font-extrabold text-white mt-1.5">{gr.value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${gr.bg} ${gr.color}`}>
              <gr.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Demand Skills */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-500" /> Top Requested Platform Skills
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { skill: 'React.js / Next.js', frequency: '840 Roles', pct: '88%' },
            { skill: 'Python / PyTorch', frequency: '720 Roles', pct: '75%' },
            { skill: 'Node.js / Express', frequency: '610 Roles', pct: '64%' },
            { skill: 'Docker / Kubernetes', frequency: '540 Roles', pct: '56%' },
          ].map((sk, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white">{sk.skill}</h4>
              <p className="text-[11px] text-brand-400 font-semibold">{sk.frequency}</p>
              <Badge variant="purple" size="sm">{sk.pct} Demand Rate</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
