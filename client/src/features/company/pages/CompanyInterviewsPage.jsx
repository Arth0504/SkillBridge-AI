import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Code2,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Briefcase,
  User,
  Edit3,
  Trash2,
  Copy,
  Lock,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Modal, Input, Select, Textarea } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

export const CompanyInterviewsPage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedAIResult, setSelectedAIResult] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(null);

  // Form State for Schedule Interview
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    candidateId: '',
    jobId: '',
    candidateName: '',
    candidateEmail: '',
    role: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    type: 'Technical',
    meetingUrl: '',
    notes: '',
  });

  // Handle location state if navigated from Applications page with pre-selected applicant
  useEffect(() => {
    if (location.state?.applicant) {
      const app = location.state.applicant;
      const jId = app.job?._id || app.jobId?._id || app.jobId;
      const cand = app.candidate || app;
      if (jId) setSelectedJobId(String(jId));
      setScheduleForm((prev) => ({
        ...prev,
        applicationId: app._id,
        candidateId: cand._id,
        jobId: jId || '',
        candidateName: cand.fullName || 'Candidate',
        candidateEmail: cand.email || '',
        role: app.job?.title || app.jobSnapshot?.title || 'Job Vacancy',
      }));
      setScheduleModalOpen(true);
      navigate('/company/interviews', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Fetch Company Interviews
  const { data: interviewsResponse, isLoading } = useQuery({
    queryKey: ['company-interviews', activeTab],
    queryFn: () => companyApi.getInterviews({ status: activeTab === 'ALL' ? undefined : activeTab }),
  });

  // Fetch Company Jobs (for job selector)
  const { data: jobsResponse } = useQuery({
    queryKey: ['company-jobs-for-interviews'],
    queryFn: () => companyApi.getCompanyJobs({ limit: 100 }),
    enabled: scheduleModalOpen,
  });

  // Fetch Applications for Selected Job
  const { data: jobApplicationsResponse, isLoading: isLoadingApplicants } = useQuery({
    queryKey: ['job-applications-for-interviews', selectedJobId],
    queryFn: () => companyApi.getApplications({ jobId: selectedJobId, excludeRejected: true, limit: 100 }),
    enabled: Boolean(selectedJobId) && scheduleModalOpen,
  });

  const interviews = interviewsResponse?.data?.interviews ?? [];
  const jobs = jobsResponse?.data?.jobs ?? [];
  const jobApplications = jobApplicationsResponse?.data?.applications ?? [];

  // Schedule Interview Mutation
  const scheduleMutation = useMutation({
    mutationFn: companyApi.scheduleInterview,
    onSuccess: () => {
      toast.success('Interview scheduled successfully!');
      setScheduleModalOpen(false);
      setSelectedJobId('');
      setScheduleForm({
        applicationId: '',
        candidateId: '',
        jobId: '',
        candidateName: '',
        candidateEmail: '',
        role: '',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00',
        type: 'Technical',
        meetingUrl: '',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    },
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => companyApi.updateInterviewStatus(id, status),
    onSuccess: () => {
      toast.success('Interview status updated.');
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Status update failed.');
    },
  });

  // Update Interview Details Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => companyApi.updateInterview(id, payload),
    onSuccess: () => {
      toast.success('Interview details updated successfully!');
      setEditingInterview(null);
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update interview.');
    },
  });

  // Soft Delete Interview Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => companyApi.deleteInterview(id),
    onSuccess: () => {
      toast.success('Interview deleted successfully.');
      setDeletingInterview(null);
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['company-calendar'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete interview.');
    },
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.applicationId) {
      toast.error('Please select an applicant candidate.');
      return;
    }

    const startTime = scheduleForm.time || '10:00';
    const [h, m] = startTime.split(':').map(Number);
    const endTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;

    scheduleMutation.mutate({
      applicationId: scheduleForm.applicationId,
      candidateId: scheduleForm.candidateId || undefined,
      jobId: scheduleForm.jobId || selectedJobId || undefined,
      candidateName: scheduleForm.candidateName,
      role: scheduleForm.role,
      title: `${scheduleForm.type} Interview - ${scheduleForm.role || 'Vacancy'}`,
      scheduledDate: scheduleForm.date || new Date(Date.now() + 86400000).toISOString(),
      startTime,
      endTime,
      interviewType: scheduleForm.type,
      meetingLink: scheduleForm.meetingUrl,
      notes: scheduleForm.notes,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="info">Scheduled</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Rescheduled':
        return <Badge variant="warning">Rescheduled</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Interview Schedule..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-brand-500" /> Interview & Evaluation Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule candidate interviews, review AI mock & coding assessment results, and manage session logs.
          </p>
        </div>

        <Button variant="primary" onClick={() => setScheduleModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Interview
        </Button>
      </div>

      {/* Tabs */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['ALL', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Interviews Found"
          description="No interview sessions found under this status filter."
          actionLabel="Schedule Interview"
          onAction={() => setScheduleModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((iv, idx) => (
            <motion.div
              key={iv._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{iv.candidateName}</h3>
                  {getStatusBadge(iv.status)}
                  <Badge variant="purple">{iv.type}</Badge>
                </div>
                <p className="text-xs font-semibold text-brand-400">{iv.title || iv.role}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {new Date(iv.date || Date.now()).toLocaleString()}
                  </span>
                </div>

                {/* AI Screening Scores Summary Pill */}
                {iv.aiScores && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[11px] text-slate-400">AI Evaluation Scores:</span>
                    <Badge variant="success" size="sm">Mock: {iv.aiScores.mockScore}%</Badge>
                    <Badge variant="info" size="sm">Coding: {iv.aiScores.codingScore}%</Badge>
                    <Badge variant="purple" size="sm">Video: {iv.aiScores.videoScore}%</Badge>
                  </div>
                )}
              </div>

              {/* Status Actions & AI Results Trigger */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  className="shadow-md shadow-brand-500/20"
                  onClick={() => {
                    const rawRoomId = iv.roomId || (iv.meetingLink ? iv.meetingLink.replace('/interview/room/', '') : iv._id);
                    navigate(`/interview/room/${rawRoomId}`);
                  }}
                >
                  <Video className="w-4 h-4 mr-1.5" /> Join Private Interview
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAIResult(iv)}
                >
                  <Sparkles className="w-4 h-4 mr-1.5 text-brand-400" /> View Details
                </Button>

                <select
                  value={iv.status}
                  disabled={iv.status === 'Completed'}
                  onChange={(e) => statusMutation.mutate({ id: iv._id, status: e.target.value })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Edit Button */}
                {iv.status === 'Completed' ? (
                  <button
                    disabled
                    title="Completed interviews are locked and cannot be edited"
                    className="p-2 rounded-xl bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingInterview(iv)}
                    title="Edit Interview Details"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {/* Duplicate Button */}
                <button
                  onClick={() => {
                    setScheduleForm({
                      applicationId: iv.applicationId?._id || iv.applicationId || '',
                      candidateId: iv.candidateId?._id || iv.candidateId || '',
                      jobId: iv.jobId?._id || iv.jobId || '',
                      candidateName: iv.candidateName || iv.candidateId?.fullName || '',
                      candidateEmail: iv.candidateId?.email || '',
                      role: iv.jobId?.title || iv.role || '',
                      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      time: iv.startTime || '10:00',
                      type: iv.interviewType || 'Technical',
                      notes: iv.notes || '',
                    });
                    setScheduleModalOpen(true);
                  }}
                  title="Duplicate Interview"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeletingInterview(iv)}
                  title="Delete Interview"
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalOpen && (
        <Modal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title="Schedule Candidate Interview"
        >
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            {/* Step 1: Select Job Position */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" /> Select Job Position *
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  const jId = e.target.value;
                  const chosenJob = jobs.find((j) => j._id === jId);
                  setSelectedJobId(jId);
                  setScheduleForm((prev) => ({
                    ...prev,
                    applicationId: '',
                    candidateId: '',
                    jobId: jId,
                    candidateName: '',
                    candidateEmail: '',
                    role: chosenJob?.title || '',
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                required
              >
                <option value="">-- Choose Job Opening --</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Applicant Candidate (Filtered by Selected Job) */}
            {selectedJobId && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Select Applicant Candidate *
                </label>
                {isLoadingApplicants ? (
                  <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                    <Loader size="sm" /> Loading candidates who applied to this job...
                  </div>
                ) : jobApplications.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold">
                    No active applicants found for this job position.
                  </div>
                ) : (
                  <select
                    value={scheduleForm.applicationId}
                    onChange={(e) => {
                      const selectedAppId = e.target.value;
                      const selectedApp = jobApplications.find((a) => a._id === selectedAppId);
                      const cand = selectedApp?.candidate || selectedApp;
                      const jobObj = selectedApp?.jobId || selectedApp?.job;
                      setScheduleForm((prev) => ({
                        ...prev,
                        applicationId: selectedAppId,
                        candidateId: cand?._id || selectedApp?.candidateId,
                        jobId: selectedJobId,
                        candidateName: cand?.fullName || selectedApp?.candidateSnapshot?.fullName || '',
                        candidateEmail: cand?.email || selectedApp?.candidateSnapshot?.email || '',
                        role: jobObj?.title || selectedApp?.jobSnapshot?.title || scheduleForm.role,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Select Candidate --</option>
                    {jobApplications.map((app) => {
                      const cand = app.candidate || app;
                      return (
                        <option key={app._id} value={app._id}>
                          {cand.fullName || 'Candidate'} ({cand.email || 'No email'}) - Status: {app.status || 'Applied'}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* Auto-Populated Candidate Name & Job Title (Read-Only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Candidate Name (Auto-filled)</label>
                <input
                  type="text"
                  readOnly
                  value={scheduleForm.candidateName}
                  placeholder="Select candidate above..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/60 border border-slate-800 text-brand-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Job Role Title (Auto-filled)</label>
                <input
                  type="text"
                  readOnly
                  value={scheduleForm.role}
                  placeholder="Select job above..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/60 border border-slate-800 text-emerald-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Date & Time Picker */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                type="date"
                label="Date *"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
              />
              <Input
                required
                type="time"
                label="Start Time *"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
              />
            </div>

            <Select
              label="Interview Type"
              value={scheduleForm.type}
              onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
              options={['Technical', 'HR', 'Coding', 'Managerial', 'Final']}
            />

            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>SkillBridge AI will automatically generate an encrypted private video room (UUID).</span>
            </div>

            <Textarea
              label="Notes & Candidate Instructions"
              rows={3}
              placeholder="Add prep instructions or team interviewers list..."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={scheduleMutation.isPending}>
                Schedule & Send Invite
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Evaluation Scores Modal */}
      {selectedAIResult && (
        <Modal
          isOpen={Boolean(selectedAIResult)}
          onClose={() => setSelectedAIResult(null)}
          title={`AI Evaluation Audit: ${selectedAIResult.candidateName}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">AI Mock Interview Rating:</span>
                <span className="font-extrabold text-emerald-400">
                  {selectedAIResult.aiScores?.mockScore !== undefined && selectedAIResult.aiScores?.mockScore !== null ? `${selectedAIResult.aiScores.mockScore}%` : 'Not Evaluated Yet'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">AI Technical Coding Test:</span>
                <span className="font-extrabold text-brand-400">
                  {selectedAIResult.aiScores?.codingScore !== undefined && selectedAIResult.aiScores?.codingScore !== null ? `${selectedAIResult.aiScores.codingScore}%` : 'Not Evaluated Yet'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">AI Automated Video Screening:</span>
                <span className="font-extrabold text-purple-400">
                  {selectedAIResult.aiScores?.videoScore !== undefined && selectedAIResult.aiScores?.videoScore !== null ? `${selectedAIResult.aiScores.videoScore}%` : 'Not Evaluated Yet'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/50 p-4 rounded-xl leading-relaxed">
              {selectedAIResult.feedback || selectedAIResult.notes || 'No detailed evaluation notes recorded.'}
            </p>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedAIResult(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Interview Modal */}
      {editingInterview && (
        <Modal
          isOpen={Boolean(editingInterview)}
          onClose={() => setEditingInterview(null)}
          title={`Edit Interview: ${editingInterview.candidateName || 'Candidate'}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                title: fd.get('title'),
                scheduledDate: fd.get('date'),
                startTime: fd.get('startTime'),
                interviewType: fd.get('interviewType'),
                interviewerName: fd.get('interviewerName'),
                interviewerEmail: fd.get('interviewerEmail'),
                notes: fd.get('notes'),
              };
              updateMutation.mutate({ id: editingInterview._id, payload });
            }}
            className="space-y-4"
          >
            <Input
              required
              name="title"
              label="Interview Title *"
              defaultValue={editingInterview.title || 'Technical Evaluation'}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                type="date"
                name="date"
                label="Date *"
                defaultValue={editingInterview.scheduledDate ? editingInterview.scheduledDate.split('T')[0] : ''}
              />
              <Input
                required
                type="time"
                name="startTime"
                label="Start Time *"
                defaultValue={editingInterview.startTime || '10:00'}
              />
            </div>

            <Select
              name="interviewType"
              label="Interview Type"
              defaultValue={editingInterview.interviewType || 'Technical'}
              options={['Technical', 'HR', 'Coding', 'Managerial', 'Final']}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="interviewerName"
                label="Interviewer Name"
                defaultValue={editingInterview.interviewerName || ''}
              />
              <Input
                name="interviewerEmail"
                type="email"
                label="Interviewer Email"
                defaultValue={editingInterview.interviewerEmail || ''}
              />
            </div>

            <Textarea
              name="notes"
              label="Recruiter Notes & Instructions"
              rows={3}
              defaultValue={editingInterview.notes || ''}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setEditingInterview(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingInterview && (
        <Modal
          isOpen={Boolean(deletingInterview)}
          onClose={() => setDeletingInterview(null)}
          title="Delete this interview?"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the scheduled interview for{' '}
              <strong className="text-white">{deletingInterview.candidateName || 'this candidate'}</strong>? This action will remove the session from candidate and company dashboards.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" type="button" onClick={() => setDeletingInterview(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingInterview._id)}
              >
                Delete Interview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
