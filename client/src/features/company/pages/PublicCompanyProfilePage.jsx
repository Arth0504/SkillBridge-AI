import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ArrowLeft,
  Home,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { companyApi } from '../../../api/companyApi';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Loader } from '../../../components/common/Loader';
import { ErrorState } from '../../../components/common/ErrorState';
import { formatCurrency } from '../../../utils/formatters';

export const PublicCompanyProfilePage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['publicCompanyProfile', companyId],
    queryFn: () => companyApi.getPublicProfile(companyId),
    enabled: Boolean(companyId),
  });

  const company = data?.data?.company;
  const openJobs = data?.data?.openJobs || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
        <Loader size="lg" text="Loading Employer Profile..." />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19]">
        <ErrorState
          title="Company Profile Unavailable"
          description="The requested company profile could not be found."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2 text-brand-500" /> Home
              </Button>
            </Link>
          </div>
          <Badge variant="purple" icon={Sparkles}>
            Verified SkillBridge Enterprise Employer
          </Badge>
        </div>

        {/* Company Header Card */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 border border-brand-500/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            <Avatar
              src={company.logoUrl}
              name={company.companyName}
              size="xl"
              className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-brand-500/30 shadow-2xl rounded-2xl"
            />
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {company.companyName}
                </h1>
                <Badge variant="success" icon={ShieldCheck}>Verified</Badge>
              </div>

              {company.industry && (
                <p className="text-sm font-semibold text-brand-400">{company.industry}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {company.location}
                  </span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {company.companySize} Employees
                  </span>
                )}
              </div>

              {/* Social & Website Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-lg transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Visit Official Website <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Company Overview / About */}
        {company.description && (
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-500" /> About {company.companyName}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </div>
        )}

        {/* Open Job Vacancies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" /> Active Job Opportunities
            </h3>
            <Badge variant="purple">{openJobs.length} Openings</Badge>
          </div>

          {openJobs.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card text-center text-xs text-slate-400 border border-slate-800">
              No active job openings currently posted by {company.companyName}. Check back soon!
            </div>
          ) : (
            <div className="space-y-4">
              {openJobs.map((job) => (
                <div
                  key={job._id}
                  className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xl transition-all"
                >
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location?.city || job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.employmentType}</span>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/jobs/${job.slug || job._id}`)}>
                    View & Apply
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicCompanyProfilePage;
