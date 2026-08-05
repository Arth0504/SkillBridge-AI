import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Layout as LayoutIcon,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Zap,
  BookOpen,
  Wand2,
  Send,
  Bot,
  User
} from 'lucide-react';
import { Badge } from '../../../components/common';

export const ResumeRightPanel = ({
  activeRightTab,
  setActiveRightTab,
  layout,
  setLayout,
  setHoveredTemplate,
  colorTheme,
  setColorTheme,
  customAccentColor,
  setCustomAccentColor,
  font,
  setFont,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  sectionGap,
  setSectionGap,
  borderRadius,
  setBorderRadius,
  showIcons,
  setShowIcons,
  atsScore,
  summary,
  experience,
  skills,
  education,
  handleTriggerAISuggestions,
  handleTriggerGrammarCheck,
  suggestMutation
}) => {
  // AI Assistant Chat Messages state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Gemini AI Resume Assistant. Select a quick prompt chip below or ask how I can optimize your resume text.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // 10 Handcrafted Template Presets
  const templates = [
    { id: 'modern', name: 'Modern Standard', tag: 'Popular', description: 'Clean single-column layout for corporate & technical roles.' },
    { id: 'executive', name: 'Executive Classic', tag: 'Leadership', description: 'Formal centered header layout ideal for management & senior roles.' },
    { id: 'minimal', name: 'Minimalist Clean', tag: 'Clean', description: 'High whitespace density layout putting focus on key highlights.' },
    { id: 'creative', name: 'Creative Accent', tag: 'Design', description: 'Left primary accent bar for high visual engagement.' },
    { id: 'harvard', name: 'Harvard Academic', tag: 'Academic', description: 'Traditional serif typography layout tailored for academia & law.' },
    { id: 'stanford', name: 'Stanford Professional', tag: 'Corporate', description: 'Sleek dark accent headers for high impact engineering roles.' },
    { id: 'google', name: 'Google Tech', tag: 'Tech', description: 'Tech-first layout highlighting core stack and GitHub deliverables.' },
    { id: 'microsoft', name: 'Microsoft Enterprise', tag: 'Enterprise', description: 'Double border headers structured for large scale systems experience.' },
    { id: 'developer', name: 'Developer Monospace', tag: 'Code', description: 'Monospace terminal aesthetic for backend & DevOps engineers.' },
    { id: 'ats', name: 'ATS Friendly', tag: 'ATS Safe', description: 'Strict single column text density engineered for 100% ATS parsers.' },
  ];

  // Curated color themes
  const colorThemes = [
    { id: 'navy', name: 'Navy Corporate', hex: '#1e3a8a' },
    { id: 'slate', name: 'Slate Minimal', hex: '#334155' },
    { id: 'emerald', name: 'Emerald Tech', hex: '#064e3b' },
    { id: 'burgundy', name: 'Burgundy Creative', hex: '#581c87' },
    { id: 'charcoal', name: 'Charcoal Classic', hex: '#0f172a' },
  ];

  // Font options with typography sample previews
  const fontFamilies = [
    { id: 'sans', name: 'Clean Sans-Serif', family: "'Inter', sans-serif", sample: 'The quick brown fox' },
    { id: 'serif', name: 'Elegant Serif', family: "'Playfair Display', serif", sample: 'The quick brown fox' },
    { id: 'mono', name: 'Monospace Tech', family: "'JetBrains Mono', monospace", sample: 'const resume = true;' },
    { id: 'modern', name: 'Modern Geometric', family: "'Outfit', sans-serif", sample: 'The quick brown fox' },
    { id: 'roboto', name: 'Corporate Roboto', family: "'Roboto', sans-serif", sample: 'The quick brown fox' },
  ];

  const tabs = [
    { id: 'templates', label: 'Templates', icon: LayoutIcon },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'fonts', label: 'Fonts', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Sliders },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'ats', label: 'ATS Rating', icon: FileCheck },
  ];

  // Send message in AI Assistant chat UI
  const handleSendChatMessage = (promptText = chatInput) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: textToSend },
    ]);
    setChatInput('');

    // Trigger AI suggestion request
    handleTriggerAISuggestions('summary', summary || textToSend);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Analyzing "${textToSend.substring(0, 30)}..." with Gemini AI engine. Check recommendations compiled above!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border-l border-slate-800 text-slate-200 overflow-hidden no-print">
      {/* Tab Navigation Header */}
      <div className="p-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-around gap-1 overflow-x-auto custom-scrollbar select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeRightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
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

      {/* Tab Content Panel Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* 1. TEMPLATES TAB (with hover live preview) */}
        {activeRightTab === 'templates' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Template Presets</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Hover card to preview layout live on canvas</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {templates.map((tpl) => {
                const isSelected = layout === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setLayout(tpl.id)}
                    onMouseEnter={() => setHoveredTemplate(tpl.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 space-y-1.5 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:border-brand-400/60 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tpl.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {tpl.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">{tpl.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 2. COLORS TAB */}
        {activeRightTab === 'colors' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Theme Palette</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Select preset colors or pick custom accent</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Curated Palettes</label>
              <div className="grid grid-cols-1 gap-2">
                {colorThemes.map((ct) => {
                  const isSelected = colorTheme === ct.id && !customAccentColor;
                  return (
                    <div
                      key={ct.id}
                      onClick={() => { setColorTheme(ct.id); setCustomAccentColor(''); }}
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

            {/* Custom Accent Color Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Custom Hex Accent</label>
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="color"
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  value={customAccentColor || colorThemes.find((c) => c.id === colorTheme)?.hex || '#1e3a8a'}
                  onChange={(e) => setCustomAccentColor(e.target.value)}
                />
                <span className="text-xs font-mono text-slate-300">
                  {customAccentColor || 'Default Palette'}
                </span>
                {customAccentColor && (
                  <button onClick={() => setCustomAccentColor('')} className="text-[10px] text-brand-400 hover:underline ml-auto font-bold">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. FONTS TAB (with font sample previews) */}
        {activeRightTab === 'fonts' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Typography & Scaling</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Customize font family and base sizing</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Font Family & Sample</label>
              <div className="space-y-2">
                {fontFamilies.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                      font === f.id ? 'border-brand-500 bg-slate-800' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{f.name}</span>
                      {font === f.id && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 italic" style={{ fontFamily: f.family }}>
                      {f.sample}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Base Font Size</label>
                <span className="font-mono text-brand-400 font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="11"
                max="16"
                step="0.5"
                className="w-full accent-brand-500"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Line Height</label>
                <span className="font-mono text-brand-400 font-bold">{lineHeight}</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                className="w-full accent-brand-500"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              />
            </div>
          </motion.div>
        )}

        {/* 4. SPACING TAB */}
        {activeRightTab === 'spacing' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Spacing & Elements</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Control gaps, padding, and visual badges</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Section Gap</label>
                <span className="font-mono text-brand-400 font-bold">{sectionGap}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                step="2"
                className="w-full accent-brand-500"
                value={sectionGap}
                onChange={(e) => setSectionGap(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Corner Radius</label>
                <span className="font-mono text-brand-400 font-bold">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="2"
                className="w-full accent-brand-500"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Section Header Icons</span>
                <span className="text-[10px] text-slate-400">Show icons next to section headings</span>
              </div>
              <input
                type="checkbox"
                checked={showIcons}
                onChange={(e) => setShowIcons(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
            </div>
          </motion.div>
        )}

        {/* 5. AI ASSISTANT TAB (Interactive Chat UI) */}
        {activeRightTab === 'ai' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 flex flex-col h-full">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Gemini AI Chat Assistant
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Interactive prompt assistant & quick action chips</p>
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSendChatMessage('Make my summary executive and impact driven')}
                className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-semibold hover:bg-purple-900/60 transition-colors"
              >
                <Wand2 className="w-3 h-3 inline mr-1" /> Executive Summary
              </button>
              <button
                onClick={() => handleSendChatMessage('Add action verbs to experience bullet points')}
                className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-semibold hover:bg-purple-900/60 transition-colors"
              >
                <Zap className="w-3 h-3 inline mr-1" /> Action Verbs
              </button>
              <button
                onClick={() => handleSendChatMessage('Polish grammar and phrasing across resume')}
                className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold hover:bg-emerald-900/60 transition-colors"
              >
                <BookOpen className="w-3 h-3 inline mr-1" /> Grammar Polish
              </button>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 text-purple-400 mt-1 shrink-0" />}
                  <div
                    className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === 'user' && <User className="w-4 h-4 text-slate-400 mt-1 shrink-0" />}
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Gemini AI resume assistant..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
              />
              <button
                onClick={() => handleSendChatMessage()}
                className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 6. ATS RATING TAB (Animated Circular / Progress Meter) */}
        {activeRightTab === 'ats' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">ATS Score Breakdown</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time parser competency score</p>
            </div>

            {/* Circular Gauge Display Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={atsScore >= 80 ? 'text-emerald-500' : atsScore >= 60 ? 'text-amber-500' : 'text-rose-500'}
                    strokeDasharray={`${atsScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-lg font-black text-white">{atsScore}%</span>
              </div>
              <span className="text-xs font-bold text-slate-300">
                {atsScore >= 80 ? 'Excellent ATS Alignment' : atsScore >= 60 ? 'Moderate ATS Alignment' : 'Needs Optimization'}
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-[11px] text-slate-400">
              <span className="font-bold block uppercase text-[10px] text-slate-500">Enhancements Checklist:</span>
              {skills.length < 5 && (
                <p className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Add at least 5 tech skills (+10 pts)
                </p>
              )}
              {(!summary || summary.split(/\s+/).filter(Boolean).length < 25) && (
                <p className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Add 25+ words summary (+10 pts)
                </p>
              )}
              {education.length === 0 && (
                <p className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Add education details (+15 pts)
                </p>
              )}
              {experience.length === 0 && (
                <p className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Add work experience (+15 pts)
                </p>
              )}
              {atsScore >= 90 && (
                <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Highly optimized for top ATS screeners!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
