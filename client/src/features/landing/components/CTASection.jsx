import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      {/* Glow Orbs behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-16 overflow-hidden bg-slate-950 border border-slate-800 text-white shadow-2xl text-center space-y-8"
        >
          {/* Animated Background Mesh Inside Card */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.45, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: 10,
              ease: 'easeInOut'
            }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 blur-[110px] rounded-full pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 0.92, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: 'easeInOut',
              delay: 2
            }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 blur-[110px] rounded-full pointer-events-none"
          />

          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shimmer-badge text-xs font-bold uppercase tracking-wider text-brand-300 border border-brand-500/20">
              <Sparkles className="w-4 h-4 text-brand-400" /> Transform Hiring Today
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] font-sans">
              Deploy Intelligent Technical Screening Instantly
            </h2>

            <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
              Join thousands of software builders and hiring leads leveraging our multi-modal assessment engine.
            </p>
          </div>

          {/* Magnetic CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2 max-w-sm sm:max-w-none mx-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-sm font-bold bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-brand-500/25 hover:scale-[1.03] transition-all flex items-center justify-center"
              onClick={() => navigate('/auth/register')}
            >
              Get Started For Free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-sm font-semibold border-slate-800 text-white hover:bg-slate-900/60"
              onClick={() => navigate('/jobs')}
            >
              Explore Jobs Marketplace
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] sm:text-xs text-slate-500 font-semibold relative z-10 pt-2 border-t border-slate-900 max-w-xl mx-auto">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Instant Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> No Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> 14-Day Free Trial</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
