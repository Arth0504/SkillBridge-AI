import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Eye, Plus, Users, Edit3, Trash2, Copy, Search, Filter } from 'lucide-react';
import { Badge, Button, EmptyState, ErrorState, Loader, Modal } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

const statusVariant = {
  open: 'success',
  active: 'success',
  draft: 'secondary',
  paused: 'warning',
  closed: 'danger',
  expired: 'danger',
};

export const CompanyJobsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [deleteJobItem, setDeleteJobItem] = useState(null);

  // Fetch Company Jobs
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['company-jobs', statusTab],
    queryFn: () => companyApi.getCompanyJobs({ limit: 50 }),
  });

  const jobs = data?.data?.jobs ?? [];

  // Delete Job Mutation
  const deleteMutation = useMutation({
    mutationFn: companyApi.deleteJob,
    onSuccess: () => {
      toast.success('Job posting deleted.');
      setDeleteJobItem(null);
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete job posting.');
    },
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => companyApi.updateJobStatus(id, status),
    onSuccess: () => {
      toast.success('Job status updated.');
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update job status.');
    },
  });

  // Duplicate Job Helper
  const handleDuplicate = (job) => {
    // Navigate to create new job page passing duplicate payload state
    toast.success('Cloning role template...');
    navigate('/company/jobs/new', { state: { duplicateJob: job } });
  };

  const filteredJobs = jobs.filter((j) => {
    const titleMatch = j.title?.toLowerCase().includes(search.toLowerCase());
    const statusMatch =
      statusTab === 'ALL'
        ? true
        : statusTab === 'DRAFT'
        ? j.status === 'draft'
        : statusTab === 'PAUSED'
        ? j.status === 'paused'
        : statusTab === 'CLOSED'
        ? j.status === 'closed'
        : j.status === 'open' || j.status === 'active';
    return titleMatch && statusMatch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-brand-500" /> Job Postings Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your published positions, draft templates, active screening, and role performance.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/company/jobs/new')}>
          <Plus className="w-4 h-4 mr-2" /> Post New Position
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusTab(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusTab === st
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading && <Loader text="Loading your job postings..." />}
      {isError && <ErrorState title="Could not load your job postings" onRetry={refetch} />}

      {!isLoading && !isError && filteredJobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No Job Postings Found"
          description="Create your first role posting to start attracting top AI-matched candidates."
          actionLabel="Post New Position"
          onAction={() => navigate('/company/jobs/new')}
        />
      )}

      {!isLoading && !isError && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-xl transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <Badge variant={statusVariant[job.status] || 'secondary'}>{job.status || 'open'}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {job.employmentType} • {job.workMode} • Location: {job.location?.city || job.city || 'Remote'}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-brand-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {job.totalApplications || job.applicantsCount || 0} Applicants
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {job.views || 0} Views
                  </span>
                </div>
              </div>

              {/* Status Dropdown & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={job.status || 'open'}
                  onChange={(e) => statusMutation.mutate({ id: job._id, status: e.target.value })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="open">Open / Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/company/jobs/edit/${job._id}`)}
                  title="Edit Position"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(job)}
                  title="Duplicate Role"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10 border-red-500/20"
                  onClick={() => setDeleteJobItem(job)}
                  title="Delete Position"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteJobItem && (
        <Modal
          isOpen={Boolean(deleteJobItem)}
          onClose={() => setDeleteJobItem(null)}
          title="Delete Job Posting"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deleteJobItem.title}</strong>? All associated application screening data will be archived.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setDeleteJobItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-500"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteJobItem._id)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
