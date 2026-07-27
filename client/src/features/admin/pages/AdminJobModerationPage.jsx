import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, XCircle, Flag, Star, Trash2, Search, ExternalLink, ChevronRight } from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Modal, Drawer } from '../../../components/common';
import { adminApi } from '../../../api';
import toast from 'react-hot-toast';

export const AdminJobModerationPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteJobItem, setDeleteJobItem] = useState(null);

  // Fetch All Platform Jobs
  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: ['admin-jobs-moderation', tab],
    queryFn: () => adminApi.getJobs({ status: tab === 'ALL' ? undefined : tab }),
  });

  const jobs = jobsResponse?.data?.jobs ?? [];

  // Moderate Job Mutation
  const moderateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.moderateJob(id, payload),
    onSuccess: () => {
      toast.success('Job posting moderation status updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs-moderation'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Moderation action failed.');
    },
  });

  // Delete Job Mutation
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteJob,
    onSuccess: () => {
      toast.success('Job posting deleted.');
      setDeleteJobItem(null);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs-moderation'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete job posting.');
    },
  });

  const handleToggleFeatured = (job) => {
    moderateMutation.mutate({
      id: job._id,
      payload: { isFeatured: !job.isFeatured },
    });
  };

  const handleStatusChange = (jobId, status) => {
    moderateMutation.mutate({ id: jobId, payload: { status } });
  };

  const filteredJobs = jobs.filter((j) => {
    const title = j.title || '';
    const company = j.companyName || j.company || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Job Moderation Queue..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-brand-500" /> Platform Job Moderation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review live job postings, flag policy violations, feature top roles, and manage posting status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Search
            placeholder="Search job title or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'active', 'flagged', 'closed'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                tab === t
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Directory Table */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Job Postings Found"
          description="No job postings match your current moderation filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((j, idx) => (
            <motion.div
              key={j._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${
                j.status === 'flagged' ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{j.title}</h3>
                  <Badge variant={j.status === 'active' ? 'success' : j.status === 'flagged' ? 'warning' : 'secondary'}>
                    {j.status}
                  </Badge>
                  {j.isFeatured && (
                    <Badge variant="purple" icon={Star}>
                      Featured Role
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-semibold text-brand-400">{j.companyName || 'Employer'}</p>
                <p className="text-[11px] text-slate-400">{j.location} • {j.salaryRange || 'Disclosed Salary'}</p>

                {j.flagReason && (
                  <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    Flagged: {j.flagReason}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFeatured(j)}
                  className={j.isFeatured ? 'text-purple-400 border-purple-500/30' : ''}
                >
                  <Star className="w-4 h-4 mr-1" /> {j.isFeatured ? 'Unfeature' : 'Feature'}
                </Button>

                {j.status === 'flagged' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleStatusChange(j._id, 'active')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-400 border-amber-500/30"
                    onClick={() => handleStatusChange(j._id, 'flagged')}
                  >
                    <Flag className="w-4 h-4 mr-1" /> Flag
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => setDeleteJobItem(j)}
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
              Are you sure you want to permanently delete <strong className="text-white">{deleteJobItem.title}</strong>?
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
