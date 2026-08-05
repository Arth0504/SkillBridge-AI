import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Search, Sparkles, CheckCircle2, TrendingUp, Filter, User } from 'lucide-react';
import { Badge } from '../../../components/common';

export const CandidateRankingWidget = ({ candidatesList = [], selectedCandidates = [], toggleCandidateSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialCandidates = [
    {
      id: 'cand-1',
      rank: 1,
      name: 'Arth Prajapati',
      email: 'arth@skillbridge.ai',
      role: 'Senior Full Stack Engineer',
      matchScore: 96,
      atsScore: 98,
      codingScore: 95,
      videoScore: 95,
      experience: '4.5 Years',
      reason: 'Superior WebRTC production experience, 98% ATS resume score, and 95/100 coding test performance.',
      skills: ['React', 'Node.js', 'WebRTC', 'MongoDB', 'System Design'],
    },
    {
      id: 'cand-2',
      rank: 2,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      role: 'Frontend Architect',
      matchScore: 94,
      atsScore: 94,
      codingScore: 88,
      videoScore: 90,
      experience: '3.8 Years',
      reason: 'Strong React 18 & Redux Toolkit expertise with clean responsive design portfolio.',
      skills: ['React', 'TypeScript', 'Redux', 'Tailwind', 'Next.js'],
    },
    {
      id: 'cand-3',
      rank: 3,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Backend Microservices Lead',
      matchScore: 91,
      atsScore: 90,
      codingScore: 92,
      videoScore: 88,
      experience: '5.0 Years',
      reason: 'Solid Express & MongoDB indexing knowledge; lower frontend portfolio score.',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis'],
    },
  ];

  const displayCandidates = candidatesList.length > 0 ? candidatesList : initialCandidates;

  const filteredCandidates = displayCandidates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.role.toLowerCase().includes(term) ||
      (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">AI Candidate Ranking & Match Engine</h3>
            <p className="text-[10px] text-slate-400">Automated Gemini 1.5 Pro candidate scoring & justification</p>
          </div>
        </div>

        {/* Natural Language Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Natural search (e.g. 'React', 'Node.js', '90+ ATS')..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Candidate Ranking List */}
      <div className="space-y-3">
        {filteredCandidates.map((cand) => {
          const isSelected = selectedCandidates.some((c) => c.id === cand.id);
          return (
            <motion.div
              key={cand.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-950/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      cand.rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : cand.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : 'bg-amber-800/60 text-amber-200'
                    }`}
                  >
                    #{cand.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{cand.name}</span>
                      <Badge variant="success">{cand.matchScore}% AI Match</Badge>
                    </div>
                    <span className="text-xs text-slate-400 block">{cand.role} • {cand.experience} Exp</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Score Pills */}
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                      ATS: {cand.atsScore}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                      Coding: {cand.codingScore}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-300">
                      Video: {cand.videoScore}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCandidateSelection(cand)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected for Matrix' : '+ Compare'}
                  </button>
                </div>
              </div>

              {/* AI Justification Reason */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">AI Reason:</strong> {cand.reason}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
