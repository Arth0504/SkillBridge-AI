import React from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  User,
  Globe,
  Briefcase,
  Award,
  Github,
  Mail,
  Linkedin,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common';

export const PortfolioRightInspector = ({
  selectedSection,
  personal,
  setPersonal,
  summary,
  setSummary,
  skills,
  setSkills,
  experience,
  setExperience,
  projects,
  setProjects,
  socialLinks,
  setSocialLinks
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-900/95 border-l border-slate-800 text-slate-200 overflow-hidden no-print">
      {/* Inspector Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-brand-400" /> Properties Inspector
        </h3>
        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase">
          {selectedSection || 'hero'}
        </span>
      </div>

      {/* Main Inspector Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* HERO SECTION INSPECTOR */}
        {(!selectedSection || selectedSection === 'hero') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <User className="w-4 h-4 text-blue-400" /> Hero & Bio Attributes
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={personal.fullName}
                onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={personal.location}
                onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Avatar Photo URL</label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={personal.avatarUrl || ''}
                onChange={(e) => setPersonal({ ...personal, avatarUrl: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Hero Headline Bio</label>
              <textarea
                rows={4}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </motion.div>
        )}

        {/* SKILLS INSPECTOR */}
        {selectedSection === 'skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Award className="w-4 h-4 text-rose-400" /> Skill Badges Properties
            </h4>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Skill Badges ({skills.length})</label>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PROJECTS INSPECTOR */}
        {selectedSection === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4 text-cyan-400" /> Project Cards Inspector
            </h4>

            <p className="text-[11px] text-slate-400">
              Editing {projects.length} showcase projects. Select any project item in Left Panel to modify media images or demo URLs.
            </p>
          </motion.div>
        )}

        {/* SOCIAL LINKS INSPECTOR */}
        {(selectedSection === 'contact' || selectedSection === 'hero') && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Links</h4>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GitHub Profile URL</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  value={socialLinks.github || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn Profile URL</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  value={socialLinks.linkedin || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
