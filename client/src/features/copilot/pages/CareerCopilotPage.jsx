import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateApi } from '../../../api';
import { motion } from 'framer-motion';
import { CopilotMetricsOverview } from '../components/CopilotMetricsOverview';
import { CopilotInsightsCard } from '../components/CopilotInsightsCard';
import { CopilotRoadmapWidget } from '../components/CopilotRoadmapWidget';
import { CopilotSkillGapWidget } from '../components/CopilotSkillGapWidget';
import { CopilotInterviewAnalytics } from '../components/CopilotInterviewAnalytics';
import { CopilotJobMatchAnalytics } from '../components/CopilotJobMatchAnalytics';
import { CopilotCareerTimeline } from '../components/CopilotCareerTimeline';
import { CopilotProductivityWidget } from '../components/CopilotProductivityWidget';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/common';
import toast from 'react-hot-toast';

export const CareerCopilotPage = () => {
  const { data: profileResponse, refetch: refetchProfile, isFetching } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: candidateApi.getProfile,
  });

  const { data: appsResponse } = useQuery({
    queryKey: ['candidate-applications'],
    queryFn: candidateApi.getApplications,
  });

  const candidateProfile = profileResponse?.data?.profile || profileResponse?.data || {};
  const candidateSkills = candidateProfile.skills || ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git', 'Tailwind CSS'];
  const candidateApplications = appsResponse?.data?.applications || appsResponse?.data || [];

  const handleSyncCopilot = () => {
    refetchProfile();
    toast.success('AI Career Copilot synchronized with latest candidate telemetry!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      {/* Top Copilot Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-brand-400 animate-pulse" /> Enterprise AI Career Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate intelligence, skill gaps, learning roadmap, and job match analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleSyncCopilot} isLoading={isFetching}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Re-Sync Copilot Telemetry
          </Button>
        </div>
      </div>

      {/* 1. Overall Career Score & Readiness Gauges */}
      <CopilotMetricsOverview
        careerScore={88}
        resumeStrength={90}
        portfolioStrength={85}
        codingReadiness={82}
        interviewReadiness={86}
        profileCompletion={95}
        jobMatchScore={89}
        applicationSuccessRate={72}
        aiConfidence={94}
      />

      {/* 2. Main Analytics & Roadmaps 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Insights, Roadmap, Skill Gap, Interview Analytics */}
        <div className="lg:col-span-7 space-y-6">
          <CopilotInsightsCard />
          <CopilotRoadmapWidget />
          <CopilotSkillGapWidget candidateSkills={candidateSkills} />
          <CopilotInterviewAnalytics />
        </div>

        {/* Right Column (5 Cols): Job Match, Career Timeline, Productivity & Streaks */}
        <div className="lg:col-span-5 space-y-6">
          <CopilotJobMatchAnalytics applications={candidateApplications} />
          <CopilotCareerTimeline />
          <CopilotProductivityWidget />
        </div>
      </div>
    </div>
  );
};

export default CareerCopilotPage;
