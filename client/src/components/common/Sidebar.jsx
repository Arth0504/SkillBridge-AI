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
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = ({ role = 'candidate', isCollapsed, onToggle }) => {
  const navGroups = {
    candidate: [
      { label: 'Overview', icon: LayoutDashboard, path: '/candidate/dashboard' },
      { label: 'Saved Jobs', icon: Briefcase, path: '/candidate/saved-jobs' },
      { label: 'Applications', icon: FileText, path: '/candidate/applications' },
      { label: 'AI Resume Analyzer', icon: Sparkles, path: '/candidate/resume-analyzer' },
      { label: 'AI Mock Interview', icon: MessageSquare, path: '/candidate/ai-interview' },
      { label: 'AI Coding Assessment', icon: Code2, path: '/candidate/ai-coding' },
      { label: 'AI Video Interview', icon: Video, path: '/candidate/video-interview' },
      {label: 'Notifications', icon: Bell, path: '/candidate/notifications' },
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
    ],
  };

  const navItems = navGroups[role] || navGroups.candidate;

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <div className="p-1.5 rounded-lg bg-brand-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-slate-900 dark:text-white capitalize">{role} Portal</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              )
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
