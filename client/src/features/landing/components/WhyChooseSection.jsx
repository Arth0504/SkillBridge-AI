import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const WhyChooseSection = () => {
  const comparison = [
    {
      feature: 'Average Time-to-Hire',
      traditional: '42 Days',
      skillbridge: '4 Days (10x Faster)',
      highlight: true,
    },
    {
      feature: 'Resume Screening',
      traditional: 'Manual & Unconscious Bias',
      skillbridge: 'Automated Gemini ATS & Bias-Free',
      highlight: true,
    },
    {
      feature: 'Technical Skill Verification',
      traditional: 'Self-Reported on Resume',
      skillbridge: 'Real-Time Multi-Language Code Testing',
      highlight: true,
    },
    {
      feature: 'Interview Evaluation',
      traditional: 'Subjective Recruiter Opinion',
      skillbridge: 'AI Scoring, Transcripts & Analytics',
      highlight: true,
    },
    {
      feature: 'Candidate Experience',
      traditional: 'Ghosting & Zero Feedback',
      skillbridge: 'Instant Score Reports & Career Tips',
      highlight: true,
    },
    {
      feature: 'Assessment Automation',
      traditional: 'Manual Scheduling & Follow-ups',
      skillbridge: 'Fully Automated End-to-End Pipeline',
      highlight: true,
    },
  ];

  return (
    <section className="py-24 bg-slate-100/50 dark:bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            The SkillBridge AI Advantage
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Modern Tech Companies Switch to SkillBridge AI
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Compare traditional manual recruiting workflows against our AI-automated evaluation engine.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200/60 dark:bg-slate-800/80 text-xs sm:text-sm font-bold uppercase tracking-wider border-b border-slate-300 dark:border-slate-700">
                  <th className="p-4 sm:p-6 text-slate-700 dark:text-slate-300">Feature Comparison</th>
                  <th className="p-4 sm:p-6 text-slate-500 dark:text-slate-400">Traditional Hiring</th>
                  <th className="p-4 sm:p-6 text-brand-600 dark:text-brand-400 bg-brand-500/10">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-500" /> SkillBridge AI
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {comparison.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 sm:p-6 font-bold text-slate-900 dark:text-white">{item.feature}</td>
                    <td className="p-4 sm:p-6 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <X className="w-4 h-4 text-rose-500 shrink-0" /> {item.traditional}
                    </td>
                    <td className="p-4 sm:p-6 font-bold text-brand-600 dark:text-brand-300 bg-brand-500/5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {item.skillbridge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
