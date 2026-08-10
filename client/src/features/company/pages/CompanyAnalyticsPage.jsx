import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Eye, Clock, Building, Sparkles, Database, Trash2 } from 'lucide-react';
import { Button, Badge, Loader, AnimatedMetricCard } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

export const CompanyAnalyticsPage = () => {
  const queryClient = useQueryClient();

  // Fetch Analytics & Job Performance Data
  const { data: analyticsResponse, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: companyApi.getDashboardAnalytics,
  });

  const { data: jobPerfResponse } = useQuery({
    queryKey: ['company-job-performance'],
    queryFn: companyApi.getJobPerformance,
  });

  const seedMutation = useMutation({
    mutationFn: companyApi.seedDemoAnalytics,
    onSuccess: () => {
      toast.success('Realistic Hiring Analytics demo data seeded successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['company-job-performance'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to seed demo analytics data.');
    },
  });

  const clearMutation = useMutation({
    mutationFn: companyApi.clearDemoAnalytics,
    onSuccess: () => {
      toast.success('Demo analytics data cleared.');
      queryClient.invalidateQueries({ queryKey: ['company-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['company-job-performance'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to clear demo analytics data.');
    },
  });

  const analytics = analyticsResponse?.data?.analytics || analyticsResponse?.data || {};
  const jobPerformance = jobPerfResponse?.data?.jobs ?? jobPerfResponse?.data?.performance ?? [];

  const viewsCount = analytics.funnel?.views ?? analytics.totalViews ?? 0;
  const appsCount = analytics.funnel?.applications ?? analytics.totalApplications ?? 0;
  const interviewedCount = analytics.funnel?.interviewed ?? analytics.totalInterviewed ?? 0;
  const hiredCount = analytics.funnel?.hired ?? analytics.totalHired ?? 0;

  const viewsConversion = analytics.funnel?.viewsConversion || '100%';
  const appsConversion = analytics.funnel?.applicationsConversion || (viewsCount > 0 ? `${((appsCount / viewsCount) * 100).toFixed(1)}%` : '0%');
  const interviewedConversion = analytics.funnel?.interviewedConversion || (appsCount > 0 ? `${((interviewedCount / appsCount) * 100).toFixed(1)}%` : '0%');
  const hiredConversion = analytics.funnel?.hiredConversion || (interviewedCount > 0 ? `${((hiredCount / interviewedCount) * 100).toFixed(1)}%` : '0%');

  const funnelList = [
    { step: '1. Impressions / Views', count: viewsCount.toLocaleString(), pct: viewsConversion, color: 'border-brand-500/40 bg-brand-500/10' },
    { step: '2. Applications', count: appsCount.toLocaleString(), pct: appsConversion, color: 'border-accent-cyan/40 bg-accent-cyan/10' },
    { step: '3. Interviewed', count: interviewedCount.toLocaleString(), pct: interviewedConversion, color: 'border-purple-500/40 bg-purple-500/10' },
    { step: '4. Hired / Placed', count: hiredCount.toLocaleString(), pct: hiredConversion, color: 'border-emerald-500/40 bg-emerald-500/10' },
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-brand-500" /> Employer Hiring Analytics
            </h1>
            {analytics.isDemo && (
              <Badge variant="warning" size="sm" className="font-bold">
                DEMO DATA ACTIVE
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep telemetry on hiring funnel conversion rates, job post views, time-to-hire, and department analytics.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2">
          {analytics.isDemo ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={clearMutation.isPending}
              onClick={() => clearMutation.mutate()}
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear Demo Data
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              isLoading={seedMutation.isPending}
              onClick={() => seedMutation.mutate()}
            >
              <Database className="w-4 h-4 mr-1.5 text-brand-400" /> Seed Demo Analytics
            </Button>
          )}
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Job Impressions', value: typeof analytics.totalViews === 'number' ? analytics.totalViews.toLocaleString() : (analytics.totalViews ?? 0), icon: Eye, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Avg Candidate Conversion', value: analytics.conversionRate ?? '0%', icon: TrendingUp, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
          { label: 'Average Time-to-Hire', value: analytics.avgTimeToHire ?? 'N/A', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'AI Screening Efficiency', value: analytics.aiEfficiency ?? '0%', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((kpi, idx) => (
          <AnimatedMetricCard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            bg={kpi.bg}
          />
        ))}
      </div>

      {/* Hiring Funnel Breakdown */}
      <div className="glass-panel p-8 rounded-2xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" /> Hiring Conversion Funnel
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Dynamically Calculated From Database</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {funnelList.map((f, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${f.color} space-y-2 text-center`}>
              <span className="text-[11px] font-bold text-slate-400 block">{f.step}</span>
              <h4 className="text-2xl font-black text-white">{f.count}</h4>
              <p className="text-xs font-semibold text-slate-300">Conversion: {f.pct}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="glass-panel p-8 rounded-2xl space-y-6 border border-slate-200/80 dark:border-slate-800">
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
              {jobPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No active job listings found. Click "Seed Demo Analytics" above to populate sample data.
                  </td>
                </tr>
              ) : (
                jobPerformance.map((row, idx) => {
                  const views = row.views ?? 0;
                  const apps = row.applications ?? row.totalApplications ?? row.applicationsCount ?? 0;
                  const convRate = typeof row.conversionRate === 'number'
                    ? `${row.conversionRate}%`
                    : row.conversion || (views > 0 ? `${((apps / views) * 100).toFixed(1)}%` : '0%');

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        {row.title}
                        {row.isDemo && <Badge variant="warning" size="sm" className="text-[10px]">DEMO</Badge>}
                      </td>
                      <td className="py-4 px-4">{row.department || 'Engineering'}</td>
                      <td className="py-4 px-4 font-semibold text-brand-400">{views.toLocaleString()}</td>
                      <td className="py-4 px-4 font-semibold text-accent-cyan">{apps.toLocaleString()}</td>
                      <td className="py-4 px-4"><Badge variant="success">{convRate}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
