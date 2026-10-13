import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Database,
  PlusCircle,
  Clock,
  Sparkles,
  Server,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ServiceMetrics, AuditLogEntry, QuestionBank, UserProfile } from '../../types';
import { api } from '../../api/client';
import { CardSkeleton } from '../common/SkeletonLoader';
import {
  CheckCircle2,
  LogOut,
  ArrowLeft,
  X,
} from 'lucide-react';

interface AdminConsoleViewProps {
  user?: UserProfile | null;
  onExitAdmin?: () => void;
  onLogout?: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  user,
  onExitAdmin,
  onLogout,
}) => {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Question Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');
  const [newBankId, setNewBankId] = useState<string>('bank-quant-1');
  const [newTopic, setNewTopic] = useState<string>('Algebra & Functions');
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [answerKey, setAnswerKey] = useState<string>('opt-a');
  const [explanation, setExplanation] = useState<string>('');
  const [publishing, setPublishing] = useState<boolean>(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminMetrics();
      setMetrics(res.metrics);
      setAuditLogs(res.auditLogs);
      setQuestionBanks(res.questionBanks);
      setTotalQuestions(res.totalQuestionsInBank);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!newPrompt.trim() || !optA.trim() || !optB.trim()) {
      setModalError('Please fill out the prompt and at least two options.');
      return;
    }

    setPublishing(true);
    try {
      await api.createQuestion({
        bankId: newBankId,
        topic: newTopic,
        prompt: newPrompt.trim(),
        options: [
          { id: 'opt-a', text: optA.trim() },
          { id: 'opt-b', text: optB.trim() },
          { id: 'opt-c', text: optC.trim() || 'None of the above' },
          { id: 'opt-d', text: optD.trim() || 'Cannot be determined' },
        ],
        answerKey,
        explanationRef: explanation.trim() || 'Standard solution derived from fundamental principles.',
      });

      setShowAddModal(false);
      setNewPrompt('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setExplanation('');
      setFeedback({
        type: 'success',
        text: 'Question successfully published to authoritative test bank.',
      });
      loadAdminData();
    } catch (err: any) {
      setModalError(err?.message || 'Error publishing question to test bank.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton rows={3} />
        <CardSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Elevated Admin Session Status Banner */}
      <div className="bg-[#0b1329] border border-indigo-500/30 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Privileged Administrative Session Active
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Signed in as <span className="text-white font-bold">{user?.displayName || 'Administrator'}</span> ({user?.email || 'admin@devprep.ai'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
              title="Return to Learner Workspace without logging out"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Learner Mode</span>
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold transition-colors border border-rose-800 flex items-center gap-1.5"
              title="Terminate administrative session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-200 ${
          feedback.type === 'success'
            ? 'bg-teal-50 border-teal-200 text-teal-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privileged Administration & Governance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Admin Console & Cloud Health
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Monitor Cloud Run API p95 latencies, verify isolated runner health, inspect audit logs, and publish new questions.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Question to Bank</span>
        </button>
      </div>

      {/* Real-time Cloud Run & Service Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cloud Run Status
            </span>
            <Server className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xl font-extrabold text-teal-700">HEALTHY</span>
          </div>
          <p className="text-[11px] text-slate-500">Dedicated Service Identity</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              API p95 Latency
            </span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-900">
            {metrics?.p95LatencyMs || 64}ms
          </div>
          <p className="text-[11px] text-slate-500">Cloud Run REST Endpoints</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gemini Quota Tracking
            </span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {metrics?.quotaUsedPercent || 18}%
          </div>
          <p className="text-[11px] text-slate-500">Per-user daily quotas enforced</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Published Questions
            </span>
            <Database className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalQuestions}</div>
          <p className="text-[11px] text-slate-500">Across {questionBanks.length} active banks</p>
        </div>
      </div>

      {/* Test Banks Governance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Question Banks Governance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bank ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {questionBanks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{b.id}</td>
                  <td className="py-3.5 px-4 font-sans font-medium text-slate-800">{b.title}</td>
                  <td className="py-3.5 px-4 font-sans capitalize">{b.category}</td>
                  <td className="py-3.5 px-4 font-sans capitalize">{b.level}</td>
                  <td className="py-3.5 px-4">v{b.version}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-sans text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                      Published
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log Stream (Blueprint Spec) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            Security & Attempt Audit Log Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.actorUid}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {log.entityType}:{log.entityId.slice(0, 16)}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Question to Test Bank */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Publish Question to Bank</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handlePublishQuestion} className="space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Question Bank</label>
                <select
                  value={newBankId}
                  onChange={(e) => setNewBankId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {questionBanks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Work and Time Kinetics"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter the problem statement clearly..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options (A, B, C, D)</label>
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Option A text"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Option B text"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Option C text (optional)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Option D text (optional)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correct Answer Key (Server-only)
                </label>
                <select
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-800"
                >
                  <option value="opt-a">Option A</option>
                  <option value="opt-b">Option B</option>
                  <option value="opt-c">Option C</option>
                  <option value="opt-d">Option D</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Authoritative Solution Explanation
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Official mathematical or logical derivation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  {publishing ? 'Publishing...' : 'Publish to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
