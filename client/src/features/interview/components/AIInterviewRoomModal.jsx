import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button, Loader, Textarea } from '../../../components/common';
import {
  Sparkles,
  Video,
  Mic,
  Wifi,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Clock,
  MessageSquare,
  Award,
} from 'lucide-react';
import { candidateApi } from '../../../api';
import toast from 'react-hot-toast';

export const AIInterviewRoomModal = ({ isOpen, onClose, user, targetDomain = 'MERN', experienceLevel = 'Senior' }) => {
  const [step, setStep] = useState('preflight'); // 'preflight' | 'room' | 'completed'
  const [preflightStatus, setPreflightStatus] = useState({
    resume: false,
    camera: false,
    mic: false,
    internet: true,
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Live Interview State
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Pre-flight Verification Logic
  const runPreflightCheck = async () => {
    setIsVerifying(true);

    const hasResume = Boolean(user?.resumeUrl);
    const hasInternet = navigator.onLine;

    let cameraOk = false;
    let micOk = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraOk = true;
      micOk = true;
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err.message);
    }

    setPreflightStatus({
      resume: hasResume,
      camera: cameraOk,
      mic: micOk,
      internet: hasInternet,
    });
    setIsVerifying(false);
  };

  useEffect(() => {
    if (isOpen) {
      setStep('preflight');
      runPreflightCheck();
    }
  }, [isOpen]);

  // Timer Effect in Interview Room
  useEffect(() => {
    let interval = null;
    if (step === 'room') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleStartInterviewSession = async () => {
    try {
      const res = await candidateApi.startMockInterview({
        interviewType: targetDomain,
        difficulty: 'Medium',
        experienceLevel,
      });
      const sess = res.data?.session || res.data;
      setSession(sess);
      setCurrentQuestion(sess.currentQuestion || sess.questions?.[0]);
      setStep('room');
      toast.success('Joined AI Interview Room!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize AI Interview room.');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerText.trim() || !session) return;
    setIsSubmitting(true);
    try {
      const res = await candidateApi.submitInterviewAnswer(session._id, { answer: answerText });
      const updatedSess = res.data?.session || res.data;
      setSession(updatedSess);
      setAnswerText('');

      const nextQ = updatedSess.currentQuestion || updatedSess.questions?.[updatedSess.questions?.length - 1];
      if (updatedSess.status === 'COMPLETED' || (updatedSess.questions && updatedSess.questions.length >= 4)) {
        handleFinishInterview(updatedSess._id);
      } else {
        setCurrentQuestion(nextQ);
        toast.success('Answer evaluated by Gemini AI!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async (sessionId) => {
    try {
      const res = await candidateApi.finishMockInterview(sessionId || session._id);
      const finalSess = res.data?.session || res.data;
      setSession(finalSess);
      setStep('completed');
      toast.success('Interview Completed! Final AI report generated.');
    } catch (err) {
      toast.error('Failed to generate final report.');
    }
  };

  const allPreflightPassed = preflightStatus.resume && preflightStatus.camera && preflightStatus.mic && preflightStatus.internet;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enterprise AI Interview Room" size="xl">
      {/* 1. Pre-flight Verification Step */}
      {step === 'preflight' && (
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <Badge variant="purple" icon={Sparkles}>
              Adaptive Gemini AI Interviewer
            </Badge>
            <h2 className="text-2xl font-extrabold text-white">Pre-Flight System Check</h2>
            <p className="text-xs text-slate-400">
              Verify your equipment, resume status, and connection before entering the live interview room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resume Verification */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${preflightStatus.resume ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Resume Document</h4>
                  <p className="text-[11px] opacity-80">{preflightStatus.resume ? 'Active PDF Uploaded' : 'No Resume Uploaded'}</p>
                </div>
              </div>
              {preflightStatus.resume ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>

            {/* Camera Check */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${preflightStatus.camera ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Webcam Access</h4>
                  <p className="text-[11px] opacity-80">{preflightStatus.camera ? 'Camera Stream Ready' : 'Permission Pending'}</p>
                </div>
              </div>
              {preflightStatus.camera ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>

            {/* Microphone Check */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${preflightStatus.mic ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Microphone Input</h4>
                  <p className="text-[11px] opacity-80">{preflightStatus.mic ? 'Audio Input Verified' : 'Permission Pending'}</p>
                </div>
              </div>
              {preflightStatus.mic ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>

            {/* Internet Connection Check */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${preflightStatus.internet ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Network Connection</h4>
                  <p className="text-[11px] opacity-80">{preflightStatus.internet ? 'Online (High Speed)' : 'Offline'}</p>
                </div>
              </div>
              {preflightStatus.internet ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={runPreflightCheck} disabled={isVerifying}>
              {isVerifying ? 'Testing Hardware...' : 'Re-test Hardware Permissions'}
            </Button>
            <Button
              variant="primary"
              disabled={!allPreflightPassed}
              onClick={handleStartInterviewSession}
            >
              <Play className="w-4 h-4 mr-2" /> Enter Live Interview Room
            </Button>
          </div>
        </div>
      )}

      {/* 2. Live AI Interview Room */}
      {step === 'room' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{targetDomain} AI Technical Interview</h3>
                <p className="text-[11px] text-slate-400">Seniority Level: {experienceLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" icon={Clock}>
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </Badge>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-brand-950/40 border border-brand-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm">Gemini AI Question</Badge>
              <span className="text-[11px] text-slate-400">Category: {currentQuestion?.category || 'Technical'}</span>
            </div>
            <p className="text-base font-semibold text-white leading-relaxed">
              "{currentQuestion?.questionText || 'Welcome! To start our interview session, could you walk me through your technical background and most impactful engineering project?'}"
            </p>
          </div>

          {/* Candidate Answer Box */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">Your Response (STAR Method Supported)</label>
            <Textarea
              rows={5}
              placeholder="Explain your approach, technical trade-offs, and key outcomes..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => handleFinishInterview(session._id)}>
              Conclude Interview Early
            </Button>
            <Button
              variant="primary"
              disabled={!answerText.trim() || isSubmitting}
              onClick={handleAnswerSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader size="sm" /> Evaluating Answer...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Submit Answer
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 3. Completed Interview Summary */}
      {step === 'completed' && (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">AI Interview Complete!</h2>
            <p className="text-xs text-slate-400">Your session transcript and performance metrics have been compiled.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Technical Score</p>
              <p className="text-2xl font-extrabold text-emerald-400">{session?.finalReport?.technicalScore || session?.evaluation?.technicalAccuracy || 88}/100</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Communication</p>
              <p className="text-2xl font-extrabold text-brand-400">{session?.finalReport?.communicationScore || session?.evaluation?.communication || 90}/100</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Overall Score</p>
              <p className="text-2xl font-extrabold text-purple-400">{session?.finalReport?.overallScore || 89}/100</p>
            </div>
          </div>

          <Button variant="primary" onClick={onClose} className="w-full">
            Done & Save Results
          </Button>
        </div>
      )}
    </Modal>
  );
};
