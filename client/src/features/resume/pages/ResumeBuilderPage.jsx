import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';
import { ResumeLeftPanel } from '../components/ResumeLeftPanel';
import { ResumeCenterCanvas } from '../components/ResumeCenterCanvas';
import { ResumeRightPanel } from '../components/ResumeRightPanel';
import '../styles/ResumeTemplates.css';

export const ResumeBuilderPage = () => {
  const queryClient = useQueryClient();

  // 1. Core Resume Data State
  const [personal, setPersonal] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [languages, setLanguages] = useState(['English (Native)', 'Spanish (Professional)']);
  const [interests, setInterests] = useState(['Open Source Development', 'Machine Learning', 'Cloud Architecture']);
  const [references, setReferences] = useState([]);

  // 2. Section Ordering & Toggle State
  const [sectionOrder, setSectionOrder] = useState([
    'personal',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'languages',
    'interests',
    'references',
  ]);

  const [enabledSections, setEnabledSections] = useState(
    new Set(['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages'])
  );

  const toggleSection = (secKey) => {
    setEnabledSections((prev) => {
      const next = new Set(prev);
      if (next.has(secKey)) next.delete(secKey);
      else next.add(secKey);
      return next;
    });
    setIsDirty(true);
  };

  // 3. Design Tokens & Styling Customizations
  const [layout, setLayout] = useState('modern');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [colorTheme, setColorTheme] = useState('navy');
  const [customAccentColor, setCustomAccentColor] = useState('');
  const [font, setFont] = useState('sans');
  const [fontSize, setFontSize] = useState(13);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [sectionGap, setSectionGap] = useState(16);
  const [borderRadius, setBorderRadius] = useState(4);
  const [showIcons, setShowIcons] = useState(true);

  // 4. Viewport & Workspace Controls
  const [zoom, setZoom] = useState(100);
  const [activeRightTab, setActiveRightTab] = useState('templates');
  const [aiTarget, setAiTarget] = useState({ section: 'summary', index: null });

  // 5. Autosave & Unsaved Changes Status State
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');

  // 6. Undo / Redo History Stack
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = React.useRef(-1);
  historyIndexRef.current = historyIndex;

  // Push snapshot to undo stack safely without triggering infinite render loop
  const pushStateToHistory = useCallback((snapshot) => {
    setHistory((prev) => {
      const idx = historyIndexRef.current;
      const updated = prev.slice(0, idx + 1);
      return [...updated, snapshot];
    });
    setHistoryIndex((prev) => prev + 1);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const prevIdx = historyIndex - 1;
    const targetState = history[prevIdx];
    if (targetState) {
      setPersonal(targetState.personal);
      setSummary(targetState.summary);
      setSkills(targetState.skills);
      setExperience(targetState.experience);
      setEducation(targetState.education);
      setProjects(targetState.projects);
      setCertifications(targetState.certifications);
      setHistoryIndex(prevIdx);
      setIsDirty(true);
    }
  }, [canUndo, historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const nextIdx = historyIndex + 1;
    const targetState = history[nextIdx];
    if (targetState) {
      setPersonal(targetState.personal);
      setSummary(targetState.summary);
      setSkills(targetState.skills);
      setExperience(targetState.experience);
      setEducation(targetState.education);
      setProjects(targetState.projects);
      setCertifications(targetState.certifications);
      setHistoryIndex(nextIdx);
      setIsDirty(true);
    }
  }, [canRedo, historyIndex, history]);

  // 7. Fetch candidate profile data on mount to auto-populate (Single hydration guard)
  const { data: profileResponse } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: candidateApi.getProfile,
  });

  const hasHydratedProfileRef = React.useRef(false);

  useEffect(() => {
    if (hasHydratedProfileRef.current) return;

    if (profileResponse?.success && profileResponse?.data) {
      hasHydratedProfileRef.current = true;
      const p = profileResponse.data.profile || profileResponse.data;
      const initialPersonal = {
        fullName: p.fullName || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        website: p.socialLinks?.portfolio || p.socialLinks?.github || '',
      };
      setPersonal(initialPersonal);
      setSummary(p.bio || '');
      setSkills(p.skills || []);
      setExperience(p.experience || []);
      setEducation(p.education || []);
      setProjects(p.projects || []);
      setCertifications(p.certifications || []);

      if (p.resumeTemplate) {
        if (p.resumeTemplate.layout) setLayout(p.resumeTemplate.layout);
        if (p.resumeTemplate.colorTheme) setColorTheme(p.resumeTemplate.colorTheme);
        if (p.resumeTemplate.font) setFont(p.resumeTemplate.font);
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(timeStr);
      setIsDirty(false);

      // Initial history snapshot
      const initialSnapshot = {
        personal: initialPersonal,
        summary: p.bio || '',
        skills: p.skills || [],
        experience: p.experience || [],
        education: p.education || [],
        projects: p.projects || [],
        certifications: p.certifications || [],
      };
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    }
  }, [profileResponse]);

  // 8. React Query AI & Profile Mutations
  const suggestMutation = useMutation({
    mutationFn: candidateApi.suggestResumeContent,
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        toast.success('AI suggestions generated successfully!');
      } else {
        toast.error(data?.message || 'AI suggestion failed.');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'AI suggestion failed.');
    },
  });

  const grammarMutation = useMutation({
    mutationFn: candidateApi.checkResumeGrammar,
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        toast.success('Grammar scan complete.');
      } else {
        toast.error(data?.message || 'Grammar review failed.');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Grammar review failed.');
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: candidateApi.updateProfile,
    onSuccess: () => {
      toast.success('Resume details synchronized to candidate profile!');
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      setIsDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  // 9. ATS Score Calculation
  const atsScore = useMemo(() => {
    let score = 40;
    if (personal?.fullName && personal?.email && personal?.phone) score += 10;
    const summaryWords = (summary || '').trim().split(/\s+/).filter(Boolean);
    if (summaryWords.length >= 25) score += 10;
    const validEdu = (education || []).filter((e) => e?.institution?.trim() || e?.degree?.trim());
    if (validEdu.length > 0) score += 15;
    const validExp = (experience || []).filter((e) => e?.company?.trim() || e?.title?.trim());
    if (validExp.length > 0) score += 15;
    const validSkills = (skills || []).filter((s) => typeof s === 'string' && s.trim());
    if (validSkills.length >= 5) score += 10;
    const validProj = (projects || []).filter((p) => p?.title?.trim() || p?.description?.trim());
    if (validProj.length > 0) score += 10;
    const validCert = (certifications || []).filter((c) => c?.name?.trim() || c?.issuer?.trim());
    if (validCert.length > 0) score += 5;
    return Math.min(100, score);
  }, [personal, summary, education, experience, skills, projects, certifications]);

  // Exporters & Save handlers
  const handlePrintPDF = useCallback(() => window.print(), []);

  const handleSaveToProfile = useCallback(() => {
    saveProfileMutation.mutate({
      fullName: personal.fullName,
      phone: personal.phone,
      location: personal.location,
      bio: summary,
      skills,
      experience,
      education,
      projects,
      certifications,
      resumeTemplate: { layout, colorTheme, font },
    });
  }, [personal, summary, skills, experience, education, projects, certifications, layout, colorTheme, font, saveProfileMutation]);

  const handleExportDOCX = useCallback(() => {
    const rawCanvas = document.getElementById('resume-preview-canvas');
    if (!rawCanvas) return;

    let htmlContent = rawCanvas.innerHTML;
    const themeColors = { navy: '#1e3a8a', slate: '#334155', emerald: '#064e3b', burgundy: '#581c87', charcoal: '#0f172a' };
    const primaryHex = customAccentColor || themeColors[colorTheme] || '#1e3a8a';
    htmlContent = htmlContent.replace(/var\(--theme-primary\)/g, primaryHex);

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><title>Resume</title><style>body { font-family: Arial, sans-serif; line-height: 1.4; color: #1e293b; } h1 { font-size: 20pt; color: ${primaryHex}; } h3 { font-size: 14pt; border-bottom: 1px solid #cbd5e1; color: ${primaryHex}; }</style></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (personal.fullName || 'Candidate').trim().replace(/\s+/g, '_');
    a.download = `${cleanName}_Resume.doc`;
    a.click();
  }, [customAccentColor, colorTheme, personal.fullName]);

  // 10. Global Keyboard Shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveToProfile();
      } else if (modifier && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRedo();
      } else if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (modifier && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrintPDF();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveToProfile, handleUndo, handleRedo, handlePrintPDF]);

  // AI Trigger Helpers
  const handleTriggerAISuggestions = (section, contextText, index = null) => {
    if (!contextText || !contextText.trim()) {
      toast.error('Please enter some context or draft first to help AI suggestions.');
      return;
    }
    setAiTarget({ section, index });
    suggestMutation.mutate({ section, context: contextText });
  };

  const handleTriggerGrammarCheck = (textToReview, section = 'summary', index = null) => {
    if (!textToReview || !textToReview.trim()) {
      toast.error('Enter some text to run the grammar scanner.');
      return;
    }
    setAiTarget({ section, index });
    grammarMutation.mutate({ text: textToReview });
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 3-Panel Canva-Style Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Panel 1: Left Form & Section Navigator (3 Cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <ResumeLeftPanel
            personal={personal}
            setPersonal={(val) => { setPersonal(val); setIsDirty(true); }}
            summary={summary}
            setSummary={(val) => { setSummary(val); setIsDirty(true); }}
            skills={skills}
            setSkills={(val) => { setSkills(val); setIsDirty(true); }}
            experience={experience}
            setExperience={(val) => { setExperience(val); setIsDirty(true); }}
            education={education}
            setEducation={(val) => { setEducation(val); setIsDirty(true); }}
            projects={projects}
            setProjects={(val) => { setProjects(val); setIsDirty(true); }}
            certifications={certifications}
            setCertifications={(val) => { setCertifications(val); setIsDirty(true); }}
            languages={languages}
            setLanguages={(val) => { setLanguages(val); setIsDirty(true); }}
            interests={interests}
            setInterests={(val) => { setInterests(val); setIsDirty(true); }}
            references={references}
            setReferences={(val) => { setReferences(val); setIsDirty(true); }}
            sectionOrder={sectionOrder}
            setSectionOrder={(val) => { setSectionOrder(val); setIsDirty(true); }}
            enabledSections={enabledSections}
            toggleSection={toggleSection}
            handleTriggerAISuggestions={handleTriggerAISuggestions}
            handleTriggerGrammarCheck={handleTriggerGrammarCheck}
            suggestMutation={suggestMutation}
            grammarMutation={grammarMutation}
            aiTarget={aiTarget}
          />
        </div>

        {/* Panel 2: Center Live A4 Editable Canvas (6 Cols) */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <ResumeCenterCanvas
            personal={personal}
            summary={summary}
            skills={skills}
            experience={experience}
            education={education}
            projects={projects}
            certifications={certifications}
            languages={languages}
            interests={interests}
            references={references}
            sectionOrder={sectionOrder}
            enabledSections={enabledSections}
            layout={layout}
            hoveredTemplate={hoveredTemplate}
            colorTheme={colorTheme}
            customAccentColor={customAccentColor}
            font={font}
            fontSize={fontSize}
            lineHeight={lineHeight}
            sectionGap={sectionGap}
            borderRadius={borderRadius}
            showIcons={showIcons}
            zoom={zoom}
            setZoom={setZoom}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            handlePrintPDF={handlePrintPDF}
            handleExportDOCX={handleExportDOCX}
            handleSaveToProfile={handleSaveToProfile}
            isSavingProfile={saveProfileMutation.isPending}
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
          />
        </div>

        {/* Panel 3: Right Design & AI Customization Suite (3 Cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <ResumeRightPanel
            activeRightTab={activeRightTab}
            setActiveRightTab={setActiveRightTab}
            layout={layout}
            setLayout={(val) => { setLayout(val); setIsDirty(true); }}
            setHoveredTemplate={setHoveredTemplate}
            colorTheme={colorTheme}
            setColorTheme={(val) => { setColorTheme(val); setIsDirty(true); }}
            customAccentColor={customAccentColor}
            setCustomAccentColor={(val) => { setCustomAccentColor(val); setIsDirty(true); }}
            font={font}
            setFont={(val) => { setFont(val); setIsDirty(true); }}
            fontSize={fontSize}
            setFontSize={setFontSize}
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            sectionGap={sectionGap}
            setSectionGap={setSectionGap}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            showIcons={showIcons}
            setShowIcons={setShowIcons}
            atsScore={atsScore}
            summary={summary}
            experience={experience}
            skills={skills}
            education={education}
            projects={projects}
            certifications={certifications}
            handleTriggerAISuggestions={handleTriggerAISuggestions}
            handleTriggerGrammarCheck={handleTriggerGrammarCheck}
            suggestMutation={suggestMutation}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
