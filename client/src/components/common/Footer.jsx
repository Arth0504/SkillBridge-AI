import React from 'react';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-xl text-white">
              <div className="p-2 rounded-xl bg-brand-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              SkillBridge AI
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Next-generation AI talent marketplace & assessment platform. Streamlining candidate evaluations with Gemini AI.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Resume Analyzer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Mock Interview</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Coding Assessment</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Pricing</a></li>
              <li><a href="/api/docs" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Standards</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} SkillBridge AI Team. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
