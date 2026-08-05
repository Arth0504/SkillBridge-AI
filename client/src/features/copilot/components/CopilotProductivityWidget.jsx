import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckSquare, Target, Award, Trophy, Zap, ShieldCheck } from 'lucide-react';

export const CopilotProductivityWidget = () => {
  const badges = [
    { name: 'ATS Resume Master', desc: 'Achieved 90%+ ATS score', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800' },
    { name: 'Full Stack Showcase', desc: 'Published Portfolio website', icon: Award, color: 'text-brand-400', bg: 'bg-brand-950/40 border-brand-800' },
    { name: 'Code Ninja', desc: 'Passed AI Coding Assessment', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800' },
    { name: 'Top Candidate', desc: 'Top 10% career score rank', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Productivity & Learning Streak</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" /> 7 Day Streak
        </span>
      </div>

      {/* Productivity Counter Cards Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Applications</span>
          <span className="text-lg font-black text-brand-400 font-mono">14</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Coding Tests</span>
          <span className="text-lg font-black text-cyan-400 font-mono">8</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Mock Practice</span>
          <span className="text-lg font-black text-purple-400 font-mono">5</span>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Unlocked Achievement Badges:</span>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className={`p-2.5 rounded-xl border ${b.bg} flex items-center gap-2.5`}>
                <Icon className={`w-5 h-5 ${b.color} shrink-0`} />
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">{b.name}</span>
                  <span className="text-[10px] text-slate-400 block">{b.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
