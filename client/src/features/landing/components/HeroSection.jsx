import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Users, Code2, Cpu, Laptop, FileText } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  // Mouse Parallax coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 25 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax transform bindings
  const bgX = useTransform(springX, (x) => x * -35);
  const bgY = useTransform(springY, (y) => y * -35);

  const consoleX = useTransform(springX, (x) => x * 15);
  const consoleY = useTransform(springY, (y) => y * 15);

  const card1X = useTransform(springX, (x) => x * 30);
  const card1Y = useTransform(springY, (y) => y * 30);

  const card2X = useTransform(springX, (x) => x * -20);
  const card2Y = useTransform(springY, (y) => y * -20);

  const card3X = useTransform(springX, (x) => x * 22);
  const card3Y = useTransform(springY, (y) => y * 22);

  const words = ["Find", "Your", "Dream"];
  const typingText = "with AI Powered";

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-14 md:pt-14 md:pb-18 overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-300 font-sans"
    >
      {/* Moving Ambient Glow Blobs & Noise overlay */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
      >
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/10 via-indigo-600/5 to-transparent blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -15, 15, 0],
            y: [0, 15, -15, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: 'easeInOut',
          }}
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-cyan-500/8 via-purple-500/5 to-transparent blur-[110px] rounded-full"
        />
        <div className="absolute inset-0 glass-noise opacity-[0.03] dark:opacity-[0.02] will-change-transform" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[75vh]">
          
          {/* LEFT COLUMN: Infinite loop float wrapper + Inner Mouse parallax container */}
          <div className="col-span-12 lg:col-span-6 order-2 lg:order-1 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
            {/* Soft breathing shadow center point */}
            <div className="absolute w-[240px] h-[240px] rounded-full bg-brand-500/5 dark:bg-brand-500/5 blur-[50px] pointer-events-none" />

            {/* Continuous floating + breathing rotation base */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 1, -1, 0],
                scale: [1, 1.015, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 7,
                ease: 'easeInOut'
              }}
              className="w-full max-w-[420px] aspect-square flex items-center justify-center relative"
            >
              {/* Inner Parallax layer */}
              <motion.div
                style={{ x: consoleX, y: consoleY, transformStyle: 'preserve-3d', perspective: 1000 }}
                className="w-full h-full"
              >
                <svg
                  viewBox="0 0 500 500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-[0_20px_50px_rgba(99,102,241,0.12)] dark:drop-shadow-[0_30px_70px_rgba(99,102,241,0.3)] select-none"
                >
                  {/* Isometric command deck */}
                  <path d="M80 300 L250 390 L420 300 L250 210 Z" fill="url(#baseGradient)" stroke="url(#borderGlow)" strokeWidth="2.2" />
                  <path d="M80 300 L80 318 L250 408 L250 390 Z" fill="#1A1C30" opacity="0.8" />
                  <path d="M420 300 L420 318 L250 408 L250 390 Z" fill="#0C0F1D" opacity="0.9" />

                  {/* Pulsing signal ring */}
                  <motion.ellipse
                    cx="250"
                    cy="300"
                    rx="55"
                    ry="22"
                    stroke="#4F46E5"
                    strokeWidth="1.5"
                    strokeDasharray="4 8"
                    animate={{ scale: [0.95, 1.2, 0.95], opacity: [0.3, 0.85, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  />

                  {/* Developers Laptop screen */}
                  <g transform="translate(180, 245)">
                    <path d="M0 35 L70 70 L140 35 L70 0 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <path d="M0 35 L0 40 L70 75 L70 70 Z" fill="#1E293B" />
                    <path d="M140 35 L140 40 L70 75 L70 70 Z" fill="#0F172A" />
                    <g transform="translate(70, 0)">
                      <path d="M0 0 L0 -65 L-55 -40 L-55 25 Z" fill="#475569" />
                      <path d="M-2 -2 L-2 -61 L-51 -37 L-51 21 Z" fill="#0A0F1D" stroke="#6366F1" strokeWidth="1" />
                      {/* Breathes/blinks LED face */}
                      <motion.g
                        animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
                        transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.22 }}
                      >
                        <circle cx="-32" cy="-22" r="2.5" fill="#22D3EE" />
                        <circle cx="-16" cy="-28" r="2.5" fill="#22D3EE" />
                        <path d="M-28 -14 Q-24 -11 -20 -14" stroke="#22D3EE" strokeWidth="1.2" strokeLinecap="round" />
                      </motion.g>
                    </g>
                  </g>

                  {/* Loop-flying digital snippet */}
                  <motion.g
                    animate={{ y: [0, -10, 0], opacity: [0.65, 0.95, 0.65] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <rect x="80" y="115" width="130" height="42" rx="9" fill="#0A0F1D" opacity="0.92" stroke="#334155" strokeWidth="1" />
                    <text x="94" y="132" fill="#F43F5E" fontSize="9" fontFamily="monospace">const match = true;</text>
                    <text x="94" y="146" fill="#10B981" fontSize="9" fontFamily="monospace">GeminiAI.audit();</text>
                  </motion.g>

                  {/* Core holographic orb */}
                  <motion.g
                    animate={{ y: [0, -10, 0], rotate: 360 }}
                    transition={{
                      y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
                      rotate: { repeat: Infinity, duration: 22, ease: 'linear' }
                    }}
                    transform="translate(250, 110)"
                  >
                    <circle cx="0" cy="0" r="35" fill="url(#coreGlow)" stroke="url(#borderGlow)" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="35" fill="url(#geminiSphereGlow)" />
                    <path d="M0 -18 L4.5 -5.5 L17 -5.5 L7.5 2.5 L11.5 15 L0 7.5 L-11.5 15 L-7.5 2.5 L-17 -5.5 L-4.5 -5.5 Z" fill="#FFFFFF" />
                  </motion.g>

                  {/* Light ray stream */}
                  <path d="M250 300 L210 110 L290 110 Z" fill="url(#projectorRayCone)" opacity="0.22" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="baseGradient" x1="80" y1="300" x2="420" y2="390" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0B0F19" />
                    </linearGradient>
                    <linearGradient id="borderGlow" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="50%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="coreGlow" x1="-35" y1="-35" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <radialGradient id="geminiSphereGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="projectorRayCone" x1="250" y1="300" x2="250" y2="110" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </motion.div>

            {/* Floating Card 1: ATS Score - Continuous Y oscillation + mouse parallax */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
              className="absolute top-10 left-2 sm:-left-6 pointer-events-none z-20"
            >
              <motion.div
                style={{ x: card1X, y: card1Y }}
                className="glass-card p-3 rounded-2xl flex items-center gap-3 border border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-[#0F1622]/95 shadow-xl max-w-[185px] will-change-transform pointer-events-auto"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">ATS Match Score</p>
                  <p className="text-xs font-black text-slate-850 dark:text-white truncate">Match: 98% (Pass)</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 2: Coding Evaluator - Continuous slow rotation + diagonal float */}
            <motion.div
              animate={{
                x: [0, 8, 0],
                y: [0, 10, 0],
                rotate: [-2, 2, -2]
              }}
              transition={{ repeat: Infinity, duration: 5.6, ease: 'easeInOut', delay: 0.6 }}
              className="absolute bottom-10 right-2 sm:-right-6 pointer-events-none z-20"
            >
              <motion.div
                style={{ x: card2X, y: card2Y }}
                className="glass-card p-3 rounded-2xl flex items-center gap-3 border border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-[#0F1622]/95 shadow-xl max-w-[185px] will-change-transform pointer-events-auto"
              >
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Coding Evaluator</p>
                  <p className="text-xs font-black text-slate-850 dark:text-white truncate">Compiler check: OK</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Card 3: AI Interview Match - Continuous bounce + scaling */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.03, 1]
              }}
              transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 1.2 }}
              className="absolute top-1/3 -right-2 sm:-right-8 pointer-events-none z-20"
            >
              <motion.div
                style={{ x: card3X, y: card3Y }}
                className="glass-card p-3 rounded-2xl flex items-center gap-3 border border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-[#0F1622]/95 shadow-xl max-w-[185px] will-change-transform pointer-events-auto"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">AI Screen Complete</p>
                  <p className="text-xs font-black text-slate-850 dark:text-white truncate">Comm Depth: 9.4/10</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Headline, Typing reveal, Magnetic buttons */}
          <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 space-y-6 lg:pl-6 text-left">
            {/* Shimmering Pulsing AI Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full shimmer-badge text-xs font-bold text-brand-750 dark:text-brand-300 border border-brand-500/20 shadow-sm transition-all duration-300 cursor-default"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4 text-brand-500" />
              </motion.div>
              <span>Gemini 1.5 Pro Screening Live</span>
            </motion.div>

            {/* Headline with Staggered Stems */}
            <div className="space-y-1">
              <div className="overflow-hidden flex flex-wrap gap-x-3 text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] font-sans">
                {words.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ y: 55, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.12 }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
                
                {/* Scale Fade Animated "Job" word */}
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                  className="gradient-text font-black"
                >
                  Job
                </motion.span>
              </div>

              {/* Typing character reveal for middle subtitle */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.7 } }
                }}
                className="text-2xl sm:text-3xl font-extrabold text-slate-700 dark:text-slate-200 tracking-tight font-sans"
              >
                {typingText.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 3 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Recruitment Scale Reveal with continuous gradient pulse */}
              <div className="overflow-hidden h-[50px] sm:h-[65px] lg:h-[75px] flex items-center">
                <motion.h1
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 11, delay: 1.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-sans"
                >
                  Recruitment.
                </motion.h1>
              </div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-xl"
            >
              SkillBridge AI automatically audits resumes, assesses programming expertise across languages, and conducts voice-based mock interviews to secure top-tier placements.
            </motion.p>

            {/* CTA Buttons - Continuous Soft Breathe + Hover Magnet Scaling */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 max-w-md sm:max-w-none"
            >
              {/* Primary: Get Started (Breathing pulse loop) */}
              <motion.div
                animate={{
                  scale: [1, 1.025, 1],
                  boxShadow: [
                    "0 4px 14px rgba(99, 102, 241, 0.15)",
                    "0 4px 22px rgba(99, 102, 241, 0.35)",
                    "0 4px 14px rgba(99, 102, 241, 0.15)"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut'
                }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 h-12 text-sm font-bold shadow-none hover:scale-[1.02] transition-all flex items-center justify-center group"
                  onClick={() => navigate('/auth/register')}
                >
                  Get Started 
                  {/* Arrow slides left/right continuously */}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="inline-block ml-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Button>
              </motion.div>

              {/* Secondary: Browse Jobs */}
              <motion.div
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 h-12 text-sm font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:scale-[1.02] transition-all"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
                </Button>
              </motion.div>
            </motion.div>

            {/* Platform indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/60 dark:border-slate-800/40"
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> SOC2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Users className="w-4 h-4 text-brand-500" /> Over 10k Candidates Matched
              </span>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
