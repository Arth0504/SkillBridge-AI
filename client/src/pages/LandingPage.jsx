import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Hero Accent Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-600/20 via-accent-purple/20 to-accent-cyan/20 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-semibold text-brand-600 dark:text-brand-400 mb-6">
          <Sparkles className="w-4 h-4" /> Next-Gen AI Talent Marketplace & Assessment Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Hire Top Global Talent & Ace Interviews with <span className="gradient-text">Gemini AI</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          Automated ATS resume parsing, AI mock technical interviews, multi-language coding assessments, and asynchronous video evaluations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Job Marketplace
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500 w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Resume Analyzer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Instant ATS score auditing, job description keyword matching, and recruiter feedback powered by Gemini 1.5 Pro.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Coding Assessment</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evaluate coding challenges across Python, JS, Java, C++, and SQL with dynamic complexity analysis.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Account lockout protection, refresh token rotation, audit logging, and role-enforced access security.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
