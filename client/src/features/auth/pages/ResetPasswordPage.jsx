import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Sparkles, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input, Button } from '../../../components/common';
import { authApi } from '../../../api/authApi';
import { InteractiveMascot } from '../components/InteractiveMascot';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ResetPasswordPage = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;
  const accountType = searchParams.get('type') || 'candidate'; // 'candidate' | 'company'

  const [mascotState, setMascotState] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Verification reset token is missing.');
      setMascotState('failure');
      return;
    }
    setLoading(true);
    setMascotState('idle');
    try {
      if (accountType === 'company') {
        await authApi.resetPasswordCompany(token, data.password);
      } else {
        await authApi.resetPasswordCandidate(token, data.password);
      }
      setMascotState('success');
      setSuccess(true);
      toast.success('Your password has been reset successfully.');
    } catch (err) {
      setMascotState('failure');
      toast.error(err.response?.data?.message || 'Password reset link has expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Left Column: Mascot Showcase */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-[#131926] to-[#0A0D15] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="flex flex-col items-center max-w-sm text-center space-y-6 z-10">
          <InteractiveMascot state={mascotState} />
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Secure New Password</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridgey will hide his eyes to respect your confidentiality while you set up your new credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Reset Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-6 glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl"
        >
          {/* Mobile Mascot Header */}
          <div className="flex md:hidden justify-center mb-4">
            <InteractiveMascot state={mascotState} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please enter your fresh workspace password below.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                startIcon={Lock}
                error={errors.password?.message}
                {...register('password')}
                onFocus={() => setMascotState('covering')}
                onBlur={() => setMascotState('idle')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                startIcon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                onFocus={() => setMascotState('covering')}
                onBlur={() => setMascotState('idle')}
              />

              <Button type="submit" variant="primary" className="w-full h-11" isLoading={loading}>
                Update Password
              </Button>
            </form>
          ) : (
            <div className="space-y-6 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your password has been successfully updated. You can now log back into your workspace.
              </p>
              <Button variant="primary" className="w-full h-11" onClick={() => navigate('/auth/login')}>
                Sign In Now
              </Button>
            </div>
          )}

          {!success && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/40 text-center">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
