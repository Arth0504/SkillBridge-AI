import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Settings, Lock, Shield, Sun, Moon, Bell, CreditCard, Save, CheckCircle2, Building } from 'lucide-react';
import { Button, Input, Badge } from '../../../components/common';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const CompanySettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');

  // Notification Preferences State
  const [newAppAlerts, setNewAppAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [weeklyDigests, setWeeklyDigests] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data) => {
    try {
      await new Promise((res) => setTimeout(res, 800));
      toast.success('Recruiter password updated successfully!');
      reset();
    } catch (err) {
      toast.error('Failed to change password.');
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-500" /> Employer Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage recruiter account security, theme appearance, notification controls, and enterprise subscription billing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'account', label: 'Password & Security', icon: Lock },
          { id: 'theme', label: 'Theme & Appearance', icon: theme === 'dark' ? Moon : Sun },
          { id: 'notifications', label: 'Notification Controls', icon: Bell },
          { id: 'billing', label: 'Enterprise Billing & Plan', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Account & Security */}
      {activeTab === 'account' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Recruiter Account Security</h3>
                <p className="text-xs text-slate-400">Work Email: {user?.email || 'recruiter@skillbridge.ai'}</p>
              </div>
            </div>
            <Badge variant="success">Verified Recruiter</Badge>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-500" /> Update Password
            </h3>

            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
              <Input
                label="Current Password *"
                type="password"
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />

              <Input
                label="New Password *"
                type="password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />

              <Input
                label="Confirm New Password *"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" /> Save Password
              </Button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Theme */}
      {activeTab === 'theme' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-brand-500" />} Theme Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2">
            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-500/10 text-white'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <Moon className="w-6 h-6 text-purple-400" />
                {theme === 'dark' && <Badge variant="purple">Active</Badge>}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Dark SaaS Mode</h4>
                <p className="text-[11px] text-slate-400">Enterprise glassmorphic dark design.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`p-6 rounded-2xl border text-left space-y-3 transition-all ${
                theme === 'light'
                  ? 'border-brand-500 bg-brand-500/10 text-slate-900'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <Sun className="w-6 h-6 text-amber-400" />
                {theme === 'light' && <Badge variant="warning">Active</Badge>}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Light Mode</h4>
                <p className="text-[11px] text-slate-400">Clean high contrast interface.</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" /> Recruiter Notification Controls
          </h3>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">New Candidate Applications</h4>
                <p className="text-[11px] text-slate-400">Instant email when a candidate applies to your role</p>
              </div>
              <input
                type="checkbox"
                checked={newAppAlerts}
                onChange={(e) => setNewAppAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Interview Schedule Alerts</h4>
                <p className="text-[11px] text-slate-400">Reminders before candidate interview sessions</p>
              </div>
              <input
                type="checkbox"
                checked={interviewReminders}
                onChange={(e) => setInterviewReminders(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Weekly Pipeline Summary</h4>
                <p className="text-[11px] text-slate-400">Weekly email report of candidate screening metrics</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigests}
                onChange={(e) => setWeeklyDigests(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" /> Save Controls
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Billing Placeholder */}
      {activeTab === 'billing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <Badge variant="purple" icon={CreditCard}>Enterprise Plan</Badge>
              <h3 className="text-2xl font-extrabold text-white mt-1">Unlimited Candidate Screening Plan</h3>
              <p className="text-xs text-slate-400">Active seat count: 10 Recruiter Seats</p>
            </div>
            <Badge variant="success" size="lg">Subscription Active</Badge>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Included Enterprise Features</h4>
            <ul className="text-xs space-y-2 text-slate-300 list-disc pl-4">
              <li>Unlimited Gemini AI Resume ATS Audits & Job Matching</li>
              <li>Automated AI Mock & Technical Coding Evaluation Suites</li>
              <li>Async AI Video Screening & Executive Candidate Reports</li>
              <li>Dedicated Account Manager & Priority API Bandwidth</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};
