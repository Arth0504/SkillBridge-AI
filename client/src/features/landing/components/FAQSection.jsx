import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'How does Gemini AI evaluate candidate resumes?',
      a: 'Our AI microservice parses PDF/DOCX resumes, extracting work history, skill keywords, and bullet point metrics. It cross-references your profile against target job specs to output an objective ATS compatibility score (0-100%).',
    },
    {
      q: 'What programming languages are supported in the AI Coding Assessment?',
      a: 'SkillBridge AI supports Python 3, JavaScript (Node.js), Go, Java, C++, and SQL with automated unit test suites and runtime execution benchmarks.',
    },
    {
      q: 'Is candidate data protected and GDPR/SOC2 compliant?',
      a: 'Yes. All data transmission uses TLS 1.3 encryption, sessions are secured via HTTP-only JWT refresh tokens, and candidate profiles are stored in isolated encrypted databases adhering to strict SOC2 Type II standards.',
    },
    {
      q: 'Can employers set up custom technical questions & video prompts?',
      a: 'Absolutely. Employer dashboards allow hiring managers to input custom job requirements, define technical evaluation rubrics, and configure video screening questions.',
    },
    {
      q: 'Is SkillBridge AI free for software engineers and candidates?',
      a: 'Yes! Job seekers can register a candidate account 100% free, browse top AI roles, receive ATS resume feedback, and practice technical mock interviews.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-50 dark:bg-[#0B0F19] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={HelpCircle}>
            Got Questions?
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Everything you need to know about SkillBridge AI candidate screening and platform security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-brand-500/10 text-brand-500' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
