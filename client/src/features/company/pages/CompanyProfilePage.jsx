import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Building, Mail, Globe, MapPin, Camera, Save, Phone, UserCheck, ShieldCheck } from 'lucide-react';
import { Button, Input, Textarea, Badge, Loader } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  recruiterContactName: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export const CompanyProfilePage = () => {
  const queryClient = useQueryClient();

  // Fetch Company Profile
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: companyApi.getProfile,
  });

  const profile = profileResponse?.data?.profile || profileResponse?.data || {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: '',
      website: '',
      industry: '',
      companySize: '',
      location: '',
      description: '',
      phone: '',
      recruiterContactName: '',
      linkedin: '',
      twitter: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName || '',
        website: profile.website || '',
        industry: profile.industry || 'Artificial Intelligence & Software',
        companySize: profile.companySize || '50-200 employees',
        location: profile.location || 'Austin, TX (Headquarters)',
        description: profile.description || 'SkillBridge AI is an enterprise talent technology company automating candidate screening & technical evaluations.',
        phone: profile.phone || '+1 (555) 234-5678',
        recruiterContactName: profile.recruiterContactName || 'Lead Technical Recruiter',
        linkedin: profile.socialLinks?.linkedin || '',
        twitter: profile.socialLinks?.twitter || '',
      });
    }
  }, [profileResponse, reset]);

  // Profile Update Mutation
  const updateMutation = useMutation({
    mutationFn: companyApi.updateProfile,
    onSuccess: () => {
      toast.success('Company profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update company profile.');
    },
  });

  // Logo Upload Mutation
  const logoMutation = useMutation({
    mutationFn: companyApi.uploadLogo,
    onSuccess: () => {
      toast.success('Company logo uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Logo upload failed.');
    },
  });

  const onSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) logoMutation.mutate(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Company Profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Building className="w-8 h-8 text-brand-500" /> Employer Company Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your organization details, logo branding, industry profile, and recruiter contact info.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company Header Card with Logo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-800 pb-6">
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 border-2 border-brand-500/30 flex items-center justify-center text-white font-black text-3xl shadow-xl overflow-hidden shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                profile.companyName?.charAt(0) || 'C'
              )}
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-extrabold text-white">{profile.companyName || 'Company Name'}</h2>
                <Badge variant="purple" icon={ShieldCheck}>Verified Enterprise Employer</Badge>
              </div>
              <p className="text-xs text-slate-400">{profile.email || 'recruiter@skillbridge.ai'}</p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all mt-1">
                <Camera className="w-3.5 h-3.5 text-brand-400" /> Upload Company Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name *"
              placeholder="e.g. Acme AI Technologies"
              error={errors.companyName?.message}
              {...register('companyName')}
            />

            <Input
              label="Website URL"
              placeholder="https://company.com"
              error={errors.website?.message}
              {...register('website')}
            />

            <Input
              label="Industry / Domain"
              placeholder="e.g. Artificial Intelligence & Enterprise SaaS"
              error={errors.industry?.message}
              {...register('industry')}
            />

            <Input
              label="Company Size"
              placeholder="e.g. 50 - 200 Employees"
              error={errors.companySize?.message}
              {...register('companySize')}
            />

            <Input
              label="Headquarters Location"
              placeholder="e.g. San Francisco, CA"
              error={errors.location?.message}
              {...register('location')}
            />

            <Input
              label="Recruiter Contact Name"
              placeholder="e.g. Sarah Jenkins (Head of Talent)"
              error={errors.recruiterContactName?.message}
              {...register('recruiterContactName')}
            />

            <Input
              label="Recruiter Contact Phone"
              placeholder="e.g. +1 (555) 019-2834"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="LinkedIn Company Page"
              placeholder="https://linkedin.com/company/acme"
              error={errors.linkedin?.message}
              {...register('linkedin')}
            />
          </div>

          <Textarea
            label="Company Description & Employer Value Proposition"
            rows={5}
            placeholder="Tell top technology candidates about your engineering culture, mission, and benefits..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button variant="primary" size="lg" type="submit" isLoading={updateMutation.isPending || isSubmitting}>
              <Save className="w-4 h-4 mr-2" /> Save Company Profile
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};
