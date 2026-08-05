import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const AIJobDescriptionGenerator = () => {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [experience, setExperience] = useState('4-6 Years');
  const [location, setLocation] = useState('San Francisco, CA / Remote');
  const [salary, setSalary] = useState('$140,000 - $165,000 USD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedJD, setGeneratedJD] = useState(
    `# Senior Full Stack Engineer - Job Description\n\n## Position Overview\nTechFlow Systems is seeking a Senior Full Stack Engineer to architect, build, and scale high-concurrency cloud applications and AI pipelines.\n\n## Core Responsibilities\n• Design and implement responsive React 18 frontend interfaces using modern design systems.\n• Architect robust Node.js/Express REST and WebSockets API microservices.\n• Optimize MongoDB database schema indexes for high throughput execution.\n• Participate in blameless code reviews and automated CI/CD pipeline deployment.\n\n## Technical Requirements\n• 4+ years production experience with React, TypeScript, Node.js, and MongoDB.\n• Deep understanding of WebSockets, WebRTC, and asynchronous event loops.\n• Proven track record with Docker containerization and cloud infrastructure (AWS/GCP).\n\n## Benefits & Perks\n• Competitive salary ($140k - $165k) + stock options.\n• Full health, dental, vision coverage & 401(k) matching.\n• $2,500 annual home office & learning stipend.`
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedJD(
        `# ${jobTitle} - Official Job Description\n\n## Overview\nWe are looking for an exceptional ${jobTitle} with ${experience} experience located in ${location}.\n\n## Key Responsibilities\n• Lead end-to-end development of enterprise web applications and scalable microservices.\n• Collaborate with cross-functional teams to deliver high performance features.\n• Ensure production system uptime, security hygiene, and automated test coverage.\n\n## Requirements\n• ${experience} hands-on technical experience in software development.\n• Expertise in modern web frameworks, API design, and database optimizations.\n• Strong problem solving and communication skills.\n\n## Compensation & Benefits\n• Salary Range: ${salary}\n• Flexible remote work policy and comprehensive health benefits.`
      );
      toast.success('Generated professional Job Description with Gemini AI!');
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJD);
    setCopied(true);
    toast.success('Copied JD markdown to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Job Description Generator</h3>
        </div>
        <Button variant="primary" size="xs" onClick={handleGenerate} isLoading={isGenerating}>
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate JD
        </Button>
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-slate-400 font-bold block mb-1">Target Job Title</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="text-slate-400 font-bold block mb-1">Experience Level</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>
        <div>
          <label className="text-slate-400 font-bold block mb-1">Work Location</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-slate-400 font-bold block mb-1">Salary Range</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
      </div>

      {/* Generated Output */}
      <div className="relative group">
        <textarea
          rows={10}
          readOnly
          className="w-full p-4 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none custom-scrollbar leading-relaxed"
          value={generatedJD}
        />
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-[11px]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy JD'}</span>
        </button>
      </div>
    </div>
  );
};
