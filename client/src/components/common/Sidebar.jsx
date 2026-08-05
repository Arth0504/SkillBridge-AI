import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Code2,
  Video,
  Bell,
  Settings,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Building,
  Activity,
  Lock,
  BarChart3,
  Globe,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = ({ role = 'candidate', isCollapsed, onToggle }) => {
  const navGroups = {
    candidate: [
      { label: 'Overview', icon: LayoutDashboard, path: '/candidate/dashboard' },
      { label: 'Saved Jobs', icon: Briefcase, path: '/candidate/saved-jobs' },
      { label: 'Applications', icon: FileText, path: '/candidate/applications' },
      { label: 'AI Resume Analyzer', icon: Sparkles, path: '/candidate/resume-analyzer' },
      { label: 'AI Resume Builder', icon: FileText, path: '/candidate/resume-builder' },
      { label: 'AI Portfolio Builder', icon: Globe, path: '/candidate/portfolio-builder' },
      { label: 'AI Career Copilot', icon: Sparkles, path: '/candidate/ai-career-copilot' },
      { label: 'AI Mock Interview', icon: MessageSquare, path: '/candidate/ai-interview' },
      { label: 'AI Coding Assessment', icon: Code2, path: '/candidate/ai-coding' },
      { label: 'AI Video Interview', icon: Video, path: '/candidate/video-interview' },
      { label: 'Notifications', icon: Bell, path: '/candidate/notifications' },
      { label: 'Profile', icon: User, path: '/candidate/profile' },
      { label: 'Settings', icon: Settings, path: '/candidate/settings' },
    ],
    company: [
      { label: 'Overview', icon: LayoutDashboard, path: '/company/dashboard' },
      { label: 'Post New Job', icon: Briefcase, path: '/company/jobs/new' },
      { label: 'Manage Jobs', icon: FileText, path: '/company/jobs' },
      { label: 'Candidate Applications', icon: Users, path: '/company/applications' },
      { label: 'Interviews', icon: Video, path: '/company/interviews' },
      { label: 'Hiring Analytics', icon: BarChart3, path: '/company/analytics' },
      { label: 'Notifications', icon: Bell, path: '/company/notifications' },
      { label: 'Company Profile', icon: User, path: '/company/profile' },
      { label: 'Settings', icon: Settings, path: '/company/settings' },
      { label: 'AI Recruiter Copilot', icon: Sparkles, path: '/company/ai-recruiter-copilot' },
    ],
    admin: [
      { label: 'System Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'User Management', icon: Users, path: '/admin/users' },
      { label: 'Company Verification', icon: Building, path: '/admin/companies' },
      { label: 'Job Moderation', icon: Briefcase, path: '/admin/jobs' },
      { label: 'AI Telemetry Monitoring', icon: Activity, path: '/admin/ai-monitoring' },
      { label: 'Reports & Growth Analytics', icon: BarChart3, path: '/admin/analytics' },
      { label: 'System Notifications', icon: Bell, path: '/admin/notifications' },
      { label: 'Platform Settings', icon: Settings, path: '/admin/settings' },
      { label: 'Security Audit Logs', icon: ShieldAlert, path: '/admin/audit' },
      { label: 'Role & RBAC Matrix', icon: Lock, path: '/admin/rbac' },
      { label: 'Super Admin Center', icon: ShieldAlert, path: '/super-admin' },
    ],
  };

  const navItems = navGroups[role] || navGroups.candidate;

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30 shrink-0 select-none justify-between',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          {!isCollapsed && (
            <NavLink to="/" className="flex items-center gap-2.5 font-extrabold text-lg group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">SkillBridge AI</span>
                <span className="text-[10px] font-bold text-brand-500 capitalize tracking-wider mt-0.5">{role} Portal</span>
              </div>
            </NavLink>
          )}

          <button
            onClick={onToggle}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Links Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border-l-2',
                  isActive
                    ? 'bg-brand-50/70 dark:bg-[#1A1F2C] text-brand-600 dark:text-brand-400 border-brand-500 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-[#121A2A]/40 hover:text-slate-900 dark:hover:text-white border-transparent'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-900/20">
        {!isCollapsed ? (
          <div className="p-4 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">SkillBridge AI Platform</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">© 2026 LB Infotech. All Rights Reserved.</p>
          </div>
        ) : (
          <div className="p-3 text-[10px] font-bold text-slate-400 text-center">
            LB
          </div>
        )}
      </div>
    </aside>
  );
};
