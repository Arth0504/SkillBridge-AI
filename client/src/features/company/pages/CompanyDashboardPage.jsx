import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building,
  Briefcase,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  BarChart3,
  TrendingUp,
  FileCheck,
  UserCheck,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { Avatar } from '../../../components/common/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { companyApi } from '../../../api';

export const CompanyDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // React Query Fetching
  const { data: summaryResponse, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['company-dashboard-summary'],
    queryFn: companyApi.getDashboardSummary,
  });

  const { data: recentAppsResponse } = useQuery({
    queryKey: ['company-recent-applications'],
    queryFn: companyApi.getRecentApplications,
  });

  const { data: interviewsResponse } = useQuery({
    queryKey: ['company-dashboard-interviews'],
    queryFn: companyApi.getDashboardInterviews,
  });

  const summary = summaryResponse?.data || {};
  const recentApps = recentAppsResponse?.data?.applications ?? [];
  const upcomingInterviews = interviewsResponse?.data?.interviews ?? [];

  const stats = [
    { label: 'Active Job Posts', value: summary?.activeJobsCount ?? 0, icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Total Applications', value: summary?.totalApplications ?? 0, icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'AI-Screened Candidates', value: summary?.aiScreenedCount ?? 0, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Interviews Scheduled', value: summary?.upcomingInterviewsCount ?? upcomingInterviews.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  if (isLoadingSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Recruiter Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="purple" icon={Building}>
              Enterprise Hiring Portal
            </Badge>
            <Badge variant="success">Verified Employer</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {user?.companyName || 'SkillBridge Enterprise Recruiter'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Automated AI candidate evaluation, resume scoring, technical coding assessments, and interview scheduling pipelines.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" onClick={() => navigate('/company/jobs/new')}>
              <Plus className="w-4 h-4 mr-2" /> Post New Position
            </Button>
            <Button variant="secondary" onClick={() => navigate('/company/applications')}>
              <Users className="w-4 h-4 mr-2" /> Review Applicants
            </Button>
            <Button variant="outline" onClick={() => navigate('/company/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" /> Hiring Analytics
            </Button>
          </div>
        </div>

        {/* Company Quick Profile Pill */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0 bg-white/5 backdrop-blur-md">
          <Avatar src={user?.logoUrl} name={user?.companyName} isSquare size="lg" className="w-14 h-14" />
          <div>
            <h3 className="text-base font-bold text-white">{user?.companyName || 'Company Name'}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span
              className="text-xs text-brand-400 font-semibold cursor-pointer hover:underline inline-flex items-center gap-1 mt-1"
              onClick={() => navigate('/company/profile')}
            >
              Company Profile <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((st, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{st.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{st.value}</h3>
            </div>
            <div className={`p-3.5 rounded-2xl ${st.bg} ${st.color} shadow-inner`}>
              <st.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid: Hiring Pipeline & Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiring Pipeline Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Hiring Pipeline Funnel
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { stage: 'Applications Received', count: 142, pct: 100, color: 'bg-brand-500' },
              { stage: 'AI ATS Screened', count: 89, pct: 63, color: 'bg-accent-cyan' },
              { stage: 'Shortlisted & Interviewed', count: 32, pct: 22, color: 'bg-purple-500' },
              { stage: 'Offers Extended', count: 8, pct: 6, color: 'bg-emerald-500' },
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{p.stage}</span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{p.count} ({p.pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className={`${p.color} h-full rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full justify-center mt-2" onClick={() => navigate('/company/analytics')}>
            Full Pipeline Analytics <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        {/* Active Jobs Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-500" /> Published Job Postings
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/company/jobs')}>
              Manage All Roles <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Senior AI Engineer', location: 'Remote', salary: '$140k - $180k', applicants: 45, status: 'Active' },
              { title: 'Full Stack React Specialist', location: 'New York, NY', salary: '$120k - $150k', applicants: 32, status: 'Active' },
              { title: 'Lead Python Backend Developer', location: 'San Francisco, CA', salary: '$160k - $200k', applicants: 28, status: 'Active' },
            ].map((job, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {job.location} • {job.salary} • <strong>{job.applicants} Applicants</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">{job.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/company/applications')}>
                    Review Candidates
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid: Upcoming Interviews & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Scheduled Interviews
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/company/interviews')}>
              Interview Hub <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingInterviews.map((iv, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{iv.candidateName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{iv.title}</p>
                  </div>
                  <Badge variant="success" size="sm">{iv.type}</Badge>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-500/10 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {new Date(iv.date || Date.now()).toLocaleString()}
                  </span>
                  <Button variant="primary" size="sm" onClick={() => navigate('/company/interviews')}>
                    Launch Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Candidate Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" /> Recent Candidate Activity
            </h3>
          </div>

          <div className="space-y-3">
            {recentApps.map((act, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.candidateName}</h4>
                    {act.matchScore && <Badge variant="purple">{act.matchScore}% Match</Badge>}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{act.role} • {act.createdAt}</p>
                </div>
                <Badge variant="info">{act.status}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
