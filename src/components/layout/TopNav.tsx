import React from 'react';
import { Menu, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { NavView } from './Sidebar';
import { UserProfile } from '../../types';

interface TopNavProps {
  currentView: NavView;
  onMobileMenuToggle: () => void;
  user: UserProfile | null;
  onRequireAdminLogin: () => void;
  onExitAdminMode: () => void;
  onLogout: () => void;
  onOpenSettings?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onMobileMenuToggle,
  user,
  onRequireAdminLogin,
  onExitAdminMode,
  onLogout,
  onOpenSettings,
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Learner Dashboard',
      subtitle: 'Track readiness, complete weekly goals, and calibrate topic mastery',
    },
    aptitude: {
      title: 'Aptitude Practice Lab',
      subtitle: 'Timed assessments with authoritative scoring and step-by-step coaching',
    },
    coding: {
      title: 'Coding Workspace',
      subtitle: 'Isolated problem sandbox with compiler runner and staged hints',
    },
    resume: {
      title: 'AI Resume Analyzer',
      subtitle: 'Evidence-grounded audit against target role expectations with private upload',
    },
    interview: {
      title: 'Mock Interview Room',
      subtitle: 'Turn-based behavioral & technical interviews scored against standard rubrics',
    },
    analytics: {
      title: 'Placement Analytics',
      subtitle: 'Diagnostic trends, accuracy distribution, and personalized study sprint',
    },
    applications: {
      title: 'Placement Applications Tracker',
      subtitle: 'Manage company hiring pipelines, online assessments, and interview rounds',
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'Test bank governance, Cloud Run health metrics, and audit log inspection',
    },
  };

  const currentInfo = titles[currentView] || {
    title: 'DevPrep AI',
    subtitle: 'Placement Preparation Platform',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentInfo.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Principle Badge, Separate Admin Console Auth, Candidate Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Advisory AI Coaching</span>
          </div>

          {/* Admin Mode Status or Separate Admin Console Login */}
          {user?.role === 'admin' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Admin Mode</span>
              <button
                type="button"
                onClick={onExitAdminMode}
                className="ml-1 text-[11px] text-amber-800 hover:text-amber-950 underline font-medium cursor-pointer"
                title="Exit administrative mode and return to candidate workspace"
              >
                Exit to Learner
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRequireAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Authenticate with separate administrative credentials"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Admin Console Login</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* Candidate Profile Chip */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <button
              onClick={onOpenSettings}
              title="Click to edit candidate profile & goals"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-indigo-400">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 truncate max-w-[120px]">
                  {user?.displayName || 'Candidate'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                  {user?.preferences?.targetRole || 'SDE-1'}
                </span>
              </div>
            </button>

            {/* Logout / Switch Account Action Button */}
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center gap-1"
              title="Sign out and return to Login portal"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
