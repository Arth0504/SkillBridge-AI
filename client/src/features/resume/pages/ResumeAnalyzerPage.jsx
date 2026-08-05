import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Upload, CheckCircle2, AlertTriangle, FileText, History, Trash2 } from 'lucide-react';
import { Button, Badge, Loader, Textarea } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';

export const ResumeAnalyzerPage = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // Fetch Resume Analysis History
  const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['candidate-resume-history'],
    queryFn: candidateApi.getResumeHistory,
  });

  const history = historyResponse?.data?.history || [];

  // Analyze Resume Mutation
  const analyzeMutation = useMutation({
    mutationFn: candidateApi.analyzeResume,
    onSuccess: (data) => {
      toast.success('Resume analyzed successfully by Gemini AI!');
      queryClient.invalidateQueries({ queryKey: ['candidate-resume-history'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-dashboard-summary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Resume analysis failed.');
    },
  });

  // Delete History Record Mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: candidateApi.deleteResumeHistory,
    onSuccess: () => {
      toast.success('Resume analysis log deleted.');
      queryClient.invalidateQueries({ queryKey: ['candidate-resume-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    },
  });

  const handleRunAudit = () => {
    if (!selectedFile && !resumeText.trim()) {
      toast.error('Please upload a PDF resume file or paste your resume text.');
      return;
    }

    if (selectedFile) {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      analyzeMutation.mutate(formData);
    } else {
      analyzeMutation.mutate({ resumeText, jobDescription });
    }
  };

  const currentAnalysis = analyzeMutation.data?.data?.analysis || history[0]?.analysisResult || history[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Sparkles className="w-7 h-7" />
          </div>
          AI Resume & ATS Analyzer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload your CV to get instant ATS breakdown, keyword alignment, missing skills detection, and AI suggestions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/40 pb-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upload'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          <Upload className="w-4 h-4" /> Run New Audit
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          <History className="w-4 h-4" /> Past Analysis Logs ({history.length})
        </button>
      </div>

      {/* Tab 1: Upload & Audit */}
      {activeTab === 'upload' && (
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-2xl space-y-6 border border-brand-500/10 dark:border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-500" /> Upload PDF or Paste Resume Text
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121A2A]/20 text-center space-y-3 flex flex-col justify-center items-center min-h-[180px]">
                <FileText className="w-10 h-10 text-brand-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Select PDF Resume File</p>
                  <p className="text-[11px] text-slate-400">Drag & drop or browse computer</p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors">
                  {selectedFile ? selectedFile.name : 'Choose File'}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {/* Job Description Optional Match */}
              <div className="space-y-2">
                <Textarea
                  label="Target Job Description (Optional for Match %)"
                  rows={5}
                  placeholder="Paste target job description to get keyword gap analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center h-11"
              isLoading={analyzeMutation.isPending}
              onClick={handleRunAudit}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Run Gemini AI Resume Audit
            </Button>
          </div>

          {/* Results Display */}
          {currentAnalysis && (() => {
            const atsData = currentAnalysis.aiResponse?.atsAnalysis || currentAnalysis.atsAnalysis || currentAnalysis;
            const scoreVal = currentAnalysis.atsScore || atsData.overallAtsScore || currentAnalysis.score || 75;
            const summaryVal = currentAnalysis.summary || atsData.resumeSummary || atsData.recruiterImpression || currentAnalysis.extractedText || 'Detailed ATS resume analysis complete.';
            const strengthsArr = (currentAnalysis.strengths && currentAnalysis.strengths.length > 0) ? currentAnalysis.strengths : (atsData.strengths || []);
            const weaknessesArr = (currentAnalysis.weaknesses && currentAnalysis.weaknesses.length > 0) ? currentAnalysis.weaknesses : (atsData.weaknesses || atsData.top5Improvements || atsData.improvementSuggestions || []);
            const missingSkillsArr = currentAnalysis.missingSkills || atsData.skillMatch?.missingSkills || atsData.keywordAnalysis?.missingKeywords || [];

            return (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/40 pb-6">
                  <div>
                    <Badge variant="purple" icon={Sparkles}>
                      Gemini AI ATS Compatibility
                    </Badge>
                    <h2 className="text-3xl font-black text-slate-850 dark:text-white mt-1">
                      Score: <span className="gradient-text">{scoreVal}/100</span>
                    </h2>
                  </div>
                  <Badge variant="success" size="lg">
                    Ready for Job Applications
                  </Badge>
                </div>

                {/* Executive Summary */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Executive Summary</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl leading-relaxed border border-slate-200/50 dark:border-slate-800/30">
                    {summaryVal}
                  </p>

                  {/* Strengths & Weaknesses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {strengthsArr.length > 0 && (
                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                        <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Strong Key Highlights
                        </h5>
                        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-4">
                          {strengthsArr.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {weaknessesArr.length > 0 && (
                      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                        <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Recommended Enhancements
                        </h5>
                        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-4">
                          {weaknessesArr.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Missing Skills */}
                  {missingSkillsArr.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Detected Skill Gaps for Target Role:</h4>
                      <div className="flex flex-wrap gap-2">
                        {missingSkillsArr.map((sk, i) => (
                          <Badge key={i} variant="warning">
                            {sk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: Audit History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No past resume audit records found.</p>
          ) : (
            history.map((record, idx) => (
              <div key={record._id || idx} className="glass-card p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center hover:shadow-premium-hover dark:hover:shadow-premium-dark-hover transition-all duration-300">
                <div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                    Resume Audit Score: {record.atsScore || record.score || 90}/100
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Scanned on {new Date(record.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                  onClick={() => deleteHistoryMutation.mutate(record._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

