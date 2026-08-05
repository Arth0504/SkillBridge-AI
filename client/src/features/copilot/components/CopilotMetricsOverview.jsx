import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileCheck,
  Globe,
  Code2,
  MessageSquare,
  UserCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Badge } from '../../../components/common';

export const CopilotMetricsOverview = ({
  careerScore = 88,
  resumeStrength = 90,
  portfolioStrength = 85,
  codingReadiness = 82,
  interviewReadiness = 86,
  profileCompletion = 95,
  jobMatchScore = 89,
  applicationSuccessRate = 72,
  aiConfidence = 94
}) => {
  const metrics = [
    { label: 'Resume ATS Strength', value: `${resumeStrength}%`, icon: FileCheck, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Portfolio Strength', value: `${portfolioStrength}%`, icon: Globe, color: 'text-brand-400', border: 'border-brand-500/30' },
    { label: 'Coding Readiness', value: `${codingReadiness}%`, icon: Code2, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'Interview Readiness', value: `${interviewReadiness}%`, icon: MessageSquare, color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Profile Completion', value: `${profileCompletion}%`, icon: UserCheck, color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'Job Match Score', value: `${jobMatchScore}%`, icon: TrendingUp, color: 'text-pink-400', border: 'border-pink-500/30' },
    { label: 'App Success Rate', value: `${applicationSuccessRate}%`, icon: Award, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'AI Confidence Meter', value: `${aiConfidence}%`, icon: Cpu, color: 'text-rose-400', border: 'border-rose-500/30' },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Circular Career Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5" /> AI Career Copilot Active
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Overall AI Career Score: <span className="text-brand-400">{careerScore}/100</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Your candidate profile, ATS resume evaluation, portfolio website, coding scores, and mock interview analytics indicate top 12% candidate readiness.
          </p>
        </div>

        {/* Circular Progress Meter */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-500 transition-all duration-1000"
              strokeDasharray={`${careerScore}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-white">{careerScore}</span>
            <span className="text-[9px] font-bold uppercase text-slate-400">Score</span>
          </div>
        </div>
      </motion.div>

      {/* Grid of 8 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3.5 rounded-xl bg-slate-900/80 border ${m.border} space-y-1.5 hover:border-brand-500/40 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="text-xl font-black text-white font-mono">{m.value}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
