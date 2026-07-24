import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-8 sm:p-16 overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-accent-purple text-white shadow-2xl text-center space-y-8"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-cyan/20 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/30">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Ready to Transform Technical Hiring?
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Hiring Top Tech Talent & Acing AI Interviews Today
            </h2>

            <p className="text-sm sm:text-lg text-white/90 max-w-2xl mx-auto font-medium">
              Join 250,000+ candidates and 1,200+ enterprise employers leveraging SkillBridge AI automated screening.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-white text-brand-600 hover:bg-slate-100 shadow-xl hover:scale-105 transition-transform"
              onClick={() => navigate('/auth/register')}
            >
              Get Started For Free <ArrowRight className="w-5 h-5 ml-2 text-brand-600" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold border-white/40 text-white hover:bg-white/10"
              onClick={() => navigate('/jobs')}
            >
              Explore Jobs Marketplace
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-medium relative z-10 pt-2">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> Instant Account Setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> No Credit Card Required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-300" /> Cancel Anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
