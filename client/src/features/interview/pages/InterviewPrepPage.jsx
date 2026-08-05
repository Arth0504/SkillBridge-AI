import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Send, CheckCircle2, History, Video } from 'lucide-react';
import { Button, Badge, Textarea } from '../../../components/common';
import { candidateApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { AIInterviewRoomModal } from '../components/AIInterviewRoomModal';
import toast from 'react-hot-toast';

export const InterviewPrepPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('practice');
  const [category, setCategory] = useState('MERN');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [activeSession, setActiveSession] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Fetch Practice Session History
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['candidate-interview-history'],
    queryFn: candidateApi.getMockInterviewHistory,
  });

  const history = historyData?.data?.history || [];

  // Start Session Mutation
  const startSessionMutation = useMutation({
    mutationFn: candidateApi.startMockInterview,
    onSuccess: (data) => {
      toast.success('AI Mock Interview session started!');
      setActiveSession(data.data?.session || data.data);
      queryClient.invalidateQueries({ queryKey: ['candidate-interview-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start interview session.');
    },
  });

  // Submit Answer Mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({ sessionId, payload }) => candidateApi.submitInterviewAnswer(sessionId, payload),
    onSuccess: (data) => {
      toast.success('Answer evaluated!');
      setUserAnswer('');
      setActiveSession(data.data?.session || data.data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    },
  });

  // Finish Session Mutation
  const finishSessionMutation = useMutation({
    mutationFn: candidateApi.finishMockInterview,
    onSuccess: (data) => {
      toast.success('Interview session complete! Report generated.');
      setActiveSession(data.data?.session || data.data);
      queryClient.invalidateQueries({ queryKey: ['candidate-interview-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate report.');
    },
  });

  const handleStartSession = () => {
    startSessionMutation.mutate({ interviewType: category, difficulty, experienceLevel });
  };

  const handleAnswerSubmit = () => {
    if (!userAnswer.trim() || !activeSession) return;
    submitAnswerMutation.mutate({
      sessionId: activeSession._id,
      payload: { answer: userAnswer },
    });
  };

  const handleFinishSession = () => {
    if (!activeSession) return;
    finishSessionMutation.mutate(activeSession._id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          AI Mock Interview Simulator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Practice adaptive technical & behavioral interviews powered by Gemini AI with real-time feedback.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/40 pb-2">
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'practice'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          Practice Room
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-[#121A2A]/40'
          }`}
        >
          <History className="w-4 h-4" /> Past Sessions ({history.length})
        </button>
      </div>

      {/* Tab 1: Live Practice Room */}
      {activeTab === 'practice' && (
        <div className="space-y-8">
          {!activeSession ? (
            /* Setup Configurator */
            <div className="glass-panel p-8 rounded-2xl space-y-6 border border-brand-500/10 dark:border-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" /> Configure Interview Session
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Target Role / Tech Stack</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Python', 'Java', 'MERN', 'React', 'Node', 'JavaScript', 'Data Science', 'AI/ML', 'DevOps', 'UI/UX', 'HR'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                          category === cat
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Rating Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Difficulty Rating</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                          difficulty === diff
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Seniority Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Architect', 'Executive'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                          experienceLevel === level
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center h-11"
                  onClick={() => setIsRoomModalOpen(true)}
                >
                  <Video className="w-4 h-4 mr-2" /> Start Live AI Interview Room
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center h-11"
                  isLoading={startSessionMutation.isPending}
                  onClick={handleStartSession}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Start Quick Text Session
                </Button>
              </div>
            </div>
          ) : (
            /* Active Q&A Interface */
            <div className="space-y-6">
              {/* Session Meta */}
              <div className="glass-panel p-6 rounded-2xl flex justify-between items-center border border-slate-200/60 dark:border-slate-800/40">
                <div>
                  <Badge variant="purple">{activeSession.category || category}</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-3">Difficulty: {activeSession.difficulty || difficulty}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSession(null)}>
                  End Session & Exit
                </Button>
              </div>

              {/* Current Question Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl space-y-6 border border-slate-200/50 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-brand-600 dark:text-brand-400">Gemini AI Interviewer Question</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeSession.currentQuestion ||
                        'Tell me about a challenging state management bug you encountered in a React application and how you resolved it.'}
                    </h3>
                  </div>
                </div>

                {/* Candidate Answer Box */}
                <div className="space-y-3">
                  <Textarea
                    rows={5}
                    placeholder="Type your response using the STAR technique (Situation, Task, Action, Result)..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={handleFinishSession} isLoading={finishSessionMutation.isPending} className="h-10 justify-center">
                      Generate Final Recruiter Report
                    </Button>
                    <Button variant="primary" isLoading={submitAnswerMutation.isPending} onClick={handleAnswerSubmit} className="h-10 justify-center">
                      <Send className="w-4 h-4 mr-1.5" /> Submit Answer
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Previous Answer Evaluation Report if available */}
              {activeSession.lastEvaluation && (
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> AI Feedback on Last Answer
                    </h4>
                    <Badge variant="success">Score: {activeSession.lastEvaluation.score}/10</Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{activeSession.lastEvaluation.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Past Sessions */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No past interview sessions logged.</p>
          ) : (
            history.map((session, idx) => (
              <div key={session._id || idx} className="glass-card p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex justify-between items-center hover:shadow-premium-hover dark:hover:shadow-premium-dark-hover transition-all duration-300">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white">{session.category || 'Interview Session'}</h4>
                    <Badge variant="purple">{session.difficulty || 'Senior'}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Completed on {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="success">Final Score: {session.overallScore || 90}%</Badge>
              </div>
            ))
          )}
        </div>
      )}

      <AIInterviewRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        user={user}
        targetDomain={category}
        experienceLevel={experienceLevel}
      />
    </div>
  );
};

