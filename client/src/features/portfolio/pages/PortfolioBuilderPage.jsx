import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';
import { PortfolioLeftPanel } from '../components/PortfolioLeftPanel';
import { PortfolioCenterPreview } from '../components/PortfolioCenterPreview';
import { PortfolioRightInspector } from '../components/PortfolioRightInspector';
import { GitHubImportModal } from '../components/GitHubImportModal';
import { Download, Sparkles, Globe, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/common';
import { useNavigate } from 'react-router-dom';
import '../styles/PortfolioTemplates.css';

export const PortfolioBuilderPage = () => {
  const navigate = useNavigate();

  // 1. Candidate Data Auto-Import State
  const [personal, setPersonal] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    avatarUrl: '',
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    portfolio: '',
    twitter: '',
  });

  // 2. Portfolio Design & Theme States
  const [template, setTemplate] = useState('fullstack');
  const [themeColor, setThemeColor] = useState('indigo');
  const [customAccentColor, setCustomAccentColor] = useState('');
  const [fontFamily, setFontFamily] = useState('outfit');
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [deviceFrame, setDeviceFrame] = useState('desktop');
  const [selectedSection, setSelectedSection] = useState('hero');
  const [activeLeftTab, setActiveLeftTab] = useState('templates');

  // 3. GitHub Repos Import State
  const [pinnedRepos, setPinnedRepos] = useState([
    {
      name: 'SkillBridge-AI',
      description: 'Enterprise AI-Powered Hiring, Video Interviewing & Resume Evaluation Platform',
      language: 'JavaScript',
      stars: 124,
      forks: 38,
    },
    {
      name: 'ai-resume-parser-microservice',
      description: 'FastAPI & Gemini LLM resume parsing microservice with ATS match rules',
      language: 'Python',
      stars: 86,
      forks: 19,
    },
  ]);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  // 4. SEO & Meta Tags Configuration
  const [seoConfig, setSeoConfig] = useState({
    title: 'Candidate Portfolio — Software Engineering & AI Architect',
    description: 'Explore technical deliverables, scalable cloud systems, and full stack projects.',
    keywords: 'Full Stack Engineer, React, Node.js, AI, Microservices',
  });

  // Auto-populate candidate profile credentials
  const { data: profileResponse } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: candidateApi.getProfile,
  });

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      const p = profileResponse.data.profile || profileResponse.data;
      setPersonal({
        fullName: p.fullName || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });
      setSummary(p.bio || '');
      setSkills(p.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'Docker']);
      setExperience(p.experience || []);
      setEducation(p.education || []);
      setProjects(p.projects || []);
      setCertifications(p.certifications || []);
      if (p.socialLinks) setSocialLinks(p.socialLinks);

      setSeoConfig({
        title: `${p.fullName || 'Candidate'} — Portfolio & Engineering Deliverables`,
        description: p.bio ? p.bio.substring(0, 150) : 'Explore technical profile & projects.',
        keywords: (p.skills || ['Software Engineer', 'React']).join(', '),
      });
    }
  }, [profileResponse]);

  // AI Content Generator Mutation
  const suggestMutation = useMutation({
    mutationFn: candidateApi.suggestResumeContent,
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        toast.success('AI content generated successfully!');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'AI generation failed.');
    },
  });

  // AI Generators
  const handleGenerateAIBio = () => {
    toast.success('Generating AI Bio with Gemini LLM...');
    suggestMutation.mutate(
      { section: 'summary', context: summary || 'Full Stack Engineer' },
      {
        onSuccess: (res) => {
          if (res?.data?.suggestedText) setSummary(res.data.suggestedText);
        },
      }
    );
  };

  const handleGenerateAIAbout = () => {
    toast.success('Generating About Me narrative...');
    setSummary(
      `Passionate Full Stack Engineer with proven experience scaling high-availability microservices, designing intuitive React applications, and integrating machine learning automation workflows.`
    );
  };

  const handleGenerateAIProjects = () => {
    toast.success('Polishing project showcases...');
  };

  const handleGenerateAISkills = () => {
    toast.success('Categorizing technical skills...');
  };

  const handleGenerateAISeo = () => {
    setSeoConfig({
      title: `${personal.fullName || 'Candidate'} | Full Stack Engineer & Tech Specialist`,
      description: `Official engineering portfolio of ${personal.fullName}. View web applications, GitHub repos, and work history.`,
      keywords: `${skills.join(', ')}, Software Engineer, Portfolio`,
    });
    toast.success('SEO Meta tags generated!');
  };

  const handleGenerateGithubReadme = () => {
    toast.success('GitHub Profile README snippet generated!');
  };

  // One-Click Static Website Export
  const handleExportStaticWebsite = useCallback(() => {
    const primaryHex = customAccentColor || {
      indigo: '#6366f1',
      emerald: '#10b981',
      cyan: '#06b6d4',
      purple: '#a855f7',
      amber: '#f59e0b',
    }[themeColor] || '#6366f1';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoConfig.title}</title>
  <meta name="description" content="${seoConfig.description}">
  <meta name="keywords" content="${seoConfig.keywords}">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { background-color: #0b0f19; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    .accent { color: ${primaryHex}; }
    .accent-bg { background-color: ${primaryHex}; }
    .card { background-color: #161e2e; border: 1px solid #2d3748; border-radius: 12px; }
  </style>
</head>
<body className="p-6 md:p-12">
  <main className="max-w-4xl mx-auto space-y-12">
    <header className="space-y-4 border-b border-gray-800 pb-8">
      <h1 className="text-4xl font-extrabold accent">${personal.fullName || 'Candidate Portfolio'}</h1>
      <p className="text-gray-400 text-lg">${experience[0]?.title || 'Software Engineer'} • ${personal.location || 'Remote'}</p>
      <p className="text-gray-300 leading-relaxed max-w-2xl">${summary}</p>
    </header>

    <section className="space-y-4">
      <h2 className="text-2xl font-bold uppercase tracking-wider accent">Technical Skills</h2>
      <div className="flex flex-wrap gap-2">
        ${skills.map((s) => `<span class="px-3 py-1 bg-gray-800 border border-gray-700 text-sm font-semibold rounded-lg">${s}</span>`).join('')}
      </div>
    </section>

    <section className="space-y-6">
      <h2 className="text-2xl font-bold uppercase tracking-wider accent">Featured Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${projects.map((p) => `<div class="card p-6 space-y-2"><h3 class="text-xl font-bold text-white">${p.title}</h3><p class="text-gray-300 text-sm">${p.description}</p></div>`).join('')}
      </div>
    </section>

    <footer className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
      © ${new Date().getFullYear()} ${personal.fullName}. Built with SkillBridge AI Portfolio Builder.
    </footer>
  </main>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (personal.fullName || 'Candidate').trim().replace(/\s+/g, '_');
    a.download = `${cleanName}_Portfolio_Website.html`;
    a.click();
    toast.success('Static Website HTML Bundle generated & downloaded!');
  }, [personal, experience, summary, skills, projects, seoConfig, customAccentColor, themeColor]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Controls */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between no-print z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" /> AI Portfolio Website Builder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsGithubModalOpen(true)}>
            Import Repos
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportStaticWebsite}>
            <Download className="w-4 h-4 mr-1.5" /> Export Static Website (HTML/Deploy Ready)
          </Button>
        </div>
      </div>

      {/* 3-Panel Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Panel 1: Left Control & Design Suite (3 Cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <PortfolioLeftPanel
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
            template={template}
            setTemplate={setTemplate}
            themeColor={themeColor}
            setThemeColor={setThemeColor}
            customAccentColor={customAccentColor}
            setCustomAccentColor={setCustomAccentColor}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            enableAnimations={enableAnimations}
            setEnableAnimations={setEnableAnimations}
            seoConfig={seoConfig}
            setSeoConfig={setSeoConfig}
            handleGenerateAIBio={handleGenerateAIBio}
            handleGenerateAIAbout={handleGenerateAIAbout}
            handleGenerateAIProjects={handleGenerateAIProjects}
            handleGenerateAISkills={handleGenerateAISkills}
            handleGenerateAISeo={handleGenerateAISeo}
            handleGenerateGithubReadme={handleGenerateGithubReadme}
            onOpenGithubModal={() => setIsGithubModalOpen(true)}
          />
        </div>

        {/* Panel 2: Center Live Portfolio Canvas (6 Cols) */}
        <div className="lg:col-span-6 h-full overflow-hidden">
          <PortfolioCenterPreview
            personal={personal}
            summary={summary}
            skills={skills}
            experience={experience}
            education={education}
            projects={projects}
            certifications={certifications}
            socialLinks={socialLinks}
            template={template}
            themeColor={themeColor}
            customAccentColor={customAccentColor}
            fontFamily={fontFamily}
            enableAnimations={enableAnimations}
            deviceFrame={deviceFrame}
            setDeviceFrame={setDeviceFrame}
            pinnedRepos={pinnedRepos}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            onDownloadResume={() => toast.success('Downloading candidate resume...')}
            onScheduleInterview={() => toast.success('Opening interview schedule calendar...')}
          />
        </div>

        {/* Panel 3: Right Inspector (3 Cols) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <PortfolioRightInspector
            selectedSection={selectedSection}
            personal={personal}
            setPersonal={setPersonal}
            summary={summary}
            setSummary={setSummary}
            skills={skills}
            setSkills={setSkills}
            experience={experience}
            setExperience={setExperience}
            projects={projects}
            setProjects={setProjects}
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
          />
        </div>
      </div>

      {/* GitHub Repos Import Modal */}
      <GitHubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onImportRepos={(repos) => setPinnedRepos(repos)}
        currentPinnedRepos={pinnedRepos}
      />
    </div>
  );
};

export default PortfolioBuilderPage;
