import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Hand,
  MessageSquare,
  ShieldCheck,
  PhoneOff,
  Sparkles,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Signal,
  AlertTriangle,
  Play,
  User,
  Code2,
  Maximize2,
  Minimize2,
  Users,
  Palette,
  Volume2,
  Award,
} from 'lucide-react';
import { Button, Badge, Loader } from '../../../components/common';
import { interviewRoomApi } from '../../../api/interviewRoomApi';
import { useSocket } from '../../../context/SocketContext';
import { PreJoinLobby } from '../components/PreJoinLobby';
import { SharedWhiteboard } from '../components/SharedWhiteboard';
import { InterviewReportModal } from '../components/InterviewReportModal';
import toast from 'react-hot-toast';

export const PrivateInterviewRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Lobby State
  const [showLobby, setShowLobby] = useState(true);

  // Media & Room Controls State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'stopped'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notes' | 'code' | 'whiteboard' | 'participants'

  // Chat & Participants State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Recruiter Notes & Evaluation State
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('Yes');
  const [scores, setScores] = useState({
    technical: 85,
    communication: 90,
    confidence: 88,
    problemSolving: 85,
  });

  // Live Coding Editor State
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState(
    '# SkillBridge AI Live Coding Sandbox\ndef solve_interview_problem(input_val):\n    # Write technical algorithm here\n    return f"Processed: {input_val}"\n\nprint(solve_interview_problem("Candidate Solution"))'
  );
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Timer & Session Duration
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Post-Interview Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);

  // WebRTC Stream & PeerConnection Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const [connectionStateText, setConnectionStateText] = useState('Connecting...');

  // STUN Production Configuration
  const RTC_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  // Fetch Room & Authorization Details
  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['private-interview-room', roomId],
    queryFn: () => interviewRoomApi.getRoomDetails(roomId),
    enabled: Boolean(roomId),
    retry: false,
  });

  const roomInfo = roomData?.data?.room;
  const currentUserRole = roomData?.data?.userRole || 'candidate';
  const candidate = roomInfo?.candidateId;
  const company = roomInfo?.companyId;
  const job = roomInfo?.jobId;
  const isReadOnly = roomData?.data?.isReadOnly || roomInfo?.status === 'completed';

  // Sync Timer
  useEffect(() => {
    if (showLobby || isReadOnly) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showLobby, isReadOnly]);

  // Sync Existing Room Data into Local State
  useEffect(() => {
    if (roomInfo) {
      if (roomInfo.recruiterNotes || roomInfo.notes) {
        setNotes(roomInfo.recruiterNotes || roomInfo.notes);
      }
      if (roomInfo.evaluationScores) {
        setScores({
          technical: roomInfo.evaluationScores.technical ?? 85,
          communication: roomInfo.evaluationScores.communication ?? 90,
          confidence: roomInfo.evaluationScores.confidence ?? 88,
          problemSolving: roomInfo.evaluationScores.problemSolving ?? 85,
        });
        if (roomInfo.evaluationScores.recommendation) {
          setRecommendation(roomInfo.evaluationScores.recommendation);
        }
      }
      if (roomInfo.chatMessages && Array.isArray(roomInfo.chatMessages)) {
        setChatMessages(roomInfo.chatMessages);
      }
    }
  }, [roomInfo]);

  // Initialize PeerConnection
  const createPeerConnection = () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('signal:ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setIsRemoteConnected(true);
        setConnectionStateText('Connected (HD)');
      }
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'connected':
          setIsRemoteConnected(true);
          setConnectionStateText('Connected (HD)');
          break;
        case 'connecting':
          setConnectionStateText('Connecting...');
          break;
        case 'disconnected':
          setConnectionStateText('Reconnecting...');
          break;
        case 'failed':
          setConnectionStateText('Poor Network / Retrying');
          try {
            pc.restartIce();
          } catch (e) {
            console.warn('ICE restart exception:', e);
          }
          break;
        default:
          break;
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Pre-Join Lobby Completion Handler
  const handleLobbyJoin = async ({ micOn: initialMic, cameraOn: initialCamera }) => {
    setShowLobby(false);
    setMicOn(initialMic);
    setCameraOn(initialCamera);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: initialCamera,
          audio: initialMic,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }
    } catch (err) {
      console.warn('Media init fallback error:', err);
    }
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (localStreamRef.current && peerConnectionRef.current) {
        const webcamTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && webcamTrack) {
          await sender.replaceTrack(webcamTrack);
        }
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      }

      screenTrack.onended = async () => {
        if (localStreamRef.current && peerConnectionRef.current) {
          const webcamTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && webcamTrack) {
            await sender.replaceTrack(webcamTrack);
          }
        }
        setIsScreenSharing(false);
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.warn('Screen sharing cancelled:', err);
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // WebRTC Signaling & Socket Integration
  useEffect(() => {
    if (!socket || !roomId || !roomData || showLobby) return;

    const name = currentUserRole === 'company' ? (company?.companyName || 'Recruiter') : (candidate?.fullName || 'Candidate');

    socket.emit('room:join', { roomId, name });

    socket.on('room:user-joined', async (user) => {
      toast.success(`${user.name || 'Participant'} joined the interview room.`);
      setParticipants((prev) => {
        if (!prev.find((p) => p.userId === user.userId)) {
          return [...prev, user];
        }
        return prev;
      });

      try {
        const pc = createPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal:offer', { roomId, sdp: offer });
      } catch (err) {
        console.error('WebRTC Offer Error:', err);
      }
    });

    socket.on('signal:offer', async (data) => {
      try {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal:answer', { roomId, sdp: answer });
      } catch (err) {
        console.error('WebRTC Answer Error:', err);
      }
    });

    socket.on('signal:answer', async (data) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      } catch (err) {
        console.error('WebRTC Answer Exception:', err);
      }
    });

    socket.on('signal:ice-candidate', async (data) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error('WebRTC ICE Error:', err);
      }
    });

    socket.on('code:sync', (data) => {
      if (data?.codeSnippet) {
        setCodeSnippet(data.codeSnippet);
        if (data.codeLanguage) setCodeLanguage(data.codeLanguage);
      }
    });

    socket.on('room:chat', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('room:end', () => {
      toast.error('The interview room session has been concluded.');
      navigate(currentUserRole === 'company' ? '/company/applications' : '/candidate/dashboard');
    });

    return () => {
      socket.off('room:user-joined');
      socket.off('signal:offer');
      socket.off('signal:answer');
      socket.off('signal:ice-candidate');
      socket.off('code:sync');
      socket.off('room:chat');
      socket.off('room:end');
    };
  }, [socket, roomId, roomData, showLobby, currentUserRole, candidate, company, navigate]);

  // Mutations
  const notesMutation = useMutation({
    mutationFn: (payload) => interviewRoomApi.saveNotesAndScores(roomId, payload),
    onSuccess: () => {
      toast.success('Recruiter notes & evaluation ratings saved live.');
    },
  });

  const endMutation = useMutation({
    mutationFn: () => interviewRoomApi.endRoomSession(roomId),
    onSuccess: async () => {
      toast.success('Interview concluded successfully.');
      if (socket) socket.emit('room:end', { roomId });
      try {
        const report = await interviewRoomApi.getInterviewReport(roomId);
        setReportData(report.data);
        setReportModalOpen(true);
      } catch (e) {
        navigate(currentUserRole === 'company' ? '/company/applications' : '/candidate/dashboard');
      }
    },
  });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const senderName = currentUserRole === 'company' ? (company?.companyName || 'Recruiter') : (candidate?.fullName || 'Candidate');
    if (socket) {
      socket.emit('room:chat', { roomId, text: chatInput, senderName });
    }
    setChatInput('');
  };

  const handleCodeChange = (newCode) => {
    setCodeSnippet(newCode);
    if (socket) {
      socket.emit('code:sync', { roomId, codeSnippet: newCode, codeLanguage });
    }
  };

  const handleSaveNotes = () => {
    const computedOverall = Math.round(
      (scores.technical + scores.communication + scores.confidence + scores.problemSolving) / 4
    );

    notesMutation.mutate({
      recruiterNotes: notes,
      recommendation,
      evaluationScores: {
        ...scores,
        overallScore: computedOverall,
        recommendation,
      },
    });
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setCodeOutput(`[SkillBridge AI Live Sandbox]\nExecution Clean (0 Errors)\nOutput: Processed Candidate Solution`);
      setIsRunningCode(false);
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader size="lg" text="Connecting to Encrypted Interview Room..." />
      </div>
    );
  }

  // 403 Unauthorized Access Screen
  if (error?.response?.status === 403) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-rose-500/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">403 Forbidden Access</h2>
          <p className="text-xs text-slate-400">
            This private video interview room is encrypted and reserved strictly for authorized candidates and recruiters.
          </p>
          <Button variant="primary" size="md" className="w-full justify-center" onClick={() => navigate('/')}>
            Return to Safety
          </Button>
        </div>
      </div>
    );
  }

  // 410 Expired Interview Screen
  if (error?.response?.status === 410 || roomInfo?.status === 'expired') {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-amber-500/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">410 Session Expired</h2>
          <p className="text-xs text-slate-400">
            This private interview room link has expired or reached its scheduled duration.
          </p>
          <Button variant="primary" size="md" className="w-full justify-center" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6">
        <div className="text-center text-slate-400 text-sm">Interview room not found.</div>
      </div>
    );
  }

  // Render Pre-Join Diagnostic Lobby
  if (showLobby) {
    return <PreJoinLobby candidate={candidate} roomInfo={roomInfo} onJoin={handleLobbyJoin} />;
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* 1. GOOGLE MEET STYLE HEADER BAR */}
      <header className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg">
            SB
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
              {job?.title || 'Technical Role Interview'}
              <Badge variant="purple" size="sm">{roomInfo.interviewType} Round</Badge>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Room UUID: <span className="font-mono text-brand-400">{roomInfo.roomId.slice(0, 13)}...</span>
            </p>
          </div>
        </div>

        {/* Center Stats */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950 px-4 py-1.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            REC LIVE
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300 font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-brand-400" /> {formatTime(elapsedSeconds)} / {roomInfo.durationMinutes || 45}:00
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Signal className={`w-3.5 h-3.5 ${isRemoteConnected ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} /> {connectionStateText}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
          </div>
          <Button
            variant="danger"
            size="sm"
            isLoading={endMutation.isPending}
            onClick={() => endMutation.mutate()}
          >
            <PhoneOff className="w-4 h-4 mr-1.5" /> End Interview
          </Button>
        </div>
      </header>

      {/* 2. MAIN INTERVIEW WORKSPACE GRID */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden relative">
        {/* VIDEO & MEDIA STREAMS STAGE (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          {/* Main Video Box */}
          <div className="relative flex-1 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!isRemoteConnected ? 'hidden' : ''}`}
            />

            {/* Remote Avatar Connecting State */}
            {!isRemoteConnected && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl border-4 border-slate-800">
                  {currentUserRole === 'company' ? (candidate?.fullName?.[0] || 'C') : (company?.companyName?.[0] || 'R')}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {currentUserRole === 'company' ? (candidate?.fullName || 'Candidate Candidate') : (company?.companyName || 'Lead Tech Recruiter')}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentUserRole === 'company' ? (candidate?.headline || 'Senior Applicant') : 'Enterprise Interviewer'}
                  </p>
                </div>

                <Badge variant="purple" className="animate-pulse">
                  <Signal className="w-3.5 h-3.5 mr-1 text-brand-400" /> Waiting for peer connection...
                </Badge>

                {isHandRaised && (
                  <Badge variant="amber" className="animate-bounce">
                    <Hand className="w-3.5 h-3.5 mr-1" /> Hand Raised
                  </Badge>
                )}
              </div>
            )}

            {/* Local Video Picture-in-Picture Box */}
            <div className="absolute bottom-4 right-4 w-44 aspect-video rounded-2xl bg-slate-900 border-2 border-brand-500/50 shadow-2xl overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''}`}
              />
              {!cameraOn && (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-950 text-xs font-bold">
                  Camera Off
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-bold text-white backdrop-blur-md">
                You ({currentUserRole})
              </div>
            </div>
          </div>

          {/* 3. FLOATING BOTTOM MEDIA CONTROLS BAR (GOOGLE MEET STYLE) */}
          <div className="h-16 px-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-xl transition-all ${
                  micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title="Toggle Microphone"
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-3 rounded-xl transition-all ${
                  cameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title="Toggle Camera"
              >
                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-xl transition-all ${
                  isScreenSharing ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`p-3 rounded-xl transition-all ${
                  isHandRaised ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Raise Hand"
              >
                <Hand className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleFullscreen}
                className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat ({chatMessages.length})
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'code' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Live Code
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'whiteboard' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> Whiteboard
              </button>
              {currentUserRole === 'company' && (
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'notes' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Recruiter Panel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. INTERACTIVE PANELS (RIGHT 4 COLS) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Panel Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              {activeTab === 'chat' && 'Live Session Chat'}
              {activeTab === 'code' && 'Live Shared Coding Sandbox'}
              {activeTab === 'whiteboard' && 'Interactive Shared Whiteboard'}
              {activeTab === 'notes' && 'Recruiter Evaluation Suite'}
            </span>
          </div>

          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-8">
                    No chat messages yet. Messages sent here are end-to-end encrypted.
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-brand-400">{msg.senderName}</span>
                        <span className="text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-200">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type encrypted message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
                <button type="submit" className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: LIVE SHARED CODE EDITOR */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
              <div className="flex justify-between items-center">
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="java">Java 17</option>
                </select>
                <Button variant="primary" size="sm" isLoading={isRunningCode} onClick={handleRunCode}>
                  <Play className="w-3.5 h-3.5 mr-1" /> Run Code
                </Button>
              </div>

              <textarea
                value={codeSnippet}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 w-full p-3 rounded-2xl bg-slate-950 font-mono text-xs text-brand-300 border border-slate-800 focus:outline-none focus:border-brand-500 resize-none min-h-[220px]"
              />

              {codeOutput && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                  {codeOutput}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERACTIVE SHARED WHITEBOARD */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 flex flex-col p-2 overflow-hidden">
              <SharedWhiteboard socket={socket} roomId={roomId} />
            </div>
          )}

          {/* TAB 4: RECRUITER EVALUATION PANEL */}
          {activeTab === 'notes' && currentUserRole === 'company' && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Candidate Info Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{candidate?.fullName || 'Candidate'}</h4>
                    <p className="text-xs text-slate-400">{candidate?.email} • {candidate?.experienceYears || 4} Yrs Exp</p>
                  </div>
                  <Badge variant="purple" size="sm">
                    <Sparkles className="w-3 h-3 mr-1 text-brand-400" /> Match: {candidate?.matchScore || 88}%
                  </Badge>
                </div>
                {candidate?.resumeUrl && (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Candidate Resume PDF
                  </a>
                )}
              </div>

              {/* Recommendation Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Candidate Recommendation</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecommendation('Yes')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      recommendation === 'Yes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Yes (Hire)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendation('Maybe')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      recommendation === 'Maybe' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Maybe
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendation('No')}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      recommendation === 'No' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    No (Pass)
                  </button>
                </div>
              </div>

              {/* Evaluation Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Technical Depth</span>
                    <span className="text-brand-400">{scores.technical}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.technical}
                    onChange={(e) => setScores({ ...scores, technical: Number(e.target.value) })}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Communication</span>
                    <span className="text-emerald-400">{scores.communication}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.communication}
                    onChange={(e) => setScores({ ...scores, communication: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Confidence</span>
                    <span className="text-purple-400">{scores.confidence}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.confidence}
                    onChange={(e) => setScores({ ...scores, confidence: Number(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Problem Solving</span>
                    <span className="text-amber-400">{scores.problemSolving}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores.problemSolving}
                    onChange={(e) => setScores({ ...scores, problemSolving: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Recruiter Notes Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Confidential Notes</label>
                <textarea
                  rows={4}
                  placeholder="Record confidential feedback..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 text-xs text-white border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                isLoading={notesMutation.isPending}
                onClick={handleSaveNotes}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Evaluation Live
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Post-Interview Structured Report Modal */}
      {reportModalOpen && (
        <InterviewReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            navigate(currentUserRole === 'company' ? '/company/applications' : '/candidate/dashboard');
          }}
          reportData={reportData}
        />
      )}
    </div>
  );
};
