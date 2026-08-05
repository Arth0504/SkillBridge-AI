import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, Code2, MessageSquare, CheckCircle2, Trophy } from 'lucide-react';

export const CopilotCareerTimeline = () => {
  const steps = [
    { label: 'Application Submitted', date: 'Jul 24', status: 'completed', icon: FileText, desc: 'Profile & Resume ATS matched' },
    { label: 'Resume Shortlisted', date: 'Jul 26', status: 'completed', icon: Award, desc: 'AI Match Score 92%' },
    { label: 'Coding Assessment', date: 'Jul 29', status: 'completed', icon: Code2, desc: 'Passed with 85% score' },
    { label: 'AI Mock Interview', date: 'Aug 02', status: 'current', icon: MessageSquare, desc: 'Interview scheduled' },
    { label: 'Final Offer / Selection', date: 'Upcoming', status: 'upcoming', icon: Trophy, desc: 'Final review pending' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Application Journey Timeline</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
          Stage 4 of 5
        </span>
      </div>

      <div className="relative border-l-2 border-slate-800 pl-6 ml-2 space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative space-y-1"
            >
              {/* Milestone Icon Dot */}
              <div
                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : isCurrent
                    ? 'bg-brand-500 border-brand-400 text-white animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className={`font-bold ${isDone || isCurrent ? 'text-white' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{step.date}</span>
              </div>
              <p className="text-[11px] text-slate-400">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
