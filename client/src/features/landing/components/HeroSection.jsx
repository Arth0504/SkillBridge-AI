import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, ArrowRight, CheckCircle2, Star, ShieldCheck, ChevronDown, Zap, Code2, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/30 via-accent-purple/20 to-accent-cyan/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent-cyan/15 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            <span>Next-Gen Enterprise Talent & Assessment Engine</span>
            <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Gemini 1.5 Pro
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]"
          >
            Hire Top Technical Talent 10x Faster with{' '}
            <span className="gradient-text">Gemini AI</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Automated ATS resume auditing, multi-language coding evaluations, AI mock interviews, and asynchronous video screening built for modern engineering teams.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-xl shadow-brand-500/30 hover:scale-105 transition-transform"
              onClick={() => navigate('/auth/register')}
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-4 text-base font-semibold backdrop-blur-md"
              onClick={() => setDemoModalOpen(true)}
            >
              <Play className="w-4 h-4 mr-2 text-brand-500 fill-current" /> Watch Demo (2 min)
            </Button>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-4"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-Day Free Employer Trial
            </span>
          </motion.div>
        </div>

        {/* Dashboard Interactive Mock Preview with Floating Glass Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          {/* Main Dashboard Canvas Container */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl bg-slate-900/90 text-white relative">
            {/* Top Bar Mock */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 ml-2 font-mono">app.skillbridge.ai/dashboard</span>
              </div>
              <Badge variant="purple" icon={Sparkles}>AI Screening Active</Badge>
            </div>

            {/* Dashboard Content Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>ATS Resume Score</span>
                  <span className="text-emerald-400 font-bold">96/100</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-brand-500 h-full w-[96%]" />
                </div>
                <p className="text-[11px] text-slate-300">Target Role: Senior Full Stack AI Engineer</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>AI Coding Test Pass</span>
                  <span className="text-brand-400 font-bold">5/5 Passed</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-purple-500 h-full w-[100%]" />
                </div>
                <p className="text-[11px] text-slate-300">Runtime: 38ms | Algorithm Complexity: O(N log N)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Video Screening Score</span>
                  <span className="text-cyan-400 font-bold">94/100</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full w-[94%]" />
                </div>
                <p className="text-[11px] text-slate-300">Communication & Technical Depth Verified</p>
              </div>
            </div>
          </div>

          {/* Floating Card 1 - Top Left */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="hidden lg:flex items-center gap-3 absolute -top-8 -left-12 glass-card p-4 rounded-2xl border border-brand-500/30 shadow-xl bg-slate-900/90 text-white z-20"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Candidate Matched</p>
              <p className="text-[10px] text-slate-400">Match score: 98% in 1.2s</p>
            </div>
          </motion.div>

          {/* Floating Card 2 - Bottom Right */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="hidden lg:flex items-center gap-3 absolute -bottom-8 -right-12 glass-card p-4 rounded-2xl border border-purple-500/30 shadow-xl bg-slate-900/90 text-white z-20"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Coding Test Complete</p>
              <p className="text-[10px] text-slate-400">Passed JS & Python suites</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="flex justify-center pt-12">
          <a href="#trusted-companies" className="text-slate-400 hover:text-brand-500 transition-colors animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Watch Demo Modal */}
      <Modal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} title="SkillBridge AI - Platform Walkthrough">
        <div className="space-y-4 text-center">
          <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-brand-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-500/50">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-xs font-mono text-slate-400">Interactive Demo Player (2:15)</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See how SkillBridge AI evaluates candidates with Gemini AI resume matching, interactive coding assessments, and automated video screening.
          </p>
        </div>
      </Modal>
    </section>
  );
};
