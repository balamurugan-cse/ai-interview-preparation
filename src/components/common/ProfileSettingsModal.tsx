import React, { useState } from 'react';
import { X, User, Briefcase, Clock, Code, ShieldCheck, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../api/client';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdated: (user: UserProfile) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}) => {
  if (!isOpen || !user) return null;

  const [displayName, setDisplayName] = useState(user.displayName);
  const [targetRole, setTargetRole] = useState(user.preferences.targetRole);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(user.preferences.weeklyGoalHours || 10);
  const [preferredLanguage, setPreferredLanguage] = useState(
    user.preferences.preferredLanguage || 'TypeScript'
  );
  const [resumeAiConsent, setResumeAiConsent] = useState(
    user.consentFlags.resumeAiProcessing || false
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        displayName,
        preferences: {
          targetRole,
          weeklyGoalHours: Number(weeklyGoalHours),
          preferredLanguage,
        },
        consentFlags: {
          resumeAiProcessing: resumeAiConsent,
        },
      });
      onUpdated(res.user);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Candidate Profile & Goals</h3>
              <p className="text-xs text-slate-500">Configure your target role and study plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Placement Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="Software Development Engineer (SDE-1)">
                  Software Development Engineer (SDE-1)
                </option>
                <option value="Frontend Engineer">Frontend Engineer (React/TypeScript)</option>
                <option value="Backend Engineer">Backend & Distributed Systems Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Cloud / DevOps Engineer">Cloud & DevOps Platform Engineer</option>
                <option value="Data Engineer / ML">Data Engineer & Machine Learning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Weekly Prep Target</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={weeklyGoalHours}
                  onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Hours per week</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred Code Sandbox</label>
              <div className="relative">
                <Code className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python 3</option>
                  <option value="Java">Java 17</option>
                  <option value="C++">C++ 20</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Consent */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={resumeAiConsent}
                onChange={(e) => setResumeAiConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                Grant permission for private Gemini AI parsing of uploaded resumes strictly for placement audit coaching.
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {successMsg ? (
                <>
                  <Check className="w-4 h-4 text-teal-300" />
                  <span>Saved!</span>
                </>
              ) : saving ? (
                <span>Saving...</span>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
