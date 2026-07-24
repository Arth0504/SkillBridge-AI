import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Building, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardShowcaseSection = () => {
  const [activePortal, setActivePortal] = useState('candidate');
  const navigate = useNavigate();

  const portals = [
    { id: 'candidate', label: 'Candidate Portal', icon: User },
    { id: 'company', label: 'Employer Portal', icon: Building },
    { id: 'admin', label: 'Admin Control Plane', icon: ShieldCheck },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Built For Every Stakeholder
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tailored Dashboard Portals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Dedicated workspace views designed specifically for job seekers, hiring teams, and platform controllers.
          </p>

          <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl glass-panel w-fit mx-auto mt-6">
            {portals.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePortal(p.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activePortal === p.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-500'
                }`}
              >
                <p.icon className="w-4 h-4" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activePortal === 'candidate' && (
            <motion.div
              key="candidate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              <div className="lg:col-span-1 space-y-4">
                <Badge variant="purple">Candidate Experience</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Your Personal Career Hub
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Track active job applications, receive direct employer match alerts, practice AI mock interviews, and showcase verified skill badges.
                </p>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Create Free Candidate Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">Candidate Overview</span>
                  <Badge variant="success">Profile 98% Complete</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-slate-400">Applications</p>
                    <p className="text-lg font-bold text-white mt-1">14 Sent</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-slate-400">AI ATS Score</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">94 / 100</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-slate-400">Interviews</p>
                    <p className="text-lg font-bold text-brand-400 mt-1">3 Upcoming</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activePortal === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              <div className="lg:col-span-1 space-y-4">
                <Badge variant="purple">Employer Experience</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Automated Candidate Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Post open tech positions, automatically screen inbound applicants with Gemini AI, and schedule automated technical assessments.
                </p>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Register Enterprise Employer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">Employer Recruitment Hub</span>
                  <Badge variant="purple">6 Active Postings</Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800 flex justify-between items-center border border-slate-700">
                    <div>
                      <p className="font-bold text-white">Senior AI Engineer</p>
                      <p className="text-[11px] text-slate-400">45 Applicants • 32 AI Screened</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activePortal === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              <div className="lg:col-span-1 space-y-4">
                <Badge variant="danger">Control Plane</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Real-time System Monitoring
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Monitor microservice health, Prometheus metrics, audit events, user access permissions, and token queue performance.
                </p>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">Admin Control Center</span>
                  <Badge variant="success">System Healthy 100%</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-slate-400">Active Users</p>
                    <p className="text-lg font-bold text-brand-400 mt-1">4,890</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-slate-400">Security Events</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">0 Critical</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
