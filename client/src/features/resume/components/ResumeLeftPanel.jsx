import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  FileText,
  Briefcase,
  BookOpen,
  Globe,
  Award,
  Languages as LangIcon,
  Heart,
  Users,
  Sparkles,
  SpellCheck,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  GripVertical
} from 'lucide-react';
import { Button } from '../../../components/common';

export const ResumeLeftPanel = ({
  personal,
  setPersonal,
  summary,
  setSummary,
  skills,
  setSkills,
  experience,
  setExperience,
  education,
  setEducation,
  projects,
  setProjects,
  certifications,
  setCertifications,
  languages,
  setLanguages,
  interests,
  setInterests,
  references,
  setReferences,
  sectionOrder,
  setSectionOrder,
  enabledSections,
  toggleSection,
  handleTriggerAISuggestions,
  handleTriggerGrammarCheck,
  suggestMutation,
  grammarMutation,
  aiTarget
}) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Section metadata mapping
  const sectionMeta = {
    personal: { label: 'Personal Credentials', icon: User, color: 'text-blue-400' },
    summary: { label: 'Professional Summary', icon: FileText, color: 'text-purple-400' },
    experience: { label: 'Work Experience', icon: Briefcase, color: 'text-emerald-400' },
    education: { label: 'Education History', icon: BookOpen, color: 'text-amber-400' },
    projects: { label: 'Key Projects', icon: Globe, color: 'text-cyan-400' },
    skills: { label: 'Skills & Tech Stack', icon: Award, color: 'text-rose-400' },
    certifications: { label: 'Certifications', icon: Award, color: 'text-indigo-400' },
    languages: { label: 'Languages', icon: LangIcon, color: 'text-teal-400' },
    interests: { label: 'Interests & Activities', icon: Heart, color: 'text-pink-400' },
    references: { label: 'References', icon: Users, color: 'text-orange-400' },
  };

  // Reorder section priority
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
  };

  // Collapse / Expand All helper
  const handleCollapseAll = () => setActiveSection(null);
  const handleExpandAll = () => setActiveSection('personal');

  // Helper experience management
  const handleAddExperience = () => {
    setExperience((prev) => [
      ...prev,
      { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' },
    ]);
  };
  const handleRemoveExperience = (idx) => {
    setExperience((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper education management
  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      { institution: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() },
    ]);
  };
  const handleRemoveEducation = (idx) => {
    setEducation((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper project management
  const handleAddProject = () => {
    setProjects((prev) => [
      ...prev,
      { title: '', description: '', link: '', technologies: [] },
    ]);
  };
  const handleRemoveProject = (idx) => {
    setProjects((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper certification management
  const handleAddCertification = () => {
    setCertifications((prev) => [
      ...prev,
      { name: '', issuer: '', issueDate: '', credentialUrl: '' },
    ]);
  };
  const handleRemoveCertification = (idx) => {
    setCertifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper reference management
  const handleAddReference = () => {
    setReferences((prev) => [
      ...prev,
      { name: '', position: '', company: '', email: '', phone: '' },
    ]);
  };
  const handleRemoveReference = (idx) => {
    setReferences((prev) => prev.filter((_, i) => i !== idx));
  };

  // Tag list adders
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const handleRemoveSkill = (item) => setSkills((prev) => prev.filter((s) => s !== item));

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages((prev) => [...prev, newLanguage.trim()]);
      setNewLanguage('');
    }
  };
  const handleRemoveLanguage = (item) => setLanguages((prev) => prev.filter((l) => l !== item));

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests((prev) => [...prev, newInterest.trim()]);
      setNewInterest('');
    }
  };
  const handleRemoveInterest = (item) => setInterests((prev) => prev.filter((i) => i !== item));

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border-r border-slate-800 text-slate-200 overflow-hidden no-print">
      {/* Header with Collapse/Expand Controls */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 select-none">
        <div>
          <h2 className="text-xs font-bold text-white flex items-center gap-2 tracking-tight">
            <User className="w-4 h-4 text-brand-500" /> Content Editor
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Customize content & priority order</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={activeSection ? handleCollapseAll : handleExpandAll}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[10px] flex items-center gap-1"
            title={activeSection ? 'Collapse All Accordions' : 'Expand First Accordion'}
          >
            {activeSection ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Accordion List Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
        {sectionOrder.map((secKey, index) => {
          const meta = sectionMeta[secKey] || { label: secKey, icon: FileText, color: 'text-brand-400' };
          const Icon = meta.icon;
          const isEnabled = enabledSections.has(secKey);
          const isOpen = activeSection === secKey;

          return (
            <motion.div
              key={secKey}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl border transition-all duration-200 ${
                isOpen
                  ? 'border-brand-500/60 bg-slate-800/90 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500/20'
                  : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Accordion Header Bar */}
              <div className="p-3 flex items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setActiveSection(isOpen ? null : secKey)}>
                  <div className="flex items-center gap-0.5 text-slate-500 hover:text-slate-200 cursor-grab" title="Reorder section priority">
                    <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                    <div className="flex flex-col text-[8px] font-mono leading-none">
                      <span onClick={(e) => { e.stopPropagation(); moveSection(index, -1); }} className="hover:text-brand-400">▲</span>
                      <span onClick={(e) => { e.stopPropagation(); moveSection(index, 1); }} className="hover:text-brand-400">▼</span>
                    </div>
                  </div>

                  <Icon className={`w-4 h-4 ${meta.color}`} />
                  <span className={`text-xs font-semibold ${isOpen ? 'text-white' : 'text-slate-300'}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleSection(secKey)}
                    className={`p-1 rounded-lg transition-colors ${isEnabled ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-600 hover:bg-slate-800'}`}
                    title={isEnabled ? 'Visible on Canvas' : 'Hidden from Canvas'}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setActiveSection(isOpen ? null : secKey)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Accordion Body Container */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-slate-800/80 p-3.5 space-y-3.5 text-xs"
                  >
                    {/* 1. Personal Credentials */}
                    {secKey === 'personal' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                          <input
                            type="text"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={personal.fullName}
                            onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                          <input
                            type="email"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={personal.email}
                            onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                          <input
                            type="text"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={personal.phone}
                            onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Location (City, Country)</label>
                          <input
                            type="text"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={personal.location}
                            onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Portfolio / GitHub / LinkedIn</label>
                          <input
                            type="text"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                            value={personal.website}
                            onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. Professional Summary */}
                    {secKey === 'summary' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="xs" onClick={() => handleTriggerAISuggestions('summary', summary, null)}>
                            <Sparkles className="w-3 h-3 mr-1 text-purple-400" /> Ask AI Suggestion
                          </Button>
                          <Button variant="outline" size="xs" onClick={() => handleTriggerGrammarCheck(summary, 'summary', null)}>
                            <SpellCheck className="w-3 h-3 mr-1 text-emerald-400" /> Polish Grammar
                          </Button>
                        </div>

                        <textarea
                          rows={4}
                          placeholder="Draft summary highlighting your core capabilities..."
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                        />

                        {/* Skeleton & AI Suggestion Result Box */}
                        {suggestMutation?.isPending && aiTarget?.section === 'summary' && (
                          <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2 animate-pulse">
                            <div className="h-3 bg-purple-900/50 rounded w-1/3" />
                            <div className="h-3 bg-purple-900/30 rounded w-full" />
                            <div className="h-3 bg-purple-900/30 rounded w-4/5" />
                          </div>
                        )}
                        {suggestMutation?.data?.data && aiTarget?.section === 'summary' && (
                          <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-purple-400 uppercase">AI Recommendation:</span>
                            <p className="text-[11px] text-slate-200 leading-relaxed">{suggestMutation.data.data.suggestedText}</p>
                            <button
                              onClick={() => { setSummary(suggestMutation.data.data.suggestedText); suggestMutation.reset(); }}
                              className="text-[10px] text-purple-400 font-bold hover:underline block pt-1"
                            >
                              Apply this copy
                            </button>
                          </div>
                        )}

                        {grammarMutation?.isPending && aiTarget?.section === 'summary' && (
                          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2 animate-pulse">
                            <div className="h-3 bg-emerald-900/50 rounded w-1/3" />
                            <div className="h-3 bg-emerald-900/30 rounded w-full" />
                          </div>
                        )}
                        {grammarMutation?.data?.data && aiTarget?.section === 'summary' && (
                          <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">Grammar Correction:</span>
                            <p className="text-[11px] text-slate-200 leading-relaxed">{grammarMutation.data.data.correctedText}</p>
                            <button
                              onClick={() => { setSummary(grammarMutation.data.data.correctedText); grammarMutation.reset(); }}
                              className="text-[10px] text-emerald-400 font-bold hover:underline block pt-1"
                            >
                              Apply polished grammar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Work Experience */}
                    {secKey === 'experience' && (
                      <div className="space-y-3.5">
                        {experience.map((exp, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5 relative">
                            <Trash2 className="absolute right-3 top-3 w-4 h-4 text-rose-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleRemoveExperience(idx)} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                                <input
                                  type="text"
                                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  value={exp.title}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].title = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                                <input
                                  type="text"
                                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  value={exp.company}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].company = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                                <input
                                  type="date"
                                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].startDate = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                                <input
                                  type="date"
                                  disabled={exp.current}
                                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none disabled:opacity-30"
                                  value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].endDate = e.target.value;
                                    setExperience(updated);
                                  }}
                                />
                              </div>
                              <div className="sm:col-span-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].current = e.target.checked;
                                    if (e.target.checked) updated[idx].endDate = '';
                                    setExperience(updated);
                                  }}
                                />
                                <span className="text-[11px] text-slate-400">Current position</span>
                              </div>

                              <div className="sm:col-span-2 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Key Achievements</label>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleTriggerAISuggestions('experience description', exp.description || exp.title || 'Software Developer', idx)}
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-400 mr-1" /> AI Bullets
                                  </Button>
                                </div>
                                <textarea
                                  rows={3}
                                  placeholder="Detail technologies, deliverables, milestones..."
                                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  value={exp.description}
                                  onChange={(e) => {
                                    const updated = [...experience];
                                    updated[idx].description = e.target.value;
                                    setExperience(updated);
                                  }}
                                />

                                {suggestMutation?.isPending && aiTarget?.section === 'experience' && aiTarget?.index === idx && (
                                  <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-1.5 animate-pulse">
                                    <div className="h-3 bg-purple-900/50 rounded w-1/3" />
                                    <div className="h-3 bg-purple-900/30 rounded w-full" />
                                    <div className="h-3 bg-purple-900/30 rounded w-4/5" />
                                  </div>
                                )}
                                {suggestMutation?.data?.data && aiTarget?.section === 'experience' && aiTarget?.index === idx && (
                                  <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl space-y-1.5">
                                    <span className="text-[9px] font-bold text-purple-400 uppercase">AI Recommendations:</span>
                                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                                      {(suggestMutation.data.data.suggestions || []).map((s, sIdx) => (
                                        <li key={sIdx}>{s}</li>
                                      ))}
                                    </ul>
                                    <button
                                      onClick={() => {
                                        const updated = [...experience];
                                        const formatted = (suggestMutation.data.data.suggestions || []).map((s) => `• ${s}`).join('\n');
                                        updated[idx].description = formatted || suggestMutation.data.data.suggestedText;
                                        setExperience(updated);
                                        suggestMutation.reset();
                                      }}
                                      className="text-[10px] text-purple-400 font-bold hover:underline block pt-1"
                                    >
                                      Apply bullet points
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleAddExperience}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Experience Position
                        </Button>
                      </div>
                    )}

                    {/* 4. Education */}
                    {secKey === 'education' && (
                      <div className="space-y-3">
                        {education.map((edu, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
                            <Trash2 className="absolute right-3 top-3 w-4 h-4 text-rose-400 cursor-pointer" onClick={() => handleRemoveEducation(idx)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="School / Institution"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={edu.institution}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].institution = e.target.value;
                                  setEducation(updated);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Degree Qualification"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={edu.degree}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].degree = e.target.value;
                                  setEducation(updated);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Field of Study"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={edu.fieldOfStudy}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].fieldOfStudy = e.target.value;
                                  setEducation(updated);
                                }}
                              />
                              <input
                                type="number"
                                placeholder="Graduation Year"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={edu.endYear}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].endYear = parseInt(e.target.value) || new Date().getFullYear();
                                  setEducation(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleAddEducation}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Education
                        </Button>
                      </div>
                    )}

                    {/* 5. Key Projects */}
                    {secKey === 'projects' && (
                      <div className="space-y-3">
                        {projects.map((proj, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
                            <Trash2 className="absolute right-3 top-3 w-4 h-4 text-rose-400 cursor-pointer" onClick={() => handleRemoveProject(idx)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Project Title"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={proj.title}
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].title = e.target.value;
                                  setProjects(updated);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Project Link"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={proj.link}
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].link = e.target.value;
                                  setProjects(updated);
                                }}
                              />
                              <textarea
                                rows={2}
                                placeholder="Description and achievements..."
                                className="sm:col-span-2 p-2 rounded bg-slate-900 border border-slate-800 text-white"
                                value={proj.description}
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].description = e.target.value;
                                  setProjects(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleAddProject}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Project
                        </Button>
                      </div>
                    )}

                    {/* 6. Skills */}
                    {secKey === 'skills' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add tech skill (e.g. React)..."
                            className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-white focus:outline-none"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }}
                          />
                          <Button variant="primary" size="sm" onClick={handleAddSkill}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700">
                              {skill}
                              <Trash2 className="w-3.5 h-3.5 text-rose-400 cursor-pointer hover:scale-110" onClick={() => handleRemoveSkill(skill)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7. Certifications */}
                    {secKey === 'certifications' && (
                      <div className="space-y-3">
                        {certifications.map((cert, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
                            <Trash2 className="absolute right-3 top-3 w-4 h-4 text-rose-400 cursor-pointer" onClick={() => handleRemoveCertification(idx)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Certification Name"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={cert.name}
                                onChange={(e) => {
                                  const updated = [...certifications];
                                  updated[idx].name = e.target.value;
                                  setCertifications(updated);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Issuer Organization"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={cert.issuer}
                                onChange={(e) => {
                                  const updated = [...certifications];
                                  updated[idx].issuer = e.target.value;
                                  setCertifications(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleAddCertification}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Certification
                        </Button>
                      </div>
                    )}

                    {/* 8. Languages */}
                    {secKey === 'languages' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add language..."
                            className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddLanguage(); }}
                          />
                          <Button variant="primary" size="sm" onClick={handleAddLanguage}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {languages.map((lang, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700">
                              {lang}
                              <Trash2 className="w-3.5 h-3.5 text-rose-400 cursor-pointer hover:scale-110" onClick={() => handleRemoveLanguage(lang)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 9. Interests */}
                    {secKey === 'interests' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add interest..."
                            className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddInterest(); }}
                          />
                          <Button variant="primary" size="sm" onClick={handleAddInterest}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {interests.map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700">
                              {item}
                              <Trash2 className="w-3.5 h-3.5 text-rose-400 cursor-pointer hover:scale-110" onClick={() => handleRemoveInterest(item)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 10. References */}
                    {secKey === 'references' && (
                      <div className="space-y-3">
                        {references.map((ref, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 relative">
                            <Trash2 className="absolute right-3 top-3 w-4 h-4 text-rose-400 cursor-pointer" onClick={() => handleRemoveReference(idx)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Reference Name"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={ref.name}
                                onChange={(e) => {
                                  const updated = [...references];
                                  updated[idx].name = e.target.value;
                                  setReferences(updated);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Company"
                                className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                                value={ref.company}
                                onChange={(e) => {
                                  const updated = [...references];
                                  updated[idx].company = e.target.value;
                                  setReferences(updated);
                                }}
                              />
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleAddReference}>
                          <Plus className="w-4 h-4 mr-1.5" /> Add Reference
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
