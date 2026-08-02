import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader } from '../components/common/Loader';

// Layouts
import { LandingLayout } from '../layouts/LandingLayout';
import { CandidateLayout } from '../layouts/CandidateLayout';
import { CompanyLayout } from '../layouts/CompanyLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Guard
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../pages/LandingPage').then(m => ({ default: m.LandingPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const ServerErrorPage = lazy(() => import('../pages/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })));
const OfflinePage = lazy(() => import('../pages/OfflinePage').then(m => ({ default: m.OfflinePage })));

// Auth Features (Lazy Loaded)
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));

// Jobs Feature (Lazy Loaded)
const JobsListPage = lazy(() => import('../features/jobs/pages/JobsListPage').then(m => ({ default: m.JobsListPage })));
const JobDetailPage = lazy(() => import('../features/jobs/pages/JobDetailPage').then(m => ({ default: m.JobDetailPage })));
const JobPostingPage = lazy(() => import('../features/jobs/pages/JobPostingPage').then(m => ({ default: m.JobPostingPage })));
const CompanyJobsPage = lazy(() => import('../features/jobs/pages/CompanyJobsPage').then(m => ({ default: m.CompanyJobsPage })));

// Candidate Features (Lazy Loaded)
const CandidateDashboardPage = lazy(() => import('../features/candidate/pages/CandidateDashboardPage').then(m => ({ default: m.CandidateDashboardPage })));
const CandidateProfilePage = lazy(() => import('../features/candidate/pages/CandidateProfilePage').then(m => ({ default: m.CandidateProfilePage })));
const PublicProfilePage = lazy(() => import('../features/candidate/pages/PublicProfilePage').then(m => ({ default: m.PublicProfilePage })));
const SavedJobsPage = lazy(() => import('../features/candidate/pages/SavedJobsPage').then(m => ({ default: m.SavedJobsPage })));
const CandidateSettingsPage = lazy(() => import('../features/candidate/pages/CandidateSettingsPage').then(m => ({ default: m.CandidateSettingsPage })));

// Company Features (Lazy Loaded)
const CompanyDashboardPage = lazy(() => import('../features/company/pages/CompanyDashboardPage').then(m => ({ default: m.CompanyDashboardPage })));
const CompanyProfilePage = lazy(() => import('../features/company/pages/CompanyProfilePage').then(m => ({ default: m.CompanyProfilePage })));
const PublicCompanyProfilePage = lazy(() => import('../features/company/pages/PublicCompanyProfilePage').then(m => ({ default: m.PublicCompanyProfilePage })));
const CompanyApplicationsPage = lazy(() => import('../features/company/pages/CompanyApplicationsPage').then(m => ({ default: m.CompanyApplicationsPage })));
const CompanyInterviewsPage = lazy(() => import('../features/company/pages/CompanyInterviewsPage').then(m => ({ default: m.CompanyInterviewsPage })));
const CompanyCalendarPage = lazy(() => import('../features/company/pages/CompanyCalendarPage').then(m => ({ default: m.CompanyCalendarPage })));
const CompanyAnalyticsPage = lazy(() => import('../features/company/pages/CompanyAnalyticsPage').then(m => ({ default: m.CompanyAnalyticsPage })));
const CompanySettingsPage = lazy(() => import('../features/company/pages/CompanySettingsPage').then(m => ({ default: m.CompanySettingsPage })));

// Admin Features (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('../features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('../features/admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminCompaniesPage = lazy(() => import('../features/admin/pages/AdminCompaniesPage').then(m => ({ default: m.AdminCompaniesPage })));
const AdminJobModerationPage = lazy(() => import('../features/admin/pages/AdminJobModerationPage').then(m => ({ default: m.AdminJobModerationPage })));
const AdminAIMonitoringPage = lazy(() => import('../features/admin/pages/AdminAIMonitoringPage').then(m => ({ default: m.AdminAIMonitoringPage })));
const AdminAnalyticsPage = lazy(() => import('../features/admin/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminNotificationsPage = lazy(() => import('../features/admin/pages/AdminNotificationsPage').then(m => ({ default: m.AdminNotificationsPage })));
const AdminSettingsPage = lazy(() => import('../features/admin/pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminAuditLogsPage = lazy(() => import('../features/admin/pages/AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })));
const AdminRBACPage = lazy(() => import('../features/admin/pages/AdminRBACPage').then(m => ({ default: m.AdminRBACPage })));

// Other Feature Pages (Lazy Loaded)
const ApplicationsListPage = lazy(() => import('../features/applications/pages/ApplicationsListPage').then(m => ({ default: m.ApplicationsListPage })));
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ResumeAnalyzerPage = lazy(() => import('../features/resume/pages/ResumeAnalyzerPage').then(m => ({ default: m.ResumeAnalyzerPage })));
const InterviewPrepPage = lazy(() => import('../features/interview/pages/InterviewPrepPage').then(m => ({ default: m.InterviewPrepPage })));
const CodingAssessmentPage = lazy(() => import('../features/coding/pages/CodingAssessmentPage').then(m => ({ default: m.CodingAssessmentPage })));
const VideoInterviewPage = lazy(() => import('../features/videoInterview/pages/VideoInterviewPage').then(m => ({ default: m.VideoInterviewPage })));
const PrivateInterviewRoomPage = lazy(() => import('../features/videoInterview/pages/PrivateInterviewRoomPage').then(m => ({ default: m.PrivateInterviewRoomPage })));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen text="Loading SkillBridge AI..." />}>
      <Routes>
        {/* Public Routes inside Landing Layout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/candidate/public/:candidateId" element={<PublicProfilePage />} />
          <Route path="/company/public/:companyId" element={<PublicCompanyProfilePage />} />
        </Route>

        {/* Auth Standalone Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Candidate Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
            <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/candidate/applications" element={<ApplicationsListPage />} />
            <Route path="/candidate/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/candidate/ai-interview" element={<InterviewPrepPage />} />
            <Route path="/candidate/ai-coding" element={<CodingAssessmentPage />} />
            <Route path="/candidate/video-interview" element={<VideoInterviewPage />} />
            <Route path="/candidate/notifications" element={<NotificationsPage />} />
            <Route path="/candidate/settings" element={<CandidateSettingsPage />} />
          </Route>
        </Route>

        {/* Company Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['company']} />}>
          <Route element={<CompanyLayout />}>
            <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/jobs" element={<CompanyJobsPage />} />
            <Route path="/company/jobs/new" element={<JobPostingPage />} />
            <Route path="/company/jobs/edit/:id" element={<JobPostingPage />} />
            <Route path="/company/applications" element={<CompanyApplicationsPage />} />
            <Route path="/company/interviews" element={<CompanyInterviewsPage />} />
            <Route path="/company/calendar" element={<CompanyCalendarPage />} />
            <Route path="/company/analytics" element={<CompanyAnalyticsPage />} />
            <Route path="/company/notifications" element={<NotificationsPage />} />
            <Route path="/company/settings" element={<CompanySettingsPage />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/jobs" element={<AdminJobModerationPage />} />
            <Route path="/admin/ai-monitoring" element={<AdminAIMonitoringPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
            <Route path="/admin/rbac" element={<AdminRBACPage />} />
            <Route path="/admin/metrics" element={<AdminAIMonitoringPage />} />
          </Route>
        </Route>

        {/* Private Encrypted Video Interview Room Route */}
        <Route element={<ProtectedRoute allowedRoles={['candidate', 'company', 'admin']} />}>
          <Route path="/interview/room/:roomId" element={<PrivateInterviewRoomPage />} />
        </Route>

        {/* System Error & Fallback Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
