import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, ExternalLink, Briefcase, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Modal, Textarea } from '../../../components/common';
import { useNavigate } from 'react-router-dom';
import { candidateApi, applicationApi } from '../../../api';
import toast from 'react-hot-toast';

export const SavedJobsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // Fetch Saved Jobs
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidate-saved-jobs'],
    queryFn: candidateApi.getSavedJobs,
  });

  const savedJobs = data?.data?.savedJobs || [];

  // Remove Saved Job Mutation
  const removeMutation = useMutation({
    mutationFn: candidateApi.removeSavedJob,
    onSuccess: () => {
      toast.success('Job removed from saved list.');
      queryClient.invalidateQueries({ queryKey: ['candidate-saved-jobs'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove saved job.');
    },
  });

  // Quick Apply Mutation
  const applyMutation = useMutation({
    mutationFn: ({ jobId, payload }) => applicationApi.applyJob(jobId, payload),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setSelectedJob(null);
      setCoverLetter('');
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not submit application.');
    },
  });

  const filteredJobs = savedJobs.filter((sj) => {
    const job = sj.job || sj;
    const title = job.title || '';
    const company = job.companyName || job.company || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading your saved jobs..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-brand-500" /> Saved Jobs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Positions you saved for review or quick application.
          </p>
        </div>
        <Badge variant="purple" icon={Sparkles}>
          {savedJobs.length} Positions Bookmarked
        </Badge>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <Search
            placeholder="Search saved job titles or company names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Saved Jobs List */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Saved Jobs Found"
          description={
            search
              ? 'No bookmarked jobs matching your filter criteria.'
              : 'You have not bookmarked any jobs yet. Browse the marketplace and click save.'
          }
          actionLabel="Explore Job Marketplace"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((item, idx) => {
            const job = item.job || item;
            return (
              <motion.div
                key={item._id || job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title || 'Engineering Role'}</h3>
                    <Badge variant="purple">Bookmarked</Badge>
                  </div>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {job.companyName || job.company || 'Tech Company'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salaryRange || '$120k - $160k'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {job.employmentType || 'Full-time'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10 border-red-500/20"
                    onClick={() => removeMutation.mutate(job._id || item.jobId)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/jobs/${job.slug || job._id}`)}>
                    <ExternalLink className="w-4 h-4 mr-1" /> Details
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setSelectedJob(job)}>
                    Quick Apply
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Apply Modal */}
      {selectedJob && (
        <Modal
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          title={`Quick Apply: ${selectedJob.title}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Submit your verified candidate profile and resume directly to{' '}
              <strong className="text-white">{selectedJob.companyName || selectedJob.company}</strong>.
            </p>
            <Textarea
              label="Cover Note / Pitch (Optional)"
              rows={4}
              placeholder="Why are you a great match for this role?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={applyMutation.isPending}
                onClick={() =>
                  applyMutation.mutate({
                    jobId: selectedJob._id,
                    payload: { coverLetter },
                  })
                }
              >
                Confirm Application
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
