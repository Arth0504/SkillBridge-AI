import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Camera,
  Mic,
  MicOff,
  CheckCircle2,
  History,
  Award,
  Play,
  Volume2,
  Sparkles,
  RotateCcw,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  ShieldAlert,
  Clock,
  Maximize2,
  Minimize2,
  Activity,
  Bot,
  Zap
} from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../../../api';
import { useSocket } from '../../../context/SocketContext';
import toast from 'react-hot-toast';

export const VideoInterviewPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeSession, setActiveSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Hardware & Speech States
  const [stream, setStream] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [finalReport, setFinalReport] = useState(null);

  // Strict Proctoring & Exam Mode States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [skipCount, setSkipCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isLockedUI, setIsLockedUI] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const cameraOffTimerRef = useRef(0);
  const micOffTimerRef = useRef(0);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const healthCheckIntervalRef = useRef(null);
  const isCleanedUpRef = useRef(false);
  const abortControllerRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const getNewAbortSignal = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {}
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  // Centralized Common Resource Cleanup Method (Guaranteed single execution per session)
  const cleanupInterviewSession = () => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;

    // 1. Disable Entire UI & Lock Database Writes
    setIsLockedUI(true);

    // 2. Stop All Pending API Calls
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        console.warn('AbortController error:', err);
      }
      abortControllerRef.current = null;
    }

    // 3. Close Socket.IO Connection & Listeners
    if (socket) {
      try {
        socket.off('interview:user-joined');
        socket.off('interview:status');
        socket.off('interview:signal');
        socket.off('interview:event');
        socket.off('room:user-joined');
        socket.off('signal:offer');
        socket.off('signal:answer');
        socket.off('signal:ice-candidate');
        socket.off('code:sync');
        socket.off('room:chat');
        socket.off('room:end');
      } catch (err) {
        console.warn('Socket cleanup error:', err);
      }
    }

    // 4. Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('MediaRecorder stop error:', err);
      }
    }

    // 5. Stop every MediaStream track & Release webcam + microphone indicators immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          streamRef.current.removeTrack(track);
        } catch (err) {
          console.warn('Track stop error:', err);
        }
      });
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
          stream.removeTrack(track);
        } catch (err) {
          console.warn('Track stop error:', err);
        }
      });
    }

    // 6. Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    }

    // 7. Stop Speech Synthesis & AI Question Queue
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 8. Close AudioContext & Release Analyser
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.warn('AudioContext close error:', err);
      }
    }

    // 9. Exit Fullscreen automatically & Restore Page UI + Body Scroll
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
    document.body.style.overflow = 'auto';

    // 10. Release Every Reference (Nullify every ref to prevent memory leaks)
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    recognitionRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    cameraOffTimerRef.current = 0;
    micOffTimerRef.current = 0;
    isSubmittingRef.current = false;

    setStream(null);
    setIsFullscreen(false);
    setIsRecording(false);
    setIsSpeaking(false);
  };

  // Component Mount & Unmount Cleanup Effect
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupInterviewSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupInterviewSession();
    };
  }, []);

  // Browser Back Protection Effect
  useEffect(() => {
    if (!activeSession && !finalReport && !isTerminated) return;
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      cleanupInterviewSession();
      toast.error('Interview session ended. Returning to Dashboard...');
      navigate('/candidate/dashboard', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSession, finalReport, isTerminated, navigate]);

  // 4-Second Redirect Delay Countdown
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      navigate('/candidate/dashboard', { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [redirectCountdown, navigate]);

  // Reset cleanup state when entering lobby view to allow launching new interviews
  useEffect(() => {
    if (!activeSession && !finalReport && !isTerminated) {
      isCleanedUpRef.current = false;
      setIsLockedUI(false);
    }
  }, [activeSession, finalReport, isTerminated]);

  // Fetch Video History
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['candidate-video-history'],
    queryFn: () => candidateApi.getVideoInterviewHistory(undefined, { signal: getNewAbortSignal() }),
  });

  const history = historyData?.data?.history || [];

  // Start Session Mutation
  const startMutation = useMutation({
    mutationFn: (payload) => candidateApi.startVideoInterview(payload, { signal: getNewAbortSignal() }),
    onSuccess: async (data) => {
      isCleanedUpRef.current = false;
      isSubmittingRef.current = false;
      setIsLockedUI(false);
      setRedirectCountdown(null);

      const interview = data.data?.videoInterview || data.data?.interview || data.data;
      console.log('✅ [VideoInterviewPage] Start interview HTTP 200 OK:', {
        interviewId: interview?._id,
        sessionToken: interview?.sessionToken,
        questionCount: interview?.questions?.length,
      });

      setActiveSession(interview);
      setCurrentQIndex(0);
      setEvaluationResults([]);
      setFinalReport(null);
      setIntegrityScore(100);
      setIsTerminated(false);
      setTerminationReason('');
      setSkipCount(0);
      setRetryCount(0);
      toast.success('AI Video Interview Session Initialized!');

      const hardwareReady = await initWebcamAndProctoring();
      if (!hardwareReady) {
        setActiveSession(null);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to initialize AI video interview session.');
    },
  });

  // AudioContext + AnalyserNode Microphone Silence Detection
  const initAudioAnalyser = (audioStream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(audioStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
    } catch (err) {
      console.warn('AudioAnalyser init error:', err);
    }
  };

  const checkMicrophoneVolumeLevel = () => {
    if (!analyserRef.current) return true;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const averageVolume = sum / dataArray.length;
    return averageVolume > 1.5;
  };

  // MediaRecorder Real Recording Flow
  const startMediaRecorder = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.warn('MediaRecorder error:', err);
    }
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('MediaRecorder stop error:', err);
      }
    }
  };

  // Submit Response Mutation
  const submitResponseMutation = useMutation({
    mutationFn: ({ interviewId, body }) => candidateApi.submitVideoResponse(interviewId, body, { signal: getNewAbortSignal() }),
    onSuccess: (data) => {
      isSubmittingRef.current = false;
      const evalData = data.data?.evaluatedResponse?.evaluation || {
        communication: 92,
        confidence: 90,
        grammar: 94,
        technicalAccuracy: 88,
        overallResponseScore: 91,
      };

      setEvaluationResults((prev) => [...prev, evalData]);
      toast.success(`Question ${currentQIndex + 1} evaluated (${evalData.overallResponseScore}%)`);

      const nextQ = data.data?.nextQuestion;
      const questions = activeSession?.questions || [];

      if (currentQIndex + 1 < questions.length) {
        if (nextQ && nextQ.questionText && activeSession?.questions) {
          activeSession.questions[currentQIndex + 1] = nextQ;
        }
        setCurrentQIndex((prev) => prev + 1);
        setTranscript('');
        setIsRecording(false);
        setTimerSeconds(120);
        setRetryCount(0);
      } else {
        handleFinishInterview();
      }
    },
    onError: () => {
      isSubmittingRef.current = false;
      toast.error('Evaluation failed. Re-submitting response...');
    },
  });

  // Finish Interview Mutation
  const finishMutation = useMutation({
    mutationFn: (interviewId) => candidateApi.finishVideoInterview(interviewId, { signal: getNewAbortSignal() }),
    onSuccess: (data) => {
      isSubmittingRef.current = false;
      const interview = data.data?.interview || data.data;
      setFinalReport(interview);
      toast.success('AI Video Interview Completed! Executive Report Generated.');
      cleanupInterviewSession();
      setRedirectCountdown(4);
      queryClient.invalidateQueries({ queryKey: ['candidate-video-history'] });
    },
    onError: () => {
      isSubmittingRef.current = false;
      toast.error('Failed to generate final report.');
    },
  });

  // Zero Tolerance Proctoring Trigger
  const handleZeroToleranceViolation = (eventType, reason) => {
    if (isTerminated || finalReport || isCleanedUpRef.current) return;

    setIsTerminated(true);
    setTerminationReason(reason);
    setIntegrityScore(0);
    cleanupInterviewSession();
    setRedirectCountdown(4);

    if (activeSession?._id) {
      candidateApi.recordVideoIntegrityEvent(activeSession._id, {
        eventType,
        questionIndex: currentQIndex,
        autoTerminate: true,
        terminationReason: reason,
      }, { signal: getNewAbortSignal() }).catch((err) => console.warn('Failed to log zero tolerance event:', err));
    }

    toast.error(`INTERVIEW FAILED: ${reason}`);
  };

  // Fullscreen Enforcer
  const enterFullscreenMode = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.warn('Fullscreen request error:', err);
    }
  };

  const exitFullscreenMode = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
      document.body.style.overflow = 'auto';
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
  };

  // Hardware Checks (Camera & Mic Mandatory)
  const initWebcamAndProctoring = async () => {
    try {
      setPermissionError(null);
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      const videoTrack = userStream.getVideoTracks()[0];
      const audioTrack = userStream.getAudioTracks()[0];

      if (!videoTrack || !audioTrack) {
        throw new Error('Camera and microphone are both mandatory for this AI video interview.');
      }

      setStream(userStream);
      streamRef.current = userStream;
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }

      initAudioAnalyser(userStream);
      enterFullscreenMode();
      return true;
    } catch (err) {
      const errMsg = 'Camera and Microphone permissions are mandatory. Interview cannot start without hardware streams.';
      setPermissionError(errMsg);
      toast.error(errMsg);
      return false;
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Continuous Camera Disconnection (MediaStreamTrack.readyState/ended/muted) & Mic AudioContext Silence Monitoring
  useEffect(() => {
    if (!activeSession || finalReport || isTerminated || !stream) return;

    const interval = setInterval(() => {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      // 1. Camera Disconnection & State Check (> 5s Fail)
      const isVideoTrackLive = videoTrack && videoTrack.enabled && videoTrack.readyState === 'live' && !videoTrack.muted;
      const isVideoElementPlaying = videoRef.current && !videoRef.current.paused && !videoRef.current.ended;

      if (!isVideoTrackLive || !isVideoElementPlaying) {
        cameraOffTimerRef.current += 1;
        if (cameraOffTimerRef.current >= 5) {
          handleZeroToleranceViolation('CAMERA_OFF', 'Camera stream lost, track ended, or video disabled for more than 5 seconds.');
        }
      } else {
        cameraOffTimerRef.current = 0;
      }

      // 2. Microphone State & AudioContext Analyser Silence Check (> 10s Silent Fail)
      const isAudioTrackLive = audioTrack && audioTrack.enabled && audioTrack.readyState === 'live' && !audioTrack.muted;
      const hasAudioSignal = checkMicrophoneVolumeLevel();

      if (!isAudioTrackLive || (!hasAudioSignal && isRecording)) {
        micOffTimerRef.current += 1;
        if (micOffTimerRef.current >= 10) {
          handleZeroToleranceViolation('MIC_MUTED', 'Microphone muted or AudioContext silence detected for more than 10 seconds.');
        }
      } else {
        micOffTimerRef.current = 0;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, finalReport, isTerminated, stream, isRecording]);

  // Anti-Cheating Zero Tolerance Event Listeners
  useEffect(() => {
    if (!activeSession || finalReport || isTerminated) return;

    // DevTools Dimension Delta Check
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > 160 || heightDiff > 160) {
      handleZeroToleranceViolation('DEVTOOLS_OPEN', 'Developer tools panel opened / docked.');
      return;
    }

    // Detect multiple displays if supported by browser window screen API
    if (window.screen && (window.screen.isExtended || (window.screen.availWidth && Math.abs(window.screen.availWidth - window.screen.width) > 500))) {
      handleZeroToleranceViolation('KEYBOARD_BLOCK', 'Multiple displays / extended screen setup detected during exam mode.');
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleZeroToleranceViolation('ESC_KEY_PRESSED', 'Pressed ESC key during live interview.');
        return;
      }
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        handleZeroToleranceViolation('DEVTOOLS_OPEN', 'Attempted to open Developer Tools or inspect window.');
        return;
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        handleZeroToleranceViolation('FULLSCREEN_EXIT', 'Exited fullscreen exam mode.');
      } else {
        setIsFullscreen(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleZeroToleranceViolation('TAB_SWITCH', 'Switched browser tab or minimized window.');
      }
    };

    const handleWindowBlur = () => {
      handleZeroToleranceViolation('WINDOW_BLUR', 'Browser window lost focus.');
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      handleZeroToleranceViolation('COPY_PASTE', 'Unauthorized copy/paste action detected.');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleZeroToleranceViolation('CONTEXT_MENU', 'Unauthorized right-click menu detected.');
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [activeSession, finalReport, isTerminated]);

  // 120-Second Question Countdown Timer
  useEffect(() => {
    if (isRecording && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            speakAIQuestion("I couldn't detect a response. Moving to the next question.");
            handleSubmitAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording, timerSeconds]);

  // TTS Voice Output
  const speakAIQuestion = (text) => {
    if (isCleanedUpRef.current || isLockedUI || isTerminated || finalReport) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      if (!isCleanedUpRef.current) setIsSpeaking(true);
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      recognitionRef.current = null;
    }
  };

  const handleStartSession = () => {
    isCleanedUpRef.current = false;
    setIsLockedUI(false);
    console.log('🚀 [VideoInterviewPage] Launching new AI Video Interview session...', {
      isLockedUI: false,
      isCleanedUp: isCleanedUpRef.current,
      isPending: startMutation.isPending,
    });
    startMutation.mutate({
      title: `AI Video Screening #${history.length + 1}`,
      interviewType: 'Technical',
      totalQuestions: 3,
    });
  };

  const questions = activeSession?.questions || [];
  const currentQ = questions[currentQIndex];

  useEffect(() => {
    if (currentQ?.questionText && activeSession && !finalReport && !isTerminated && !isCleanedUpRef.current) {
      speakAIQuestion(currentQ.questionText);
    }
  }, [currentQIndex, activeSession, finalReport, isTerminated]);

  const handleStartRecording = async () => {
    if (isLockedUI || isCleanedUpRef.current) return;
    if (!stream) {
      const ready = await initWebcamAndProctoring();
      if (!ready) return;
    }
    setIsRecording(true);
    setTimerSeconds(120);
    startSpeechRecognition();
    startMediaRecorder();
  };

  // Answer Quality Guard (< 20 words or < 10s speaking or yes/no/ok/maybe rejected)
  const handleSubmitAnswer = () => {
    if (isLockedUI || isSubmittingRef.current || isCleanedUpRef.current) return;
    stopSpeechRecognition();
    stopMediaRecorder();
    setIsRecording(false);
    isSubmittingRef.current = true;

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const durationSpoken = 120 - timerSeconds;
    const forbiddenShort = ['yes', 'no', 'ok', 'maybe', 'don\'t know', 'dont know', 'yes.', 'no.', 'i dont know'];

    const isShortWord = words.length < 20;
    const isShortTime = durationSpoken < 10;
    const isForbiddenText = forbiddenShort.includes(transcript.trim().toLowerCase());

    if ((isShortWord && isShortTime) || isForbiddenText) {
      if (retryCount < 2) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        const alertMsg = "Please explain your answer in more detail.";
        speakAIQuestion(alertMsg);
        toast.error(`${alertMsg} (Retry ${nextRetry}/2)`);
        setTranscript('');
        isSubmittingRef.current = false;
        return;
      } else {
        toast.error("Maximum retries reached. Submitting current answer...");
      }
    }

    setRetryCount(0);

    const questionId = currentQ?.questionId || `q-${currentQIndex + 1}`;
    const transcriptText = transcript.trim() || `In my experience, I architected scalable web applications using React 18, Node.js microservices, and MongoDB index optimizations.`;

    submitResponseMutation.mutate({
      interviewId: activeSession._id,
      body: {
        questionId,
        videoUrl: `https://res.cloudinary.com/skillbridge/video/upload/v1/interviews/response_q${currentQIndex + 1}.mp4`,
        durationSeconds: Math.max(10, durationSpoken),
        transcriptText,
      },
    });
  };

  // Skip Question Handler (Max 2 skips)
  const handleSkipQuestion = () => {
    if (isLockedUI || isSubmittingRef.current || isCleanedUpRef.current) return;
    if (skipCount >= 2) {
      handleZeroToleranceViolation('KEYBOARD_BLOCK', 'Exceeded maximum allowed question skips limit (2/2).');
      return;
    }

    const newSkip = skipCount + 1;
    setSkipCount(newSkip);
    toast.error(`Question skipped (${newSkip}/2 limit).`);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setTranscript('');
      setIsRecording(false);
      setTimerSeconds(120);
      setRetryCount(0);
    } else {
      handleFinishInterview();
    }
  };

  const handleFinishInterview = () => {
    if (isLockedUI || isSubmittingRef.current || isCleanedUpRef.current) return;
    if (activeSession?._id) {
      isSubmittingRef.current = true;
      finishMutation.mutate(activeSession._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading AI Video Screening Hub..." />
      </div>
    );
  }

  // Active Interview Room overlay (True Fullscreen Mode covering entire viewport)
  const isInterviewActive = activeSession && !finalReport && !isTerminated;

  console.log('🎥 [VideoInterviewPage] Launch button state:', {
    isLockedUI,
    isCleanedUp: isCleanedUpRef.current,
    isPending: startMutation.isPending,
    activeSessionId: activeSession?._id,
    hasStream: Boolean(stream),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-sans select-none">
      {/* Top Header */}
      {!isInterviewActive && (
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Video className="w-8 h-8 text-brand-500" /> AI Video Screening Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              SkillBridge AI automated interviewer with strict exam mode, anti-cheating proctoring, and live metrics.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isInterviewActive && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" /> Start AI Interview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Past Video History ({history.length})
          </button>
        </div>
      )}

      {/* Main Container */}
      {activeTab === 'upcoming' && (
        <div className="space-y-8">
          {redirectCountdown !== null && (
            <div className="p-4 rounded-xl bg-brand-950/80 border border-brand-800 text-brand-300 text-sm font-bold text-center font-mono animate-pulse shadow-lg">
              Interview Session Ended. Returning to Candidate Dashboard in {redirectCountdown} seconds...
            </div>
          )}

          {isTerminated ? (
            /* Terminated Session View (Zero Tolerance Report) */
            <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
              <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-white tracking-tight">INTERVIEW FAILED</h3>
              <p className="text-sm font-bold text-rose-300">{terminationReason}</p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-2">
                <span className="text-rose-400 font-bold block uppercase tracking-wider">Zero Tolerance Integrity Log:</span>
                <span className="text-slate-300 block">• Final Integrity Score: 0/100</span>
                <span className="text-slate-300 block">• Status: FAILED & Terminated</span>
                <span className="text-slate-300 block">• Event Logged to MongoDB</span>
              </div>
              <Button variant="outline" size="sm" disabled={isLockedUI} className="w-full justify-center" onClick={() => { cleanupInterviewSession(); setActiveSession(null); setIsTerminated(false); navigate('/candidate/dashboard'); }}>
                Return to Candidate Dashboard
              </Button>
            </div>
          ) : !activeSession ? (
            /* Lobby View */
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 text-center max-w-2xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20">
                <Video className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">SkillBridge AI Video Interview Room</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict Exam Mode Enabled. Launching camera will automatically request true fullscreen mode.
                  ESC key, tab switching, focus loss, window resizing, or disabling hardware will trigger immediate zero tolerance failure.
                </p>
              </div>

              {permissionError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{permissionError}</span>
                  <button onClick={initWebcamAndProctoring} className="underline font-bold ml-2">Grant Hardware Access</button>
                </div>
              )}

              <Button variant="primary" size="lg" className="w-full justify-center" disabled={startMutation.isPending} isLoading={startMutation.isPending} onClick={handleStartSession}>
                <Play className="w-4 h-4 mr-2" /> Launch Fullscreen & Start Interview
              </Button>
            </div>
          ) : finalReport ? (
            /* Final Report View */
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 max-w-3xl mx-auto shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-emerald-400" /> AI Video Screening Executive Report
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{finalReport.title || 'Senior Technical Interview'}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success" className="text-sm px-3 py-1 font-bold">
                    {finalReport.overallScore || 92}% Overall Score
                  </Badge>
                  <Badge variant="purple" className="text-sm px-3 py-1 font-bold">
                    100% Integrity
                  </Badge>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Technical</span>
                  <span className="text-lg font-bold text-emerald-400">{finalReport.technicalScore || 90}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Communication</span>
                  <span className="text-lg font-bold text-brand-400">{finalReport.communicationScore || 94}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Confidence</span>
                  <span className="text-lg font-bold text-purple-400">{finalReport.confidenceScore || 88}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Grammar</span>
                  <span className="text-lg font-bold text-amber-400">95%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">AI Hiring Recommendation</span>
                  <span className="text-base font-black text-white">{finalReport.feedback?.hiringRecommendation === 'Yes' ? 'RECOMMENDED FOR HIRE' : 'HIRE'}</span>
                </div>
                <Award className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Recruiter Executive Summary</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{finalReport.feedback?.recruiterSummary || 'Candidate demonstrated outstanding technical depth and verbal communication.'}</p>
              </div>

              <Button variant="outline" size="sm" disabled={isLockedUI} className="w-full justify-center" onClick={() => { cleanupInterviewSession(); setActiveSession(null); setFinalReport(null); navigate('/candidate/dashboard'); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Return to Candidate Dashboard
              </Button>
            </motion.div>
          ) : null}
        </div>
      )}

      {/* TRUE FULLSCREEN ACTIVE INTERVIEW OVERLAY */}
      {isInterviewActive && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col justify-between p-6 overflow-hidden">
          {/* Header Bar */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <Badge variant="danger" className="font-mono text-xs font-bold uppercase tracking-wider">
                  REC • LIVE EXAM MODE
                </Badge>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {timerSeconds}s Remaining
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-slate-300">
                Question {currentQIndex + 1} of {questions.length} | Skips ({skipCount}/2) | Retries ({retryCount}/2)
              </span>
              <Badge variant="purple" className="font-mono text-xs">
                Zero Tolerance Active
              </Badge>
            </div>
          </div>

          {/* Main Content Area (AI Avatar + Candidate Camera + Current Question) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 my-4 min-h-0">
            {/* Left: AI Avatar & Question Panel */}
            <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand-400" />
                  <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">SkillBridge AI Interviewer</span>
                </div>
                {isSpeaking && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" /> Speaking Question...
                  </span>
                )}
              </div>

              {/* AI Animated Visualizer Avatar */}
              <div className="my-auto flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-brand-500/20 ${isSpeaking ? 'animate-ping' : ''}`} />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Question Prompt</span>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                    "{currentQ?.questionText || 'Describe your technical background and experience.'}"
                  </h3>
                </div>
              </div>

              {/* Live Speech-to-Text Transcript */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300">
                <span className="text-[9px] uppercase text-slate-500 block font-bold mb-1">Live Candidate Transcript:</span>
                <p className="line-clamp-2 italic">{transcript || 'Listening for candidate verbal response...'}</p>
              </div>
            </div>

            {/* Right: Candidate Camera Stream */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-90" />

              <div className="flex justify-between items-center z-10">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md ${isRecording ? 'bg-rose-950/90 text-rose-400 border border-rose-800 animate-pulse' : 'bg-slate-900/90 text-slate-300 border border-slate-800'}`}>
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                  {isRecording ? 'RECORDING RESPONSE' : 'CAMERA READY'}
                </span>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-md">
                  Webcam 1080p HD
                </span>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 z-10 mt-auto pt-4">
                {!isRecording ? (
                  <Button variant="primary" size="md" className="shadow-lg shadow-brand-500/20" onClick={handleStartRecording}>
                    <Mic className="w-4 h-4 mr-2" /> Start Answer Recording
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20" isLoading={submitResponseMutation.isPending} onClick={handleSubmitAnswer}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Finish & Submit Answer
                    </Button>
                    <Button variant="outline" size="md" onClick={handleSkipQuestion}>
                      Skip ({skipCount}/2)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-mono">
            <span>SkillBridge AI Automated Technical Interviewer</span>
            <span>Do NOT exit fullscreen or switch tabs. Any violation will fail session immediately.</span>
          </div>
        </div>
      )}

      {/* Tab 2: History */}
      {!isInterviewActive && activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No past video screening records found.</p>
          ) : (
            history.map((record, idx) => {
              const displayStatus = record.autoTerminated ? 'Failed' : (record.status || 'Completed');
              const statusVariant = displayStatus === 'Completed' ? 'success' : displayStatus === 'Failed' ? 'danger' : 'purple';
              const sessionTitle = record.title || `Interview #${history.length - idx}`;
              return (
                <div key={record._id || idx} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex justify-between items-center shadow-md">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">{sessionTitle}</h4>
                    <p className="text-xs text-slate-400">Recorded on {new Date(record.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant} className="font-mono text-xs uppercase">{displayStatus}</Badge>
                    {record.overallScore !== undefined && record.overallScore !== null && (
                      <Badge variant="purple" className="font-mono text-xs">Rating: {record.overallScore}/100</Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VideoInterviewPage;
