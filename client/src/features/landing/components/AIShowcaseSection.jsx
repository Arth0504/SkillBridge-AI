import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, MessageSquare, Code2, Video, CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const AIShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('resume');
  const navigate = useNavigate();

  const tabs = [
    { id: 'resume', label: 'ATS Resume AI', icon: FileText },
    { id: 'interview', label: 'AI Mock Interview', icon: MessageSquare },
    { id: 'coding', label: 'Coding Assessment', icon: Code2 },
    { id: 'video', label: 'Video Screening', icon: Video },
  ];

  return (
    <section id="ai-showcase" className="py-24 bg-slate-100/50 dark:bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Powered by Gemini AI Engine
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore the Interactive AI Evaluation Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            See how our multi-modal AI models audit candidates with human-level accuracy.
          </p>

          {/* Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl glass-panel w-fit mx-auto mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Preview Display */}
        <AnimatePresence mode="wait">
          {activeTab === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="space-y-5">
                <Badge variant="purple">Automated Resume Audit</Badge>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Get Instant ATS Scores & Recruiter Match Audits
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload your CV in PDF/DOCX format. Gemini AI inspects section layout, technical keyword density, impact metrics, and provides actionable recommendations.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ATS Compatibility Score (0 - 100%)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Role Keyword Alignment vs Job Specification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bullet Point Action Verbs & Quantified Metrics Analysis
                  </li>
                </ul>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Test Your Resume Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 font-sans border border-slate-800 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400">resume_audit_report.json</span>
                  <Badge variant="success">94/100 ATS Score</Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-emerald-400 font-mono">✓ High density: React 18, Node.js, Python, PostgreSQL</p>
                  <p className="text-emerald-400 font-mono">✓ Strong impact metric verbs: 'Engineered', 'Optimized'</p>
                  <p className="text-amber-400 font-mono">! Suggestion: Add Kubernetes & Docker deployments</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="space-y-5">
                <Badge variant="purple">AI Voice & Text Interview</Badge>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Practice Realistic Technical Mock Interviews
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Engage in dynamic, conversational technical interview sessions tailored to your exact target position (Full Stack, Backend, AI/ML, System Architecture).
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Adaptive follow-up questions based on your responses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant scoring breakdown & missing detail suggestions
                  </li>
                </ul>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Start Mock Interview <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-2xl">
                <div className="p-3 rounded-xl bg-brand-500/20 text-brand-300 text-xs border border-brand-500/30">
                  <p className="font-bold">AI Interviewer:</p>
                  <p className="mt-1">"How do you handle state normalization in complex React application trees?"</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 text-xs border border-slate-700 text-slate-200">
                  <p className="font-bold text-slate-400">Candidate Response:</p>
                  <p className="mt-1">"I use Redux Toolkit or Zustand with normalized entity adapters to avoid redundant object trees..."</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="space-y-5">
                <Badge variant="purple">Multi-Language IDE</Badge>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Automated Multi-Language Coding Challenges
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Solve algorithms, data structure problems, and real-world microservice tasks with automated unit testing and Big-O runtime analysis.
                </p>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Try Coding Test Lab <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 text-white font-mono text-xs border border-slate-800 shadow-2xl space-y-3">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                  <span>solution.py</span>
                  <span className="text-emerald-400">All 5 Unit Tests Passed</span>
                </div>
                <pre className="text-brand-300 overflow-x-auto">
{`def is_balanced_tree(root):
    def check(node):
        if not node: return 0
        l, r = check(node.left), check(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return max(l, r) + 1
    return check(root) != -1`}
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="space-y-5">
                <Badge variant="purple">Asynchronous Video Screening</Badge>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  Screen Video Pitch & Communication Skills
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Candidates record short video responses to key behavioral and technical prompts. Gemini transcribes and evaluates clarity, confidence, and subject matter accuracy.
                </p>
                <Button variant="primary" onClick={() => navigate('/auth/register')}>
                  Explore Video AI <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center animate-pulse">
                    <Video className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-mono text-slate-400">Webcam Feed Active • HD 1080p</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
