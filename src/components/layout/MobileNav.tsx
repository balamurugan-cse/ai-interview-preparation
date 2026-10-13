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
  X,
  Sparkles,
  LogOut,
  Lock,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { UserProfile } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  user: UserProfile | null;
  onRequireAdminLogin?: () => void;
  onExitAdminMode?: () => void;
  onLogout?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  user,
  onRequireAdminLogin,
  onExitAdminMode,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Learner Dashboard', icon: LayoutDashboard },
    { id: 'aptitude' as NavView, label: 'Aptitude Lab', icon: BrainCircuit },
    { id: 'coding' as NavView, label: 'Coding Lab', icon: Code2 },
    { id: 'resume' as NavView, label: 'Resume Analyzer', icon: FileText },
    { id: 'interview' as NavView, label: 'Mock Interview Room', icon: MessageSquareCode },
    { id: 'analytics' as NavView, label: 'Placement Analytics', icon: TrendingUp },
    { id: 'applications' as NavView, label: 'Placement Tracker', icon: Briefcase },
    {
      id: 'admin' as NavView,
      label: user?.role === 'admin' ? 'Admin Console' : 'Admin Console (Locked)',
      icon: user?.role === 'admin' ? ShieldCheck : Lock,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-[#0b1329] text-white flex flex-col h-full shadow-2xl z-10">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">DevPrep AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'admin' && user?.role !== 'admin') {
                    onClose();
                    if (onRequireAdminLogin) {
                      onRequireAdminLogin();
                    }
                    return;
                  }
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : item.id === 'admin' && user?.role !== 'admin'
                    ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#090f20] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">{user?.displayName || 'Learner'}</p>
            <p className="text-[11px] text-teal-400">{user?.role === 'admin' ? 'Administrator' : 'Learner'}</p>
          </div>
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
