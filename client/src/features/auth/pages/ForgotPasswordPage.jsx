import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowLeft, Send } from 'lucide-react';
import { Input, Button, Radio } from '../../../components/common';
import { authApi } from '../../../api/authApi';
import { InteractiveMascot } from '../components/InteractiveMascot';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const [accountType, setAccountType] = useState('candidate');
  const [mascotState, setMascotState] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMascotState('idle');
    try {
      if (accountType === 'candidate') {
        await authApi.forgotPasswordCandidate(data.email);
      } else {
        await authApi.forgotPasswordCompany(data.email);
      }
      setMascotState('success');
      setSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      setMascotState('failure');
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Left Column: Mascot & Pitch Showcase */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-[#131926] to-[#0A0D15] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Grid Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="flex flex-col items-center max-w-sm text-center space-y-6 z-10">
          <InteractiveMascot state={mascotState} />
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Lost Your Password?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don't worry, Bridgey will help you retrieve your secure security credentials in just a few seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Password Recovery Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-6 glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl"
        >
          {/* Mobile Mascot Header (Fallback for smaller viewports) */}
          <div className="flex md:hidden justify-center mb-4">
            <InteractiveMascot state={mascotState} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email and we'll send you a magic recovery link.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Radio
                label="Select Account Type"
                name="accountType"
                value={accountType}
                onChange={setAccountType}
                direction="horizontal"
                options={[
                  { label: 'Candidate', value: 'candidate' },
                  { label: 'Company Employer', value: 'company' },
                ]}
              />

              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@domain.com"
                startIcon={Mail}
                error={errors.email?.message}
                {...register('email')}
                onFocus={() => setMascotState('looking')}
                onBlur={() => setMascotState('idle')}
              />

              <Button type="submit" variant="primary" className="w-full h-11" isLoading={loading}>
                <Send className="w-4 h-4 mr-2" /> Send Recovery Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                A verification link has been sent to your email box. Please open it to finalize setting up your new password.
              </p>
              <Button variant="secondary" className="w-full h-11" onClick={() => setSubmitted(false)}>
                Resend Recovery Link
              </Button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/40 text-center">
            <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
