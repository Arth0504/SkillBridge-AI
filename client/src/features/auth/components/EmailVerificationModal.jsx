import React, { useState } from 'react';
import { Mail, CheckCircle2, RefreshCw, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal, Button, Badge } from '../../../components/common';
import { authApi } from '../../../api/authApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export const EmailVerificationModal = ({ isOpen, onClose, user, onVerified }) => {
  const { refreshUser, updateUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!user) return null;

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await authApi.resendCandidateVerification(user.email);
      toast.success(`Verification link sent to ${user.email}! Please check your inbox.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const freshUser = await refreshUser();

      if (freshUser?.isEmailVerified) {
        toast.success('Email verified successfully! Opening application form...');
        onClose();
        if (onVerified) onVerified();
      } else {
        toast.error('Email not verified yet. Please check your inbox link or resend.');
      }
    } catch (err) {
      toast.error('Could not refresh verification status.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Verification Required" maxWidth="max-w-md">
      <div className="space-y-6 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto border border-brand-500/20">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Verify Your Email to Apply
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            To ensure employer trust and prevent spam applications, SkillBridge AI requires candidates to verify their work email address.
          </p>
        </div>

        {/* Current Email Display Card */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Work Email</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{user.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            className="w-full justify-center py-3 text-sm"
            isLoading={checking}
            onClick={handleCheckStatus}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> I've Verified My Email / Refresh Status
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center py-2.5 text-xs font-semibold"
            isLoading={resending}
            onClick={handleResendEmail}
          >
            <Send className="w-4 h-4 mr-2" /> Resend Verification Email
          </Button>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Need assistance? Check your spam folder or contact support@skillbridge.ai
        </p>
      </div>
    </Modal>
  );
};
