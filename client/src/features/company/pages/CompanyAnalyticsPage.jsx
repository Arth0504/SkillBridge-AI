import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Eye, Clock, Building, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { companyApi } from '../../../api';

export const CompanyAnalyticsPage = () => {
  // Fetch Analytics & Job Performance Data
  const { data: analyticsResponse, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: companyApi.getDashboardAnalytics,
  });

  const { data: jobPerfResponse } = useQuery({
    queryKey: ['company-job-performance'],
    queryFn: companyApi.getJobPerformance,
  });

  const analytics = analyticsResponse?.data || {};
  const jobPerformance = jobPerfResponse?.data?.performance || [
    { title: 'Senior AI Engineer', department: 'Core AI', views: 340, applications: 45, conversion: '13.2%' },
    { title: 'Full Stack React Specialist', department: 'Frontend', views: 280, applications: 32, conversion: '11.4%' },
    { title: 'Lead Python Backend Developer', department: 'Platform', views: 210, applications: 28, conversion: '13.3%' },
    { title: 'Principal MLOps Architect', department: 'MLOps', views: 190, applications: 19, conversion: '10.0%' },
  ];

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Hiring Analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-500" /> Employer Hiring Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Deep telemetry on hiring funnel conversion rates, job post views, time-to-hire, and department analytics.
        </p>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Job Impressions', value: analytics.totalViews || '1,020', icon: Eye, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Avg Candidate Conversion', value: analytics.conversionRate || '12.4%', icon: TrendingUp, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
          { label: 'Average Time-to-Hire', value: analytics.avgTimeToHire || '14 Days', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'AI Screening Efficiency', value: analytics.aiEfficiency || '98.5%', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-800"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{kpi.value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hiring Funnel Breakdown */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" /> Hiring Conversion Funnel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1. Impressions / Views', count: '1,020', pct: '100%', color: 'border-brand-500/40 bg-brand-500/10' },
            { step: '2. Applications', count: '142', pct: '13.9%', color: 'border-accent-cyan/40 bg-accent-cyan/10' },
            { step: '3. Interviewed', count: '32', pct: '22.5%', color: 'border-purple-500/40 bg-purple-500/10' },
            { step: '4. Hired / Placed', count: '8', pct: '25.0%', color: 'border-emerald-500/40 bg-emerald-500/10' },
          ].map((f, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${f.color} space-y-2 text-center`}>
              <span className="text-[11px] font-bold text-slate-400 block">{f.step}</span>
              <h4 className="text-2xl font-black text-white">{f.count}</h4>
              <p className="text-xs font-semibold text-slate-300">Conversion: {f.pct}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-500" /> Role-Level Performance Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Job Views</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {jobPerformance.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{row.title}</td>
                  <td className="py-4 px-4">{row.department}</td>
                  <td className="py-4 px-4 font-semibold text-brand-400">{row.views}</td>
                  <td className="py-4 px-4 font-semibold text-accent-cyan">{row.applications}</td>
                  <td className="py-4 px-4"><Badge variant="success">{row.conversion}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
