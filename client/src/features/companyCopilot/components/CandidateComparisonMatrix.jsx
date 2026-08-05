import React from 'react';
import { motion } from 'framer-motion';
import { Scale, CheckCircle2, XCircle, Award, Sparkles } from 'lucide-react';
import { Badge } from '../../../components/common';

export const CandidateComparisonMatrix = ({ selectedCandidates = [] }) => {
  if (!selectedCandidates || selectedCandidates.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
        <Scale className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Candidates Selected for Side-by-Side Comparison</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Click "+ Compare" on candidates from the Ranking list to generate a multi-candidate comparison matrix.
        </p>
      </div>
    );
  }

  const criteria = [
    { label: 'Overall AI Rank & Match', key: 'rank', render: (c) => `#${c.rank} (${c.matchScore}% Match)` },
    { label: 'Experience Level', key: 'experience', render: (c) => c.experience },
    { label: 'ATS Resume Score', key: 'atsScore', render: (c) => `${c.atsScore}/100` },
    { label: 'AI Coding Test Score', key: 'codingScore', render: (c) => `${c.codingScore}/100` },
    { label: 'AI Video Screening Score', key: 'videoScore', render: (c) => `${c.videoScore}/100` },
    { label: 'Core Technical Skills', key: 'skills', render: (c) => c.skills.join(', ') },
    { label: 'AI Recommendation', key: 'recommendation', render: (c) => (c.matchScore >= 94 ? 'Strong Hire' : 'Recommend') },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Candidate Side-by-Side Comparison Matrix</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-950 text-brand-300 border border-brand-800">
          {selectedCandidates.length} Selected
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-3 w-48">Evaluation Dimension</th>
              {selectedCandidates.map((c) => (
                <th key={c.id} className="p-3 text-center min-w-[200px]">
                  <span className="font-bold text-white text-sm block">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{c.role}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {criteria.map((cr, idx) => (
              <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                <td className="p-3 font-bold text-slate-200 border-r border-slate-800/60">{cr.label}</td>
                {selectedCandidates.map((c) => (
                  <td key={c.id} className="p-3 text-center font-mono">
                    {cr.render(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
