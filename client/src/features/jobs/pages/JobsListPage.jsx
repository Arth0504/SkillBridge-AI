import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Button, Badge, Loader, EmptyState, ErrorState } from '../../../components/common';
import { Briefcase, MapPin, DollarSign, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../../../api/jobApi';
import { candidateApi } from '../../../api/candidateApi';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';

export const JobsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => jobApi.getJobs({ keyword: search || undefined, limit: 20 }),
  });

  const { data: savedJobsData } = useQuery({
    queryKey: ['candidate-saved-jobs'],
    queryFn: candidateApi.getSavedJobs,
    enabled: role === 'candidate',
  });

  const savedJobs = savedJobsData?.data?.savedJobs || [];
  const savedJobIds = new Set(
    savedJobs.map((sj) => (sj.job?._id || sj.jobId || sj._id)?.toString()).filter(Boolean)
  );

  const saveMutation = useMutation({
    mutationFn: candidateApi.saveJob,
    onSuccess: () => {
      toast.success('Job saved to your bookmarks!');
      queryClient.invalidateQueries({ queryKey: ['candidate-saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not save job.');
    },
  });

  const removeSaveMutation = useMutation({
    mutationFn: candidateApi.removeSavedJob,
    onSuccess: () => {
      toast.success('Job removed from saved list.');
      queryClient.invalidateQueries({ queryKey: ['candidate-saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not remove job.');
    },
  });

  const toggleSaveJob = (jobId) => {
    if (role !== 'candidate') {
      toast.error('Please log in as a candidate to save jobs.');
      return;
    }
    if (savedJobIds.has(jobId.toString())) {
      removeSaveMutation.mutate(jobId);
    } else {
      saveMutation.mutate(jobId);
    }
  };

  const jobs = data?.data?.jobs ?? [];
  const getLocation = (job) => [job.location?.city || job.city, job.location?.state || job.state, job.location?.country || job.country].filter(Boolean).join(', ') || job.workMode;
  const getSalary = (job) => job.salary?.isNegotiable ? 'Negotiable' : job.salary?.min || job.salary?.max ? `${formatCurrency(job.salary.min || 0, job.currency)} – ${formatCurrency(job.salary.max || 0, job.currency)}` : 'Not disclosed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search & Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="purple" icon={Sparkles}>
          AI-Matched Talent Marketplace
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Explore AI & Engineering <span className="gradient-text">Opportunities</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalized candidate matching powered by deep learning evaluation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="flex-1">
            <Search placeholder="Search role title, skill, or keyword..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="primary" onClick={() => refetch()}>
            Search Jobs
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoading && <Loader />}
        {isError && <ErrorState title="Could not load jobs" onRetry={refetch} />}
        {!isLoading && !isError && jobs.length === 0 && <EmptyState icon={Briefcase} title="No jobs found" description="Try another keyword or check back soon for new opportunities." />}
        {jobs.map((job, idx) => {
          const isSaved = savedJobIds.has(job._id.toString());
          return (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <Badge variant="success">Open role</Badge>
                </div>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{job.company}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {getLocation(job)}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {getSalary(job)}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.employmentType}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(job.requiredSkills?.length ? job.requiredSkills : job.tags || []).slice(0, 5).map((tg, i) => (
                    <Badge key={i} variant="secondary" size="sm">
                      {tg}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {role === 'candidate' && (
                  <button
                    onClick={() => toggleSaveJob(job._id)}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isSaved ? 'Remove from Saved Jobs' : 'Save Job'}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    />
                  </button>
                )}
                <Button variant="primary" onClick={() => navigate(`/jobs/${job.slug || job._id}`)}>
                  View & Apply
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
