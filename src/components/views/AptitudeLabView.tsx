import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Award,
} from 'lucide-react';
import { QuestionBank, Question, TestAttempt } from '../../types';
import { api } from '../../api/client';
import { CardSkeleton } from '../common/SkeletonLoader';

interface AptitudeLabViewProps {
  onAttemptCompleted: () => void;
}

export const AptitudeLabView: React.FC<AptitudeLabViewProps> = ({ onAttemptCompleted }) => {
  // Catalog State
  const [testBanks, setTestBanks] = useState<QuestionBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Active Assessment State
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [autosaveState, setAutosaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Completed Results State
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [questionResults, setQuestionResults] = useState<any[]>([]);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiExplain, setLoadingAiExplain] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test banks on mount
  useEffect(() => {
    async function loadBanks() {
      try {
        setLoadingBanks(true);
        const res = await api.getTestBanks();
        setTestBanks(res.tests);
      } catch (err) {
        console.error('Failed to load test banks:', err);
      } finally {
        setLoadingBanks(false);
      }
    }
    loadBanks();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (activeAttempt && !completedAttempt && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAttempt, completedAttempt, timeRemainingSeconds]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'marked' | 'bookmarked'>('all');

  // Load bookmarks on mount
  useEffect(() => {
    api.getBookmarks().then((res) => setBookmarks(res.bookmarks || [])).catch(() => {});
  }, []);

  // Keyboard Shortcuts (1-4, A-D, N, P, M, B)
  useEffect(() => {
    if (!activeAttempt || completedAttempt || showSubmitModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const q = questions[currentIndex];
      if (!q) return;

      const key = e.key.toLowerCase();
      // Option selection 1-4 or A-D
      const optionMap: Record<string, number> = {
        '1': 0, 'a': 0,
        '2': 1, 'b': 1,
        '3': 2, 'c': 2,
        '4': 3, 'd': 3,
      };

      if (key in optionMap) {
        const optIdx = optionMap[key];
        if (q.options[optIdx]) {
          handleSelectOption(q.id, q.options[optIdx].id);
        }
      } else if (key === 'n' || key === 'arrowright') {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (key === 'p' || key === 'arrowleft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (key === 'm') {
        handleToggleMarkReview(q.id);
      } else if (key === 'b') {
        handleToggleBookmark(q.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAttempt, completedAttempt, showSubmitModal, currentIndex, questions, selectedAnswers, markedForReview]);

  // Start Timed Attempt
  const handleStartTest = async (bankId: string) => {
    try {
      setLoadingBanks(true);
      const res = await api.startAttempt(bankId);
      setActiveAttempt(res.attempt);
      setQuestions(res.questions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setMarkedForReview([]);
      setTimeRemainingSeconds(res.attempt.durationMinutes * 60);
      setCompletedAttempt(null);
      setQuestionResults([]);
    } catch (err: any) {
      alert(`Error starting test: ${err?.message || 'Please try again'}`);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Option selection with Autosave
  const handleSelectOption = async (questionId: string, optionId: string) => {
    const updated = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updated);
    setAutosaveState('saving');

    if (activeAttempt) {
      try {
        await api.autosaveAnswers(activeAttempt.id, updated, markedForReview);
        setAutosaveState('saved');
      } catch (err) {
        console.error('Autosave failed:', err);
        setAutosaveState('error');
      }
    }
  };

  // Toggle Mark For Review with Autosave
  const handleToggleMarkReview = async (questionId: string) => {
    const isMarked = markedForReview.includes(questionId);
    const updated = isMarked
      ? markedForReview.filter((id) => id !== questionId)
      : [...markedForReview, questionId];

    setMarkedForReview(updated);

    if (activeAttempt) {
      try {
        await api.autosaveAnswers(activeAttempt.id, selectedAnswers, updated);
      } catch (err) {
        console.error('Failed to sync marked for review:', err);
      }
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (questionId: string) => {
    const isBookmarked = bookmarks.includes(questionId);
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((id) => id !== questionId));
      api.removeBookmark(questionId).catch(() => {});
    } else {
      setBookmarks((prev) => [...prev, questionId]);
      api.addBookmark(questionId).catch(() => {});
    }
  };

  // Clear current selection
  const handleClearSelection = (questionId: string) => {
    const updated = { ...selectedAnswers };
    delete updated[questionId];
    setSelectedAnswers(updated);
    if (activeAttempt) {
      api.autosaveAnswers(activeAttempt.id, updated, markedForReview).catch(console.error);
    }
  };

  // Submit test
  const handleFinalSubmit = async () => {
    if (!activeAttempt || submitting) return;
    setSubmitting(true);
    try {
      const timeSpent = activeAttempt.durationMinutes * 60 - timeRemainingSeconds;
      const res = await api.submitAttempt(activeAttempt.id, Math.max(15, timeSpent));
      setCompletedAttempt(res.attempt);
      setQuestionResults(res.questionResults);
      setShowSubmitModal(false);
      onAttemptCompleted();
    } catch (err: any) {
      alert(`Submission error: ${err?.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Request AI Explanation for a question
  const handleRequestAiExplanation = async (questionId: string, userAnswer: string | null) => {
    setLoadingAiExplain(questionId);
    try {
      const res = await api.explainQuestion(questionId, userAnswer || '');
      setAiExplanations((prev) => ({
        ...prev,
        [questionId]: res.explanation,
      }));
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
    } finally {
      setLoadingAiExplain(null);
    }
  };

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // Render Completed Results View
  // ==========================================
  if (completedAttempt) {
    const score = completedAttempt.score || 0;
    const isPassing = score >= 70;

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Result Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Objective Assessment Scorecard</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {completedAttempt.bankTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Completed in {Math.round((completedAttempt.timeSpentSeconds || 0) / 60)} minutes •
                Authoritative server-side evaluation
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div
                className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl border text-3xl font-extrabold ${
                  isPassing
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {score}%
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {completedAttempt.correctAnswers} of {completedAttempt.totalQuestions} Correct
              </p>
            </div>
          </div>

          {/* Topic Breakdown */}
          {completedAttempt.topicBreakdown && (
            <div className="pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Topic-by-Topic Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(completedAttempt.topicBreakdown).map(([topic, data]) => (
                  <div key={topic} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1.5">
                      <span className="truncate">{topic}</span>
                      <span className="text-teal-700">{data.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {data.correct} / {data.total} questions answered correctly
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                setActiveAttempt(null);
                setCompletedAttempt(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Test Catalog</span>
            </button>
            <span className="text-xs text-slate-500">
              Results updated your global topic mastery meter.
            </span>
          </div>
        </div>

        {/* Detailed Question Review & AI Explanations */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Detailed Question Review & Explanations
          </h3>

          {questionResults.map((qr, idx) => (
            <div
              key={qr.questionId}
              className={`bg-white border rounded-2xl p-6 shadow-xs transition-all ${
                qr.isCorrect ? 'border-teal-200 bg-teal-50/10' : 'border-rose-200 bg-rose-50/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Question {idx + 1} • {qr.topic}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    qr.isCorrect
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {qr.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 mb-4">{qr.prompt}</p>

              {/* Options Breakdown */}
              <div className="space-y-2 mb-4">
                {qr.options.map((opt: any) => {
                  const isUserPick = opt.id === qr.userAnswer;
                  const isAnswerKey = opt.id === qr.correctAnswer;

                  let borderClass = 'border-slate-200 bg-white';
                  if (isAnswerKey) borderClass = 'border-teal-500 bg-teal-50/50 text-teal-900 font-medium';
                  else if (isUserPick && !isAnswerKey) borderClass = 'border-rose-500 bg-rose-50/50 text-rose-900 line-through';

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs ${borderClass}`}
                    >
                      <span>{opt.text}</span>
                      <div className="flex items-center gap-2">
                        {isAnswerKey && (
                          <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100 px-2 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                        {isUserPick && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              isAnswerKey ? 'bg-teal-200 text-teal-900' : 'bg-rose-200 text-rose-900'
                            }`}
                          >
                            Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Authoritative Explanation Note */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1 mb-3">
                <span className="font-bold text-slate-900 block">Official Solution Note:</span>
                <p className="leading-relaxed">{qr.explanation}</p>
              </div>

              {/* AI Deep Explanation CTA */}
              {aiExplanations[qr.questionId] ? (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Gemini Coaching Step-by-Step Breakdown</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-indigo-900">
                    {aiExplanations[qr.questionId]}
                  </p>
                  <span className="text-[10px] text-indigo-500 block pt-1">
                    AI-generated placement coaching guidance.
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleRequestAiExplanation(qr.questionId, qr.userAnswer)}
                  disabled={loadingAiExplain === qr.questionId}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {loadingAiExplain === qr.questionId
                      ? 'Generating coaching explanation...'
                      : 'Ask Gemini for Step-by-Step Coaching Breakdown'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // Render Active Timed Assessment Runner
  // ==========================================
  if (activeAttempt && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);
    const isUnder2Minutes = timeRemainingSeconds <= 120;

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Test Control Top Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-16 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
              {activeAttempt.bankTitle}
            </span>
            <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              v{activeAttempt.bankVersion}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Autosave Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  autosaveState === 'saving'
                    ? 'bg-amber-400 animate-ping'
                    : autosaveState === 'saved'
                    ? 'bg-teal-500'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-500 font-medium">
                {autosaveState === 'saving'
                  ? 'Saving...'
                  : autosaveState === 'saved'
                  ? 'Autosaved'
                  : 'Sync Error'}
              </span>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                isUnder2Minutes
                  ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Linear Progress Meter */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Workspace: Question Canvas (Left) + Question Palette (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Canvas (3 cols) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[460px]">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-indigo-600">{currentQ.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Question toggle */}
                  <button
                    onClick={() => handleToggleBookmark(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      bookmarks.includes(currentQ.id)
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Bookmark question for revision (Shortcut: B)"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarks.includes(currentQ.id) ? 'fill-indigo-600 text-indigo-600' : ''
                      }`}
                    />
                    <span>{bookmarks.includes(currentQ.id) ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>

                  {/* Mark for review toggle */}
                  <button
                    onClick={() => handleToggleMarkReview(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      markedForReview.includes(currentQ.id)
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Mark for review (Shortcut: M)"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        markedForReview.includes(currentQ.id) ? 'fill-amber-500 text-amber-500' : ''
                      }`}
                    />
                    <span>
                      {markedForReview.includes(currentQ.id) ? 'Marked for Review' : 'Mark for Review'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint Bar */}
              <div className="mb-4 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">⚡ Keyboard Shortcuts:</span>
                <span className="font-mono">
                  <strong>1-4 / A-D</strong>: Select Option • <strong>N / P</strong>: Next/Prev • <strong>M</strong>: Mark • <strong>B</strong>: Bookmark
                </span>
              </div>

              {/* Prompt */}
              <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-8">
                {currentQ.prompt}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'font-semibold text-indigo-950' : 'text-slate-700'}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleClearSelection(currentQ.id)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Clear Choice
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
                  >
                    Review & Submit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette (1 col) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Question Palette</h4>
              <p className="text-xs text-slate-500 mb-4">
                Click any number to jump directly to that question.
              </p>

              {/* 1..N Palette Grid */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(selectedAnswers[q.id]);
                  const isMarked = markedForReview.includes(q.id);
                  const isCurrent = currentIndex === idx;

                  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isCurrent) {
                    bgClass = 'ring-2 ring-indigo-600 font-extrabold text-indigo-700 bg-indigo-50 border-indigo-300';
                  } else if (isMarked) {
                    bgClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl text-xs flex items-center justify-center border transition-all ${bgClass}`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs text-slate-500 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-teal-100 border border-teal-300" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                  <span>Marked for Review ({markedForReview.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
                  <span>Unanswered ({questions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 text-xs font-bold text-center text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Submission</h3>
              </div>

              <p className="text-sm text-slate-600">
                Are you ready to submit your test? Once submitted, your answers will be evaluated authoritatively against the test bank answer key.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Questions:</span>
                  <span className="font-bold text-slate-800">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Answered:</span>
                  <span className="font-bold text-teal-700">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unanswered:</span>
                  <span className="font-bold text-rose-700">{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Marked for Review:</span>
                  <span className="font-bold text-amber-700">{markedForReview.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleFinalSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  {submitting ? 'Scoring Answers...' : 'Confirm & Score'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // Render Test Catalog (Default View)
  // ==========================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Catalog Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Aptitude Practice Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Published Placement Test Banks
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Take timed diagnostic assessments designed around standard hiring formats: Quantitative, Logical Reasoning, and Core CS. Questions are scored with server-authoritative keys with zero answer key leakage to the client bundle.
          </p>
        </div>
      </div>

      {/* Catalog Cards */}
      {loadingBanks ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testBanks.map((bank) => (
            <div
              key={bank.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 tracking-wider">
                    {bank.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-teal-600 capitalize">
                    {bank.level}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{bank.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{bank.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 py-3 border-t border-slate-100 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {bank.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    {bank.totalQuestions} questions
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartTest(bank.id)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs text-center flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Start Timed Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
