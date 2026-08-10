import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  Star,
  FileText,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  User,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowRight,
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Textarea } from '../../../components/common';
import { companyApi } from '../../../api';
import { CandidateReportModal } from '../components/CandidateReportModal';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import toast from 'react-hot-toast';

// 8 Enterprise Kanban Pipeline Stages
const KANBAN_STAGES = [
  { id: 'Applied', name: 'Applied', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'Screening', name: 'Screening', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
  { id: 'Interview Scheduled', name: 'Interview', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { id: 'Technical Round', name: 'Technical Round', color: 'border-brand-500/40 text-brand-400 bg-brand-500/10' },
  { id: 'HR Round', name: 'HR Round', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'Offer', name: 'Offer Extended', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'Selected', name: 'Hired', color: 'border-teal-500/40 text-teal-400 bg-teal-500/10' },
  { id: 'Rejected', name: 'Rejected', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
];

export const CompanyApplicationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters & View Mode State
  const [viewMode, setViewMode] = useState('board'); // 'board' (Kanban) | 'list'
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [expFilter, setExpFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [reportApplication, setReportApplication] = useState(null);
  const [scheduleApplication, setScheduleApplication] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [collapsedJobs, setCollapsedJobs] = useState({});

  const toggleJobCollapse = (jobId) => {
    setCollapsedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Fetch Company Applications
  const { data: appsResponse, isLoading } = useQuery({
    queryKey: ['company-applications', stageFilter],
    queryFn: () => companyApi.getApplications({ limit: 100, status: stageFilter === 'ALL' ? undefined : stageFilter }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const rawApplications = appsResponse?.data?.applications ?? [];

  // Stage Update Mutation with Socket & DB Sync
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => companyApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      toast.success('Candidate stage updated live!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Status update failed.');
    },
  });

  const ratingMutation = useMutation({
    mutationFn: ({ id, rating }) => companyApi.updateApplicationRating(id, rating),
    onSuccess: () => {
      toast.success('Candidate rating saved!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }) => companyApi.updateApplicationFeedback(id, feedback),
    onSuccess: () => {
      toast.success('Recruiter notes saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
  });

  const onboardMutation = useMutation({
    mutationFn: (appId) => companyApi.onboardEmployee({ applicationId: appId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Candidate auto-onboarded to HRMS!');
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
      queryClient.invalidateQueries({ queryKey: ['company-employees'] });
      navigate('/company/employees');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Auto onboarding failed.');
    },
  });

  const handleSaveNotes = () => {
    if (!selectedApp) return;
    feedbackMutation.mutate({ id: selectedApp._id, feedback: feedbackNote });
  };

  // Filter applications by search controls
  const filteredApps = useMemo(() => {
    return rawApplications.filter((app) => {
      const cand = app.candidate || app;
      const candName = (cand.fullName || app.candidateSnapshot?.fullName || '').toLowerCase();
      const candEmail = (cand.email || app.candidateSnapshot?.email || '').toLowerCase();
      const candPhone = (cand.phone || app.candidateSnapshot?.phone || '').toLowerCase();
      const jobTitle = (app.job?.title || app.jobId?.title || app.title || '').toLowerCase();

      if (candidateSearch.trim()) {
        const cTerm = candidateSearch.trim().toLowerCase();
        if (!candName.includes(cTerm) && !candEmail.includes(cTerm) && !candPhone.includes(cTerm)) {
          return false;
        }
      }

      if (jobSearch.trim()) {
        const jTerm = jobSearch.trim().toLowerCase();
        if (!jobTitle.includes(jTerm)) return false;
      }

      if (skillSearch.trim()) {
        const sTerm = skillSearch.trim().toLowerCase();
        const skills = (cand.skills || []).map((s) => String(s).toLowerCase());
        if (!skills.some((sk) => sk.includes(sTerm))) return false;
      }

      const exp = cand.experienceYears ?? app.candidateSnapshot?.experienceYears ?? 0;
      if (expFilter === '0-2' && (exp < 0 || exp > 2)) return false;
      if (expFilter === '3-5' && (exp < 3 || exp > 5)) return false;
      if (expFilter === '5+' && exp < 5) return false;

      return true;
    });
  }, [rawApplications, candidateSearch, jobSearch, skillSearch, expFilter]);

  // Group applications by Kanban Stages for Kanban View
  const kanbanColumns = useMemo(() => {
    const cols = {};
    KANBAN_STAGES.forEach((st) => {
      cols[st.id] = [];
    });

    filteredApps.forEach((app) => {
      const currentSt = app.status || 'Applied';
      if (cols[currentSt]) {
        cols[currentSt].push(app);
      } else {
        cols['Applied'].push(app);
      }
    });

    return cols;
  }, [filteredApps]);

  // Group applications by Job Post for List View
  const groupedJobSections = useMemo(() => {
    const map = {};

    filteredApps.forEach((app) => {
      const jId = app.job?._id || app.jobId?._id || app.jobId || 'unassigned';
      const jTitle = app.job?.title || app.jobId?.title || app.title || 'General Vacancies';
      const jDept = app.job?.department || app.jobId?.department || 'Engineering';
      const jLoc = app.job?.location || 'Remote';
      const jType = app.job?.employmentType || 'Full Time';
      const jPosted = app.job?.createdAt || app.createdAt;

      if (!map[jId]) {
        map[jId] = {
          jobId: jId,
          jobTitle: jTitle,
          department: jDept,
          location: jLoc,
          employmentType: jType,
          postedAt: jPosted,
          applications: [],
          counts: {
            total: 0,
            applied: 0,
            underReview: 0,
            shortlisted: 0,
            interviewScheduled: 0,
            selected: 0,
            rejected: 0,
          },
        };
      }

      map[jId].applications.push(app);
      map[jId].counts.total += 1;

      const st = app.status || 'Applied';
      if (st === 'Applied') map[jId].counts.applied += 1;
      else if (st === 'Under Review') map[jId].counts.underReview += 1;
      else if (st === 'Shortlisted') map[jId].counts.shortlisted += 1;
      else if (st === 'Interview Scheduled' || st === 'Interview Completed') map[jId].counts.interviewScheduled += 1;
      else if (st === 'Selected') map[jId].counts.selected += 1;
      else if (st === 'Rejected') map[jId].counts.rejected += 1;
    });

    return Object.values(map).map((group) => {
      const sortedApps = [...group.applications].sort((a, b) => {
        if (sortBy === 'score') return (b.matchScore || 0) - (a.matchScore || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      return { ...group, applications: sortedApps };
    });
  }, [filteredApps, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading Enterprise Recruitment Pipeline..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Recruiter Pipeline Board <Badge variant="purple" size="sm">Live Kanban</Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise applicant tracking Kanban board with instant MongoDB stage updates & Socket.IO sync.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('board')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'board' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'list' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Vacancy List View
          </button>
        </div>
      </div>

      {/* 2. Top Multi-Filter Bar */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800 shadow-xl bg-slate-900/90">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-brand-400" /> Pipeline Search & Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Search Candidate</label>
            <input
              type="text"
              placeholder="Name, Email, Phone..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Search Job Title</label>
            <input
              type="text"
              placeholder="Job Title..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Filter by Skill</label>
            <input
              type="text"
              placeholder="React, Python, AWS..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Experience</label>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="ALL">All Experience Levels</option>
              <option value="0-2">0 - 2 Years</option>
              <option value="3-5">3 - 5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Sort Candidates</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="score">Highest AI Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. KANBAN BOARD VIEW (MODULE 3) */}
      {viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
          {KANBAN_STAGES.map((col) => {
            const columnApps = kanbanColumns[col.id] || [];

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${col.color.split(' ')[2]}`}></span>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{col.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {columnApps.length}
                  </span>
                </div>

                {/* Candidate Cards Column Stack */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {columnApps.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No candidates in this stage.
                    </div>
                  ) : (
                    columnApps.map((app) => {
                      const cand = app.candidate || app;
                      const candName = cand.fullName || app.candidateSnapshot?.fullName || 'Candidate';
                      const jobTitle = app.job?.title || app.jobId?.title || 'Position';

                      return (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-brand-500/50 shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                                {candName}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium">{jobTitle}</p>
                            </div>
                            <Badge variant="purple" size="sm">
                              {app.matchScore !== null && app.matchScore !== undefined ? `${app.matchScore}%` : 'N/A'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>{cand.experienceYears || 2} Yrs Exp</span>
                            <span>{new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>

                          {/* Action Selector */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                            <select
                              value={app.status || 'Applied'}
                              onChange={(e) => statusMutation.mutate({ id: app._id, status: e.target.value })}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-800 text-white focus:outline-none cursor-pointer"
                            >
                              {KANBAN_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setFeedbackNote(app.feedback || '');
                              }}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-all"
                              title="View Details"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-6">
          {groupedJobSections.map((group) => (
            <div key={group.jobId} className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{group.jobTitle}</h3>
                <Badge variant="purple">{group.applications.length} Applicants</Badge>
              </div>

              <div className="space-y-3">
                {group.applications.map((app) => (
                  <div key={app._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">{app.candidate?.fullName || 'Candidate'}</h4>
                      <p className="text-xs text-slate-400">{app.candidate?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{app.status || 'Applied'}</Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Candidate Profile Drawer */}
      <Drawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.candidate?.fullName || 'Candidate Profile'}
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedApp.candidate?.fullName}</h4>
                  <p className="text-xs text-slate-400">{selectedApp.candidate?.email}</p>
                </div>
                <Badge variant="purple">Stage: {selectedApp.status}</Badge>
              </div>

              {/* Auto Onboard to HRMS Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  isLoading={onboardMutation.isPending}
                  onClick={() => onboardMutation.mutate(selectedApp._id)}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-brand-400" /> Auto Onboard to HRMS
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white">Recruiter Notes</h4>
              <Textarea
                rows={4}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Record candidate evaluation notes..."
              />
              <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <CandidateReportModal
        isOpen={Boolean(reportApplication)}
        onClose={() => setReportApplication(null)}
        application={reportApplication}
      />

      <ScheduleInterviewModal
        isOpen={Boolean(scheduleApplication)}
        onClose={() => setScheduleApplication(null)}
        application={scheduleApplication}
      />
    </div>
  );
};
