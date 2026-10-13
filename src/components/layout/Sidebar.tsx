import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Code2,
  FileText,
  MessageSquareCode,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  LogOut,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type NavView =
  | 'dashboard'
  | 'aptitude'
  | 'coding'
  | 'resume'
  | 'interview'
  | 'analytics'
  | 'applications'
  | 'admin';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: UserProfile | null;
  onRequireAdminLogin?: () => void;
  onExitAdminMode?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  user,
  onRequireAdminLogin,
  onExitAdminMode,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Learner Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'aptitude' as NavView,
      label: 'Aptitude Lab',
      shortLabel: 'Aptitude',
      icon: BrainCircuit,
      badge: 'Timed',
    },
    {
      id: 'coding' as NavView,
      label: 'Coding Lab',
      shortLabel: 'Coding',
      icon: Code2,
      badge: 'Sandbox',
    },
    {
      id: 'resume' as NavView,
      label: 'Resume Analyzer',
      shortLabel: 'Resume',
      icon: FileText,
      badge: 'Gemini',
    },
    {
      id: 'interview' as NavView,
      label: 'Mock Interview Room',
      shortLabel: 'Interview',
      icon: MessageSquareCode,
      badge: 'Rubric',
    },
    {
      id: 'analytics' as NavView,
      label: 'Placement Analytics',
      shortLabel: 'Analytics',
      icon: TrendingUp,
      badge: undefined,
    },
    {
      id: 'applications' as NavView,
      label: 'Placement Tracker',
      shortLabel: 'Tracker',
      icon: Briefcase,
      badge: 'Drives',
    },
    {
      id: 'admin' as NavView,
      label: 'Admin Console',
      shortLabel: 'Admin',
      icon: user?.role === 'admin' ? ShieldCheck : Lock,
      badge: user?.role === 'admin' ? 'Ops' : 'Locked',
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0b1329] text-slate-300 transition-all duration-300 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/90 text-white shadow-inner flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-200" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-white tracking-tight truncate">
                DevPrep <span className="text-teal-400">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                Smart Placement Prep
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'admin' && user?.role !== 'admin') {
                  if (onRequireAdminLogin) {
                    onRequireAdminLogin();
                    return;
                  }
                }
                onSelectView(item.id);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : item.id === 'admin' && user?.role !== 'admin'
                  ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title={item.id === 'admin' && user?.role !== 'admin' ? 'Admin Console (Requires separate Admin Login)' : item.label}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              {!collapsed && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded tracking-wider ${
                        isActive
                          ? 'bg-indigo-700/80 text-indigo-100'
                          : item.id === 'admin' && user?.role !== 'admin'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Blueprint Footnote */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090f20]">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'PB'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.displayName || 'Learner'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-teal-400">
                  <span className="truncate">{user?.role === 'admin' ? 'Administrator' : 'Active Learner'}</span>
                  {user?.role === 'admin' && onExitAdminMode && (
                    <button
                      type="button"
                      onClick={onExitAdminMode}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline font-normal shrink-0"
                      title="Return to Learner Workspace"
                    >
                      (Exit)
                    </button>
                  )}
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="px-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Blueprint v2026.1</span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Cloud Run Live
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div
              className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center text-xs"
              title={user?.displayName || 'Candidate'}
            >
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'PB'}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
