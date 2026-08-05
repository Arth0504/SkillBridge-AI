import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Badge } from '../../../components/common';

export const CandidateRiskAnalysis = () => {
  const riskProfiles = [
    {
      candidateName: 'Arth Prajapati',
      joiningProbability: '92%',
      offerAcceptance: '88%',
      noticePeriod: '15 Days (Low Risk)',
      skillGap: 'Minor: GraphQL production tuning',
      interviewRisk: 'Low',
      confidenceScore: '96%',
    },
    {
      candidateName: 'Rahul Sharma',
      joiningProbability: '85%',
      offerAcceptance: '80%',
      noticePeriod: '30 Days (Medium Risk)',
      skillGap: 'Moderate: Docker container orchestration',
      interviewRisk: 'Low',
      confidenceScore: '91%',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Predictive Candidate Risk Analysis</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
          Predictive AI Model Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskProfiles.map((p, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">{p.candidateName}</span>
              <Badge variant="success">{p.confidenceScore} AI Confidence</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Joining Probability</span>
                <span className="text-emerald-400 font-bold text-sm">{p.joiningProbability}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Offer Acceptance %</span>
                <span className="text-brand-400 font-bold text-sm">{p.offerAcceptance}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Notice Period Risk:</span>
                <span className="text-slate-200 font-mono">{p.noticePeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Identified Skill Gap:</span>
                <span className="text-amber-300 font-mono text-[11px]">{p.skillGap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interview Risk Rating:</span>
                <span className="text-emerald-400 font-bold font-mono">{p.interviewRisk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
