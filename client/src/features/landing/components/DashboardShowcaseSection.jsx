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
    { id: 'candidate', label: 'Candidate Portal', icon: User, tag: 'Career Dashboard' },
    { id: 'company', label: 'Recruiter Console', icon: Building, tag: 'Hiring Workspace' },
    { id: 'admin', label: 'System Control Plane', icon: ShieldCheck, tag: 'Security & Telemetry' },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/3 w-[380px] h-[380px] bg-brand-500/5 dark:bg-brand-500/3 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Next-Gen Portal Workspace
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans leading-[1.1]">
            Intuitive Hubs for Everyone
          </h2>
          <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 font-sans">
            Clean and synchronized dashboards engineered for developers, engineering leads, and admin operations.
          </p>

          {/* Portal Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 p-1.5 rounded-2xl glass-panel w-fit mx-auto mt-8 bg-white/80 dark:bg-dark-card/60">
            {portals.map((p) => {
              const isActive = activePortal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePortal(p.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-slate-600 dark:text-slate-350 hover:text-brand-500 dark:hover:text-brand-400'
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Preview Browser Mockup container */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activePortal === 'candidate' && (
              <motion.div
                key="candidate"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Details left */}
                <div className="lg:col-span-4 space-y-4">
                  <Badge variant="purple">Candidate Portal</Badge>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight leading-[1.2]">
                    Your Unified Career Sandbox
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                    Practice dynamic AI technical mocks, request compiler diagnostics on coding exercises, manage role applications, and publish credentials direct to recruiters.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" onClick={() => navigate('/auth/register')}>
                      Build Profile <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Browser Mockup right */}
                <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  {/* Glass reflection gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                  {/* Top Header Mockup */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400 font-mono ml-2">skillbridge.ai/candidate/dashboard</span>
                    </div>
                    <Badge variant="success">Profile 98% Verified</Badge>
                  </div>
                  {/* Browser content details */}
                  <div className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Applied Roles</span>
                        <h4 className="text-lg font-black">14 Sent</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">ATS Check</span>
                        <h4 className="text-lg font-black text-emerald-400">96 / 100</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Interview Queue</span>
                        <h4 className="text-lg font-black text-brand-400">3 Pending</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePortal === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Details left */}
                <div className="lg:col-span-4 space-y-4">
                  <Badge variant="purple">Employer Portal</Badge>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight leading-[1.2]">
                    Recruit Engineering Talent 10x Faster
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                    Post corporate job openings, audit incoming candidate portfolios, screen voice recordings with transcript parsers, and access technical report summaries.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" onClick={() => navigate('/auth/register')}>
                      Employer Console <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Browser Mockup right */}
                <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400 font-mono ml-2">skillbridge.ai/employer/dashboard</span>
                    </div>
                    <Badge variant="purple">Enterprise screening</Badge>
                  </div>
                  {/* Browser content details */}
                  <div className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Active Jobs</span>
                        <h4 className="text-lg font-black">6 Posted</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Candidates Screened</span>
                        <h4 className="text-lg font-black text-brand-400">182 Total</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Avg Match Accuracy</span>
                        <h4 className="text-lg font-black text-emerald-400">94.8% Score</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePortal === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Details left */}
                <div className="lg:col-span-4 space-y-4">
                  <Badge variant="purple">Admin Panel</Badge>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight leading-[1.2]">
                    Total System Telemetry Control
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                    Track AI service usage, verify company registration documents, moderate active job listings, and inspect growth performance analytics.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" onClick={() => navigate('/auth/register')}>
                      System Access <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Browser Mockup right */}
                <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400 font-mono ml-2">skillbridge.ai/admin/dashboard</span>
                    </div>
                    <Badge variant="purple">Control Plane Active</Badge>
                  </div>
                  {/* Browser content details */}
                  <div className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">Verify Requests</span>
                        <h4 className="text-lg font-black text-amber-400">8 Pending</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]">AI Usage Volume</span>
                        <h4 className="text-lg font-black text-brand-400">92.4k Requests</h4>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                        <span className="text-slate-400 text-[10px]  ">Users Registered</span>
                        <h4 className="text-lg font-black">12.5k Total</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
