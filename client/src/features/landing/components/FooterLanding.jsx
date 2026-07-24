import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Github, Twitter, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import toast from 'react-hot-toast';

export const FooterLanding = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success('Thank you for subscribing to SkillBridge AI updates!');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SkillBridge <span className="gradient-text">AI</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise Talent Marketplace & AI Assessment Engine. Automated ATS resume audits, multi-language coding challenges, and asynchronous video evaluations powered by Gemini 1.5 Pro.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-white">Subscribe to AI Hiring Insights</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-xs"
                />
                <Button type="submit" variant="primary" size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product Suite</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/#features" className="hover:text-brand-400 transition-colors">ATS Resume AI</a></li>
              <li><a href="/#ai-showcase" className="hover:text-brand-400 transition-colors">AI Mock Interview</a></li>
              <li><a href="/#ai-showcase" className="hover:text-brand-400 transition-colors">Coding Assessment Lab</a></li>
              <li><a href="/#ai-showcase" className="hover:text-brand-400 transition-colors">Video Screening</a></li>
              <li><Link to="/jobs" className="hover:text-brand-400 transition-colors">Jobs Marketplace</Link></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/candidate/dashboard" className="hover:text-brand-400 transition-colors">For Job Seekers</Link></li>
              <li><Link to="/company/dashboard" className="hover:text-brand-400 transition-colors">For Tech Employers</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-brand-400 transition-colors">Admin Control Plane</Link></li>
              <li><a href="/#pricing" className="hover:text-brand-400 transition-colors">Enterprise Pricing</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/#faq" className="hover:text-brand-400 transition-colors">Security & SOC2</a></li>
              <li><a href="/#faq" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/#faq" className="hover:text-brand-400 transition-colors">Terms of Service</a></li>
              <li><a href="/#faq" className="hover:text-brand-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Socials & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillBridge AI Platform. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
