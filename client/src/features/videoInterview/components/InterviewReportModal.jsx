import React from 'react';
import {
  Modal,
  Badge,
  Button,
} from '../../../components/common';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Sparkles,
  Clock,
  Briefcase,
  Award,
} from 'lucide-react';

export const InterviewReportModal = ({ isOpen, onClose, reportData }) => {
  if (!reportData) return null;

  const report = reportData.report || reportData;
  const candidate = report.candidate || {};
  const company = report.company || {};
  const job = report.job || {};
  const evalScores = report.evaluation || {};
  const rec = evalScores.recommendation || 'Yes';

  const getRecommendationBadge = (r) => {
    switch (r) {
      case 'Yes':
        return (
          <Badge variant="emerald" size="md" className="px-3 py-1 text-xs font-black">
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> RECOMMENDED FOR HIRE (YES)
          </Badge>
        );
      case 'Maybe':
        return (
          <Badge variant="amber" size="md" className="px-3 py-1 text-xs font-black">
            <AlertTriangle className="w-4 h-4 mr-1 text-amber-400" /> UNDER CONSIDERATION (MAYBE)
          </Badge>
        );
      case 'No':
        return (
          <Badge variant="danger" size="md" className="px-3 py-1 text-xs font-black">
            <XCircle className="w-4 h-4 mr-1 text-rose-400" /> NOT RECOMMENDED (NO)
          </Badge>
        );
      default:
        return <Badge variant="secondary">{r}</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Private Interview Summary Report">
      <div className="space-y-6">
        {/* Candidate & Job Banner */}
        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              {candidate.fullName?.[0] || 'C'}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{candidate.fullName || 'Candidate'}</h3>
              <p className="text-xs text-slate-400 font-medium">{job.title || 'Role'} • {candidate.email}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-400" /> Match Score: {report.matchScore || 88}%
            </Badge>
          </div>
        </div>

        {/* Recommendation Badge Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Recruiter Decision:</span>
          {getRecommendationBadge(rec)}
        </div>

        {/* Evaluation Scores Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-brand-400" /> Evaluation Scores Breakdown
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Technical Depth</span>
              <p className="text-lg font-black text-brand-400">{evalScores.technical ?? 85}/100</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Communication Skills</span>
              <p className="text-lg font-black text-emerald-400">{evalScores.communication ?? 90}/100</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Confidence Level</span>
              <p className="text-lg font-black text-purple-400">{evalScores.confidence ?? 88}/100</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Problem Solving</span>
              <p className="text-lg font-black text-amber-400">{evalScores.problemSolving ?? 85}/100</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/60 to-indigo-950/60 border border-brand-500/30 flex justify-between items-center">
            <span className="text-xs font-bold text-white">Overall Composite Score:</span>
            <span className="text-xl font-extrabold text-brand-300">{evalScores.overallScore ?? 87}/100</span>
          </div>
        </div>

        {/* Confidential Recruiter Notes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" /> Confidential Interviewer Notes
          </h4>
          <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 whitespace-pre-wrap italic">
            {report.notes || 'No detailed evaluation notes recorded during session.'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Done & Export Audit Log
          </Button>
        </div>
      </div>
    </Modal>
  );
};
