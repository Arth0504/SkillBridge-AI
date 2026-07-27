import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Upload,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Camera,
  Save,
  Link as LinkIcon,
} from 'lucide-react';
import { Button, Input, Textarea, Badge, Loader } from '../../../components/common';
import { Avatar } from '../../../components/common/Avatar';
import { candidateApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

// Zod Validation Schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  headline: z.string().min(2, 'Headline is required'),
  bio: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  experienceYears: z.coerce.number().min(0, 'Experience years must be 0 or greater'),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  twitter: z.string().optional(),
});

export const CandidateProfilePage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);

  // Fetch Candidate Profile
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: candidateApi.getProfile,
  });

  const profile = profileResponse?.data?.profile || {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      headline: '',
      bio: '',
      location: '',
      experienceYears: 0,
      github: '',
      linkedin: '',
      portfolio: '',
      twitter: '',
    },
  });

  // Load existing profile values into form & state
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        experienceYears: profile.experienceYears || 0,
        github: profile.socialLinks?.github || '',
        linkedin: profile.socialLinks?.linkedin || '',
        portfolio: profile.socialLinks?.portfolio || '',
        twitter: profile.socialLinks?.twitter || '',
      });
      if (profile.skills) setSkills(profile.skills);
      if (profile.education) setEducationList(profile.education);
      if (profile.experience) setExperienceList(profile.experience);
    }
  }, [profileResponse, reset]);

  const { user, updateUser, refreshUser } = useAuth();

  // Profile Update Mutation
  const updateMutation = useMutation({
    mutationFn: candidateApi.updateProfile,
    onSuccess: (data) => {
      toast.success('Candidate profile saved successfully!');
      const updatedCandidate = data?.data?.profile || data?.profile;
      if (updatedCandidate) {
        updateUser(updatedCandidate);
      }
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  // Avatar Upload Mutation
  const avatarMutation = useMutation({
    mutationFn: candidateApi.uploadAvatar,
    onSuccess: (data) => {
      toast.success('Profile avatar updated successfully!');
      const newAvatarUrl = data?.data?.avatarUrl || data?.avatarUrl;
      if (newAvatarUrl) {
        updateUser({ avatarUrl: newAvatarUrl });
      }
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Avatar upload failed.');
    },
  });

  // Resume Upload Mutation
  const resumeMutation = useMutation({
    mutationFn: candidateApi.uploadResume,
    onSuccess: (data) => {
      toast.success('Resume PDF uploaded successfully!');
      const newResumeUrl = data?.data?.resumeUrl || data?.resumeUrl;
      if (newResumeUrl) {
        updateUser({ resumeUrl: newResumeUrl, profileCompleted: true });
      }
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Resume upload failed.');
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      headline: formData.headline,
      bio: formData.bio,
      location: formData.location,
      experienceYears: Number(formData.experienceYears),
      skills,
      education: educationList,
      experience: experienceList,
      socialLinks: {
        github: formData.github,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        twitter: formData.twitter,
      },
    };
    updateMutation.mutate(payload);
  };

  // Add / Remove Skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
      { institution: '', degree: '', fieldOfStudy: '', startYear: 2020, endYear: 2024 },
    ]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // Experience Helpers
  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      { title: '', company: '', location: '', current: true, description: '' },
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experienceList];
    updated[index][field] = value;
    setExperienceList(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperienceList(experienceList.filter((_, i) => i !== index));
  };

  // Avatar Upload Handler
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  // Resume Upload Handler
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) resumeMutation.mutate(file);
  };

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    let score = 0;
    if (profile.fullName) score += 15;
    if (profile.headline) score += 15;
    if (profile.location) score += 10;
    if (profile.skills?.length > 0) score += 20;
    if (profile.education?.length > 0) score += 15;
    if (profile.experience?.length > 0) score += 15;
    if (profile.resumeUrl) score += 10;
    return score;
  };

  const completionPct = calculateCompletion();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Candidate Profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-brand-500" /> Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal bio, work experience, verified skills, and resume ATS documents.
          </p>
        </div>

        {/* Completion Progress & Public Profile Button */}
        <div className="flex flex-wrap items-center gap-3">
          {user?._id && (
            <Link to={`/candidate/public/${user._id}`} target="_blank">
              <Button variant="secondary" size="sm" type="button">
                <Globe className="w-4 h-4 mr-2 text-brand-500" /> View Public Profile
              </Button>
            </Link>
          )}

          <div className="glass-panel px-5 py-3 rounded-2xl border border-brand-500/20 flex items-center gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Profile Completion</p>
              <h4 className="text-lg font-black text-brand-500">{completionPct}% Completed</h4>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
              {completionPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'experience', label: 'Experience & Education', icon: Briefcase },
          { id: 'skills', label: 'Skills & Social Links', icon: Sparkles },
          { id: 'uploads', label: 'Resume & Avatar Upload', icon: Upload },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name *"
                placeholder="e.g. Alex Johnson"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Phone Number"
                placeholder="e.g. +1 (555) 019-2834"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Professional Headline *"
                placeholder="e.g. Senior Full Stack AI Engineer"
                error={errors.headline?.message}
                {...register('headline')}
              />

              <Input
                label="Location *"
                placeholder="e.g. San Francisco, CA (or Remote)"
                error={errors.location?.message}
                {...register('location')}
              />

              <Input
                label="Years of Experience *"
                type="number"
                placeholder="e.g. 5"
                error={errors.experienceYears?.message}
                {...register('experienceYears')}
              />
            </div>

            <Textarea
              label="Professional Bio"
              rows={4}
              placeholder="Write a brief overview of your technical achievements, background, and career goals..."
              error={errors.bio?.message}
              {...register('bio')}
            />
          </motion.div>
        )}

        {/* Tab 2: Education & Experience */}
        {activeTab === 'experience' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Work Experience */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-500" /> Work Experience
                </h3>
                <Button variant="outline" size="sm" type="button" onClick={handleAddExperience}>
                  <Plus className="w-4 h-4 mr-1" /> Add Role
                </Button>
              </div>

              {experienceList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No work experience added yet. Click 'Add Role' above.</p>
              ) : (
                <div className="space-y-4">
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Job Title"
                          value={exp.title}
                          onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                        />
                        <Input
                          label="Company Name"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          placeholder="e.g. Google DeepMind"
                        />
                        <Input
                          label="Location"
                          value={exp.location}
                          onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                          placeholder="e.g. Mountain View, CA"
                        />
                      </div>

                      <Textarea
                        label="Description & Achievements"
                        rows={2}
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="Key responsibilities and technical accomplishments..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education History */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-500" /> Education History
                </h3>
                <Button variant="outline" size="sm" type="button" onClick={handleAddEducation}>
                  <Plus className="w-4 h-4 mr-1" /> Add Education
                </Button>
              </div>

              {educationList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No education added yet. Click 'Add Education' above.</p>
              ) : (
                <div className="space-y-4">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          label="Institution / University"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                          placeholder="e.g. Stanford University"
                        />
                        <Input
                          label="Degree"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                          placeholder="e.g. Bachelor of Science"
                        />
                        <Input
                          label="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleUpdateEducation(idx, 'fieldOfStudy', e.target.value)}
                          placeholder="e.g. Computer Science"
                        />
                        <Input
                          label="Graduation Year"
                          type="number"
                          value={edu.endYear}
                          onChange={(e) => handleUpdateEducation(idx, 'endYear', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Skills & Social Links */}
        {activeTab === 'skills' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Skills Tag Management */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" /> Technical Skills & Stack
              </h3>

              <div className="flex gap-3">
                <Input
                  placeholder="Enter skill (e.g. React.js, Python, LLMs, Docker)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-semibold text-xs"
                  >
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social & Portfolio Links */}
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-500" /> Social Profiles & Links
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="GitHub Profile URL"
                  placeholder="https://github.com/username"
                  {...register('github')}
                />
                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/username"
                  {...register('linkedin')}
                />
                <Input
                  label="Personal Portfolio URL"
                  placeholder="https://yourportfolio.com"
                  {...register('portfolio')}
                />
                <Input
                  label="Twitter / X Handle"
                  placeholder="https://twitter.com/username"
                  {...register('twitter')}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Resume & Avatar Upload */}
        {activeTab === 'uploads' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Upload */}
            <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-brand-500" /> Profile Avatar
              </h3>

              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-brand-500/30 bg-slate-800 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-500" />
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all">
                  <Camera className="w-4 h-4" /> Upload New Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <p className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</p>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" /> ATS Resume Document
              </h3>

              {profile.resumeUrl ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Active Resume PDF Uploaded
                  </p>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-400 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    View Current Resume PDF <LinkIcon className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No PDF uploaded yet.</p>
              )}

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all">
                  <Upload className="w-4 h-4 text-brand-500" /> Choose PDF File
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeChange} />
                </label>
                <p className="text-[11px] text-slate-400">PDF document format only</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="primary" size="lg" type="submit" isLoading={updateMutation.isPending || isSubmitting}>
            <Save className="w-4 h-4 mr-2" /> Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
