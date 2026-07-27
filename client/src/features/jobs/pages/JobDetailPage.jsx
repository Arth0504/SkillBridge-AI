import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Modal, Textarea } from '../../../components/common';
import { MapPin, DollarSign, Briefcase, Sparkles, ArrowLeft, FileText, ExternalLink, Upload, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { jobApi } from '../../../api/jobApi';
import { candidateApi } from '../../../api/candidateApi';
import { Loader, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

import { useAuth } from '../../../context/AuthContext';
import { EmailVerificationModal } from '../../auth/components/EmailVerificationModal';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customResumeUrl, setCustomResumeUrl] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id),
    enabled: Boolean(id),
  });
  const job = data?.data?.job;

  const activeResumeUrl = customResumeUrl || user?.resumeUrl || '';

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      toast.error('Please log in as a candidate to apply for jobs.');
      navigate('/auth/login');
      return;
    }

    if (role !== 'candidate') {
      toast.error('Only candidate accounts can submit job applications.');
      return;
    }

    const isEmailVerificationRequired = import.meta.env.VITE_EMAIL_VERIFICATION_REQUIRED === 'true';
    if (isEmailVerificationRequired && user && !user.isEmailVerified) {
      setVerifyModalOpen(true);
      return;
    }

    setApplyModalOpen(true);
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF document.');
      return;
    }

    setIsUploadingResume(true);
    try {
      const res = await candidateApi.uploadResume(file);
      const newUrl = res.data?.resumeUrl || res.resumeUrl;
      setCustomResumeUrl(newUrl);
      setShowFilePicker(false);
      setIsUploadingResume(false);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      setIsUploadingResume(false);
      toast.error(err.response?.data?.message || 'Failed to upload resume file.');
    }
  };

  const handleApply = async () => {
    if (!job) return;
    const finalResumeUrl = customResumeUrl || user?.resumeUrl;
    if (!finalResumeUrl) {
      toast.error('Please upload or select a resume before submitting your application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await jobApi.applyToJob(job._id, { coverLetter, resumeUrl: finalResumeUrl });
      setIsSubmitting(false);
      setApplyModalOpen(false);
      toast.success('Application submitted successfully! AI evaluation in progress.');
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || 'Could not submit your application.');
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (isError || !job)
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <ErrorState
          title="Job not available"
          description="This role may have closed or no longer exists."
          onRetry={refetch}
        />
      </div>
    );

  const location =
    [job.location?.city || job.city, job.location?.state || job.state, job.location?.country || job.country]
      .filter(Boolean)
      .join(', ') || job.workMode;
  const salary = job.salary?.isNegotiable
    ? 'Negotiable'
    : job.salary?.min || job.salary?.max
    ? `${formatCurrency(job.salary.min || 0, job.currency)} – ${formatCurrency(
        job.salary.max || 0,
        job.currency
      )} / ${job.salaryType}`
    : 'Not disclosed';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div className="space-y-2">
            <Badge variant="purple" icon={Sparkles}>
              {job.experienceLevel} level opportunity
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{job.title}</h1>
            <p className="text-base font-semibold text-brand-600 dark:text-brand-400">{job.company}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> {salary}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {job.employmentType} · {job.workMode}
              </span>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={handleOpenApplyModal}>
            Quick Apply with AI Profile
          </Button>
        </div>

        {/* Job Description */}
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">About this role</h3>
          <p className="whitespace-pre-line leading-relaxed">{job.description}</p>
          {job.responsibilities?.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Job Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-2">
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Key Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills?.length ? job.requiredSkills : job.requirements || []).map((req, i) => (
              <Badge key={i} variant="info">
                {req}
              </Badge>
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
        <div className="space-y-5">
          <p className="text-xs text-slate-400">
            Your candidate resume and AI skill evaluation scores will be attached to this application.
          </p>

          {/* Resume Selection / Upload Control */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Candidate Resume *</label>

            {activeResumeUrl && !showFilePicker ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                    <FileText className="w-4 h-4 text-brand-500" /> Current Resume Attached
                  </div>
                  <Badge variant="success" size="sm">
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={activeResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Resume
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilePicker(true)}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replace Resume
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center space-y-3">
                <Upload className="w-8 h-8 mx-auto text-brand-400" />
                <div>
                  <p className="text-xs font-bold text-white">Upload Candidate Resume (PDF)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Select a PDF file from your device</p>
                </div>
                <div className="flex justify-center items-center gap-3 pt-1">
                  <label className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white cursor-pointer transition-all shadow-md shadow-brand-500/20 flex items-center gap-2">
                    {isUploadingResume ? (
                      <>
                        <Loader size="sm" /> Uploading PDF...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Select PDF File
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={isUploadingResume}
                      onChange={handleResumeFileChange}
                      className="hidden"
                    />
                  </label>
                  {activeResumeUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setShowFilePicker(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Cover Note / Pitch (Optional)"
            placeholder="Tell the hiring team why you are a great fit for this role..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmitting || isUploadingResume}
              onClick={handleApply}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        user={user}
        onVerified={() => setApplyModalOpen(true)}
      />
    </div>
  );
};
