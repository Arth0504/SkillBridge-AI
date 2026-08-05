import React from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  CheckCircle2,
  Undo2,
  Redo2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  BookOpen,
  Award,
  FileText,
  Languages as LangIcon,
  Heart,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '../../../components/common';

export const ResumeCenterCanvas = ({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  languages,
  interests,
  references,
  sectionOrder,
  enabledSections,
  layout,
  hoveredTemplate,
  colorTheme,
  customAccentColor,
  font,
  fontSize,
  lineHeight,
  sectionGap,
  borderRadius,
  showIcons,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  handlePrintPDF,
  handleExportDOCX,
  handleSaveToProfile,
  isSavingProfile,
  isDirty,
  lastSavedAt
}) => {

  // Font family mappings
  const fontFamilyMap = {
    sans: "'Inter', sans-serif",
    serif: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', monospace",
    modern: "'Outfit', sans-serif",
    roboto: "'Roboto', sans-serif",
  };

  // Accent color mappings
  const themeAccentMap = {
    navy: '#1e3a8a',
    slate: '#334155',
    emerald: '#064e3b',
    burgundy: '#581c87',
    charcoal: '#0f172a',
  };

  const primaryAccent = customAccentColor || themeAccentMap[colorTheme] || '#1e3a8a';
  const activeLayout = hoveredTemplate || layout;

  // Section icon resolver
  const getSectionIcon = (secKey) => {
    if (!showIcons) return null;
    switch (secKey) {
      case 'summary': return <FileText className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'experience': return <Briefcase className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'education': return <BookOpen className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'projects': return <Globe className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'skills': return <Award className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'certifications': return <Award className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'languages': return <LangIcon className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'interests': return <Heart className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      case 'references': return <Users className="w-4 h-4 mr-2 inline" style={{ color: primaryAccent }} />;
      default: return null;
    }
  };

  // Zoom scale transform
  const zoomScale = zoom / 100;

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* 1. Canva Canvas Top Toolbar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print z-20">
        {/* Left Toolbar: Undo/Redo & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="text-slate-400 hover:text-white">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-brand-400 w-10 text-center font-bold">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="text-slate-400 hover:text-white">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(100)} className="text-slate-500 hover:text-slate-300 ml-1" title="Reset Zoom">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Autosave Status Badge */}
          <div className="ml-2 flex items-center gap-1.5 text-[10px] font-medium">
            {isDirty ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Unsaved changes...
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved {lastSavedAt ? `at ${lastSavedAt}` : 'just now'}
              </span>
            )}
          </div>
        </div>

        {/* Right Toolbar: Export & Synchronize Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintPDF}>
            <Printer className="w-4 h-4 mr-1.5" /> PDF / Print (Ctrl+P)
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDOCX}>
            <Download className="w-4 h-4 mr-1.5" /> Word DOC
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveToProfile} isLoading={isSavingProfile}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Synchronize (Ctrl+S)
          </Button>
        </div>
      </div>

      {/* 2. Top Precision A4 Ruler */}
      <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 text-[10px] font-mono text-slate-500 select-none no-print">
        <span>[Margin 15mm]</span>
        <span>0mm ---------- 50mm ---------- 100mm ---------- 150mm ---------- 210mm (A4 Sheet Width)</span>
        <span>[Margin 15mm]</span>
      </div>

      {/* 3. Main Sheet Workspace (Scrollable viewport) */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center bg-slate-950/90 custom-scrollbar">
        <motion.div
          layout
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: fontFamilyMap[font] || 'sans-serif',
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
          }}
          className="relative"
        >
          {/* Hover Template Preview Floating Pill Indicator */}
          {hoveredTemplate && (
            <div className="absolute -top-7 left-0 right-0 text-center text-xs font-bold text-brand-400 bg-brand-950/80 border border-brand-500/30 rounded-lg py-0.5 no-print z-30">
              ⚡ Hover Previewing Layout: <span className="uppercase">{hoveredTemplate}</span>
            </div>
          )}

          {/* Real A4 Sheet Canvas with Paper Lifting Hover Elevation */}
          <div
            id="resume-preview-canvas"
            className={`resume-preview-sheet layout-${activeLayout} theme-${colorTheme} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)]`}
            style={{
              '--theme-primary': primaryAccent,
              '--font-size-base': `${fontSize}px`,
              '--line-height-base': lineHeight,
              '--section-gap': `${sectionGap}px`,
              '--border-radius': `${borderRadius}px`,
            }}
          >
            {/* Common Document Header */}
            <div className="resume-header flex flex-col md:flex-row justify-between items-start border-b pb-4 mb-4" style={{ borderColor: `${primaryAccent}40` }}>
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: primaryAccent }}>
                  {personal.fullName || 'Candidate Full Name'}
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1">
                  {experience[0]?.title || 'Professional Title'}
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-600 dark:text-slate-400 flex flex-col gap-1 mt-2 md:mt-0">
                {personal.email && <span className="flex items-center gap-1 justify-end"><Mail className="w-3.5 h-3.5" style={{ color: primaryAccent }} /> {personal.email}</span>}
                {personal.phone && <span className="flex items-center gap-1 justify-end"><Phone className="w-3.5 h-3.5" style={{ color: primaryAccent }} /> {personal.phone}</span>}
                {personal.location && <span className="flex items-center gap-1 justify-end"><MapPin className="w-3.5 h-3.5" style={{ color: primaryAccent }} /> {personal.location}</span>}
                {personal.website && <span className="flex items-center gap-1 justify-end"><Globe className="w-3.5 h-3.5" style={{ color: primaryAccent }} /> {personal.website}</span>}
              </div>
            </div>

            {/* Dynamic Ordered Sections Rendering */}
            <div className="resume-body-content space-y-5">
              {sectionOrder.map((secKey) => {
                if (!enabledSections.has(secKey)) return null;

                // 1. Professional Summary Section
                if (secKey === 'summary' && summary) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('summary')} Professional Summary
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{summary}</p>
                    </div>
                  );
                }

                // 2. Work Experience Section
                if (secKey === 'experience' && experience.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-3 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('experience')} Work History & Experience
                      </h3>
                      <div className="space-y-3">
                        {experience.map((exp, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <strong className="text-slate-900 dark:text-white font-bold">{exp.title} — {exp.company}</strong>
                              <span className="text-slate-500 font-mono text-[10px]">
                                {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 3. Education Section
                if (secKey === 'education' && education.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-3 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('education')} Education
                      </h3>
                      <div className="space-y-2">
                        {education.map((edu, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-slate-900 dark:text-white font-semibold">{edu.degree} in {edu.fieldOfStudy}</strong>
                              <span className="text-slate-500 block text-[11px]">{edu.institution}</span>
                            </div>
                            <span className="text-slate-400 text-[11px] font-mono">{edu.endYear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 4. Projects Section
                if (secKey === 'projects' && projects.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-3 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('projects')} Key Projects
                      </h3>
                      <div className="space-y-2.5">
                        {projects.map((proj, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between items-center text-xs">
                              <strong className="text-slate-900 dark:text-white font-bold">{proj.title}</strong>
                              {proj.link && <span className="text-blue-500 text-[10px] font-mono">{proj.link}</span>}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 5. Skills Section
                if (secKey === 'skills' && skills.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('skills')} Skills & Expertise
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded border"
                            style={{
                              backgroundColor: `${primaryAccent}15`,
                              borderColor: `${primaryAccent}30`,
                              color: primaryAccent,
                              borderRadius: `${borderRadius}px`,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 6. Certifications Section
                if (secKey === 'certifications' && certifications.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('certifications')} Certifications & Credentials
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {certifications.map((cert, i) => (
                          <div key={i} className="text-xs">
                            <strong className="text-slate-900 dark:text-white block font-semibold">{cert.name}</strong>
                            <span className="text-slate-500 text-[11px]">{cert.issuer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 7. Languages Section
                if (secKey === 'languages' && languages && languages.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('languages')} Languages
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {languages.map((lang, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 8. Interests Section
                if (secKey === 'interests' && interests && interests.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('interests')} Interests & Activities
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {interests.map((item, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 9. References Section
                if (secKey === 'references' && references && references.length > 0) {
                  return (
                    <div key={secKey} className="resume-section" style={{ marginBottom: `${sectionGap}px` }}>
                      <h3 className="resume-section-title flex items-center font-bold text-sm uppercase mb-2 pb-1 border-b" style={{ color: primaryAccent, borderColor: `${primaryAccent}30` }}>
                        {getSectionIcon('references')} References
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {references.map((ref, i) => (
                          <div key={i} className="text-xs">
                            <strong className="text-slate-900 dark:text-white block font-semibold">{ref.name}</strong>
                            <span className="text-slate-500 text-[11px] block">{ref.company}</span>
                            <span className="text-slate-400 text-[10px]">{ref.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* A4 Page Break Indicator Line & Page Number Badge */}
            <div className="mt-12 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between items-center text-[10px] font-mono text-slate-400 no-print">
              <span>--- A4 Page Break Guide ---</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Page 1 of 1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
