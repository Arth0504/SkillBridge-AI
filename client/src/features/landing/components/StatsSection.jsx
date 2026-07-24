import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Building, Video, CheckCircle2, TrendingUp } from 'lucide-react';

export const StatsSection = () => {
  const stats = [
    { label: 'Active Tech Jobs Posted', value: '50,000+', icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Verified Tech Candidates', value: '250,000+', icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'Enterprise Employers', value: '1,200+', icon: Building, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'AI Interviews Evaluated', value: '500,000+', icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Screening Match Accuracy', value: '99.4%', icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Global Platform Scale
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Massive Scale & Enterprise Accuracy
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Empowering tech talent and hiring teams with real-time data metrics across the globe.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((st, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-6 rounded-3xl text-center space-y-3 hover:scale-105 transition-transform border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className={`mx-auto w-12 h-12 rounded-2xl ${st.bg} ${st.color} flex items-center justify-center`}>
                <st.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {st.value}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {st.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
