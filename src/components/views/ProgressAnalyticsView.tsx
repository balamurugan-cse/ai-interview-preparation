import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight,
  BrainCircuit,
  Code2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { TestAttempt, CodeSubmission, DailyMilestone } from '../../types';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';
import { CardSkeleton } from '../common/SkeletonLoader';

interface ProgressAnalyticsViewProps {
  attempts: TestAttempt[];
  submissions: CodeSubmission[];
  topicMastery: Record<string, number>;
  weeklyGoals: any[];
  readinessScore: number;
  onNavigateToAptitude: () => void;
  onNavigateToCoding: () => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  attempts,
  submissions,
  topicMastery,
  weeklyGoals,
  readinessScore,
  onNavigateToAptitude,
  onNavigateToCoding,
}) => {
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);
  const [studyPlan, setStudyPlan] = useState<{
    weekSummary: string;
    dailyMilestones: DailyMilestone[];
  } | null>(null);

  // Generate Personalized 7-Day Plan via Gemini
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      // Find weak topics (mastery < 70)
      const weakTopics = Object.entries(topicMastery)
        .filter(([_, score]) => score < 70)
        .map(([topic]) => topic);

      const res = await api.generateStudyPlan(
        topicMastery,
        weakTopics.length > 0 ? weakTopics : ['Work and Time Kinetics', 'Operating Systems Concurrency', 'Hash Maps']
      );
      setStudyPlan(res.plan);
    } catch (err: any) {
      alert(`Study plan generation error: ${err?.message || 'Please try again'}`);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const hasData = attempts.length > 0 || submissions.length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Placement Readiness Analytics</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Diagnostic Mastery & Study Planning
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Synthesizes quantitative scores, isolated coding runtimes, and rubric feedback into actionable weekly study milestones.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs self-start sm:self-auto"
          >
            {generatingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Sprint Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate 7-Day Study Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No performance records found"
          description="Complete your first aptitude test or solve a coding challenge to generate objective accuracy analytics and personalized study recommendations."
          actionText="Take Aptitude Diagnostic"
          onAction={onNavigateToAptitude}
          secondaryText="Solve Coding Task"
          onSecondaryAction={onNavigateToCoding}
        />
      ) : (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Composite Readiness
              </span>
              <div className="text-3xl font-extrabold text-indigo-900">
                {readinessScore > 0 ? `${readinessScore}%` : 'Calibrating'}
              </div>
              <p className="text-[11px] text-slate-500">Objective test & interview index</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Aptitude Tests Taken
              </span>
              <div className="text-3xl font-extrabold text-teal-700">{attempts.length}</div>
              <p className="text-[11px] text-slate-500">
                Avg Score:{' '}
                {attempts.length > 0
                  ? `${Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length)}%`
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Code Submissions
              </span>
              <div className="text-3xl font-extrabold text-slate-900">{submissions.length}</div>
              <p className="text-[11px] text-slate-500">
                Accepted: {submissions.filter((s) => s.status === 'ACCEPTED').length}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Goals Completed
              </span>
              <div className="text-3xl font-extrabold text-purple-700">
                {weeklyGoals.filter((g) => g.completed).length} / {weeklyGoals.length}
              </div>
              <p className="text-[11px] text-slate-500">Sprint Week 1 Target</p>
            </div>
          </div>

          {/* Topic Breakdown Bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Calibrated Topic Mastery & Weak Area Index
              </h3>
              <span className="text-xs text-slate-500">Authoritative evaluation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(topicMastery).map(([topic, pct]) => {
                const isWeak = pct < 65;
                return (
                  <div key={topic} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                      <span className="truncate">{topic}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          isWeak
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {pct}% {isWeak ? '(Focus Area)' : '(Proficient)'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past Attempt Log Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Test Attempt Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Test Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{att.bankTitle}</td>
                      <td className="py-3.5 px-4 capitalize">{att.bankCategory}</td>
                      <td className="py-3.5 px-4">{new Date(att.startedAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">{att.durationMinutes} mins</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full ${
                            (att.score || 0) >= 70
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {att.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Generated Study Plan (Gemini Output) */}
      {studyPlan && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-indigo-900 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personalized 7-Day Sprint Milestones
              </h3>
              <p className="text-xs text-slate-500">
                Generated by Gemini coach grounded in your current diagnostic topic mastery.
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-700 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
            {studyPlan.weekSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlan.dailyMilestones.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700">{m.day}</span>
                  <span className="text-[11px] font-semibold text-slate-600">{m.focus}</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                  {m.recommendedTasks.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
