import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

export const CopilotInterviewAnalytics = ({
  mockScore = 86,
  codingScore = 82,
  communication = 90,
  grammar = 94,
  confidence = 88,
  responseTime = '1.4s (Optimal)',
}) => {
  const radarMetrics = [
    { label: 'Technical Depth', val: 86, color: 'bg-brand-500' },
    { label: 'Communication Tone', val: communication, color: 'bg-emerald-500' },
    { label: 'Syntax & Grammar', val: grammar, color: 'bg-purple-500' },
    { label: 'Delivery Confidence', val: confidence, color: 'bg-cyan-500' },
    { label: 'Coding Assessment', val: codingScore, color: 'bg-amber-500' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Mock Interview & Coding Analytics</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
          Average {mockScore}% Rating
        </span>
      </div>

      {/* Analytics Meter Bars */}
      <div className="space-y-2.5">
        {radarMetrics.map((m, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{m.label}</span>
              <span className="text-slate-400 font-mono">{m.val}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full ${m.color} transition-all duration-500`} style={{ width: `${m.val}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Key Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1 text-xs">
          <span className="font-bold text-emerald-400 uppercase text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Highlighted
          </span>
          <p className="text-slate-300 text-[11px] leading-snug">
            Strong active verb vocabulary, clear modular system explanations, and concise answer structure.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1 text-xs">
          <span className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Key Focus Area
          </span>
          <p className="text-slate-300 text-[11px] leading-snug">
            Elaborate more on trade-offs when answering database scalability & caching questions.
          </p>
        </div>
      </div>
    </div>
  );
};
