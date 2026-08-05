import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button, Badge } from '../../../components/common';
import { authApi } from '../../../api/authApi';
import { useAuth } from '../../../context/AuthContext';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'candidate';
  const navigate = useNavigate();
  const { updateUser, refreshUser } = useAuth();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('No verification token provided in URL.');
        }
        return;
      }

      try {
        const res = await authApi.verifyEmailCandidate(token);
        if (isMounted) {
          setStatus('success');
          if (res.data?.user) {
            updateUser(res.data.user);
          } else {
            await refreshUser();
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
        }
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6 border border-slate-200/60 dark:border-slate-800/40 shadow-xl"
      >
        {status === 'loading' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifying Your Email Address...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please wait while we confirm your security credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="success" size="lg">Verification Successful</Badge>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Email Address Verified!</h2>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                Your email address has been verified. You can now submit job applications without restriction.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center py-3 font-semibold h-11"
              onClick={() => navigate(type === 'company' ? '/company/dashboard' : '/jobs')}
            >
              Continue to {type === 'company' ? 'Company Dashboard' : 'Explore Jobs'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="danger" size="lg">Verification Failed</Badge>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Invalid or Expired Link</h2>
              <p className="text-xs text-slate-650 dark:text-slate-400">{errorMessage}</p>
            </div>
            <Button
              variant="primary"
              className="w-full justify-center py-3 font-semibold h-11"
              onClick={() => navigate('/auth/login')}
            >
              Return to Login
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

