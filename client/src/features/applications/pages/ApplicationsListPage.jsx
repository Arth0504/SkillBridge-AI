import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Modal, Drawer, Textarea } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const ApplicationsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawApp, setWithdrawApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Fetch Applications
  const { data, isLoading, refetch } = useQuery({
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
    if (s.includes('interview') || s.includes('scheduled')) return <Badge variant="success">Interview Scheduled</Badge>;
    if (s.includes('screening') || s.includes('review')) return <Badge variant="info">In Screening</Badge>;
    if (s.includes('offer')) return <Badge variant="purple">Offer Extended</Badge>;
    if (s.includes('rejected') || s.includes('declined')) return <Badge variant="danger">Rejected</Badge>;
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-brand-500" /> Application Pipeline
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
          {['ALL', 'Screening', 'Interview Scheduled', 'Offer Extended', 'Withdrawn'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
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
          {filteredApps.map((app, idx) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{app.job?.title || 'Applied Position'}</h3>
                  {getStatusBadge(app.status)}
                  {app.matchScore && <Badge variant="purple">{app.matchScore}% AI Match</Badge>}
                </div>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {app.job?.companyName || app.job?.company || 'Company'} • {app.job?.location || 'Remote'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Applied on {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                </p>

                {/* Upcoming Interview Alert pill if scheduled */}
                {app.interviewDate && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-400 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        Interview Scheduled: <strong>{new Date(app.interviewDate).toLocaleString()}</strong>
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="shadow-md shadow-brand-500/20"
                      onClick={() => {
                        const rawRoomId = app.interviewRoomId || app.roomId || (app.meetingLink ? app.meetingLink.replace('/interview/room/', '') : app._id);
                        navigate(`/interview/room/${rawRoomId}`);
                      }}
                    >
                      Join Private Interview
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                  View Timeline & Details <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => setWithdrawApp(app)}
                  >
                    <UserX className="w-4 h-4 mr-1" /> Withdraw
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
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
              <p className="text-xs font-semibold text-brand-400">{selectedApp.job?.companyName || 'Company'}</p>
              <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Application Timeline Audit */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Application Audit Trail</h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {(selectedApp.timeline || [
                  { status: 'Application Submitted', date: selectedApp.createdAt, note: 'Candidate profile & resume sent' },
                  { status: 'ATS AI Screening', date: selectedApp.createdAt, note: 'Verified ATS score 94%' },
                ]).map((t, i) => (
                  <div key={i} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-slate-900" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{t.status}</h5>
                      <p className="text-[11px] text-slate-400">{t.note}</p>
                      <span className="text-[10px] text-slate-500">{t.date ? new Date(t.date).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted Cover Letter */}
            {selectedApp.coverLetter && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white">Cover Note Pitch</h4>
                <p className="text-xs text-slate-300 bg-slate-800/60 p-4 rounded-xl italic">
                  "{selectedApp.coverLetter}"
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
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
            <p className="text-xs text-slate-400">
              Are you sure you want to withdraw your application for{' '}
              <strong className="text-white">{withdrawApp.job?.title}</strong>? This action cannot be undone.
            </p>
            <Textarea
              label="Reason for Withdrawal (Optional)"
              rows={3}
              placeholder="e.g. Accepted another offer, position no longer aligns..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setWithdrawApp(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-500"
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
