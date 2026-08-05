import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common';

export const CopilotJobMatchAnalytics = ({ applications = [] }) => {
  const defaultApplications = [
    {
      id: 'app-1',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'TechFlow Systems',
      overallMatch: 92,
      resumeMatch: 95,
      portfolioMatch: 90,
      skillMatch: 94,
      expMatch: 88,
      status: 'Shortlisted',
      aiRecommendation: 'High Match Candidate',
    },
    {
      id: 'app-2',
      jobTitle: 'Lead Backend Developer',
      company: 'CloudScale Data',
      overallMatch: 86,
      resumeMatch: 88,
      portfolioMatch: 84,
      skillMatch: 89,
      expMatch: 83,
      status: 'Coding Round',
      aiRecommendation: 'Strong Match Candidate',
    },
    {
      id: 'app-3',
      jobTitle: 'AI Platform Engineer',
      company: 'Cognitive Dynamics',
      overallMatch: 79,
      resumeMatch: 82,
      portfolioMatch: 76,
      skillMatch: 80,
      expMatch: 78,
      status: 'Under Review',
      aiRecommendation: 'Moderate Match Candidate',
    },
  ];

  const activeApps = applications.length > 0 ? applications : defaultApplications;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Applied Job Match Analytics</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-950 text-pink-300 border border-pink-800">
          {activeApps.length} Tracked Roles
        </span>
      </div>

      <div className="space-y-3">
        {activeApps.map((app, idx) => (
          <div key={app.id || idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-white">{app.jobTitle}</h4>
                <span className="text-[11px] text-slate-400 font-semibold">{app.company}</span>
              </div>
              <div className="text-right">
                <Badge variant={app.overallMatch >= 85 ? 'success' : 'info'}>
                  {app.overallMatch}% Match
                </Badge>
                <span className="text-[9px] font-mono text-slate-400 block mt-1">{app.status}</span>
              </div>
            </div>

            {/* Match Breakdown Grid */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center pt-1 border-t border-slate-800">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Resume</span>
                <span className="text-emerald-400 font-bold">{app.resumeMatch}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Portfolio</span>
                <span className="text-brand-400 font-bold">{app.portfolioMatch}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Skills</span>
                <span className="text-cyan-400 font-bold">{app.skillMatch}%</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block">Experience</span>
                <span className="text-purple-400 font-bold">{app.expMatch}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
