import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Settings, Lock, Shield, Sun, Moon, Bell, CheckCircle2, Save, UserCheck } from 'lucide-react';
import { Button, Input, Checkbox, Badge } from '../../../components/common';
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

export const CandidateSettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');

  // Notification Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

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
      // Simulate/call password update endpoint
      await new Promise((res) => setTimeout(res, 800));
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error('Failed to change password.');
    }
  };

  const handleSaveNotificationPrefs = () => {
    toast.success('Notification preferences updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-500" /> Candidate Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account security, password, theme preferences, and notification controls.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'account', label: 'Password & Security', icon: Lock },
          { id: 'theme', label: 'Theme & Appearance', icon: theme === 'dark' ? Moon : Sun },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

      {/* Tab 1: Password & Security */}
      {activeTab === 'account' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Security Status Box */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Account Security & Verification</h3>
                <p className="text-xs text-slate-400">Email: {user?.email || 'candidate@skillbridge.ai'}</p>
              </div>
            </div>
            <Badge variant="success">Email Verified</Badge>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-500" /> Change Account Password
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
                <Save className="w-4 h-4 mr-2" /> Update Password
              </Button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Theme & Appearance */}
      {activeTab === 'theme' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-500" /> : <Sun className="w-5 h-5 text-brand-500" />} Theme Preference
          </h3>

          <p className="text-xs text-slate-400">
            Choose your preferred color theme for the SkillBridge AI candidate portal interface.
          </p>

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
                <h4 className="text-sm font-bold text-white">Dark Mode (SaaS Premium)</h4>
                <p className="text-[11px] text-slate-400">Sleek dark glassmorphic interface with low eye strain.</p>
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
                <p className="text-[11px] text-slate-400">High contrast bright workspace layout.</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" /> Notification Controls
          </h3>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Email Application Updates</h4>
                <p className="text-[11px] text-slate-400">Receive email alerts when application status changes</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">AI Job Recommendations</h4>
                <p className="text-[11px] text-slate-400">Daily digests of 90%+ AI matched positions</p>
              </div>
              <input
                type="checkbox"
                checked={jobAlerts}
                onChange={(e) => setJobAlerts(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white">Interview Reminders</h4>
                <p className="text-[11px] text-slate-400">Reminders 1 hour before scheduled interview sessions</p>
              </div>
              <input
                type="checkbox"
                checked={interviewReminders}
                onChange={(e) => setInterviewReminders(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={handleSaveNotificationPrefs}>
                <Save className="w-4 h-4 mr-2" /> Save Preferences
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
