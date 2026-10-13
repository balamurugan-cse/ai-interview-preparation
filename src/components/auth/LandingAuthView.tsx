import React, { useState } from 'react';
import {
  BrainCircuit,
  Code2,
  FileText,
  MessageSquareCode,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../api/client';
import { AdminLoginModal } from './AdminLoginModal';

interface LandingAuthViewProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const LandingAuthView: React.FC<LandingAuthViewProps> = ({ onAuthenticated }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Software Development Engineer (SDE-1)');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const scrollToAuth = (mode?: 'signin' | 'signup') => {
    if (mode) setAuthMode(mode);
    const formEl = document.getElementById('auth-form-card');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Authentic Client Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@university.edu).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup' && !displayName.trim()) {
      setErrorMessage('Please enter your full name to set up your placement profile.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signin') {
        const res = await api.login({
          email: trimmedEmail,
          password,
          role: 'learner',
          targetRole,
        });
        localStorage.setItem('devprep_auth', 'true');
        onAuthenticated(res.user);
      } else {
        const res = await api.signup({
          displayName: displayName.trim(),
          email: trimmedEmail,
          password,
          role: 'learner',
          targetRole,
        });
        localStorage.setItem('devprep_auth', 'true');
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              DP
            </span>
            <span>
              DevPrep <span className="text-teal-600">AI</span>
            </span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Platform Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Placement Workflow
            </a>
            <a href="#principles" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              AI Guardrails
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary Header CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0"
              title="Open Separate Administrator Console Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => scrollToAuth('signin')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Auth Form Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Platform Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Placement Readiness Architecture · v2026.1</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
                  Master Technical Placements with Objective Assessments &amp; Advisory AI Coaching
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl text-balance">
                  DevPrep AI unifies timed aptitude evaluations, isolated coding sandboxes, Gemini-assisted resume audits, and turn-based mock interviews with verifiable evidence and private data handling.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToAuth('signup')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span>Create Candidate Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToAuth('signin')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </button>
              </div>

              {/* Architecture & Integrity Strip */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  100% Deterministic Test Scoring
                </span>
                <span aria-hidden="true">·</span>
                <span>Protected Server Answer Keys</span>
                <span aria-hidden="true">·</span>
                <span>Isolated Code Runner Sandbox</span>
                <span aria-hidden="true">·</span>
                <span>Private Resume Audits</span>
              </div>
            </div>

            {/* Right Column: Authentic Sign In / Register Card */}
            <div className="lg:col-span-5" id="auth-form-card">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
                {/* Auth Mode Tabs */}
                <div>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 text-center rounded-lg transition-all ${
                        authMode === 'signin'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 text-center rounded-lg transition-all ${
                        authMode === 'signup'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 text-center">
                    {authMode === 'signin'
                      ? 'Sign in to access your placement dashboard and test logs.'
                      : 'Create a candidate account to benchmark your placement readiness.'}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Alex Johnson"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu or you@company.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
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
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 6 characters)"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Placement Role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Software Development Engineer (SDE-1)">Software Development Engineer (SDE-1)</option>
                      <option value="Frontend Engineer">Frontend Engineer (React / TypeScript)</option>
                      <option value="Backend Engineer">Backend Engineer (Node / Python / Go)</option>
                      <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer (GCP / Docker)</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Engineer / ML">Data Engineer / ML Specialist</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Assessments, coding tasks, and AI interview prompts will calibrate to this track.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Authenticating...</span>
                      </>
                    ) : authMode === 'signin' ? (
                      <span>Sign In &amp; Open Cockpit</span>
                    ) : (
                      <span>Create Account &amp; Start Practice</span>
                    )}
                  </button>
                </form>

                {/* Separate Admin Console Login link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Placement Officer or Admin?</span>
                  <button
                    type="button"
                    onClick={() => setAdminModalOpen(true)}
                    className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Console Login</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  By continuing, you agree to DevPrep AI practice terms. AI coaching is advisory and strictly evidence-grounded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Cards (Blueprint Page 2 & 7) */}
      <section id="features" className="py-16 sm:py-24 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Integrated Placement Preparation Suite
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every tool maps directly to real technical placement rounds: from quantitative screeners to final architecture interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module 1: Aptitude */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Aptitude Practice Lab</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Timed diagnostic exams with authoritative server scoring. Option autosave, live timer, and detailed step-by-step coaching breakdown.
              </p>
            </div>

            {/* Module 2: Coding Lab */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Coding Sandbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Split-pane workspace with live compiler, custom test runner tabs, and progressive staged hints powered by Gemini.
              </p>
            </div>

            {/* Module 3: Resume Analyzer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">AI Resume Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evidence-grounded audit against target role expectations. Strict zero-hallucination guardrail with private document parsing.
              </p>
            </div>

            {/* Module 4: Mock Interview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Mock Interview Room</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Turn-based conversational interviews with follow-up probing and transparent 4-axis rubric scorecards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Structured Placement Methodology
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed according to recruitment industry best practices for engineering graduates and career switchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-2xl font-black text-indigo-600">01</span>
              <h4 className="font-bold text-slate-900 text-base">Diagnostic Baseline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take a timed test across Quantitative, Logical, and Core CS to establish your initial mastery breakdown.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-2xl font-black text-teal-600">02</span>
              <h4 className="font-bold text-slate-900 text-base">Deliberate Practice</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Solve algorithmic problems in an isolated editor with test case verification and staged hints when blocked.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-2xl font-black text-purple-600">03</span>
              <h4 className="font-bold text-slate-900 text-base">Application &amp; Interview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduct turn-based mock interviews with follow-ups, track company application pipelines, and generate 7-day study sprints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles & Privacy Notice */}
      <section id="principles" className="py-12 bg-amber-50/60 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Product Principle &amp; Ethical Guardrails</span>
          </div>
          <p className="text-sm text-amber-900 font-medium leading-relaxed">
            AI should coach learners with transparent, evidence-based feedback. It must not invent resume achievements or guarantee placements. All candidate documents are processed privately with explicit consent.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about the DevPrep AI platform architecture.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <h4 className="font-bold text-slate-900">How is aptitude scoring calculated?</h4>
              <p className="text-slate-600 leading-relaxed">
                Scores are calculated strictly server-side using authoritative answer keys. Gemini API is used only for step-by-step coaching explanations, never for determining objective scores.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <h4 className="font-bold text-slate-900">Is code executed safely?</h4>
              <p className="text-slate-600 leading-relaxed">
                Yes. In accordance with the blueprint, code evaluations run in isolated containers with strict CPU, memory, and timeout bounds, separated from privileged platform APIs.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <h4 className="font-bold text-slate-900">Can I track multiple placement drives?</h4>
              <p className="text-slate-600 leading-relaxed">
                Yes. The Placement Tracker provides a full Kanban pipeline to track applications from initial application through OA, Technical Round 1, System Design, and final Offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b1329] text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">DevPrep AI</span>
            <span>·</span>
            <span>Smart Placement Preparation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              className="text-slate-300 hover:text-teal-400 flex items-center gap-1 transition-colors font-medium cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console Gateway</span>
            </button>
            <span>·</span>
            <span>Cloud Run Live</span>
            <span>·</span>
            <span>Firestore Schemas</span>
            <span>·</span>
            <span>Gemini Server SDK</span>
          </div>
        </div>
      </footer>

      {/* Dedicated Admin Login Gateway Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onAdminAuthenticated={onAuthenticated}
      />
    </div>
  );
};
