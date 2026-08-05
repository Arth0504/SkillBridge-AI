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
    },
    {
      feature: 'Resume Screening',
      traditional: 'Manual & Unconscious Bias',
      skillbridge: 'Automated Gemini ATS & Bias-Free',
    },
    {
      feature: 'Technical Skill Verification',
      traditional: 'Self-Reported on Resume',
      skillbridge: 'Real-Time Multi-Language Code Testing',
    },
    {
      feature: 'Interview Evaluation',
      traditional: 'Subjective Recruiter Opinion',
      skillbridge: 'AI Scoring, Transcripts & Analytics',
    },
    {
      feature: 'Candidate Experience',
      traditional: 'Ghosting & Zero Feedback',
      skillbridge: 'Instant Score Reports & Career Tips',
    },
    {
      feature: 'Assessment Automation',
      traditional: 'Manual Scheduling & Follow-ups',
      skillbridge: 'Fully Automated End-to-End Pipeline',
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            The SkillBridge AI Advantage
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans leading-[1.1]">
            Why Modern Tech Companies Switch
          </h2>
          <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 font-sans">
            Compare traditional manual recruiting workflows against our AI-automated evaluation engine.
          </p>
        </div>

        {/* Premium Table comparison layout */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="premium-table-container"
        >
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Feature Comparison</th>
                  <th>Traditional Hiring</th>
                  <th className="bg-brand-500/5 text-brand-650 dark:text-brand-450">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" /> SkillBridge AI
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-900 dark:text-white">{item.feature}</td>
                    <td className="text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500 shrink-0" /> {item.traditional}
                      </span>
                    </td>
                    <td className="font-bold text-brand-650 dark:text-brand-350 bg-brand-500/5">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {item.skillbridge}
                      </span>
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
