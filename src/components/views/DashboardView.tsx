import React from 'react';
import {
  Target,
  BrainCircuit,
  Code2,
  FileText,
  MessageSquareCode,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { NavView } from '../layout/Sidebar';
import { EmptyState } from '../common/EmptyState';
import { CardSkeleton } from '../common/SkeletonLoader';
import { TestAttempt, CodeSubmission, UserProfile } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  user: UserProfile | null;
  attempts: TestAttempt[];
  submissions: CodeSubmission[];
  topicMastery: Record<string, number>;
  weeklyGoals: { id: string; title: string; completed: boolean; category: string }[];
  readinessScore: number;
  loading: boolean;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  user,
  attempts,
  submissions,
  topicMastery,
  weeklyGoals,
  readinessScore,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
        <CardSkeleton rows={4} />
      </div>
    );
  }

  // Goal metrics
  const completedGoals = weeklyGoals.filter((g) => g.completed).length;
  const totalGoals = weeklyGoals.length;
  const goalPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // SVG Ring values
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPercent / 100) * circumference;

  const masteryKeys = Object.keys(topicMastery);
  const hasMasteryData = masteryKeys.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DevPrep AI Placement Cockpit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to practice, {user?.displayName ? user.displayName.split(' ')[0] : 'Learner'}?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Target role: <strong className="text-white">{user?.preferences?.targetRole || 'Software Engineer'}</strong>. Complete timed diagnostic assessments and isolated coding tasks to build evidence for your interview readiness.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={() => onNavigate('aptitude')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Start Diagnostic</span>
            </button>
            <button
              onClick={() => onNavigate('coding')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700"
            >
              <Code2 className="w-4 h-4" />
              <span>Coding Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Goal Ring + Topic Mastery + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Goal Completion Ring */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Weekly Goal Ring
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Placement Sprint
              </span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Circle (Teal from blueprint) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-teal-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900">{goalPercent}%</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {completedGoals} of {totalGoals} done
                  </span>
                </div>
              </div>
            </div>

            {/* Goal checklist */}
            {weeklyGoals.length === 0 ? (
              <div className="py-4 px-3 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2 mt-2">
                <p className="text-xs text-slate-500 font-medium">No weekly goals set yet.</p>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Study Plan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 mt-2">
                {weeklyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-2.5 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        goal.completed
                          ? 'bg-teal-500 text-white'
                          : 'border border-slate-300 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                    <span className={`flex-1 ${goal.completed ? 'line-through text-slate-400' : ''}`}>
                      {goal.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{goal.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Topic Mastery Visualizer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Topic Mastery Meter
            </h3>
            <span className="text-xs text-slate-400 font-medium">Objective</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {hasMasteryData ? (
              <div className="space-y-3.5">
                {masteryKeys.map((topic) => {
                  const val = topicMastery[topic];
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate">{topic}</span>
                        <span className="text-teal-700">{val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No mastery calibration yet"
                description="Complete an Aptitude test or Coding challenge to calculate your topic mastery."
                actionText="Start Aptitude Lab"
                onAction={() => onNavigate('aptitude')}
              />
            )}
          </div>
        </div>

        {/* Card 3: Practice Readiness Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Practice Readiness
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Composite
              </span>
            </div>

            <div className="text-center py-5">
              <div className="inline-block p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 mb-3">
                <div className="text-4xl font-extrabold text-indigo-900">
                  {readinessScore > 0 ? `${readinessScore}%` : 'Pending'}
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {readinessScore > 0
                  ? 'Calculated from objective aptitude scores, compiler evaluations, and interview rubrics.'
                  : 'Take your first diagnostic assessment to generate your initial readiness score.'}
              </p>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Product Principle Notice
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Readiness score is an analytical practice signal to direct study focus. It does not guarantee placement.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Next milestone:</span>
            <button
              onClick={() => onNavigate('interview')}
              className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Mock Interview Room <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards (5 core modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <button
          onClick={() => onNavigate('aptitude')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Aptitude Practice</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Timed tests, objective auto-grading, and Gemini-assisted question explanations.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
            Open Lab <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          onClick={() => onNavigate('coding')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Coding Workspace</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-language code runner with test suites and staged algorithmic hints.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-teal-600 flex items-center gap-1">
            Open Lab <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          onClick={() => onNavigate('resume')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Resume Analyzer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Audit resume against target role, verify evidence, and get XYZ rewrites.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-600 flex items-center gap-1">
            Analyze Resume <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          onClick={() => onNavigate('interview')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Mock Interview</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Role-based conversational interview with rubric evaluation and follow-ups.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-purple-600 flex items-center gap-1">
            Enter Room <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        <button
          onClick={() => onNavigate('applications')}
          className="text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Placement Tracker</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track company applications, pipeline stages, OA milestones, and offers.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-amber-600 flex items-center gap-1">
            Open Pipeline <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Two Column Section: Recent Test Attempts vs Recent Code Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attempts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Recent Aptitude Attempts
            </h3>
            {attempts.length > 0 && (
              <button
                onClick={() => onNavigate('aptitude')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all ({attempts.length})
              </button>
            )}
          </div>

          {attempts.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No tests taken yet"
              description="Start with a timed 10-minute diagnostic test to establish your baseline score and reveal solution notes."
              actionText="Take Aptitude Test"
              onAction={() => onNavigate('aptitude')}
            />
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 3).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">{att.bankTitle}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(att.startedAt).toLocaleDateString()} • {att.durationMinutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        (att.score || 0) >= 70
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {att.score !== undefined ? `${att.score}%` : 'In Progress'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Code Submissions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-600" />
              Recent Code Submissions
            </h3>
            {submissions.length > 0 && (
              <button
                onClick={() => onNavigate('coding')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View all ({submissions.length})
              </button>
            )}
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No submissions found"
              description="Open the Coding Lab to solve algorithm challenges in TypeScript, Python, or C++ with isolated test evaluation."
              actionText="Open Coding Lab"
              onAction={() => onNavigate('coding')}
            />
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">{sub.challengeTitle}</p>
                    <p className="text-xs text-slate-500">
                      {sub.language} • {sub.runtimeMs}ms • {sub.memoryMb}MB
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      sub.status === 'ACCEPTED'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {sub.status === 'ACCEPTED' ? 'Accepted' : 'Wrong Answer'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
