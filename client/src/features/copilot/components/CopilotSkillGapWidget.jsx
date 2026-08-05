import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const CopilotSkillGapWidget = ({
  candidateSkills = ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git', 'Tailwind CSS'],
  targetJobSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker', 'Redis', 'AWS'],
}) => {
  const matched = candidateSkills.filter((s) => targetJobSkills.includes(s));
  const missing = targetJobSkills.filter((s) => !candidateSkills.includes(s));

  const matchPct = Math.round((matched.length / targetJobSkills.length) * 100);

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Target Job Skill Gap Analysis</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          {matchPct}% Skill Overlap
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Matched Skills ({matched.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {matched.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Recommended Skill Gaps ({missing.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {missing.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                + {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
