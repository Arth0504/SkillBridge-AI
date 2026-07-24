import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  Code2,
  Video,
  BarChart3,
  Bell,
  LayoutDashboard,
  Building2,
  UserCheck,
  ShieldAlert,
  Lock,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export const FeaturesSection = () => {
  const features = [
    {
      title: 'ATS Resume AI Audit',
      desc: 'Instant parser checking layout, keyword density, and bullet impact scores optimized for recruiter ATS software.',
      icon: FileText,
      tag: 'AI Parsing',
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
    {
      title: 'AI Mock Technical Interviews',
      desc: 'Dynamic voice & text technical Q&A tailored to specific target roles with real-time answer suggestions.',
      icon: MessageSquare,
      tag: 'Voice & Text',
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    {
      title: 'Multi-Language Coding Lab',
      desc: 'Online IDE running test suites across Python, JavaScript, Go, C++, and Java with Big-O time complexity analysis.',
      icon: Code2,
      tag: 'Automated Testing',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Asynchronous Video Screening',
      desc: 'Record webcam candidate responses with automated voice-to-text transcript analysis and confidence scoring.',
      icon: Video,
      tag: 'Video AI',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Real-Time Recruitment Analytics',
      desc: 'High-level insights into candidate pipelines, conversion rates, time-to-hire, and skills breakdown.',
      icon: BarChart3,
      tag: 'Analytics',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Smart Push Notifications',
      desc: 'Instant notifications on interview invitations, candidate submissions, status changes, and platform alerts.',
      icon: Bell,
      tag: 'Real-Time',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Unified Employer Dashboard',
      desc: 'Manage active job postings, application pools, candidate ratings, and interview schedules in one hub.',
      icon: LayoutDashboard,
      tag: 'Employer Suite',
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
    {
      title: 'Enterprise Company Portal',
      desc: 'Custom corporate branding, team member invitation, department management, and bulk candidate export.',
      icon: Building2,
      tag: 'Enterprise',
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    {
      title: 'Verified Candidate Portal',
      desc: 'Personalized career dashboard with saved jobs, application status tracker, and AI skill verification badges.',
      icon: UserCheck,
      tag: 'Candidate Hub',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Granular Role Management',
      desc: 'Strict role-based access control (RBAC) supporting Candidate, Company Admin, and System Controller roles.',
      icon: ShieldAlert,
      tag: 'Security',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Enterprise Security & Audit',
      desc: 'Automatic refresh token rotation, Redis session storage, Prometheus metrics, and full audit logging.',
      icon: Lock,
      tag: 'Compliance',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Gemini AI Automation Pipeline',
      desc: 'Decoupled Python AI microservice processing large language model prompt evaluations with zero latency.',
      icon: Cpu,
      tag: 'Gemini 1.5',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-100/50 dark:bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="purple" icon={Sparkles}>
            Complete Technical Hiring Suite
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            12 Enterprise Capabilities Built for Next-Gen Tech Teams
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From automated resume scoring to live AI mock evaluations, everything you need to screen and hire top engineering talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-card p-8 rounded-3xl space-y-4 hover:-translate-y-1.5 transition-all border border-slate-200/80 dark:border-slate-800/80 group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${feat.bg} ${feat.color} group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" size="sm">
                  {feat.tag}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                {feat.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
