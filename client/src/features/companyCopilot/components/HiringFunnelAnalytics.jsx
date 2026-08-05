import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Filter, CheckCircle2, Clock } from 'lucide-react';

export const HiringFunnelAnalytics = ({ funnelList = [], avgAtsScore = 84 }) => {
  const initialFunnelStages = [
    { stage: 'Applied Candidates', count: 248, percentage: 100, color: 'from-blue-500 to-indigo-500' },
    { stage: 'ATS Screened (70%+ ATS)', count: 164, percentage: 66, color: 'from-purple-500 to-pink-500' },
    { stage: 'Shortlisted for Testing', count: 86, percentage: 35, color: 'from-emerald-500 to-teal-500' },
    { stage: 'AI & Technical Interview', count: 32, percentage: 13, color: 'from-amber-500 to-orange-500' },
    { stage: 'Executive Offer Extended', count: 8, percentage: 3.2, color: 'from-brand-500 to-cyan-500' },
    { stage: 'Final Hires Joined', count: 6, percentage: 2.4, color: 'from-emerald-400 to-emerald-600' },
  ];

  const displayFunnel = funnelList.length > 0 ? funnelList : initialFunnelStages;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Real-Time Socket.IO Hiring Funnel Analytics</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Socket Sync
        </span>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Time-to-Hire</span>
          <span className="text-lg font-black text-emerald-400 font-mono">14 Days</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg ATS Score</span>
          <span className="text-lg font-black text-brand-400 font-mono">{avgAtsScore}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Interview Drop-off %</span>
          <span className="text-lg font-black text-amber-400 font-mono">12.5%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Offer Conversion %</span>
          <span className="text-lg font-black text-purple-400 font-mono">75%</span>
        </div>
      </div>

      {/* Funnel Progress Bars */}
      <div className="space-y-3 pt-2">
        {displayFunnel.map((st, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{st.stage}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {st.count} Candidates ({st.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div className={`bg-gradient-to-r ${st.color || 'from-brand-500 to-indigo-500'} h-full`} style={{ width: `${st.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
