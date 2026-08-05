import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Building, Video, CheckCircle2, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '../../../components/common';

export const StatsSection = () => {
  const stats = [
    { label: 'Active Tech Jobs Posted', to: 50000, suffix: '+', icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Verified Tech Candidates', to: 250000, suffix: '+', icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'Enterprise Employers', to: 1200, suffix: '+', icon: Building, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'AI Interviews Evaluated', to: 500000, suffix: '+', icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Screening Match Accuracy', to: 99.4, decimals: 1, suffix: '%', icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  // Sync heartbeat trigger state every 10 seconds
  const [pulseTrigger, setPulseTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTrigger((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Global Platform Scale
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            Engineered for Massive Scale & Enterprise Accuracy
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans">
            Empowering tech talent and hiring teams with real-time data metrics across the globe.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((st, idx) => (
            <motion.div
              key={`${idx}-${pulseTrigger}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                  "0 4px 30px rgba(0, 0, 0, 0.02)",
                  "0 10px 30px rgba(99, 102, 241, 0.15)",
                  "0 4px 30px rgba(0, 0, 0, 0.02)"
                ]
              }}
              transition={{
                y: { duration: 0.5, delay: idx * 0.1 },
                scale: { duration: 0.8, ease: 'easeInOut' },
                boxShadow: { duration: 0.8, ease: 'easeInOut' }
              }}
              className="glass-card p-6 rounded-2xl text-center space-y-3 hover:scale-105 transition-transform border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-dark-card/90"
            >
              {/* Pulsing and bouncing icon wrapper */}
              <div className={`mx-auto w-12 h-12 rounded-2xl ${st.bg} ${st.color} flex items-center justify-center`}>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 12, -12, 0]
                  }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  <st.icon className="w-6 h-6" />
                </motion.div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  <AnimatedCounter to={st.to} suffix={st.suffix} decimals={st.decimals || 0} />
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
