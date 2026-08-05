import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export const SuperAdminAITelemetry = ({
  totalTokens = '1,420,500',
  totalRequests = '12,400',
  avgResponseTime = '280ms',
  failureRate = '0.2%',
}) => {
  const topFeatures = [
    { name: 'AI Resume Content Suggestion', usagePct: 42, calls: '5,208 calls' },
    { name: 'AI Resume Grammar Checker', usagePct: 28, calls: '3,472 calls' },
    { name: 'Portfolio Bio Copywriter', usagePct: 18, calls: '2,232 calls' },
    { name: 'AI Mock Interview Evaluator', usagePct: 12, calls: '1,488 calls' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gemini AI LLM Telemetry & Tokens</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
          Gemini 1.5 Pro / Flash Active
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tokens</span>
          <span className="text-lg font-black text-purple-400 font-mono">{totalTokens}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Requests</span>
          <span className="text-lg font-black text-brand-400 font-mono">{totalRequests}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Latency</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{avgResponseTime}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Failure Rate</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{failureRate}</span>
        </div>
      </div>

      {/* Feature Usage Breakdown */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase block">Top Feature Usage Distribution:</span>
        <div className="space-y-2">
          {topFeatures.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{f.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{f.calls} ({f.usagePct}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-purple-500 to-brand-500 h-full" style={{ width: `${f.usagePct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
