import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Star,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  MessageSquare,
  ExternalLink,
  Award,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Textarea } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

export const CompanyApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  // Fetch Company Applications
  const { data: appsResponse, isLoading } = useQuery({
    queryKey: ['company-applications', stageFilter],
    queryFn: () => companyApi.getApplications({ status: stageFilter === 'ALL' ? undefined : stageFilter }),
  });

  const applications = appsResponse?.data?.applications || [
    {
      _id: 'c-app-1',
      candidate: { fullName: 'Alex Mercer', email: 'alex@example.com', headline: 'Senior AI Engineer', skills: ['React', 'Python', 'PyTorch', 'Docker'], experienceYears: 6 },
      job: { title: 'Senior AI Platform Engineer' },
      status: 'Screening',
      matchScore: 96,
      rating: 5,
      createdAt: '2026-07-24T10:00:00Z',
      coverLetter: 'Built high-throughput AI inference pipelines handling 100k requests/min.',
      resumeUrl: 'https://cloudinary.com/sample-resume.pdf',
      feedback: 'Outstanding candidate with deep PyTorch and React knowledge.',
    },
    {
      _id: 'c-app-2',
      candidate: { fullName: 'Sophia Lin', email: 'sophia@example.com', headline: 'Full Stack Specialist', skills: ['React.js', 'Node.js', 'Tailwind', 'PostgreSQL'], experienceYears: 4 },
      job: { title: 'Full Stack React Developer' },
      status: 'Interview Scheduled',
      matchScore: 94,
      rating: 4,
      createdAt: '2026-07-23T14:00:00Z',
      coverLetter: 'Lead frontend developer for SaaS dashboard projects.',
      resumeUrl: 'https://cloudinary.com/sample-resume-2.pdf',
      feedback: 'Solid UI engineering design skills.',
    },
  ];

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => companyApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      toast.success('Candidate status updated!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Status update failed.');
    },
  });

  // Rating Mutation
  const ratingMutation = useMutation({
    mutationFn: ({ id, rating }) => companyApi.updateApplicationRating(id, rating),
    onSuccess: () => {
      toast.success('Candidate rating updated!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
  });

  // Feedback Mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }) => companyApi.updateApplicationFeedback(id, feedback),
    onSuccess: () => {
      toast.success('Recruiter notes saved.');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
  });

  const handleSaveNotes = () => {
    if (!selectedApp) return;
    feedbackMutation.mutate({ id: selectedApp._id, feedback: feedbackNote });
  };

  const filteredApps = applications.filter((app) => {
    const name = app.candidate?.fullName || app.fullName || '';
    const role = app.job?.title || app.title || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Candidate Applicants..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-500" /> Applicant Management Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review AI-screened candidate profiles, score resumes, set stage statuses, and shortlist top talent.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Search
            placeholder="Search candidate name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Screening', 'Interview Scheduled', 'Shortlisted', 'Rejected', 'Offer Extended'].map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stageFilter === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Applicants Found"
          description="No candidate applications match your current search and stage filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, idx) => {
            const cand = app.candidate || app;
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cand.fullName || 'Candidate Name'}</h3>
                    {app.matchScore && <Badge variant="purple">{app.matchScore}% AI Match</Badge>}
                    <Badge variant="info">{app.status || 'Applied'}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-brand-400">
                    {cand.headline || 'Software Engineer'} • Applied for <strong>{app.job?.title || 'Engineering Role'}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(cand.skills || []).slice(0, 4).map((sk, i) => (
                      <Badge key={i} variant="secondary" size="sm">
                        {sk}
                      </Badge>
                    ))}
                    {cand.experienceYears && (
                      <span className="text-xs text-slate-400 font-semibold">• {cand.experienceYears} Years Exp</span>
                    )}
                  </div>
                </div>

                {/* Rating & Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => ratingMutation.mutate({ id: app._id, rating: star })}
                        className="text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${star <= (app.rating || 0) ? 'fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Stage Dropdown */}
                  <select
                    value={app.status || 'Screening'}
                    onChange={(e) => statusMutation.mutate({ id: app._id, status: e.target.value })}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="Screening">Screening</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app);
                      setFeedbackNote(app.feedback || '');
                    }}
                  >
                    View Resume & Notes <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Candidate Resume & Profile Drawer */}
      <Drawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.candidate?.fullName || 'Candidate Profile'}
      >
        {selectedApp && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">{selectedApp.candidate?.fullName}</h3>
              <p className="text-xs text-brand-400">{selectedApp.candidate?.headline}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedApp.candidate?.email}</p>
            </div>

            {/* Resume Link */}
            {selectedApp.resumeUrl && (
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                  <FileText className="w-4 h-4" /> Candidate Resume PDF
                </div>
                <a
                  href={selectedApp.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white hover:underline flex items-center gap-1"
                >
                  Open PDF <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Cover Note Pitch */}
            {selectedApp.coverLetter && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">Cover Note / Pitch</h4>
                <p className="text-xs text-slate-300 bg-slate-800/60 p-4 rounded-2xl italic">
                  "{selectedApp.coverLetter}"
                </p>
              </div>
            )}

            {/* Recruiter Notes Textarea */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white">Internal Recruiter Notes</h4>
              <Textarea
                rows={4}
                placeholder="Write internal team feedback, screening impressions, or salary notes..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
              />
              <Button variant="primary" size="sm" isLoading={feedbackMutation.isPending} onClick={handleSaveNotes}>
                Save Recruiter Notes
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
