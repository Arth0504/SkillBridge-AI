import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Briefcase,
  FileCheck,
  Award,
  TrendingUp,
  ArrowRight,
  UserCheck,
  FileText,
  Video,
  Code2,
  Bell,
  Upload,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { Button, Badge, Loader, AnimatedMetricCard, LiveActivityFeed } from '../../../components/common';
import { Avatar } from '../../../components/common/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { candidateApi } from '../../../api';

export const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // React Query Data Fetching
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['candidate-dashboard-summary'],
    queryFn: candidateApi.getDashboardSummary,
  });

  const { data: profileCompletionData } = useQuery({
    queryKey: ['candidate-profile-completion'],
    queryFn: candidateApi.getProfileCompletion,
  });

  const { data: upcomingInterviewsData } = useQuery({
    queryKey: ['candidate-upcoming-interviews'],
    queryFn: candidateApi.getUpcomingInterviews,
  });

  const { data: recentApplicationsData } = useQuery({
    queryKey: ['candidate-recent-applications'],
    queryFn: () => candidateApi.getApplications({ limit: 4 }),
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['candidate-recent-notifications'],
    queryFn: () => candidateApi.getNotifications({ limit: 5 }),
  });

  const summary = summaryData?.data || {};
  const completion = profileCompletionData?.data || { completionPercentage: summary?.profileCompletionPercentage ?? 0, missingSections: [] };
  const interviews = upcomingInterviewsData?.data?.interviews ?? [];
  const applications = recentApplicationsData?.data?.applications ?? summary?.recentApplications ?? [];
  const notifications = notificationsData?.data?.notifications ?? [];

  const stats = [
    { label: 'Applications Sent', value: summary?.totalApplications ?? applications.length, icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'AI Resume Score', value: summary?.resumeScore ? `${summary.resumeScore}/100` : 'Not Evaluated Yet', icon: Sparkles, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
    { label: 'Interviews Scheduled', value: summary?.interviewsScheduled ?? interviews.length, icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Saved Jobs', value: `${summary?.savedJobsCount ?? 0} Saved`, icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  if (isLoadingSummary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Candidate Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" icon={Sparkles}>
                Enterprise AI Talent Hub
              </Badge>
              <Badge variant="success">Verified Candidate</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.fullName || 'Candidate'}</span>! 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your profile is actively matching top technical roles. Boost your AI match rating by completing technical mock evaluations and optimizing your resume.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" onClick={() => navigate('/candidate/resume-analyzer')}>
                <Sparkles className="w-4 h-4 mr-2" /> Analyze Resume
              </Button>
              <Button variant="secondary" onClick={() => navigate('/candidate/ai-interview')}>
                <Video className="w-4 h-4 mr-2" /> AI Mock Interview
              </Button>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                <Search className="w-4 h-4 mr-2" /> Explore Jobs
              </Button>
            </div>
          </div>

          {/* User Profile Mini Badge */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0 bg-white/5 backdrop-blur-md">
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="lg" />
            <div>
              <h3 className="text-base font-bold text-white">{user?.fullName || 'Candidate Name'}</h3>
              <p className="text-xs text-slate-400">{user?.email || 'candidate@skillbridge.ai'}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-brand-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/candidate/profile')}>
                <UserCheck className="w-3.5 h-3.5" /> Edit Profile <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((st, idx) => (
          <AnimatedMetricCard
            key={idx}
            label={st.label}
            value={st.value}
            icon={st.icon}
            color={st.color}
            bg={st.bg}
          />
        ))}
      </div>

      {/* Grid Layout for Profile Completion & Resume Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Profile Completion Widget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-500" /> Profile Completion
            </h3>
            <span className="text-sm font-extrabold text-brand-500">{completion.completionPercentage || 85}%</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-600 to-accent-cyan h-full rounded-full transition-all duration-500"
              style={{ width: `${completion.completionPercentage || 85}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            A complete candidate profile increases visibility to top hiring companies by 3.5x.
          </p>

          {completion.missingSections && completion.missingSections.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pending Recommendations:</p>
              <div className="flex flex-wrap gap-2">
                {completion.missingSections.map((sec, i) => (
                  <Badge key={i} variant="warning" size="sm">
                    + Add {sec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full justify-center mt-2" onClick={() => navigate('/candidate/profile')}>
            Complete Profile Now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>

        {/* 4. Resume Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4 border border-brand-500/20 bg-gradient-to-b from-brand-900/10 to-transparent"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" /> ATS Resume Rating
            </h3>
            <Badge variant={summary?.resumeScore >= 75 ? 'success' : summary?.resumeScore >= 50 ? 'warning' : 'info'}>
              {summary?.resumeScore ? `${summary.resumeScore} / 100` : (user?.skills?.length ? `${Math.min(95, 50 + user.skills.length * 4)} / 100` : 'Not Scored')}
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Keyword Optimization:</span>
              <span className="font-bold text-emerald-500">{user?.skills?.length >= 5 ? 'High Overlap' : 'Needs Optimization'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Format & Structure:</span>
              <span className="font-bold text-emerald-500">ATS Compatible</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Profile Credentials:</span>
              <span className="font-bold text-brand-400">{user?.experience?.length ? `${user.experience.length} Experience Record(s)` : 'Add Experience Details'}</span>
            </div>
          </div>

          <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => navigate('/candidate/resume-analyzer')}>
            <Upload className="w-4 h-4 mr-1.5" /> Upload & Re-Analyze Resume
          </Button>
        </motion.div>

        {/* 8. Recent Notifications Quick Drawer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-500" /> Notifications
            </h3>
            <span
              className="text-xs text-brand-500 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate('/candidate/notifications')}
            >
              View All ({notifications.length})
            </span>
          </div>

          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{notif.createdAt || 'Recent'}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid Layout for Applications & Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-500" /> Active Job Applications
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/candidate/applications')}>
              View Application Tracker <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {applications.map((app, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/70"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.job?.title || 'Engineering Role'}</h4>
                    {app.matchScore && <Badge variant="purple">{app.matchScore}% Match</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {app.job?.companyName || 'Company'} • {app.job?.location || 'Remote'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={app.status === 'Interview Scheduled' ? 'success' : 'info'}>
                    {app.status || 'Applied'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/candidate/applications')}>
                    View Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 6. Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Upcoming Sessions
            </h3>
          </div>

          <div className="space-y-3">
            {interviews.map((iv, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{iv.title || 'Technical Interview'}</h4>
                  <Badge variant="success" size="sm">{iv.type || 'Live Session'}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{iv.companyName || 'SkillBridge Client'}</p>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-500/10 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {new Date(iv.date || Date.now()).toLocaleDateString()}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const rawRoomId = iv.roomId || (iv.meetingLink ? iv.meetingLink.replace('/interview/room/', '') : iv._id);
                      navigate(`/interview/room/${rawRoomId}`);
                    }}
                  >
                    Join Private Room
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 7. AI Job Recommendations & 9. Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Top AI Job Matches
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
              Explore <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { title: 'Senior AI Engineer', company: 'Tech Corp AI', location: 'Remote', salary: '$140k - $180k', match: '96%' },
              { title: 'Full Stack React Developer', company: 'Nexus Labs', location: 'New York, NY', salary: '$120k - $150k', match: '94%' },
            ].map((job, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-brand-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.title}</h4>
                    <Badge variant="purple">{job.match}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{job.company} • {job.location}</p>
                  <p className="text-xs font-semibold text-emerald-500 mt-1">{job.salary}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => navigate('/jobs')}>
                  View Position <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" /> My Activity Log
            </h3>
          </div>
          <LiveActivityFeed limit={3} userFilter={{ id: user?._id || user?.id, role: 'candidate' }} />
        </div>

        {/* 9. Quick Action Hub */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-brand-500/20 bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" /> Quick Career Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Launch AI tools and improve your interview readiness score instantly.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/candidate/resume-analyzer')}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Upload & Score Resume</h4>
                  <p className="text-[10px] text-slate-400">Instant ATS analysis & feedback</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/candidate/resume-builder')}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Create AI Resume</h4>
                  <p className="text-[10px] text-slate-400">Build resume from premium templates</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/candidate/ai-interview')}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Start AI Mock Interview</h4>
                  <p className="text-[10px] text-slate-400">Practice questions with Gemini AI</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/candidate/ai-coding')}
              className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Technical Coding Test</h4>
                  <p className="text-[10px] text-slate-400">Solve live coding challenges</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
