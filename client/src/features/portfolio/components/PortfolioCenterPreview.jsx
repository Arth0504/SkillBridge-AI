import React from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Tablet,
  Smartphone,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Calendar,
  Briefcase,
  BookOpen,
  Award,
  Star,
  GitFork,
  Send,
  Sparkles,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge } from '../../../components/common';

export const PortfolioCenterPreview = ({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  socialLinks,
  template,
  themeColor,
  customAccentColor,
  fontFamily,
  enableAnimations,
  deviceFrame,
  setDeviceFrame,
  pinnedRepos,
  selectedSection,
  setSelectedSection,
  onDownloadResume,
  onScheduleInterview
}) => {
  const primaryAccent = customAccentColor || {
    indigo: '#6366f1',
    emerald: '#10b981',
    cyan: '#06b6d4',
    purple: '#a855f7',
    amber: '#f59e0b',
  }[themeColor] || '#6366f1';

  // Animation wrapper
  const MotionCard = enableAnimations ? motion.div : 'div';

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Device View Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between no-print z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Device Frame View:</span>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setDeviceFrame('desktop')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold ${deviceFrame === 'desktop' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDeviceFrame('tablet')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold ${deviceFrame === 'tablet' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
            </button>
            <button
              onClick={() => setDeviceFrame('mobile')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold ${deviceFrame === 'mobile' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            ● Live Portfolio Preview Mode
          </span>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start custom-scrollbar">
        <div className={`portfolio-canvas template-${template} device-frame-${deviceFrame} transition-all duration-300`}>
          
          {/* HERO BANNER SECTION */}
          <section
            onClick={() => setSelectedSection('hero')}
            className={`p-8 md:p-12 border-b cursor-pointer relative overflow-hidden transition-all ${
              selectedSection === 'hero' ? 'ring-2 ring-brand-500' : ''
            }`}
          >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: primaryAccent }} /> Open for Technical Opportunities
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  {personal.fullName || 'Candidate Full Name'}
                </h1>
                
                <p className="text-sm md:text-base text-slate-400 font-medium">
                  {experience[0]?.title || 'Senior Full Stack Software Engineer'} • {personal.location || 'San Francisco, CA'}
                </p>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {summary || 'Architecting scalable enterprise cloud microservices, intuitive React frontends, and AI evaluation pipelines.'}
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="primary" size="sm" onClick={onScheduleInterview}>
                    <Calendar className="w-4 h-4 mr-1.5" /> Schedule Interview
                  </Button>
                  <Button variant="outline" size="sm" onClick={onDownloadResume}>
                    <Download className="w-4 h-4 mr-1.5" /> Download Resume PDF
                  </Button>
                </div>

                {/* Social Icons Bar */}
                <div className="flex items-center gap-4 pt-2 text-slate-400 text-xs">
                  {personal.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {personal.email}</span>}
                  {personal.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {personal.phone}</span>}
                  {socialLinks?.github && <a href={socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-white"><Github className="w-4 h-4" /></a>}
                  {socialLinks?.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>}
                </div>
              </div>

              {/* Avatar Photo */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl" style={{ borderColor: primaryAccent }}>
                  <img
                    src={personal.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SKILLS & TECH STACK SECTION */}
          {skills && skills.length > 0 && (
            <section
              onClick={() => setSelectedSection('skills')}
              className={`p-8 border-b cursor-pointer transition-all ${selectedSection === 'skills' ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Award className="w-5 h-5" /> Technical Skills & Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-transform hover:scale-105"
                      style={{ backgroundColor: `${primaryAccent}15`, borderColor: `${primaryAccent}40`, color: primaryAccent }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PROJECTS SHOWCASE SECTION */}
          {projects && projects.length > 0 && (
            <section
              onClick={() => setSelectedSection('projects')}
              className={`p-8 border-b cursor-pointer transition-all ${selectedSection === 'projects' ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Globe className="w-5 h-5" /> Featured Projects Showcase
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((proj, idx) => (
                    <MotionCard
                      key={idx}
                      whileHover={enableAnimations ? { y: -4 } : {}}
                      className="portfolio-card p-5 rounded-2xl space-y-3 relative flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-bold text-white">{proj.title || `Project #${idx + 1}`}</h3>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline text-xs flex items-center gap-1">
                              Live Demo <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                      </div>

                      {/* Tech stack badges */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {(proj.technologies || ['React', 'Node.js', 'MongoDB']).map((tech, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </MotionCard>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* GITHUB REPOSITORIES SHOWCASE */}
          {pinnedRepos && pinnedRepos.length > 0 && (
            <section
              onClick={() => setSelectedSection('github')}
              className={`p-8 border-b cursor-pointer transition-all ${selectedSection === 'github' ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Github className="w-5 h-5" /> GitHub Repositories & Stats
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pinnedRepos.map((repo, idx) => (
                    <div key={idx} className="portfolio-card p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-brand-400" /> {repo.name}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300">{repo.language}</span>
                      </div>
                      <p className="text-xs text-slate-400">{repo.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* WORK EXPERIENCE & EDUCATION TIMELINE */}
          {experience && experience.length > 0 && (
            <section
              onClick={() => setSelectedSection('experience')}
              className={`p-8 border-b cursor-pointer transition-all ${selectedSection === 'experience' ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: primaryAccent }}>
                  <Briefcase className="w-5 h-5" /> Work History & Career Journey
                </h2>

                <div className="space-y-4 border-l-2 pl-4" style={{ borderColor: primaryAccent }}>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1 relative">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="text-sm font-bold text-white">{exp.title} — {exp.company}</strong>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CONTACT & INTERVIEW SCHEDULE SECTION */}
          <section
            onClick={() => setSelectedSection('contact')}
            className={`p-8 cursor-pointer transition-all ${selectedSection === 'contact' ? 'ring-2 ring-brand-500' : ''}`}
          >
            <div className="max-w-4xl mx-auto space-y-6 text-center">
              <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color: primaryAccent }}>
                Let's Build Something Great Together
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Interested in evaluating my technical profile or scheduling an interview? Send a direct message below.
              </p>

              <div className="max-w-md mx-auto space-y-3 text-left">
                <input
                  type="text"
                  placeholder="Your Name / Recruiter Name"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
                <input
                  type="email"
                  placeholder="Work Email Address"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
                <textarea
                  rows={3}
                  placeholder="Project inquiry or role details..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
                <Button variant="primary" size="sm" className="w-full justify-center" onClick={onScheduleInterview}>
                  <Send className="w-4 h-4 mr-1.5" /> Send Inquiry & Schedule Evaluation
                </Button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
