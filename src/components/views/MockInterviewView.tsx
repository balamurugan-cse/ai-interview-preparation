import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bot,
  User,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Printer,
  RefreshCw,
  Lightbulb,
  Info,
  Check,
} from 'lucide-react';
import { InterviewSession, UserProfile } from '../../types';
import { api } from '../../api/client';

interface MockInterviewViewProps {
  user?: UserProfile | null;
  onInterviewCompleted: () => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({
  user,
  onInterviewCompleted,
}) => {
  // Setup State
  const [targetRole, setTargetRole] = useState<string>(
    user?.preferences?.targetRole || 'Software Development Engineer (SDE-1)'
  );
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('junior');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'system_design'>('technical');

  // Session State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [starting, setStarting] = useState<boolean>(false);
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [submittingTurn, setSubmittingTurn] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Sync target role if user profile updates
  useEffect(() => {
    if (user?.preferences?.targetRole && !session) {
      setTargetRole(user.preferences.targetRole);
    }
  }, [user?.preferences?.targetRole, session]);

  // Audio TTS Synthesizer (safe with try/catch)
  const handleSpeak = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('TTS playback not available:', e);
      setSpeaking(false);
    }
  };

  const handleStopSpeak = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
    } catch {
      setSpeaking(false);
    }
  };

  // Start interview session
  const handleStartSession = async () => {
    setStarting(true);
    setErrorMessage(null);
    try {
      const res = await api.startInterview({
        targetRole,
        level,
        interviewType,
      });
      setSession(res.session);
      setUserAnswerInput('');
    } catch (err: any) {
      console.error('Interview start error:', err);
      setErrorMessage(err?.message || 'Unable to connect to the interview room. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  // Submit interview turn
  const handleSubmitTurn = async () => {
    if (!session || !userAnswerInput.trim() || submittingTurn) return;
    setSubmittingTurn(true);
    setErrorMessage(null);
    try {
      const res = await api.submitInterviewTurn(session.id, userAnswerInput.trim());
      setSession(res.session);
      setUserAnswerInput('');
      if (res.session.status === 'COMPLETED') {
        onInterviewCompleted();
      }
    } catch (err: any) {
      console.error('Interview turn error:', err);
      setErrorMessage(
        err?.message ||
          'Failed to evaluate answer. If the session expired, you can start a fresh session.'
      );
    } finally {
      setSubmittingTurn(false);
    }
  };

  // Reset to setup
  const handleReset = () => {
    handleStopSpeak();
    setSession(null);
    setUserAnswerInput('');
    setErrorMessage(null);
  };

  // Safe print handler
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Print not allowed in this environment:', e);
    }
  };

  // Helpful STAR templates
  const applyStarTemplate = () => {
    const template = `Situation: In my previous project, we faced a performance bottleneck where...\nTask: I was responsible for optimizing the...\nAction: I investigated the issue by analyzing metrics, identified..., and chose to implement...\nResult: This reduced latency by 60% and improved throughput without regressions.`;
    setUserAnswerInput(template);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // ==========================================
  // Render Completed Rubric Scorecard
  // ==========================================
  if (session && session.status === 'COMPLETED' && session.feedback) {
    const fb = session.feedback;
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Interview Session Rubric Assessment</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {session.targetRole}
              </h2>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                Level: {session.level} • Type: {session.interviewType.replace('_', ' ')} • Rubric v{session.rubricVersion || '2026.1'}
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 text-3xl font-extrabold">
                {fb.overallScore}%
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">Overall Rubric Score</p>
            </div>
          </div>

          {/* Three Dimensional Rubric Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Technical Depth</span>
                <span className="text-teal-700">{fb.technicalDepthScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${fb.technicalDepthScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Problem Solving</span>
                <span className="text-teal-700">{fb.problemSolvingScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${fb.problemSolvingScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Communication</span>
                <span className="text-teal-700">{fb.communicationScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${fb.communicationScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Demonstrated Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {fb.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {fb.improvementAreas?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Practice Plan */}
          {fb.actionablePracticePlan && fb.actionablePracticePlan.length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Next-Step Actionable Practice Plan
              </h4>
              <div className="space-y-2">
                {fb.actionablePracticePlan.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer Banner */}
          <div className="mt-6 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              Advisory notice: AI interview feedback is a practice signal for placement preparation, not a hiring decision.
            </span>
          </div>

          <div className="pt-6 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Interview</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Scorecard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render Active Conversation Room
  // ==========================================
  if (session && session.status === 'IN_PROGRESS') {
    const currentTurn = session.turns[session.turns.length - 1];
    const turnCount = session.turns.length;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-800 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Interview Turn Error</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Restart Interview
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700 font-bold px-1"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{session.targetRole}</h3>
              <p className="text-xs text-slate-500 capitalize">
                {session.level} Level • {session.interviewType.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Turn {turnCount} of 3
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Quit & Reset</span>
            </button>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="space-y-4">
          {session.turns.map((turn, idx) => (
            <div key={idx} className="space-y-3">
              {/* Interviewer Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs max-w-2xl text-xs sm:text-sm text-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-indigo-600 uppercase tracking-wider block">
                      AI Interviewer (Question {turn.turnNumber})
                    </span>
                    <button
                      type="button"
                      onClick={() => (speaking ? handleStopSpeak() : handleSpeak(turn.question))}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                      title="Speak question aloud"
                    >
                      {speaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{speaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  <p className="leading-relaxed font-medium">{turn.question}</p>
                </div>
              </div>

              {/* User Response if already submitted */}
              {turn.userAnswer && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 shadow-xs max-w-2xl text-xs sm:text-sm text-slate-900 space-y-1">
                    <span className="font-bold text-[10px] text-indigo-700 uppercase tracking-wider block">
                      Your Response
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">{turn.userAnswer}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs font-bold text-xs">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                </div>
              )}

              {/* Coaching Feedback on this Turn */}
              {turn.feedback && (
                <div className="ml-11 p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-teal-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Turn Rubric Score: {turn.feedback.score}%
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-slate-700 text-[11px] pt-1 space-y-0.5">
                    {turn.feedback.observations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Evaluating loader state */}
          {submittingTurn && (
            <div className="ml-11 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              <div>
                <p className="font-bold">Evaluating your response with Gemini AI...</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Analyzing technical depth, structure (STAR format), and generating placement rubrics.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input Box for Current Turn */}
        {!currentTurn.userAnswer && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">Compose your verbal or technical response</span>
              <button
                type="button"
                onClick={applyStarTemplate}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{copiedSnippet ? 'Template Applied!' : 'Insert STAR Answer Template'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={userAnswerInput}
              onChange={(e) => setUserAnswerInput(e.target.value)}
              placeholder="Speak directly to the scenario. Mention technical rationale, trade-offs, metrics, and outcomes..."
              className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-normal text-slate-900"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                {userAnswerInput.length} characters entered
              </span>
              <button
                onClick={handleSubmitTurn}
                disabled={submittingTurn || !userAnswerInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                {submittingTurn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating with Rubric...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Response</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // Render Setup Screen (Default)
  // ==========================================
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Setup Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold mb-3">
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Interactive Placement Simulator</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Role-Based Mock Interview Room
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Practice conversational interview turns dynamically generated with Gemini AI. Each answer is scored against standard hiring rubrics (Technical Depth, Problem Solving, Communication) with actionable follow-ups and final placement assessment.
          </p>
        </div>
      </div>

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-800 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Could Not Enter Interview Room</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Setup Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Target Role
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 cursor-pointer"
          >
            <option value="Software Development Engineer (SDE-1)">
              Software Development Engineer (SDE-1)
            </option>
            <option value="Frontend Engineer (React / TypeScript)">
              Frontend Engineer (React / TypeScript)
            </option>
            <option value="Backend Engineer (Node.js / Distributed Systems)">
              Backend Engineer (Node.js / Distributed Systems)
            </option>
            <option value="Full Stack Engineer (MERN / Next.js)">
              Full Stack Engineer (MERN / Next.js)
            </option>
            <option value="Cloud & DevOps Engineer (GCP / Docker / Kubernetes)">
              Cloud & DevOps Engineer (GCP / Docker / Kubernetes)
            </option>
            <option value="Data Engineer (SQL / Spark / Data Pipelines)">
              Data Engineer (SQL / Spark / Data Pipelines)
            </option>
          </select>
        </div>

        {/* Experience Level & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['junior', 'mid', 'senior'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2.5 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                    level === lvl
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Interview Focus
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['technical', 'behavioral', 'system_design'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`py-2.5 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                    interviewType === type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guidance Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <span>
            You will participate in a realistic 3-question adaptive interview round. Answer each question thoroughly using your real experiences or problem-solving approaches to receive an accurate hiring rubric assessment.
          </span>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleStartSession}
            disabled={starting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            {starting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating AI Interview Question...</span>
              </>
            ) : (
              <>
                <MessageSquareCode className="w-4 h-4" />
                <span>Enter Mock Interview Room</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
