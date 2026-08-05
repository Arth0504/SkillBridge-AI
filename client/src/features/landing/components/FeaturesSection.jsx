import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Code2, Video, BarChart3, LayoutDashboard, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      {/* Background soft blur nodes */}
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/3 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/3 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Next-Gen Tech Talent Suite
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans leading-[1.1]">
            Experience the Future of Technical Hiring
          </h2>
          <p className="text-sm sm:text-base text-slate-650 dark:text-slate-400 font-sans">
            Every tool you need to source, assess, interview, and verify top engineering candidates at warp speed.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: ATS Resume Audit - Large Card (col-span-2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col lg:flex-row gap-8 justify-between hover:shadow-2xl transition-all duration-300 relative group overflow-hidden"
          >
            <div className="space-y-4 max-w-sm flex-1">
              <Badge variant="purple">AI Analysis</Badge>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                ATS Resume AI Auditor
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                Our parsing model checks layouts, keyword density, and bullet impact metrics optimized for corporate tracking systems.
              </p>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Structure Compatibility Check</p>
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keyword & Tech Density Matrix</p>
              </div>
            </div>

            {/* Interactive ATS scoring preview panel */}
            <div className="w-full lg:w-[240px] p-5 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-xl flex flex-col justify-center">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-slate-400">candidate_report.yaml</span>
                <span className="text-[10px] font-bold text-emerald-400">Scanned OK</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span>ATS Score:</span>
                  <span className="text-emerald-400 font-bold">98/100</span>
                </div>
                {/* Looping progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: ["0%", "98%", "98%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeOut', repeatDelay: 1.5 }}
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full w-[98%]"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-mono italic">"Matches: React, Node.js, Go"</p>
            </div>
          </motion.div>

          {/* Card 2: AI Mock Interviews - Medium Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Mock Voice Interviews
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
                Tailored technical Q&As with dynamic speech synthesis. Animate candidate responses with instant grading reports.
              </p>
            </div>

            {/* Continuous looping audio waveforms */}
            <div className="flex justify-center items-end gap-1 h-10 mt-6 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 32, 8] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + (i * 0.1),
                    ease: 'easeInOut'
                  }}
                  className="w-1 bg-brand-500 dark:bg-brand-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Card 3: Multi-Language Coding Lab - Medium Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Technical Sandbox
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
                Full-featured online IDE executing custom coding tests across Python, JS, C++, Go, and Java with algorithm checks.
              </p>
            </div>

            {/* Live editor mock screen */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950 font-mono text-[9px] text-slate-300 border border-slate-850 shadow-inner">
              <p className="text-purple-400">def calculate_match(score):</p>
              <p className="text-indigo-400 pl-3">if score &gt; 95:</p>
              <p className="text-emerald-400 pl-6">return "Hire"</p>
              <p className="text-slate-500 pl-3"># pass test cases</p>
            </div>
          </motion.div>

          {/* Card 4: Video Screening Room - Large Card (col-span-2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col lg:flex-row gap-8 justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4 max-w-sm flex-1">
              <Badge variant="purple">AI Video Screening</Badge>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                Asynchronous Screening Rooms
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                Record responses on camera. Gemini generates transcriptions, detects tone metrics, and extracts semantic clarity markers automatically.
              </p>
              <div className="flex gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> AI Speech-to-Text</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Semantic Verification</span>
              </div>
            </div>

            {/* Video preview simulation dashboard */}
            <div className="w-full lg:w-[240px] aspect-video rounded-xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between p-3">
              <div className="flex items-center justify-between z-10">
                <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">REC</span>
                <span className="text-[8px] text-slate-300">00:42</span>
              </div>
              {/* Dynamic face mesh indicator circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-16 h-16 rounded-full border border-cyan-400"
                />
              </div>
              <div className="z-10 text-[8px] text-emerald-400 font-mono bg-slate-950/80 p-1.5 rounded-lg">
                "Transcribing response: 'I optimized Node queries...'"
              </div>
            </div>
          </motion.div>

          {/* Card 5: Real-Time Analytics - Small Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Recruitment Analytics
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
                Real-time pipelines dashboards indicating candidates throughput, skills scores, and team action conversions.
              </p>
            </div>

            {/* Continuously scaling chart bars */}
            <div className="flex justify-between items-end gap-3 h-14 mt-6">
              {[60, 100, 75, 45, 90].map((val, idx) => (
                <div key={idx} className="flex-1 bg-slate-200 dark:bg-slate-800 h-full rounded-md relative overflow-hidden">
                  <motion.div
                    animate={{ height: [`0%`, `${val}%`, `${val}%`] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeOut', delay: idx * 0.15 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-brand-500 to-indigo-500 rounded-md"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 6: Unified Hub - Small Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card p-8 border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-dark-card/80 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Integrated Dashboards
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
                Synchronized telemetry views linking candidate settings with company evaluation queues.
              </p>
            </div>

            {/* Glass telemetry match card */}
            <div className="mt-6 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 text-center flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4 text-brand-500 animate-spin-slow" />
              <span className="text-[10px] font-bold text-brand-650 dark:text-brand-300 font-sans uppercase">Hiring Pipeline Verified</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
