import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, MessageSquare, Code2, Video, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const AIShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('resume');
  const navigate = useNavigate();

  const tabs = [
    { id: 'resume', label: 'ATS Resume AI', icon: FileText, desc: 'Instant structure checking, keyword density analyzer, and layout auditor.' },
    { id: 'interview', label: 'AI Mock Interview', icon: MessageSquare, desc: 'Speech-synthesized technical mock Q&A with live communication scores.' },
    { id: 'coding', label: 'Coding Assessment', icon: Code2, desc: 'Online sandbox executing algorithm checks across JS, Python, Go, and C++.' },
    { id: 'video', label: 'Video Screening', icon: Video, desc: 'Record camera responses with speech transcript analysis and confidence metrics.' },
  ];

  return (
    <section id="ai-showcase" className="py-24 bg-[#0A0F1D] text-white relative overflow-hidden">
      {/* Animated futuristic background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.06]" />
      
      {/* Rotating radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 to-brand-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Powered by Gemini AI Engine
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-sans leading-[1.1]">
            Multi-Modal AI Screening Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-sans">
            Explore how our integrated neural models evaluate candidates with corporate accuracy.
          </p>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Tabs selector and description details */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-slate-900/90 border-brand-500/40 shadow-xl shadow-brand-500/5 text-white'
                        : 'bg-slate-900/30 border-slate-800/40 text-slate-400 hover:bg-slate-900/50 hover:text-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800/40 text-slate-500'}`}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-sans">{tab.label}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-start">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/25"
                onClick={() => navigate('/auth/register')}
              >
                Launch Sandbox Screen <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* RIGHT: High-fidelity animated AI Brain Connection Grid */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[380px] sm:min-h-[440px]">
            {/* Soft inner glow */}
            <div className="absolute w-[220px] h-[220px] rounded-full bg-brand-500/10 blur-[60px]" />

            {/* AI brain core + pulsing connection nodes */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 0.5, -0.5, 0]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-full max-w-[420px] aspect-square flex items-center justify-center relative"
            >
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_20px_40px_rgba(168,85,247,0.2)] select-none"
              >
                {/* Node Connecting lines */}
                {/* Center -> Top Left */}
                <motion.line x1="200" y1="200" x2="100" y2="100" stroke="url(#nodeLineGrad)" strokeWidth="1.5" strokeDasharray="5 10" animate={{ strokeDashoffset: [-30, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} />
                {/* Center -> Top Right */}
                <motion.line x1="200" y1="200" x2="300" y2="100" stroke="url(#nodeLineGrad)" strokeWidth="1.5" strokeDasharray="5 10" animate={{ strokeDashoffset: [0, 30] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }} />
                {/* Center -> Bottom Left */}
                <motion.line x1="200" y1="200" x2="100" y2="300" stroke="url(#nodeLineGrad)" strokeWidth="1.5" strokeDasharray="5 10" animate={{ strokeDashoffset: [-30, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }} />
                {/* Center -> Bottom Right */}
                <motion.line x1="200" y1="200" x2="300" y2="300" stroke="url(#nodeLineGrad)" strokeWidth="1.5" strokeDasharray="5 10" animate={{ strokeDashoffset: [0, 30] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }} />

                {/* Outer Connection Ring */}
                <motion.circle cx="200" cy="200" r="142" stroke="url(#brainOuterRing)" strokeWidth="1.5" strokeDasharray="4 8" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 25, ease: 'linear' }} />

                {/* Center Core Brain node (Gemini AI Core) */}
                <circle cx="200" cy="200" r="28" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2" />
                <motion.circle
                  cx="200"
                  cy="200"
                  r="24"
                  fill="url(#brainCoreGradient)"
                  animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
                {/* Core Sparkle */}
                <path d="M200 192 L202 198 L208 198 L203 201 L205 207 L200 203 L195 207 L197 201 L192 198 L198 198 Z" fill="#FFFFFF" />

                {/* Satellite Node 1 - Resume Parsing (Top Left) */}
                <g transform="translate(100, 100)">
                  <circle cx="0" cy="0" r="18" fill="#0A0F1D" stroke="#06B6D4" strokeWidth="1.5" />
                  <motion.circle cx="0" cy="0" r="14" fill="#06B6D4" opacity="0.15" animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} />
                  <circle cx="0" cy="0" r="14" fill="url(#sat1)" />
                  <path d="M-4 -5 L2 -5 L5 -2 L5 5 L-4 5 Z M-2 -2 L2 -2 M-2 1 L2 1" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Satellite Node 2 - Voice Q&A (Top Right) */}
                <g transform="translate(300, 100)">
                  <circle cx="0" cy="0" r="18" fill="#0A0F1D" stroke="#A855F7" strokeWidth="1.5" />
                  <motion.circle cx="0" cy="0" r="14" fill="#A855F7" opacity="0.15" animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }} />
                  <circle cx="0" cy="0" r="14" fill="url(#sat2)" />
                  <path d="M-4 -1 Q0 -5 4 -1 L4 3 L-4 3 Z M0 3 L0 6" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Satellite Node 3 - Code Sandbox (Bottom Left) */}
                <g transform="translate(100, 300)">
                  <circle cx="0" cy="0" r="18" fill="#0A0F1D" stroke="#6366F1" strokeWidth="1.5" />
                  <motion.circle cx="0" cy="0" r="14" fill="#6366F1" opacity="0.15" animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 1 }} />
                  <circle cx="0" cy="0" r="14" fill="url(#sat3)" />
                  <path d="M-4 -2 L-1 1 L-4 4 M4 -2 L1 1 L4 4" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Satellite Node 4 - Video Screen (Bottom Right) */}
                <g transform="translate(300, 300)">
                  <circle cx="0" cy="0" r="18" fill="#0A0F1D" stroke="#10B981" strokeWidth="1.5" />
                  <motion.circle cx="0" cy="0" r="14" fill="#10B981" opacity="0.15" animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.5 }} />
                  <circle cx="0" cy="0" r="14" fill="url(#sat4)" />
                  <path d="M-4 -3 L2 -3 L2 3 L-4 3 Z M2 -1 L5 -3 L5 3 L2 1 Z" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="nodeLineGrad" x1="100" y1="100" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <linearGradient id="brainOuterRing" x1="58" y1="58" x2="342" y2="342" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="brainCoreGradient" x1="176" y1="176" x2="224" y2="224" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                  <linearGradient id="sat1" x1="-14" y1="-14" x2="14" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#0891B2" /></linearGradient>
                  <linearGradient id="sat2" x1="-14" y1="-14" x2="14" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#A855F7" /><stop offset="100%" stopColor="#9333EA" /></linearGradient>
                  <linearGradient id="sat3" x1="-14" y1="-14" x2="14" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#4F46E5" /></linearGradient>
                  <linearGradient id="sat4" x1="-14" y1="-14" x2="14" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

        </div>
        
      </div>
    </section>
  );
};
