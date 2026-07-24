import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Modal, Textarea } from '../../../components/common';
import { MapPin, DollarSign, Briefcase, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { jobApi } from '../../../api/jobApi';
import { Loader, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['job', id], queryFn: () => jobApi.getJobById(id), enabled: Boolean(id) });
  const job = data?.data?.job;

  const handleApply = async () => {
    if (!job) return;
    setIsSubmitting(true);
    try {
      await jobApi.applyToJob(job._id, { coverLetter });
      setIsSubmitting(false);
      setApplyModalOpen(false);
      toast.success('Application submitted successfully! AI evaluation in progress.');
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || 'Could not submit your application.');
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (isError || !job) return <div className="max-w-5xl mx-auto px-4 py-10"><ErrorState title="Job not available" description="This role may have closed or no longer exists." onRetry={refetch} /></div>;
  const location = [job.location?.city || job.city, job.location?.state || job.state, job.location?.country || job.country].filter(Boolean).join(', ') || job.workMode;
  const salary = job.salary?.isNegotiable ? 'Negotiable' : job.salary?.min || job.salary?.max ? `${formatCurrency(job.salary.min || 0, job.currency)} – ${formatCurrency(job.salary.max || 0, job.currency)} / ${job.salaryType}` : 'Not disclosed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Button>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="space-y-2">
            <Badge variant="purple" icon={Sparkles}>
              {job.experienceLevel} level opportunity
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{job.title}</h1>
            <p className="text-base font-semibold text-brand-600 dark:text-brand-400">{job.company}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {location}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {salary}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.employmentType} · {job.workMode}</span>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={() => setApplyModalOpen(true)}>
            Quick Apply with AI Profile
          </Button>
        </div>

        {/* Job Description */}
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this role</h3>
          <p className="whitespace-pre-line leading-relaxed">{job.description}</p>
          {job.responsibilities?.length > 0 && <><h3 className="text-lg font-bold text-slate-900 dark:text-white">Job Responsibilities</h3>
          <ul className="list-disc pl-5 space-y-2">
            {job.responsibilities.map((item) => <li key={item}>{item}</li>)}
          </ul></>}

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Key Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills?.length ? job.requiredSkills : job.requirements || []).map((req, i) => (
              <Badge key={i} variant="info">{req}</Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your verified candidate resume and AI skill assessment scores will automatically be attached to this application.
          </p>
          <Textarea
            label="Cover Note / Pitch (Optional)"
            placeholder="Tell the hiring team why you are a great fit..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleApply}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
