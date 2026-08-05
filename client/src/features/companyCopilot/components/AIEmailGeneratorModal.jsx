import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Copy, Check, Sparkles, Send } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const AIEmailGeneratorModal = () => {
  const [emailType, setEmailType] = useState('offer');
  const [candidateName, setCandidateName] = useState('Arth Prajapati');
  const [roleName, setRoleName] = useState('Senior Full Stack Engineer');
  const [copied, setCopied] = useState(false);

  const getEmailTemplate = () => {
    if (emailType === 'offer') {
      return `Subject: Offer Letter - Senior Full Stack Engineer at TechFlow Systems\n\nDear ${candidateName},\n\nWe are delighted to extend an offer for the position of ${roleName} at TechFlow Systems! Your technical skills and interview evaluations were outstanding.\n\n• Base Compensation: $145,000 / year\n• Stock Grant: 0.25% Equity\n• Start Date: September 1, 2026\n\nPlease review and confirm acceptance by signing below.\n\nBest regards,\nTechFlow Talent Team`;
    }
    if (emailType === 'invite') {
      return `Subject: Interview Invitation: ${roleName} at TechFlow Systems\n\nDear ${candidateName},\n\nThank you for applying for the ${roleName} role. We were very impressed by your profile and would like to invite you for a 45-minute technical interview.\n\nPlease pick a convenient time slot using our scheduling link: https://skillbridge.ai/company/interviews/schedule\n\nBest regards,\nTechFlow Recruiting Team`;
    }
    return `Subject: Application Update: ${roleName}\n\nDear ${candidateName},\n\nThank you for your time and interest in TechFlow Systems. While your background is impressive, we have decided to move forward with another candidate whose experience matches our immediate requirements.\n\nWe will keep your profile in our talent network for future opportunities.\n\nBest regards,\nTechFlow HR Team`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmailTemplate());
    setCopied(true);
    toast.success('Copied email template to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Recruiter Document & Email Drafter</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEmailType('invite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              emailType === 'invite' ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Invite
          </button>
          <button
            onClick={() => setEmailType('offer')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              emailType === 'offer' ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Offer Letter
          </button>
          <button
            onClick={() => setEmailType('reject')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              emailType === 'reject' ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Rejection
          </button>
        </div>
      </div>

      <div className="relative group">
        <textarea
          rows={8}
          readOnly
          className="w-full p-4 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none custom-scrollbar leading-relaxed"
          value={getEmailTemplate()}
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[11px]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Email'}</span>
        </button>
      </div>
    </div>
  );
};
