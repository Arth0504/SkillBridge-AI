import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Quote, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';

export const TestimonialsSection = () => {
  const reviews = [
    {
      name: 'David Chen',
      role: 'VP of Engineering, CloudScale',
      type: 'Recruiter',
      avatar: 'David Chen',
      rating: 5,
      comment:
        'SkillBridge AI cut our engineering hiring cycle from 5 weeks down to just 3 days. The automated AI coding evaluation and video screening filtered out non-qualifying candidates instantly.',
    },
    {
      name: 'Elena Rostova',
      role: 'Senior AI Engineer',
      type: 'Candidate',
      avatar: 'Elena Rostova',
      rating: 5,
      comment:
        'The ATS resume score breakdown and AI mock interview practice gave me total confidence. I received 3 enterprise job offers within two weeks of creating my candidate profile!',
    },
    {
      name: 'Marcus Vance',
      role: 'Head of Talent Acquisition, TechCorp',
      type: 'Recruiter',
      avatar: 'Marcus Vance',
      rating: 5,
      comment:
        'The Gemini AI scoring precision is unbelievable. Every candidate that passes SkillBridge coding tests demonstrates top 5% technical capability in actual production environments.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            User Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by Developers & Engineering Hiring Leaders
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Real feedback from software engineers and talent executives using SkillBridge AI every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="glass-card p-8 rounded-3xl space-y-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:scale-105 transition-transform relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Badge variant={rev.type === 'Recruiter' ? 'purple' : 'success'}>
                    {rev.type}
                  </Badge>
                </div>

                <Quote className="w-8 h-8 text-brand-500/20" />

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <Avatar name={rev.name} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
