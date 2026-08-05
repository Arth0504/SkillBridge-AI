import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/common';
import { useNavigate } from 'react-router-dom';

export const CopilotInsightsCard = ({ insights = [] }) => {
  const navigate = useNavigate();

  const defaultInsights = [
    {
      id: 1,
      title: 'Add 2 more key architecture projects',
      description: 'Candidates with 3+ showcase projects receive 2.4x more interview invitations.',
      impact: '+8% Match',
      actionText: 'Go to Portfolio Builder',
      actionPath: '/candidate/portfolio-builder',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Your resume ATS score can increase by 12%',
      description: 'Add metric bullet points (e.g. "Improved query performance by 40%") to experience.',
      impact: '+12% ATS',
      actionText: 'Open Resume Builder',
      actionPath: '/candidate/resume-builder',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Practice JavaScript & Data Structures mock interview',
      description: 'Complete 1 additional coding assessment to unlock senior developer badge.',
      impact: '+10% Readiness',
      actionText: 'Take Coding Test',
      actionPath: '/candidate/ai-coding',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Link GitHub Repositories to Portfolio',
      description: 'Connect repository star counts and contribution graph to impress recruiters.',
      impact: '+6% Portfolio',
      actionText: 'Connect GitHub',
      actionPath: '/candidate/portfolio-builder',
      priority: 'medium',
    },
  ];

  const activeInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Copilot Action Insights</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
          {activeInsights.length} Recommendations
        </span>
      </div>

      <div className="space-y-3">
        {activeInsights.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{item.title}</span>
                <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {item.impact}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            {item.actionPath && (
              <button
                onClick={() => navigate(item.actionPath)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
              >
                {item.actionText} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
