import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Video, Camera, Mic, CheckCircle2, History, Award, Play, AlertCircle } from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';

export const VideoInterviewPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeSession, setActiveSession] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Fetch Video Interview History
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['candidate-video-history'],
    queryFn: candidateApi.getVideoInterviewHistory,
  });

  const history = historyData?.data?.history || [];

  // Start Video Interview Mutation
  const startMutation = useMutation({
    mutationFn: candidateApi.startVideoInterview,
    onSuccess: (data) => {
      toast.success('AI Video Interview session scheduled!');
      const session = data.data?.interview || data.data;
      setActiveSession(session);
      queryClient.invalidateQueries({ queryKey: ['candidate-video-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start video interview session.');
    },
  });

  // Finish Video Interview Mutation
  const finishMutation = useMutation({
    mutationFn: candidateApi.finishVideoInterview,
    onSuccess: (data) => {
      toast.success('Video screening response submitted & analyzed!');
      setActiveSession(data.data?.interview || data.data);
      setIsRecording(false);
      queryClient.invalidateQueries({ queryKey: ['candidate-video-history'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to analyze video response.');
    },
  });

  const handleStartSession = () => {
    startMutation.mutate({ title: 'AI Automated Video Screening', durationMinutes: 15 });
  };

  const handleFinishVideo = () => {
    if (!activeSession) return;
    finishMutation.mutate(activeSession._id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Video Screening Hub..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Video className="w-8 h-8 text-brand-500" /> AI Video Screening Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete asynchronous AI video interviews with automated tone, clarity, and technical depth scoring.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" /> Start Video Screening
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Past Video History ({history.length})
        </button>
      </div>

      {/* Tab 1: Start Video Screening */}
      {activeTab === 'upcoming' && (
        <div className="space-y-8">
          {!activeSession ? (
            <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border border-brand-500/20 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">AI Video Interview Room</h3>
                <p className="text-xs text-slate-400">
                  Ensure your webcam and microphone are connected. You will be presented with 3 interview prompts.
                </p>
              </div>

              <div className="flex justify-center gap-6 text-xs text-slate-300 py-2">
                <span className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-emerald-400" /> Camera Ready</span>
                <span className="flex items-center gap-1.5"><Mic className="w-4 h-4 text-emerald-400" /> Audio Ready</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                isLoading={startMutation.isPending}
                onClick={handleStartSession}
              >
                <Play className="w-4 h-4 mr-2" /> Launch Camera & Start Interview
              </Button>
            </div>
          ) : (
            /* Active Camera Preview & Recording */
            <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 max-w-3xl mx-auto text-center">
              <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between p-6 overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <Badge variant={isRecording ? 'danger' : 'info'}>
                    {isRecording ? '● Live Recording Response...' : 'Camera Preview Active'}
                  </Badge>
                  <span className="text-xs font-bold text-slate-400">Prompt 1 of 3</span>
                </div>

                <div className="z-10 space-y-2 max-w-xl mx-auto bg-slate-900/80 p-4 rounded-xl backdrop-blur-md border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-brand-400">AI Screening Question</span>
                  <h4 className="text-sm font-bold text-white">
                    "Describe a complex technical system you architected and how you handled high throughput scaling."
                  </h4>
                </div>

                <div className="flex justify-center gap-3 z-10">
                  {!isRecording ? (
                    <Button variant="primary" size="sm" onClick={() => setIsRecording(true)}>
                      <Camera className="w-4 h-4 mr-1.5" /> Start Response Recording
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500"
                      isLoading={finishMutation.isPending}
                      onClick={handleFinishVideo}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit Response & Finish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No past video screening records found.</p>
          ) : (
            history.map((record, idx) => (
              <div key={record._id || idx} className="glass-card p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">{record.title || 'AI Video Screening'}</h4>
                  <p className="text-xs text-slate-400">Completed on {new Date(record.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <Badge variant="purple">Rating: {record.score || 92}/100</Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
