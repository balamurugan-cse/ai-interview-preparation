import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Terminal,
  History,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { CodingChallenge, CodeSubmission } from '../../types';
import { api } from '../../api/client';
import { CardSkeleton } from '../common/SkeletonLoader';

interface CodingLabViewProps {
  onSubmissionCompleted: () => void;
}

export const CodingLabView: React.FC<CodingLabViewProps> = ({ onSubmissionCompleted }) => {
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor State
  const [language, setLanguage] = useState<string>('typescript');
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'history'>('problem');

  // Staged Hints State
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [revealedHints, setRevealedHints] = useState<{ level: number; text: string }[]>([]);
  const [requestingHint, setRequestingHint] = useState<boolean>(false);

  // Runner / Console Output State
  const [activeTestCaseTab, setActiveTestCaseTab] = useState<number>(0);
  const [consoleOpen, setConsoleOpen] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [latestSubmission, setLatestSubmission] = useState<CodeSubmission | null>(null);
  const [sandboxEnvironment, setSandboxEnvironment] = useState<string>('');
  const [pastSubmissions, setPastSubmissions] = useState<CodeSubmission[]>([]);

  // Load challenges on mount
  useEffect(() => {
    async function loadChallenges() {
      try {
        setLoading(true);
        const res = await api.getCodingChallenges();
        setChallenges(res.challenges);
        if (res.challenges.length > 0) {
          const first = res.challenges[0];
          setSelectedChallenge(first);
          setCode(first.starterCode[language] || first.starterCode['typescript'] || '');
        }
      } catch (err) {
        console.error('Failed to load coding challenges:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChallenges();
  }, []);

  // Update starter code when challenge or language changes
  const handleSelectChallenge = (c: CodingChallenge) => {
    setSelectedChallenge(c);
    setCode(c.starterCode[language] || c.starterCode['typescript'] || '');
    setRevealedHints([]);
    setHintLevel(1);
    setLatestSubmission(null);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode[newLang] || '// Starter code not available for this language');
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode[language] || '');
    }
  };

  // Request Staged Hint via Gemini
  const handleGetNextHint = async () => {
    if (!selectedChallenge || requestingHint) return;
    setRequestingHint(true);
    try {
      const res = await api.getCodingHint(selectedChallenge.id, code, hintLevel);
      setRevealedHints((prev) => [...prev, { level: res.level, text: res.hint }]);
      setHintLevel((prev) => prev + 1);
      setActiveTab('hints');
    } catch (err) {
      console.error('Failed to get hint:', err);
    } finally {
      setRequestingHint(false);
    }
  };

  // Submit Code for Evaluation
  const handleSubmitCode = async () => {
    if (!selectedChallenge || evaluating) return;
    setEvaluating(true);
    setConsoleOpen(true);
    try {
      const res = await api.submitCode({
        challengeId: selectedChallenge.id,
        language,
        code,
      });
      setLatestSubmission(res.submission);
      setSandboxEnvironment(res.runnerEnvironment);
      setPastSubmissions((prev) => [res.submission, ...prev]);
      onSubmissionCompleted();
    } catch (err: any) {
      alert(`Submission error: ${err?.message || 'Error running test suite'}`);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !selectedChallenge) {
    return (
      <div className="space-y-6">
        <CardSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top Challenge Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Challenge:
          </span>
          <select
            value={selectedChallenge.id}
            onChange={(e) => {
              const found = challenges.find((c) => c.id === e.target.value);
              if (found) handleSelectChallenge(found);
            }}
            aria-label="Select Coding Challenge"
            className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.difficulty})
              </option>
            ))}
          </select>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              selectedChallenge.difficulty === 'Easy'
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : selectedChallenge.difficulty === 'Medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {selectedChallenge.difficulty}
          </span>
          <span className="text-xs text-slate-500">{selectedChallenge.category}</span>
        </div>

        {/* Sandbox Simulation Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="hidden sm:inline">Execution Sandbox Ready (Node v20 / Python 3.12)</span>
        </div>
      </div>

      {/* Split Pane: Problem Brief & Constraints (Left) vs Code Editor & Runner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Pane: Tabs (Problem Brief, Staged Hints, History) (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[700px] overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center border-b border-slate-200 px-4 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('problem')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'problem'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Problem Brief
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Staged Hints ({revealedHints.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'problem' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {selectedChallenge.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedChallenge.prompt}
                  </p>
                </div>

                {/* Sample Test Cases */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Sample Examples
                  </h4>
                  <div className="space-y-3">
                    {selectedChallenge.sampleTestCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono space-y-1.5"
                      >
                        <div className="text-slate-600">
                          <strong className="text-slate-800 font-sans">Input:</strong> {tc.input}
                        </div>
                        <div className="text-teal-700">
                          <strong className="text-slate-800 font-sans">Output:</strong> {tc.expectedOutput}
                        </div>
                        {tc.explanation && (
                          <div className="text-slate-500 font-sans text-[11px] pt-1">
                            {tc.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Execution Constraints
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 font-mono">
                    {selectedChallenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini Staged Coaching Hints</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    Hints are delivered stage-by-stage to guide your analytical thinking without revealing the entire answer code.
                  </p>
                </div>

                {revealedHints.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-3">
                    <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-medium">No hints requested yet.</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Stuck? Click below to reveal Stage 1 intuition without spoiling the solution.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revealedHints.map((h, i) => (
                      <div
                        key={i}
                        className="bg-white border border-indigo-200 rounded-xl p-4 shadow-xs text-xs space-y-1"
                      >
                        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                          Hint Level {h.level}
                        </span>
                        <p className="text-slate-800 leading-relaxed">{h.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {hintLevel <= 3 && (
                  <button
                    onClick={handleGetNextHint}
                    disabled={requestingHint}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {requestingHint
                        ? 'Synthesizing hint...'
                        : `Get Stage ${hintLevel} Hint`}
                    </span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {pastSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm font-medium">No submissions for this session yet.</p>
                    <p className="text-xs mt-1">Submit your code to see execution logs.</p>
                  </div>
                ) : (
                  pastSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            sub.status === 'ACCEPTED'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {sub.runtimeMs}ms • {sub.memoryMb}MB
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] pt-1">
                        {sub.language} • {new Date(sub.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Interactive Code Editor & Console Runner (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[700px] bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b1329] border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Select Programming Language"
                className="bg-slate-800 text-slate-200 text-xs font-mono font-semibold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++ (GCC 13)</option>
                <option value="java">Java 21</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset starter template"
                aria-label="Reset starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={evaluating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{evaluating ? 'Executing...' : 'Run in Sandbox'}</span>
              </button>
            </div>
          </div>

          {/* Code Textarea Workspace */}
          <div className="flex-1 relative bg-[#0b1120] font-mono text-xs overflow-hidden flex">
            {/* Simple Line Numbers */}
            <div className="w-10 py-3 select-none text-right pr-2 text-slate-600 bg-[#090e1a] border-r border-slate-800/80 leading-5">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editor Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full h-full p-3 bg-transparent text-slate-100 resize-none font-mono text-xs leading-5 focus:outline-none"
              placeholder="// Write your algorithm solution here..."
            />
          </div>

          {/* Console Drawer (collapsible) */}
          <div className="bg-[#0b1329] border-t border-slate-800 flex flex-col">
            <div
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-400 cursor-pointer hover:bg-slate-800/40 select-none border-b border-slate-800/60"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>Execution Console & Test Runner</span>
                {latestSubmission && (
                  <span
                    className={`ml-2 text-[10px] px-2 py-0.5 rounded font-bold ${
                      latestSubmission.status === 'ACCEPTED'
                        ? 'bg-teal-900/60 text-teal-300 border border-teal-700'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {latestSubmission.status}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                {consoleOpen ? 'Collapse' : 'Expand'}
              </span>
            </div>

            {consoleOpen && (
              <div className="p-4 max-h-56 overflow-y-auto text-xs font-mono space-y-3">
                {latestSubmission ? (
                  <div className="space-y-3">
                    {/* Execution Metrics */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                      <span>
                        Runtime: <strong className="text-teal-400">{latestSubmission.runtimeMs}ms</strong>
                      </span>
                      <span>
                        Memory: <strong className="text-teal-400">{latestSubmission.memoryMb}MB</strong>
                      </span>
                      <span>
                        Passed: <strong className="text-white">{latestSubmission.testSummary.passed}/{latestSubmission.testSummary.total}</strong>
                      </span>
                      <span className="text-slate-500 italic">
                        {sandboxEnvironment || 'Simulated Container'}
                      </span>
                    </div>

                    {/* Test Case Outputs */}
                    <div className="space-y-2">
                      {latestSubmission.testSummary.tests.map((test, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-300">{test.name}</span>
                            <span
                              className={test.passed ? 'text-teal-400 font-bold' : 'text-rose-400 font-bold'}
                            >
                              {test.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex gap-4">
                            <span>Output: {test.output}</span>
                            <span>Expected: {test.expected}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-3 text-center">
                    Press "Run in Sandbox" to evaluate your code against sample test cases.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
