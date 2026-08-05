import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layout as LayoutIcon,
  Palette,
  Type,
  Sparkles,
  Search,
  Globe,
  Github,
  CheckCircle2,
  Sliders,
  Wand2,
  Zap,
  BookOpen,
  FileCode
} from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const PortfolioLeftPanel = ({
  activeLeftTab,
  setActiveLeftTab,
  template,
  setTemplate,
  themeColor,
  setThemeColor,
  customAccentColor,
  setCustomAccentColor,
  fontFamily,
  setFontFamily,
  enableAnimations,
  setEnableAnimations,
  seoConfig,
  setSeoConfig,
  handleGenerateAIBio,
  handleGenerateAIAbout,
  handleGenerateAIProjects,
  handleGenerateAISkills,
  handleGenerateAISeo,
  handleGenerateGithubReadme,
  onOpenGithubModal
}) => {
  // 10 Portfolio Templates
  const templates = [
    { id: 'developer', name: 'Developer Monospace', tag: 'Terminal', desc: 'Dark terminal code block hero layout.' },
    { id: 'software-engineer', name: 'Software Engineer', tag: 'Corporate', desc: 'Corporate tech split hero banner.' },
    { id: 'fullstack', name: 'Full Stack Gradient', tag: 'Full Stack', desc: 'Vibrant indigo/cyan gradient hero layout.' },
    { id: 'designer', name: 'Designer Showcase', tag: 'Portfolio', desc: 'High visual impact media grid layout.' },
    { id: 'minimal', name: 'Minimalist Clean', tag: 'Clean', desc: 'Light high-whitespace typography layout.' },
    { id: 'creative', name: 'Creative Floating', tag: 'Creative', desc: 'Bold floating card micro-animations.' },
    { id: 'startup', name: 'Startup SaaS', tag: 'SaaS', desc: 'Modern SaaS landing layout with strong CTAs.' },
    { id: 'corporate', name: 'Corporate Executive', tag: 'Executive', desc: 'Structured timeline & enterprise cards.' },
    { id: 'glassmorphism', name: 'Glassmorphism', tag: 'Glass', desc: 'Frosted glass panels with backdrop blur.' },
    { id: 'dark-neon', name: 'Dark Cyber Neon', tag: 'Cyberpunk', desc: 'Dark mode glowing cyan/magenta borders.' },
  ];

  const colorThemes = [
    { id: 'indigo', name: 'Indigo Brand', hex: '#6366f1' },
    { id: 'emerald', name: 'Emerald Tech', hex: '#10b981' },
    { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
    { id: 'purple', name: 'Purple Creative', hex: '#a855f7' },
    { id: 'amber', name: 'Amber Warmth', hex: '#f59e0b' },
  ];

  const fonts = [
    { id: 'inter', name: 'Clean Sans (Inter)', sample: 'Sample Heading' },
    { id: 'outfit', name: 'Modern Outfit (Geometric)', sample: 'Sample Heading' },
    { id: 'mono', name: 'Monospace (JetBrains)', sample: 'const dev = true;' },
    { id: 'playfair', name: 'Serif Elegant (Playfair)', sample: 'Sample Heading' },
  ];

  const tabs = [
    { id: 'templates', label: 'Templates', icon: LayoutIcon },
    { id: 'theme', label: 'Theme & Color', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'seo', label: 'SEO & Meta', icon: Search },
    { id: 'ai', label: 'AI Copywriter', icon: Sparkles },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border-r border-slate-800 text-slate-200 overflow-hidden no-print">
      {/* Top Tab Switcher */}
      <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-around gap-1 overflow-x-auto custom-scrollbar select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLeftTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLeftTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Control Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* 1. TEMPLATES */}
        {activeLeftTab === 'templates' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Portfolio Templates</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Select a website design preset</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {templates.map((tpl) => {
                const isSelected = template === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tpl.name}</span>
                      <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                        {tpl.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{tpl.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 2. THEME COLORS & ACCENTS */}
        {activeLeftTab === 'theme' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Theme Colors</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Customize brand primary accent</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Color Palettes</label>
              <div className="grid grid-cols-1 gap-2">
                {colorThemes.map((ct) => {
                  const isSelected = themeColor === ct.id && !customAccentColor;
                  return (
                    <div
                      key={ct.id}
                      onClick={() => { setThemeColor(ct.id); setCustomAccentColor(''); }}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected ? 'border-brand-500 bg-slate-800' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: ct.hex }} />
                        <span className="text-xs font-semibold text-slate-200">{ct.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Custom Accent Color</label>
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  value={customAccentColor || colorThemes.find((c) => c.id === themeColor)?.hex || '#6366f1'}
                  onChange={(e) => setCustomAccentColor(e.target.value)}
                />
                <span className="text-xs font-mono text-slate-300">{customAccentColor || 'Palette Default'}</span>
                {customAccentColor && (
                  <button onClick={() => setCustomAccentColor('')} className="text-[10px] text-brand-400 hover:underline ml-auto font-bold">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. TYPOGRAPHY */}
        {activeLeftTab === 'typography' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Typography</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Select website font family</p>
            </div>

            <div className="space-y-2">
              {fonts.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                    fontFamily === f.id ? 'border-brand-500 bg-slate-800' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-white block">{f.name}</span>
                    <span className="text-[11px] text-slate-400 italic">{f.sample}</span>
                  </div>
                  {fontFamily === f.id && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                </div>
              ))}
            </div>

            {/* Animation Toggle */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Framer Motion Animations</span>
                  <span className="text-[10px] text-slate-400">Enable smooth entry & card hover transitions</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAnimations}
                  onChange={(e) => setEnableAnimations(e.target.checked)}
                  className="w-4 h-4 accent-brand-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. SEO CONFIGURATION */}
        {activeLeftTab === 'seo' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">SEO & Meta Tags</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure page title, meta description & keywords</p>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Page Title Tag</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  value={seoConfig.title}
                  onChange={(e) => setSeoConfig({ ...seoConfig, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  value={seoConfig.description}
                  onChange={(e) => setSeoConfig({ ...seoConfig, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  value={seoConfig.keywords}
                  onChange={(e) => setSeoConfig({ ...seoConfig, keywords: e.target.value })}
                />
              </div>

              <Button variant="outline" size="xs" className="w-full justify-center" onClick={handleGenerateAISeo}>
                <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1" /> Auto-Generate SEO Tags with AI
              </Button>
            </div>
          </motion.div>
        )}

        {/* 5. AI COPYWRITING ASSISTANT */}
        {activeLeftTab === 'ai' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Portfolio Generator
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Generate portfolio sections using Gemini LLM</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div
                onClick={handleGenerateAIBio}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-purple-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Wand2 className="w-3.5 h-3.5" /> Generate Professional Bio
                </div>
                <p className="text-[10px] text-slate-400">Craft hero banner headline & bio intro</p>
              </div>

              <div
                onClick={handleGenerateAIAbout}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-purple-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <BookOpen className="w-3.5 h-3.5" /> Generate About Me Copy
                </div>
                <p className="text-[10px] text-slate-400">Detailed career story & philosophy</p>
              </div>

              <div
                onClick={handleGenerateAIProjects}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-purple-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Zap className="w-3.5 h-3.5" /> Polish Project Highlights
                </div>
                <p className="text-[10px] text-slate-400">Improve architecture deliverables text</p>
              </div>

              <div
                onClick={handleGenerateGithubReadme}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-emerald-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <FileCode className="w-3.5 h-3.5" /> Generate GitHub Profile README
                </div>
                <p className="text-[10px] text-slate-400">Compile markdown README snippet</p>
              </div>

              <div
                onClick={onOpenGithubModal}
                className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-blue-500/50 cursor-pointer space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Github className="w-3.5 h-3.5" /> GitHub Repos & Stats Import
                </div>
                <p className="text-[10px] text-slate-400">Import repositories, stars, & language tags</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
