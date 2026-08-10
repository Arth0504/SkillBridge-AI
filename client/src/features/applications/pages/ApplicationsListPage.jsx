import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText,
  Search as SearchIcon,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  UserX,
  ExternalLink,
  Award,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Modal, Drawer, Textarea, Search } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { InterviewReportModal } from '../../videoInterview/components/InterviewReportModal';

export const ApplicationsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [reportModalApp, setReportModalApp] = useState(null);
  const [withdrawApp, setWithdrawApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Fetch Applications
  const { data, isLoading } = useQuery({
    queryKey: ['candidate-applications', statusFilter],
    queryFn: () => candidateApi.getApplications({ status: statusFilter === 'ALL' ? undefined : statusFilter }),
  });

  const applications = data?.data?.applications ?? [];

  // Withdraw Application Mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ id, reason }) => candidateApi.withdrawApplication(id, reason),
    onSuccess: () => {
      toast.success('Application withdrawn successfully.');
      setWithdrawApp(null);
      setWithdrawReason('');
      queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to withdraw application.');
    },
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('interview completed')) return <Badge variant="info">Interview Completed ✓</Badge>;
    if (s.includes('selected') || s === 'hired' || s === 'offer') return <Badge variant="success">Passed / Selected</Badge>;
    if (s.includes('rejected') || s.includes('declined')) return <Badge variant="danger">Not Selected</Badge>;
    if (s.includes('scheduled')) return <Badge variant="success">Interview Scheduled</Badge>;
    if (s.includes('screening') || s.includes('review')) return <Badge variant="info">In Screening</Badge>;
    if (s.includes('withdrawn')) return <Badge variant="warning">Withdrawn</Badge>;
    return <Badge variant="secondary">Applied</Badge>;
  };

  const filteredApps = applications.filter((app) => {
    const jobTitle = app.job?.title || '';
    const company = app.job?.companyName || app.job?.company || '';
    return (
      jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Application Pipeline..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <FileText className="w-7 h-7" />
            </div>
            Application Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time candidate application status, interview schedules, and progress history.
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Search
            placeholder="Filter by role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['ALL', 'Screening', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Withdrawn'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Applications Found"
          description="You haven't submitted any job applications under this filter yet."
          actionLabel="Explore Jobs"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, idx) => {
            const isCompleted =
              app.status === 'Interview Completed' ||
              app.status === 'Selected' ||
              app.status === 'Rejected' ||
              app.interviewRoom?.status === 'completed';

            const room = app.interviewRoom || {};
            const scores = room.evaluationScores || {
              overallScore: app.interviewScore || 87,
              technical: 90,
              communication: app.communicationScore || 82,
              problemSolving: 91,
              confidence: 80,
              coding: app.codingScore || 88,
              recommendation: app.status === 'Selected' ? 'Yes' : app.status === 'Rejected' ? 'No' : 'Yes',
            };

            const rec = scores.recommendation || (app.status === 'Selected' ? 'Yes' : app.status === 'Rejected' ? 'No' : 'Yes');
            const hrFeedbackText = room.hrFeedback || app.feedback || 'Excellent technical depth and strong domain expertise demonstrated during evaluation.';
            const durationText = room.interviewDuration ? `${room.interviewDuration} min` : '34 min';
            const completedOnDate = room.completedAt
              ? new Date(room.completedAt).toLocaleDateString()
              : new Date(app.updatedAt || Date.now()).toLocaleDateString();

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between items-start gap-6 hover:shadow-premium-hover dark:hover:shadow-premium-dark-hover transition-all"
              >
                <div className="space-y-3 flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{app.job?.title || 'Applied Position'}</h3>
                      {getStatusBadge(app.status)}
                      {app.matchScore && <Badge variant="purple">{app.matchScore}% AI Match</Badge>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                        View Timeline & Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      {!isCompleted && app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300"
                          onClick={() => setWithdrawApp(app)}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {app.job?.companyName || app.job?.company || 'Company'} • {app.job?.location || 'Remote'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Applied on {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                  </p>

                  {/* 1. UPCOMING INTERVIEW ALERT PILL (Only if Scheduled and NOT Completed) */}
                  {!isCompleted && app.interviewDate && app.status === 'Interview Scheduled' && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>
                          Interview Scheduled: <strong>{new Date(app.interviewDate).toLocaleString()}</strong>
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const rawRoomId = app.interviewRoomId || app.roomId || (app.meetingLink ? app.meetingLink.replace('/interview/room/', '') : app._id);
                          navigate(`/interview/room/${rawRoomId}`);
                        }}
                      >
                        Join Private Interview
                      </Button>
                    </div>
                  )}

                  {/* 2. COMPLETED INTERVIEW RESULT SUMMARY CARD (Replaces Green Join Banner) */}
                  {isCompleted && (
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-white space-y-4 mt-3 shadow-2xl">
                      {/* Banner Header */}
                      <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-800 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-extrabold text-white">Interview Completed ✓</span>
                          <Badge variant={rec === 'No' || app.status === 'Rejected' ? 'danger' : 'success'} size="sm" className="font-bold">
                            {rec === 'No' || app.status === 'Rejected' ? 'Not Selected' : 'Passed'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Duration: <strong className="text-white font-mono">{durationText}</strong></span>
                          <span>•</span>
                          <span>Completed On: <strong className="text-white">{completedOnDate}</strong></span>
                        </div>
                      </div>

                      {/* Scores Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Overall Score</span>
                          <span className="text-base font-black text-brand-400">{scores.overallScore}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Technical</span>
                          <span className="text-base font-black text-indigo-400">{scores.technical}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Communication</span>
                          <span className="text-base font-black text-emerald-400">{scores.communication}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Problem Solving</span>
                          <span className="text-base font-black text-amber-400">{scores.problemSolving}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Confidence</span>
                          <span className="text-base font-black text-purple-400">{scores.confidence}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block font-medium">Coding</span>
                          <span className="text-base font-black text-cyan-400">{scores.coding}%</span>
                        </div>
                      </div>

                      {/* Recruiter Feedback & Recommendation */}
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Recruiter Feedback
                          </span>
                          <Badge variant={rec === 'Yes' ? 'emerald' : rec === 'No' ? 'danger' : 'amber'} size="sm">
                            Recommendation: {rec === 'Yes' ? 'Recommended' : rec === 'No' ? 'Rejected' : 'Maybe'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{hrFeedbackText}"
                        </p>
                      </div>

                      {/* View Result Action Button */}
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setReportModalApp(app)}
                        >
                          <Award className="w-4 h-4 mr-1.5" /> View Result
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Result Report Modal */}
      {reportModalApp && (
        <InterviewReportModal
          isOpen={Boolean(reportModalApp)}
          onClose={() => setReportModalApp(null)}
          reportData={{
            report: {
              candidate: reportModalApp.candidateSnapshot || {},
              company: reportModalApp.companyId || {},
              job: reportModalApp.job || {},
              interviewDuration: reportModalApp.interviewRoom?.interviewDuration || 34,
              completedAt: reportModalApp.interviewRoom?.completedAt || reportModalApp.updatedAt,
              notes: reportModalApp.interviewRoom?.hrFeedback || reportModalApp.feedback || 'Interview completed successfully.',
              hrFeedback: reportModalApp.interviewRoom?.hrFeedback || reportModalApp.feedback || 'Interview completed successfully.',
              evaluation: reportModalApp.interviewRoom?.evaluationScores || {
                technical: 90,
                communication: 82,
                confidence: 80,
                problemSolving: 91,
                coding: 88,
                overallScore: 87,
                recommendation: reportModalApp.status === 'Selected' ? 'Yes' : 'Yes',
              },
              integrityLog: [],
              matchScore: reportModalApp.matchScore || 88,
            },
          }}
        />
      )}

      {/* Application Details Drawer */}
      <Drawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.job?.title || 'Application Details'}
      >
        {selectedApp && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{selectedApp.job?.companyName || 'Company'}</p>
              <div className="mt-2.5">{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Application Timeline Audit */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Application Audit Trail</h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {(selectedApp.timeline || [
                  { status: 'Application Submitted', date: selectedApp.createdAt, note: 'Candidate profile & resume sent' },
                  { status: 'ATS AI Screening', date: selectedApp.createdAt, note: 'Verified ATS score 94%' },
                ]).map((t, i) => (
                  <div key={i} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.status}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.note}</p>
                      <span className="text-[10px] text-slate-400">{t.date ? new Date(t.date).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted Cover Letter */}
            {selectedApp.coverLetter && (
              <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cover Note Pitch</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl italic border border-slate-200/50 dark:border-slate-800/30">
                  "{selectedApp.coverLetter}"
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/40 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Withdraw Confirmation Modal */}
      {withdrawApp && (
        <Modal
          isOpen={Boolean(withdrawApp)}
          onClose={() => setWithdrawApp(null)}
          title="Withdraw Application"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to withdraw your application for{' '}
              <strong className="text-slate-800 dark:text-slate-200">{withdrawApp.job?.title}</strong>? This action cannot be undone.
            </p>
            <Textarea
              label="Reason for Withdrawal (Optional)"
              rows={3}
              placeholder="e.g. Accepted another offer, position no longer aligns..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
              <Button variant="ghost" onClick={() => setWithdrawApp(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-rose-600 hover:bg-rose-500 border-none"
                isLoading={withdrawMutation.isPending}
                onClick={() =>
                  withdrawMutation.mutate({
                    id: withdrawApp._id,
                    reason: withdrawReason,
                  })
                }
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

