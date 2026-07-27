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
} from 'lucide-react';
import { Button, Badge, Loader, EmptyState, Drawer, Textarea, Search } from '../../../components/common';
import { companyApi } from '../../../api';
import toast from 'react-hot-toast';

export const CompanyApplicationsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters state
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [expFilter, setExpFilter] = useState('ALL'); // ALL, 0-2, 3-5, 5+
  const [stageFilter, setStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating, score

  const [selectedApp, setSelectedApp] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [collapsedJobs, setCollapsedJobs] = useState({});

  const toggleJobCollapse = (jobId) => {
    setCollapsedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  // Fetch Company Applications (real MongoDB data)
  const { data: appsResponse, isLoading } = useQuery({
    queryKey: ['company-applications', stageFilter],
    queryFn: () => companyApi.getApplications({ limit: 100, status: stageFilter === 'ALL' ? undefined : stageFilter }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const rawApplications = appsResponse?.data?.applications ?? [];

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => companyApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      toast.success('Candidate stage updated!');
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

      // Candidate search (name, email, phone)
      if (candidateSearch.trim()) {
        const cTerm = candidateSearch.trim().toLowerCase();
        if (!candName.includes(cTerm) && !candEmail.includes(cTerm) && !candPhone.includes(cTerm)) {
          return false;
        }
      }

      // Job search
      if (jobSearch.trim()) {
        const jTerm = jobSearch.trim().toLowerCase();
        if (!jobTitle.includes(jTerm)) {
          return false;
        }
      }

      // Skill search
      if (skillSearch.trim()) {
        const sTerm = skillSearch.trim().toLowerCase();
        const skills = (cand.skills || []).map((s) => String(s).toLowerCase());
        if (!skills.some((sk) => sk.includes(sTerm))) {
          return false;
        }
      }

      // Experience filter
      const exp = cand.experienceYears ?? app.candidateSnapshot?.experienceYears ?? 0;
      if (expFilter === '0-2' && (exp < 0 || exp > 2)) return false;
      if (expFilter === '3-5' && (exp < 3 || exp > 5)) return false;
      if (expFilter === '5+' && exp < 5) return false;

      return true;
    });
  }, [rawApplications, candidateSearch, jobSearch, skillSearch, expFilter]);

  // Group applications by Job Post with live counts
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

    // Convert map to array and sort jobs & candidate lists
    return Object.values(map)
      .map((group) => {
        const sortedApps = [...group.applications].sort((a, b) => {
          if (sortBy === 'oldest') {
            return new Date(a.appliedAt || a.createdAt || 0) - new Date(b.appliedAt || b.createdAt || 0);
          }
          if (sortBy === 'score') {
            return (b.matchScore || b.rating || 0) - (a.matchScore || a.rating || 0);
          }
          // Default: newest first
          return new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0);
        });

        const newestApplied = sortedApps[0]
          ? new Date(sortedApps[0].appliedAt || sortedApps[0].createdAt || 0).getTime()
          : 0;

        return {
          ...group,
          applications: sortedApps,
          newestApplied,
        };
      })
      .sort((a, b) => b.newestApplied - a.newestApplied);
  }, [filteredApps, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading ATS Applicant Control Center..." />
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
                Applicant Tracking System <Badge variant="purple" size="sm">Live ATS</Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enterprise candidate pipeline organized by Job Vacancy Postings with live status counts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Multi-Filter Bar */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl bg-slate-900/90">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-brand-400" /> Pipeline Filters & Search
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Candidate Search */}
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

          {/* Job Search */}
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

          {/* Skill Filter */}
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

          {/* Experience Filter */}
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

          {/* Stage Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Stage Status</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="ALL">All Application Stages</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Sort Candidates By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score">Highest AI Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Job-Grouped Sections */}
      {groupedJobSections.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Applicants Match Filters"
          description="No candidate applications match your specified search, skill, or stage filter criteria."
        />
      ) : (
        <div className="space-y-8">
          {groupedJobSections.map((group) => (
            <div key={group.jobId} className="space-y-4">
              {/* ATS Job Post Accordion Header */}
              <div
                onClick={() => toggleJobCollapse(group.jobId)}
                className="glass-panel p-6 rounded-3xl border border-brand-500/30 bg-slate-900/90 hover:bg-slate-800/90 transition-all cursor-pointer space-y-4 shadow-xl"
              >
                {/* Job Info Header Line */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-brand-400">
                      {collapsedJobs[group.jobId] ? (
                        <ChevronRight className="w-5 h-5 transition-transform" />
                      ) : (
                        <ChevronDown className="w-5 h-5 transition-transform" />
                      )}
                    </div>
                    <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        {group.jobTitle}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-brand-400 font-bold">{group.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {group.location}</span>
                        <span>•</span>
                        <span>{group.employmentType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> Posted: {new Date(group.postedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="purple" size="md">
                    Total Applicants: {group.counts.total}
                  </Badge>
                </div>

                {/* Live Calculated Status Counts Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 pt-2 border-t border-slate-800/80">
                  <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Applicants</p>
                    <p className="text-sm font-extrabold text-white">{group.counts.total}</p>
                  </div>
                  <div className="bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-blue-400">Applied</p>
                    <p className="text-sm font-extrabold text-blue-400">{group.counts.applied}</p>
                  </div>
                  <div className="bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-amber-400">Under Review</p>
                    <p className="text-sm font-extrabold text-amber-400">{group.counts.underReview}</p>
                  </div>
                  <div className="bg-purple-500/10 px-3 py-2 rounded-xl border border-purple-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-400">Shortlisted</p>
                    <p className="text-sm font-extrabold text-purple-400">{group.counts.shortlisted}</p>
                  </div>
                  <div className="bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-indigo-400">Interview</p>
                    <p className="text-sm font-extrabold text-indigo-400">{group.counts.interviewScheduled}</p>
                  </div>
                  <div className="bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Selected</p>
                    <p className="text-sm font-extrabold text-emerald-400">{group.counts.selected}</p>
                  </div>
                  <div className="bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 text-center">
                    <p className="text-[10px] uppercase font-bold text-rose-400">Rejected</p>
                    <p className="text-sm font-extrabold text-rose-400">{group.counts.rejected}</p>
                  </div>
                </div>
              </div>

              {/* Candidate Cards Grid for this Job */}
              {!collapsedJobs[group.jobId] && (
                <div className="space-y-4 pl-0 sm:pl-3">
                  {group.applications.map((app, idx) => {
                    const cand = app.candidate || app;
                    const candName = cand.fullName || app.candidateSnapshot?.fullName || 'Candidate Name';
                    const candEmail = cand.email || app.candidateSnapshot?.email || '';
                    const candPhone = cand.phone || app.candidateSnapshot?.phone || '';
                    const resumeUrl = app.resumeUrl || cand.resumeUrl || app.candidateSnapshot?.resumeUrl || '';
                    const initials = candName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-brand-500/40 hover:shadow-2xl transition-all"
                      >
                        {/* Candidate Identity Section */}
                        <div className="flex items-start gap-4 flex-1">
                          {/* Photo / Avatar */}
                          {cand.avatarUrl ? (
                            <img
                              src={cand.avatarUrl}
                              alt={candName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-extrabold text-lg flex items-center justify-center border-2 border-brand-500/30 shrink-0 shadow-lg shadow-brand-500/10">
                              {initials}
                            </div>
                          )}

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-white tracking-tight">{candName}</h3>
                              {app.matchScore && (
                                <Badge variant="purple" size="sm">
                                  {app.matchScore}% AI Match
                                </Badge>
                              )}
                              <Badge variant="info" size="sm">
                                {app.status || 'Applied'}
                              </Badge>
                            </div>

                            <p className="text-xs font-semibold text-brand-400">
                              {cand.headline || 'Software Engineer'}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                              {candEmail && (
                                <span className="flex items-center gap-1 text-slate-300">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {candEmail}
                                </span>
                              )}
                              {candPhone && (
                                <span className="flex items-center gap-1 text-slate-300">
                                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {candPhone}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-slate-400">
                                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {cand.experienceYears ?? 0} Years Exp
                              </span>
                              {app.appliedAt && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Skills Tags */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {(cand.skills || []).slice(0, 5).map((sk, i) => (
                                <Badge key={i} variant="secondary" size="sm">
                                  {sk}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Controls & Quick Actions */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          {/* Resume Quick Access Buttons */}
                          {resumeUrl ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 transition-all flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Resume
                              </a>
                              <a
                                href={resumeUrl}
                                download="Candidate_Resume.pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </div>
                          ) : (
                            <button
                              disabled
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-slate-500 border border-slate-800/80 cursor-not-allowed flex items-center gap-1 opacity-60"
                            >
                              <FileText className="w-3.5 h-3.5" /> No Resume Uploaded
                            </button>
                          )}

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => ratingMutation.mutate({ id: app._id, rating: star })}
                                className="text-amber-400 hover:scale-125 transition-transform"
                              >
                                <Star className={`w-4 h-4 ${star <= (app.rating || 0) ? 'fill-amber-400' : 'text-slate-700'}`} />
                              </button>
                            ))}
                          </div>

                          {/* Stage Select Box */}
                          <select
                            value={app.status || 'Applied'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const payload = { status: newStatus };
                              if (newStatus === 'Interview Scheduled' && !app.interviewDate) {
                                payload.interviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
                              }
                              statusMutation.mutate({ id: app._id, ...payload });
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Interview Completed">Interview Completed</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {/* Shortlist Quick Action */}
                          {app.status !== 'Shortlisted' && (
                            <button
                              onClick={() => statusMutation.mutate({ id: app._id, status: 'Shortlisted' })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                            </button>
                          )}

                          {/* Reject Quick Action */}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() => statusMutation.mutate({ id: app._id, status: 'Rejected' })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          )}

                          {/* Schedule Interview */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/company/interviews', { state: { applicant: app } })}
                          >
                            Schedule Interview
                          </Button>

                          {/* View Profile */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setFeedbackNote(app.feedback || '');
                            }}
                          >
                            View Profile <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile & Recruiter Notes Drawer */}
      <Drawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.candidate?.fullName || selectedApp?.candidateSnapshot?.fullName || 'Candidate Profile'}
      >
        {selectedApp && (() => {
          const drawerResumeUrl =
            selectedApp.resumeUrl ||
            selectedApp.candidate?.resumeUrl ||
            selectedApp.candidateSnapshot?.resumeUrl ||
            '';
          const drawerCand = selectedApp.candidate || selectedApp;
          const candName = drawerCand.fullName || selectedApp.candidateSnapshot?.fullName || 'Candidate';
          const candEmail = drawerCand.email || selectedApp.candidateSnapshot?.email || 'No email provided';
          const candPhone = drawerCand.phone || selectedApp.candidateSnapshot?.phone || 'No phone provided';

          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                {drawerCand.avatarUrl ? (
                  <img src={drawerCand.avatarUrl} alt={candName} className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center border-2 border-brand-500/30">
                    {candName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{candName}</h3>
                  <p className="text-xs text-brand-400 font-semibold">{drawerCand.headline || 'Software Engineer'}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span><Mail className="w-3 h-3 inline mr-1" />{candEmail}</span>
                    {candPhone && <span><Phone className="w-3 h-3 inline mr-1" />{candPhone}</span>}
                  </p>
                </div>
              </div>

              {/* Resume Panel */}
              {drawerResumeUrl ? (
                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                      <FileText className="w-4 h-4" /> Candidate Resume PDF Attached
                    </div>
                    <Badge variant="success" size="sm">Verified Document</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={drawerResumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs font-bold text-center bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Resume PDF
                    </a>
                    <a
                      href={drawerResumeUrl}
                      download="Candidate_Resume.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 font-semibold">
                  No resume file attached to this application.
                </div>
              )}

              {/* Cover Note Pitch */}
              {selectedApp.coverLetter && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white">Cover Note / Pitch</h4>
                  <p className="text-xs text-slate-300 bg-slate-800/60 p-4 rounded-2xl italic leading-relaxed">
                    "{selectedApp.coverLetter}"
                  </p>
                </div>
              )}

              {/* Recruiter Notes Textarea */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white">Internal Recruiter Notes</h4>
                <Textarea
                  rows={4}
                  placeholder="Write internal team feedback, screening impressions, or salary notes..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                />
                <Button variant="primary" size="sm" isLoading={feedbackMutation.isPending} onClick={handleSaveNotes}>
                  Save Recruiter Notes
                </Button>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};
