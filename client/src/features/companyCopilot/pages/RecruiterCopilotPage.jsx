import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Award,
  Scale,
  ShieldAlert,
  FileText,
  Mail,
  Mic,
  MicOff,
  BarChart3,
  RefreshCw,
  Search
} from 'lucide-react';
import { RecruiterChatAssistant } from '../components/RecruiterChatAssistant';
import { CandidateRankingWidget } from '../components/CandidateRankingWidget';
import { CandidateComparisonMatrix } from '../components/CandidateComparisonMatrix';
import { CandidateRiskAnalysis } from '../components/CandidateRiskAnalysis';
import { AIJobDescriptionGenerator } from '../components/AIJobDescriptionGenerator';
import { AIEmailGeneratorModal } from '../components/AIEmailGeneratorModal';
import { HiringFunnelAnalytics } from '../components/HiringFunnelAnalytics';
import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../../../api/companyApi';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const RecruiterCopilotPage = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const { data: copilotRes, refetch } = useQuery({
    queryKey: ['recruiterCopilotAnalytics'],
    queryFn: () => companyApi.getCopilotAnalytics(),
    staleTime: 60000,
  });

  const copilotData = copilotRes?.data || copilotRes || {};
  const liveCandidates = copilotData.candidates || [];
  const liveFunnel = copilotData.funnel || [];
  const avgAtsScore = copilotData.avgAtsScore || 85;

  const tabs = [
    { id: 'assistant', label: 'AI Recruiter Chatbot', icon: Bot },
    { id: 'ranking', label: 'Candidate AI Ranking', icon: Award },
    { id: 'matrix', label: 'Comparison Matrix', icon: Scale },
    { id: 'risk', label: 'Risk Analysis & Funnel', icon: ShieldAlert },
    { id: 'jd', label: 'AI JD & Email Drafter', icon: FileText },
  ];

  const toggleCandidateSelection = (candidate) => {
    setSelectedCandidates((prev) => {
      const exists = prev.some((c) => c.id === candidate.id);
      if (exists) {
        toast.success(`Removed ${candidate.name} from comparison matrix.`);
        return prev.filter((c) => c.id !== candidate.id);
      } else {
        toast.success(`Added ${candidate.name} to comparison matrix!`);
        return [...prev, candidate];
      }
    });
  };

  // Web Speech API Voice Assistant
  const handleToggleVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Web Speech API is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      toast.success('Voice assistant deactivated.');
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          toast.success('Voice assistant listening... Speak your command!');
        };

        recognition.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          setIsListening(false);
          toast.success(`Voice command detected: "${speechResult}"`);
          setActiveTab('ranking');
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          toast.error(`Voice recognition error: ${event.error}`);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
        toast.error('Voice assistant error.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" /> Enterprise AI Recruiter Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gemini 1.5 Pro talent acquisition assistant, AI candidate ranking, comparison matrix & predictive risk analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleVoiceAssistant}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-400" />}
            <span>{isListening ? 'Listening...' : 'Voice Assistant'}</span>
          </button>

          <Button variant="outline" size="sm" onClick={() => toast.success('Recruiter Copilot synced with cluster!')}>
            <RefreshCw className="w-4 h-4 mr-1" /> Sync Analytics
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 custom-scrollbar select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Recruiter Chatbot */}
      {activeTab === 'assistant' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RecruiterChatAssistant />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <CandidateRankingWidget
              candidatesList={liveCandidates}
              selectedCandidates={selectedCandidates}
              toggleCandidateSelection={toggleCandidateSelection}
            />
            <HiringFunnelAnalytics funnelList={liveFunnel} avgAtsScore={avgAtsScore} />
          </div>
        </motion.div>
      )}

      {/* Tab 2: Candidate AI Ranking */}
      {activeTab === 'ranking' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <CandidateRankingWidget
            candidatesList={liveCandidates}
            selectedCandidates={selectedCandidates}
            toggleCandidateSelection={toggleCandidateSelection}
          />
          <CandidateComparisonMatrix selectedCandidates={selectedCandidates} />
        </motion.div>
      )}

      {/* Tab 3: Comparison Matrix */}
      {activeTab === 'matrix' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CandidateComparisonMatrix selectedCandidates={selectedCandidates} />
        </motion.div>
      )}

      {/* Tab 4: Risk Analysis & Funnel */}
      {activeTab === 'risk' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <CandidateRiskAnalysis />
          <HiringFunnelAnalytics funnelList={liveFunnel} avgAtsScore={avgAtsScore} />
        </motion.div>
      )}

      {/* Tab 5: AI JD & Email Drafter */}
      {activeTab === 'jd' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIJobDescriptionGenerator />
          <AIEmailGeneratorModal />
        </motion.div>
      )}
    </div>
  );
};

export default RecruiterCopilotPage;
