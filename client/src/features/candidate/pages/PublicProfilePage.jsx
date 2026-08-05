import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Globe,
  Github,
  Linkedin,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { candidateApi } from '../../../api/candidateApi';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Loader } from '../../../components/common/Loader';
import { ErrorState } from '../../../components/common/ErrorState';

export const PublicProfilePage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['publicCandidateProfile', candidateId],
    queryFn: () => candidateApi.getPublicProfile(candidateId),
    enabled: Boolean(candidateId),
  });

  const candidate = data?.data?.candidate;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <Loader size="lg" text="Loading Candidate Public Profile..." />
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19]">
        <ErrorState
          title="Candidate Profile Unavailable"
          description="The requested candidate profile could not be found or is private."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link to={-1}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <Badge variant="purple" icon={Sparkles}>
            SkillBridge AI Verified Candidate
          </Badge>
        </div>

        {/* Profile Card Header */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 border border-brand-500/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            <Avatar
              src={candidate.avatarUrl}
              name={candidate.fullName}
              size="xl"
              className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-brand-500/30 shadow-2xl"
            />
            <div className="space-y-2 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {candidate.fullName}
              </h1>
              {candidate.headline && (
                <p className="text-sm font-semibold text-brand-400">{candidate.headline}</p>
              )}
              {candidate.location && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.bio && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed pt-2">
                  {candidate.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                {candidate.socialLinks?.portfolio && (
                  <a
                    href={candidate.socialLinks.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" /> Portfolio
                  </a>
                )}
                {candidate.socialLinks?.github && (
                  <a
                    href={candidate.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-300" /> GitHub
                  </a>
                )}
                {candidate.socialLinks?.linkedin && (
                  <a
                    href={candidate.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
                  </a>
                )}
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Resume
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 text-xs font-semibold text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60"
                  >
                    <FileText className="w-3.5 h-3.5" /> No Resume Uploaded
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-500" /> Technical Skills & Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Professional Experience */}
        {candidate.experience && candidate.experience.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" /> Experience History
            </h3>
            <div className="space-y-4">
              {candidate.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</h4>
                  <p className="text-xs font-semibold text-brand-500">{exp.company} • {exp.location}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {candidate.education && candidate.education.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-cyan" /> Education & Background
            </h3>
            <div className="space-y-3">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.degree}</h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{edu.institution}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
