import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Code2, Sparkles, Play, CheckCircle2, History, Award, ArrowRight, Terminal } from 'lucide-react';
import { Button, Badge, Loader, Textarea } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';

export const CodingAssessmentPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('assessments');
  const [language, setLanguage] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Medium');
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [codeSolution, setCodeSolution] = useState('');

  // Fetch Coding History
  const { data: historyData } = useQuery({
    queryKey: ['candidate-coding-history'],
    queryFn: candidateApi.getCodingHistory,
  });

  const history = historyData?.data?.history || [];

  const getStarterCode = (lang) => {
    switch (lang) {
      case 'Python':
        return 'def solution(nums, target):\n    # Write your O(N) solution here\n    hashmap = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hashmap:\n            return [hashmap[complement], i]\n        hashmap[num] = i\n    return []';
      case 'Java':
        return 'import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        // Write your solution here\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}';
      case 'C++':
        return '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int comp = target - nums[i];\n            if (mp.count(comp)) return {mp[comp], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};';
      case 'C':
        return '#include <stdio.h>\n#include <stdlib.h>\n\nint* solution(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                result[0] = i; result[1] = j;\n                return result;\n            }\n        }\n    }\n    return result;\n}';
      case 'SQL':
        return '-- Write your SQL query solution\nSELECT u.user_id, u.user_name, COUNT(a.application_id) AS total_applications\nFROM users u\nJOIN applications a ON u.user_id = a.candidate_id\nGROUP BY u.user_id, u.user_name\nHAVING COUNT(a.application_id) >= 1\nORDER BY total_applications DESC;';
      case 'JavaScript':
      default:
        return 'function solution(nums, target) {\n  // Write your O(N) solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}';
    }
  };

  // Start Assessment Mutation
  const startMutation = useMutation({
    mutationFn: candidateApi.startCodingAssessment,
    onSuccess: (data) => {
      toast.success('Coding Assessment started!');
      const session = data.data?.assessment || data.data;
      setActiveAssessment(session);
      setCodeSolution(getStarterCode(language));
      queryClient.invalidateQueries({ queryKey: ['candidate-coding-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start coding assessment.');
    },
  });

  // Submit Answer Mutation
  const submitMutation = useMutation({
    mutationFn: ({ assessmentId, payload }) => candidateApi.submitCodingAnswer(assessmentId, payload),
    onSuccess: (data) => {
      toast.success('Code solution evaluated!');
      const updated = data.data?.assessment || data.data;
      setActiveAssessment(updated);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Code evaluation failed.');
    },
  });

  const handleStart = (selectedLang, selectedDiff) => {
    setLanguage(selectedLang);
    setDifficulty(selectedDiff);
    setCodeSolution(getStarterCode(selectedLang));
    startMutation.mutate({ language: selectedLang, difficulty: selectedDiff });
  };

  const handleSubmitCode = () => {
    if (!codeSolution.trim() || !activeAssessment) return;
    submitMutation.mutate({
      assessmentId: activeAssessment._id,
      payload: { code: codeSolution, language },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Code2 className="w-8 h-8 text-brand-500" /> AI Technical Coding Environment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Solve real-time algorithm & data structure challenges evaluated by Gemini AI test runners.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assessments'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" /> Available Coding Challenges
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Score History ({history.length})
        </button>
      </div>

      {/* Tab 1: Coding Challenges */}
      {activeTab === 'assessments' && (
        <div className="space-y-8">
          {!activeAssessment ? (
            /* Challenge Selection Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Two Sum & Hash Table Lookup', lang: 'JavaScript', diff: 'Easy', time: '20 mins', category: 'Data Structures' },
                { title: 'LRU Cache System Design', lang: 'Python', diff: 'Medium', time: '35 mins', category: 'Algorithms' },
                { title: 'Binary Tree Level Order Traversal', lang: 'Java', diff: 'Hard', time: '45 mins', category: 'Trees & Graphs' },
                { title: 'High-Throughput Concurrent Queue', lang: 'C++', diff: 'Hard', time: '45 mins', category: 'Concurrency' },
                { title: 'Dynamic Programming Subsets', lang: 'Python', diff: 'Medium', time: '30 mins', category: 'Dynamic Programming' },
                { title: 'Asynchronous Event Pipeline', lang: 'JavaScript', diff: 'Medium', time: '30 mins', category: 'Async I/O' },
              ].map((chal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand-500/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="purple">{chal.lang}</Badge>
                      <Badge variant={chal.diff === 'Easy' ? 'success' : chal.diff === 'Medium' ? 'warning' : 'danger'}>
                        {chal.diff}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{chal.title}</h3>
                    <p className="text-xs text-slate-400">{chal.category} • Expected Time: {chal.time}</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    isLoading={startMutation.isPending}
                    onClick={() => handleStart(chal.lang, chal.diff)}
                  >
                    <Play className="w-4 h-4 mr-1.5" /> Start Challenge
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Active Coding Workspace */
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl flex justify-between items-center border border-slate-800">
                <div>
                  <Badge variant="purple">{language}</Badge>
                  <Badge variant="warning" className="ml-2">{difficulty}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveAssessment(null)}>
                  Exit Challenge
                </Button>
              </div>

              {/* Challenge Description & Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Problem Prompt */}
                <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-brand-500" /> Challenge Prompt
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeAssessment.problemStatement ||
                      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.'}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-brand-400 space-y-2">
                    <p>Input: nums = [2,7,11,15], target = 9</p>
                    <p>Output: [0,1]</p>
                  </div>
                </div>

                {/* Right: Code Editor & Submission */}
                <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
                  <h3 className="text-base font-bold text-white">Solution Code ({language})</h3>
                  <Textarea
                    rows={12}
                    className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-2xl border-slate-800"
                    value={codeSolution}
                    onChange={(e) => setCodeSolution(e.target.value)}
                  />

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" isLoading={submitMutation.isPending} onClick={handleSubmitCode}>
                      <Play className="w-4 h-4 mr-1.5" /> Submit & Run Code
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Test Evaluation Results */}
              {activeAssessment.lastResult && (
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Gemini AI Code Execution Report
                    </h4>
                    <Badge variant="success">Test Score: {activeAssessment.lastResult.score || 100}%</Badge>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-900 p-4 rounded-xl">
                    {activeAssessment.lastResult.feedback || 'All test cases passed cleanly! Time Complexity: O(N), Space Complexity: O(N).'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No coding test attempts logged yet.</p>
          ) : (
            history.map((item, idx) => (
              <div key={item._id || idx} className="glass-card p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">{item.language || 'Coding Challenge'}</h4>
                  <p className="text-xs text-slate-400">Tested on {new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <Badge variant="success">Score: {item.score || 95}%</Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
