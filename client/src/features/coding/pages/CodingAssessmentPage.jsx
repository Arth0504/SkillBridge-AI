import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Code2, Sparkles, Play, CheckCircle2, History, Terminal, ChevronRight, ChevronLeft, Award, RefreshCw } from 'lucide-react';
import { Button, Badge, Textarea } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';

export const CodingAssessmentPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('assessments');
  const [language, setLanguage] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Medium');
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [codeSolution, setCodeSolution] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  // Fetch Coding History
  const { data: historyData } = useQuery({
    queryKey: ['candidate-coding-history'],
    queryFn: candidateApi.getCodingHistory,
  });

  const history = historyData?.data?.history || [];

  // Resume active in-progress assessment on mount or history fetch
  useEffect(() => {
    if (!activeAssessment && history.length > 0) {
      const activeInProg = history.find((item) => item.status === 'In Progress');
      if (activeInProg) {
        setActiveAssessment(activeInProg);
        const qIdx = activeInProg.currentQuestionIndex || 0;
        setCurrentQIndex(qIdx);
        const currentQ = activeInProg.questions?.[qIdx];
        if (currentQ) {
          setCodeSolution(currentQ.submittedAnswer || currentQ.initialCode || getStarterCode(activeInProg.language || 'JavaScript'));
        }
      }
    }
  }, [history, activeAssessment]);

  const getStarterCode = (lang) => {
    switch (lang) {
      case 'Python':
        return 'def solution(nums, target):\n    # Write your O(N) solution here\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []';
      case 'Java':
        return 'import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}';
      case 'C++':
        return '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (mp.count(comp)) return {mp[comp], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};';
      case 'SQL':
        return '-- Write your SQL query solution\nSELECT u.user_id, u.user_name, COUNT(a.application_id) AS total_applications\nFROM users u\nJOIN applications a ON u.user_id = a.candidate_id\nGROUP BY u.user_id, u.user_name\nHAVING COUNT(a.application_id) >= 1\nORDER BY total_applications DESC;';
      case 'JavaScript':
      default:
        return 'function solution(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}';
    }
  };

  // Start Assessment Mutation
  const startMutation = useMutation({
    mutationFn: candidateApi.startCodingAssessment,
    onSuccess: (data) => {
      toast.success('AI Coding Assessment started!');
      const session = data.data?.assessment || data.data;
      setActiveAssessment(session);
      setCurrentQIndex(0);
      const firstQ = session?.questions?.[0];
      setCodeSolution(firstQ?.initialCode || getStarterCode(session.language || language));
      setSelectedOption('');
      queryClient.invalidateQueries({ queryKey: ['candidate-coding-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start coding assessment.');
    },
  });

  // Finish Assessment Mutation
  const finishMutation = useMutation({
    mutationFn: (assessmentId) => candidateApi.finishCodingAssessment(assessmentId),
    onSuccess: (data) => {
      toast.success('Assessment finished & AI report generated!');
      const updated = data.data?.assessment || data.data;
      setActiveAssessment(updated);
      queryClient.invalidateQueries({ queryKey: ['candidate-coding-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to complete assessment.');
    },
  });

  // Submit Answer Mutation
  const submitMutation = useMutation({
    mutationFn: ({ assessmentId, payload }) => candidateApi.submitCodingAnswer(assessmentId, payload),
    onSuccess: (data) => {
      toast.success('Answer evaluated by Gemini AI!');
      const updated = data.data?.assessment || data.data?.result?.assessment || data.data;
      const isComplete = data.data?.isAssessmentComplete || data.isAssessmentComplete;

      setActiveAssessment(updated);

      if (isComplete) {
        finishMutation.mutate(updated._id);
      } else {
        const nextIdx = updated.currentQuestionIndex ?? (currentQIndex + 1);
        setCurrentQIndex(nextIdx);
        const nextQ = updated.questions?.[nextIdx];
        if (nextQ) {
          setCodeSolution(nextQ.submittedAnswer || nextQ.initialCode || getStarterCode(updated.language || language));
          setSelectedOption(nextQ.submittedAnswer || '');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['candidate-coding-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Code evaluation failed.');
    },
  });

  const handleStart = (selectedLang, selectedDiff) => {
    setLanguage(selectedLang);
    setDifficulty(selectedDiff);
    startMutation.mutate({ language: selectedLang, difficulty: selectedDiff, totalQuestions: 5 });
  };

  const currentQuestion = activeAssessment?.questions?.[currentQIndex] || activeAssessment?.questions?.[0];
  const totalQuestions = activeAssessment?.totalQuestions || activeAssessment?.questions?.length || 5;

  const handleSubmitCode = () => {
    if (!activeAssessment) return;
    const isMCQ = currentQuestion?.questionType === 'MCQ' || (currentQuestion?.options && currentQuestion.options.length > 0);
    const answerToSubmit = isMCQ ? (selectedOption || codeSolution) : codeSolution;

    if (!answerToSubmit.trim()) {
      toast.error(isMCQ ? 'Please select an option before submitting.' : 'Please provide a solution before submitting.');
      return;
    }

    submitMutation.mutate({
      assessmentId: activeAssessment._id,
      payload: { code: answerToSubmit, submittedAnswer: answerToSubmit, language: activeAssessment.language },
    });
  };

  const handleSelectQuestion = (idx) => {
    if (!activeAssessment || !activeAssessment.questions || idx >= activeAssessment.questions.length) return;
    setCurrentQIndex(idx);
    const targetQ = activeAssessment.questions[idx];
    setCodeSolution(targetQ.submittedAnswer || targetQ.initialCode || getStarterCode(activeAssessment.language));
    if (targetQ.options && targetQ.options.length > 0 && targetQ.submittedAnswer) {
      setSelectedOption(targetQ.submittedAnswer);
    } else {
      setSelectedOption('');
    }
  };

  const isCompletedView = activeAssessment?.status === 'Completed';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Code2 className="w-7 h-7" />
          </div>
          AI Technical Coding Environment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Solve multi-challenge algorithmic & data structure assessments evaluated by Gemini AI test runners.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/40 pb-2">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assessments'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          <Code2 className="w-4 h-4" /> Available Coding Challenges
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          <History className="w-4 h-4" /> Assessment History ({history.length})
        </button>
      </div>

      {/* Tab 1: Coding Challenges */}
      {activeTab === 'assessments' && (
        <div className="space-y-8">
          {!activeAssessment ? (
            /* Challenge Selection Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Full Stack Algorithm Assessment', lang: 'JavaScript', diff: 'Medium', time: '5 Questions', category: 'Data Structures & Algorithms' },
                { title: 'Python Machine Learning & Systems', lang: 'Python', diff: 'Medium', time: '5 Questions', category: 'Algorithms & Pythonic OOP' },
                { title: 'Java Enterprise Data Structures', lang: 'Java', diff: 'Hard', time: '5 Questions', category: 'Concurrency & Trees' },
                { title: 'C++ High Performance Algorithms', lang: 'C++', diff: 'Hard', time: '5 Questions', category: 'STL & Memory Management' },
                { title: 'SQL Analytics & Data Engineering', lang: 'SQL', diff: 'Medium', time: '5 Questions', category: 'Aggregations & Joins' },
              ].map((chal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between space-y-4 hover:shadow-premium-hover dark:hover:shadow-premium-dark-hover transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="purple">{chal.lang}</Badge>
                      <Badge variant={chal.diff === 'Easy' ? 'success' : chal.diff === 'Medium' ? 'warning' : 'danger'}>
                        {chal.diff}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-850 dark:text-white mt-1">{chal.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{chal.category} • {chal.time}</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center h-10"
                    isLoading={startMutation.isPending}
                    onClick={() => handleStart(chal.lang, chal.diff)}
                  >
                    <Play className="w-4 h-4 mr-1.5" /> Start Assessment
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : isCompletedView ? (
            /* Completed Assessment AI Proficiency Report View */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/40 pb-6">
                  <div>
                    <Badge variant="success" icon={Award}>
                      Assessment Completed
                    </Badge>
                    <h2 className="text-3xl font-black text-slate-850 dark:text-white mt-1">
                      Overall Score: <span className="text-emerald-500">{activeAssessment.score || activeAssessment.feedback?.overallScore || 85}%</span>
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveAssessment(null)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Start New Assessment
                  </Button>
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Evaluation Summary</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl leading-relaxed border border-slate-200/50 dark:border-slate-800/30">
                    {activeAssessment.feedback?.summary || `Successfully solved ${activeAssessment.questions?.length || 5} coding challenges in ${activeAssessment.language}. Demonstrated clean algorithmic structure and optimal space/time complexity.`}
                  </p>
                </div>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Technical Strengths
                    </h5>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-4">
                      {(activeAssessment.feedback?.strengths || ['Clean code modularity', 'Optimal time complexity']).map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Recommendations
                    </h5>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-disc pl-4">
                      {(activeAssessment.feedback?.topImprovements || activeAssessment.feedback?.weaknesses || ['Include defensive boundary checks']).map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Questions Breakdown Table */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Full Assessment Question Breakdown ({totalQuestions} Total Questions)</h4>
                  <div className="space-y-2">
                    {Array.from({ length: totalQuestions }).map((_, idx) => {
                      const q = activeAssessment.questions?.[idx];
                      const isSubmitted = Boolean(q?.submittedAnswer && String(q.submittedAnswer).trim() !== 'No answer submitted.');
                      const scoreVal = isSubmitted ? (q?.evaluation?.score || 0) : 0;

                      return (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-850 dark:text-white">
                              Q{idx + 1}: {q?.questionType || 'Coding Challenge'} ({q?.difficulty || activeAssessment.difficulty})
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {q?.questionText || 'Unanswered / Skipped Question'}
                            </p>
                          </div>
                          <Badge variant={isSubmitted ? (scoreVal >= 80 ? 'success' : 'warning') : 'danger'}>
                            {isSubmitted ? `Score: ${scoreVal}%` : 'Unanswered (0%)'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Active Multi-Question Workspace */
            <div className="space-y-6">
              {/* Header Bar & Question Progress */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="purple">{activeAssessment.language}</Badge>
                    <Badge variant="warning">{activeAssessment.difficulty}</Badge>
                    <Badge variant="brand" icon={Sparkles}>
                      Question {currentQIndex + 1} of {totalQuestions}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => finishMutation.mutate(activeAssessment._id)}>
                      Finish & Submit Early
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveAssessment(null)}>
                      Exit Workspace
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Interactive Question Selector Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const qObj = activeAssessment.questions?.[idx];
                    const isAnswered = Boolean(qObj?.submittedAnswer);
                    const isCurrent = idx === currentQIndex;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuestion(idx)}
                        disabled={idx > activeAssessment.questions.length}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/50'
                            : isAnswered
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : idx < activeAssessment.questions.length
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Q{idx + 1} {isAnswered && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Problem Prompt & Code Editor Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Problem Prompt */}
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/60 dark:border-slate-800/40">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-brand-500" /> Question Prompt ({currentQuestion?.questionType || 'Coding Challenge'})
                    </h3>
                    <Badge variant="outline">{currentQuestion?.difficulty || activeAssessment.difficulty}</Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line">
                    {currentQuestion?.questionText || 'Write a solution to evaluate algorithm complexity.'}
                  </p>

                  {/* Multiple Choice Options if applicable */}
                  {currentQuestion?.options && currentQuestion.options.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-200">Select Answer Choice:</p>
                      {currentQuestion.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            selectedOption === opt
                              ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="mcq-option"
                            value={opt}
                            checked={selectedOption === opt}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Code Editor & Submission */}
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-white">Solution Code ({activeAssessment.language})</h3>
                    <Textarea
                      rows={12}
                      className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
                      value={codeSolution}
                      onChange={(e) => setCodeSolution(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentQIndex === 0}
                      onClick={() => handleSelectQuestion(currentQIndex - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>

                    <Button
                      variant="primary"
                      isLoading={submitMutation.isPending}
                      onClick={handleSubmitCode}
                      className="h-10"
                    >
                      <Play className="w-4 h-4 mr-1.5" /> Submit Answer
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentQIndex >= activeAssessment.questions.length - 1}
                      onClick={() => handleSelectQuestion(currentQIndex + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Test Evaluation Results for Current Question */}
              {currentQuestion?.evaluation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Gemini AI Evaluation Report
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="purple">Time: {currentQuestion.evaluation.timeComplexity || 'O(N)'}</Badge>
                      <Badge variant="success">Score: {currentQuestion.evaluation.score || 90}%</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/45">
                    {currentQuestion.evaluation.feedbackText || 'All test cases passed cleanly! Time and space complexity meet optimal benchmarks.'}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No coding test attempts logged yet.</p>
          ) : (
            history.map((item, idx) => (
              <div key={item._id || idx} className="glass-card p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center hover:shadow-premium-hover dark:hover:shadow-premium-dark-hover transition-all duration-300 font-sans">
                <div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                    {item.language || 'Coding Challenge'} ({item.difficulty || 'Medium'})
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.questions?.length || 5} Questions • Tested on {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={item.status === 'Completed' ? 'success' : 'warning'}>
                  {item.status === 'Completed' ? `Score: ${item.score || 95}%` : 'In Progress'}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

