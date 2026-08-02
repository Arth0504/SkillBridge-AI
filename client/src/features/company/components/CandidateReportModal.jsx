import React from 'react';
import { Modal, Badge, Button } from '../../../components/common';
import { Avatar } from '../../../components/common/Avatar';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Code2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Award,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  X,
} from 'lucide-react';

export const CandidateReportModal = ({ isOpen, onClose, application }) => {
  if (!application) return null;

  const candidate = application.candidate || application.candidateId || {};
  const job = application.job || application.jobId || {};

  const handleExportPDF = () => {
    window.print();
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'Highly Recommended':
        return <Badge variant="success" size="lg"><Award className="w-4 h-4 mr-1" /> Highly Recommended</Badge>;
      case 'Recommended':
        return <Badge variant="purple" size="lg"><CheckCircle2 className="w-4 h-4 mr-1" /> Recommended</Badge>;
      case 'Needs Improvement':
        return <Badge variant="warning" size="lg"><AlertTriangle className="w-4 h-4 mr-1" /> Needs Improvement</Badge>;
      case 'Not Recommended':
        return <Badge variant="danger" size="lg"><X className="w-4 h-4 mr-1" /> Not Recommended</Badge>;
      default:
        return <Badge variant="secondary" size="lg">Not Evaluated Yet</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Executive AI Recruiter Report" size="xl">
      <div className="space-y-8 print:p-6 print:bg-white print:text-black">
        {/* Printable Report Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:border-slate-300">
          <div className="flex items-center gap-4">
            <Avatar src={candidate.avatarUrl} name={candidate.fullName} size="xl" />
            <div>
              <h2 className="text-2xl font-extrabold text-white print:text-black">{candidate.fullName || 'Candidate Name'}</h2>
              <p className="text-xs font-semibold text-brand-400 print:text-brand-600">{candidate.headline || 'Software Engineer'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 print:text-slate-600">
                {candidate.email && <span><Mail className="w-3 h-3 inline mr-1" />{candidate.email}</span>}
                {candidate.phone && <span><Phone className="w-3 h-3 inline mr-1" />{candidate.phone}</span>}
                <span><Briefcase className="w-3 h-3 inline mr-1" />{candidate.experienceYears ?? 0} Yrs Experience</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 print:hidden">
            {getRecommendationBadge(application.hiringRecommendation)}
            <Button variant="primary" size="sm" onClick={handleExportPDF}>
              <Printer className="w-4 h-4 mr-1.5" /> Export PDF Report
            </Button>
          </div>
        </div>

        {/* Position Context */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between print:bg-slate-100 print:border-slate-300">
          <div>
            <p className="text-xs text-slate-400">Evaluated Position</p>
            <h3 className="text-base font-bold text-white print:text-black">{job.title || 'Target Job Role'}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Overall AI Match Score</p>
            <p className="text-2xl font-black text-brand-400 print:text-brand-600">
              {application.matchScore !== null && application.matchScore !== undefined ? `${application.matchScore}%` : 'Not Evaluated Yet'}
            </p>
          </div>
        </div>

        {/* 4-Metric Evaluation Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <FileText className="w-4 h-4 text-brand-400" /> Resume Score
            </div>
            <p className="text-xl font-extrabold text-white print:text-black">
              {application.resumeScore !== null && application.resumeScore !== undefined ? `${application.resumeScore}/100` : 'Not Evaluated Yet'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Interview Score
            </div>
            <p className="text-xl font-extrabold text-white print:text-black">
              {application.interviewScore !== null && application.interviewScore !== undefined ? `${application.interviewScore}/100` : 'Not Evaluated Yet'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Code2 className="w-4 h-4 text-purple-400" /> Coding Score
            </div>
            <p className="text-xl font-extrabold text-white print:text-black">
              {application.codingScore !== null && application.codingScore !== undefined ? `${application.codingScore}/100` : 'Not Evaluated Yet'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400" /> Communication
            </div>
            <p className="text-xl font-extrabold text-white print:text-black">
              {application.communicationScore !== null && application.communicationScore !== undefined ? `${application.communicationScore}/100` : 'Not Evaluated Yet'}
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Key Identified Strengths
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              {(application.strengths || ['Demonstrates solid foundational background']).map((st, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Key Growth Areas
            </h4>
            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800">
              {(application.weaknesses || ['No critical technical bottlenecks identified']).map((wk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recruiter Evaluation Notes */}
        {application.feedback && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white print:text-black">Internal Recruiter Feedback</h4>
            <p className="text-xs text-slate-300 print:text-slate-800 italic leading-relaxed">
              "{application.feedback}"
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
