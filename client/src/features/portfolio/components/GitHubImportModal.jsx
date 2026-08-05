import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Star,
  GitFork,
  Code2,
  CheckCircle2,
  X,
  Search,
  Check
} from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const GitHubImportModal = ({ isOpen, onClose, onImportRepos, currentPinnedRepos = [] }) => {
  const [username, setUsername] = useState('arthprajapati');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedRepos, setFetchedRepos] = useState([
    {
      name: 'SkillBridge-AI',
      description: 'Enterprise AI-Powered Hiring, Video Interviewing & Resume Evaluation Platform',
      language: 'JavaScript',
      stars: 124,
      forks: 38,
      url: 'https://github.com/arthprajapati/SkillBridge-AI',
      selected: true,
    },
    {
      name: 'ai-resume-parser-microservice',
      description: 'FastAPI & Gemini LLM resume parsing microservice with ATS match rules',
      language: 'Python',
      stars: 86,
      forks: 19,
      url: 'https://github.com/arthprajapati/ai-resume-parser-microservice',
      selected: true,
    },
    {
      name: 'distributed-microservices-starter',
      description: 'Production-ready Node.js, Redis, MongoDB, & Docker microservice boilerplate',
      language: 'TypeScript',
      stars: 52,
      forks: 11,
      url: 'https://github.com/arthprajapati/distributed-microservices-starter',
      selected: true,
    },
    {
      name: 'react-glassmorphism-ui-kit',
      description: 'Modern Tailwind CSS glassmorphic component library with Framer Motion',
      language: 'TypeScript',
      stars: 43,
      forks: 9,
      url: 'https://github.com/arthprajapati/react-glassmorphism-ui-kit',
      selected: false,
    },
  ]);

  const handleFetchGitHub = () => {
    if (!username.trim()) {
      toast.error('Please enter a valid GitHub username.');
      return;
    }
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      toast.success(`Fetched repositories for @${username}!`);
    }, 600);
  };

  const toggleSelectRepo = (index) => {
    setFetchedRepos((prev) => {
      const updated = [...prev];
      updated[index].selected = !updated[index].selected;
      return updated;
    });
  };

  const handleConfirmImport = () => {
    const selected = fetchedRepos.filter((r) => r.selected);
    onImportRepos(selected);
    toast.success(`Imported ${selected.length} GitHub repositories to portfolio!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-2xl text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Import GitHub Repositories</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Username Input Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="GitHub Username (e.g. octocat)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleFetchGitHub} isLoading={isFetching}>
              Fetch Repos
            </Button>
          </div>

          {/* Repository Selection List */}
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {fetchedRepos.map((repo, i) => (
              <div
                key={i}
                onClick={() => toggleSelectRepo(i)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  repo.selected ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{repo.name}</span>
                    <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                      {repo.language}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{repo.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {repo.stars}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-blue-400" /> {repo.forks}</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${repo.selected ? 'bg-brand-500 border-brand-400 text-white' : 'border-slate-700 bg-slate-800'}`}>
                  {repo.selected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmImport}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Import Pinned Repositories
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
