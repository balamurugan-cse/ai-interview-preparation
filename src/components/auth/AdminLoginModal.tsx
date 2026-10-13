import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  X,
  Server,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../api/client';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAuthenticated: (adminUser: UserProfile) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
}) => {
  const [email, setEmail] = useState<string>('admin@devprep.ai');
  const [password, setPassword] = useState<string>('AdminPass2026!');
  const [adminKey, setAdminKey] = useState<string>('DEVPREP-ADMIN-2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  if (!isOpen) return null;

  const handleFillDefaults = () => {
    setEmail('admin@devprep.ai');
    setPassword('AdminPass2026!');
    setAdminKey('DEVPREP-ADMIN-2026');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter an authorized administrator email.');
      return;
    }

    if (!adminKey.trim() && (!password || password.length < 6)) {
      setErrorMessage('Please provide your admin password (min 6 chars) or master passkey (DEVPREP-ADMIN-2026).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminLogin({
        email: trimmedEmail,
        password: password.trim(),
        adminKey: adminKey.trim(),
        displayName: 'Placement Admin Officer',
      });

      setSuccessNotice('Administrative authorization verified. Launching console...');
      localStorage.setItem('devprep_auth', 'true');
      
      setTimeout(() => {
        onAdminAuthenticated(res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Access denied. Invalid administrative credentials or security passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened backdrop */}
      <div
        className="fixed inset-0 bg-[#060a17]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0b1329] text-white rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Glowing Top Border Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500" />

        {/* Header Bar */}
        <div className="p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-300 mb-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>Tier-1 Security Gateway</span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Admin Console Login
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-400 text-xs leading-relaxed">
            Restricted entry for placement directors, question bank evaluators, and system operators.
          </p>

          {/* Quick autofill helper */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60">
            <span className="text-[11px] text-indigo-200">
              Need quick access for review or testing?
            </span>
            <button
              type="button"
              onClick={handleFillDefaults}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
            >
              Fill Admin Credentials
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Admin Email */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Administrator Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@devprep.ai"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 font-medium placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-300">
                Administrator Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 font-medium placeholder-slate-600"
              />
            </div>
          </div>

          {/* Master Security Passkey */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-300">
                Master Security Passkey <span className="text-teal-400 font-mono text-[11px]">(RBAC Master Token)</span>
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-teal-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="DEVPREP-ADMIN-2026"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-teal-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-300 font-mono text-xs uppercase placeholder-slate-600 tracking-wider"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Valid master token: <code className="text-teal-300 font-mono">DEVPREP-ADMIN-2026</code>
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Server className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              All administrative sessions and actions are logged to immutable audit records with cryptographic timestamps.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize &amp; Launch Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
