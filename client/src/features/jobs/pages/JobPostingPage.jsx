import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Briefcase, Plus, Save, ArrowLeft } from 'lucide-react';
import { Button, Input, Select, Textarea, Loader } from '../../../components/common';
import { companyApi } from '../../../api';

const splitList = (value) =>
  typeof value === 'string'
    ? value.split('\n').map((item) => item.trim()).filter(Boolean)
    : Array.isArray(value)
    ? value
    : [];

export const JobPostingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    department: '',
    description: '',
    experienceLevel: 'mid',
    employmentType: 'Full Time',
    workMode: 'Remote',
    city: '',
    country: '',
    requiredSkills: '',
    responsibilities: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    openings: '1',
    applicationDeadline: '',
    status: 'open',
  });

  const [isCodingRoundEnabled, setIsCodingRoundEnabled] = useState(true);
  const [codingLanguages, setCodingLanguages] = useState(['JavaScript', 'Python', 'Java', 'C++', 'C', 'SQL']);

  const ALL_LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'SQL'];

  const toggleLanguage = (lang) => {
    setCodingLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // Fetch job details if editing
  const { data: jobResponse, isLoading } = useQuery({
    queryKey: ['company-job-detail', id],
    queryFn: () => companyApi.getCompanyJobById(id),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && jobResponse?.data?.job) {
      const j = jobResponse.data.job;
      setForm({
        title: j.title || '',
        department: j.department || '',
        description: j.description || '',
        experienceLevel: j.experienceLevel || 'mid',
        employmentType: j.employmentType || 'Full Time',
        workMode: j.workMode || 'Remote',
        city: j.location?.city || j.city || '',
        country: j.location?.country || j.country || '',
        requiredSkills: Array.isArray(j.requiredSkills) ? j.requiredSkills.join('\n') : '',
        responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('\n') : '',
        requirements: Array.isArray(j.requirements) ? j.requirements.join('\n') : '',
        salaryMin: j.salary?.min || '',
        salaryMax: j.salary?.max || '',
        openings: String(j.openings || 1),
        applicationDeadline: j.applicationDeadline ? j.applicationDeadline.split('T')[0] : '',
        status: j.status || 'open',
      });
      setIsCodingRoundEnabled(j.isCodingRoundEnabled !== false);
      if (Array.isArray(j.codingLanguages) && j.codingLanguages.length > 0) {
        setCodingLanguages(j.codingLanguages);
      }
    }
  }, [isEditMode, jobResponse]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event, targetStatus = 'open') => {
    if (event) event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        department: form.department,
        description: form.description,
        experienceLevel: form.experienceLevel,
        employmentType: form.employmentType,
        workMode: form.workMode,
        city: form.city,
        country: form.country,
        location: { city: form.city, country: form.country },
        requiredSkills: splitList(form.requiredSkills),
        responsibilities: splitList(form.responsibilities),
        requirements: splitList(form.requirements),
        salary: { min: Number(form.salaryMin || 0), max: Number(form.salaryMax || 0) },
        openings: Number(form.openings),
        applicationDeadline: form.applicationDeadline || undefined,
        status: targetStatus,
        isCodingRoundEnabled,
        codingLanguages: isCodingRoundEnabled ? codingLanguages : [],
      };

      if (isEditMode) {
        await companyApi.updateJob(id, payload);
        toast.success('Job posting updated successfully.');
      } else {
        await companyApi.createJob(payload);
        toast.success(targetStatus === 'draft' ? 'Job draft saved.' : 'Job published successfully.');
      }
      navigate('/company/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save the job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Role Details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-500" /> {isEditMode ? 'Edit Job Posting' : 'Post New Position'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEditMode ? 'Update role requirements and job details.' : 'Publish a new role to reach top AI-screened candidates.'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/company/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Roles
        </Button>
      </div>

      <form onSubmit={(e) => submit(e, 'open')} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input required label="Job Title *" value={form.title} onChange={update('title')} placeholder="e.g. Senior AI Platform Engineer" />
          <Input label="Department" value={form.department} onChange={update('department')} placeholder="e.g. Core AI Engineering" />
          <Select
            label="Experience Level"
            value={form.experienceLevel}
            onChange={update('experienceLevel')}
            options={['entry', 'mid', 'senior', 'lead', 'executive']}
          />
          <Select
            label="Employment Type"
            value={form.employmentType}
            onChange={update('employmentType')}
            options={['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance']}
          />
          <Select
            label="Work Mode"
            value={form.workMode}
            onChange={update('workMode')}
            options={['Remote', 'On Site', 'Hybrid']}
          />
          <Input required type="number" min="1" label="Openings *" value={form.openings} onChange={update('openings')} />
        </div>

        <Textarea
          required
          label="Role Description *"
          rows={6}
          value={form.description}
          onChange={update('description')}
          placeholder="Describe company mission, candidate impact, and key engineering goals..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Required Skills (One per line)"
            rows={5}
            value={form.requiredSkills}
            onChange={update('requiredSkills')}
            placeholder="React.js&#10;Node.js&#10;PyTorch&#10;Docker"
          />
          <Textarea
            label="Responsibilities (One per line)"
            rows={5}
            value={form.responsibilities}
            onChange={update('responsibilities')}
            placeholder="Architect high throughput AI services&#10;Lead frontend component design"
          />
          <Textarea
            label="Key Requirements (One per line)"
            rows={5}
            value={form.requirements}
            onChange={update('requirements')}
            placeholder="5+ years in full stack engineering&#10;B.S. in Computer Science"
          />
          <div className="grid grid-cols-2 gap-3 content-start">
            <Input type="number" min="0" label="Min Salary ($)" value={form.salaryMin} onChange={update('salaryMin')} placeholder="140000" />
            <Input type="number" min="0" label="Max Salary ($)" value={form.salaryMax} onChange={update('salaryMax')} placeholder="180000" />
            <Input label="City" value={form.city} onChange={update('city')} placeholder="San Francisco" />
            <Input label="Country" value={form.country} onChange={update('country')} placeholder="United States" />
            <Input type="date" label="Application Deadline" className="col-span-2" value={form.applicationDeadline} onChange={update('applicationDeadline')} />
          </div>
        </div>

        {/* AI Coding Round & Language Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">AI Technical Coding Round</h3>
              <p className="text-xs text-slate-400">Enable algorithmic code assessment for candidate screening.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCodingRoundEnabled}
                onChange={(e) => setIsCodingRoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {isCodingRoundEnabled && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">Allowed Interview Coding Languages</label>
              <div className="flex flex-wrap gap-3">
                {ALL_LANGUAGES.map((lang) => (
                  <label key={lang} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer hover:border-brand-500">
                    <input
                      type="checkbox"
                      checked={codingLanguages.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                      className="rounded border-slate-800 text-brand-500 focus:ring-brand-500"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={() => navigate('/company/jobs')}>
            Cancel
          </Button>
          {!isEditMode && (
            <Button type="button" variant="secondary" isLoading={submitting} onClick={(e) => submit(e, 'draft')}>
              <Save className="w-4 h-4 mr-2" /> Save as Draft
            </Button>
          )}
          <Button type="submit" variant="primary" isLoading={submitting}>
            <Plus className="w-4 h-4 mr-2" /> {isEditMode ? 'Update Position' : 'Publish Position'}
          </Button>
        </div>
      </form>
    </div>
  );
};
