/**
 * DevPrep AI API Client
 * Centralized interface for /api/v1 REST services
 */

import {
  UserProfile,
  QuestionBank,
  Question,
  TestAttempt,
  CodingChallenge,
  CodeSubmission,
  ResumeAnalysis,
  InterviewSession,
  ServiceMetrics,
  AuditLogEntry,
  LearningPlan,
} from '../types';

const BASE_URL = '/api/v1';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication (Blueprint Page 2 & 3)
  async login(payload: {
    email: string;
    password?: string;
    role?: 'learner' | 'content_manager' | 'admin';
    targetRole?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    return fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async signup(payload: {
    displayName: string;
    email: string;
    password?: string;
    role?: 'learner' | 'content_manager' | 'admin';
    targetRole?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    return fetchJson('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async adminLogin(payload: {
    email: string;
    password?: string;
    adminKey?: string;
    displayName?: string;
  }): Promise<{ user: UserProfile; token: string; message: string }> {
    return fetchJson('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ success: boolean }> {
    return fetchJson('/auth/logout', { method: 'POST' });
  },

  // User Profile
  async getProfile(): Promise<{ user: UserProfile }> {
    return fetchJson('/me');
  },

  async updateProfile(updates: {
    displayName?: string;
    preferences?: Partial<UserProfile['preferences']>;
    consentFlags?: Partial<UserProfile['consentFlags']>;
  }): Promise<{ user: UserProfile; message: string }> {
    return fetchJson('/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Aptitude Tests
  async getTestBanks(): Promise<{ tests: QuestionBank[] }> {
    return fetchJson('/aptitude/tests');
  },

  async startAttempt(bankId: string): Promise<{ attempt: TestAttempt; questions: Question[] }> {
    return fetchJson('/aptitude/attempts', {
      method: 'POST',
      body: JSON.stringify({ bankId }),
    });
  },

  async autosaveAnswers(
    attemptId: string,
    answers: Record<string, string>,
    markedForReview: string[]
  ): Promise<{ success: boolean; savedAt: string; answeredCount: number }> {
    return fetchJson(`/aptitude/attempts/${attemptId}/answers`, {
      method: 'PUT',
      body: JSON.stringify({ answers, markedForReview }),
    });
  },

  async submitAttempt(
    attemptId: string,
    timeSpentSeconds: number
  ): Promise<{
    attempt: TestAttempt;
    questionResults: {
      questionId: string;
      topic: string;
      prompt: string;
      options: { id: string; text: string }[];
      userAnswer: string | null;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }[];
  }> {
    return fetchJson(`/aptitude/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ timeSpentSeconds }),
    });
  },

  async explainQuestion(questionId: string, userAnswer: string): Promise<{
    questionId: string;
    explanation: string;
    isAiAssisted: boolean;
    disclaimer: string;
  }> {
    return fetchJson('/aptitude/explain', {
      method: 'POST',
      body: JSON.stringify({ questionId, userAnswer }),
    });
  },

  // Coding Lab
  async getCodingChallenges(): Promise<{ challenges: CodingChallenge[] }> {
    return fetchJson('/coding/challenges');
  },

  async submitCode(payload: {
    challengeId: string;
    language: string;
    code: string;
  }): Promise<{ submission: CodeSubmission; runnerEnvironment: string }> {
    return fetchJson('/coding/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCodingHint(
    challengeId: string,
    currentCode: string,
    hintLevel: number
  ): Promise<{ hint: string; level: number; maxLevels: number }> {
    return fetchJson('/coding/hint', {
      method: 'POST',
      body: JSON.stringify({ challengeId, currentCode, hintLevel }),
    });
  },

  // Resume Analyzer
  async analyzeResume(payload: {
    resumeText: string;
    targetRole: string;
    fileName: string;
    consentGiven: boolean;
    jobDescription?: string;
  }): Promise<{ analysis: ResumeAnalysis }> {
    return fetchJson('/resume/analyses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Mock Interviews
  async startInterview(payload: {
    targetRole: string;
    level: 'junior' | 'mid' | 'senior';
    interviewType: 'technical' | 'behavioral' | 'system_design';
  }): Promise<{ session: InterviewSession }> {
    return fetchJson('/interviews/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitInterviewTurn(
    sessionId: string,
    userAnswer: string
  ): Promise<{ session: InterviewSession }> {
    return fetchJson(`/interviews/sessions/${sessionId}/turns`, {
      method: 'POST',
      body: JSON.stringify({ userAnswer }),
    });
  },

  // Progress & Study Plan
  async getProgressSummary(): Promise<{
    readinessScore: number;
    attempts: TestAttempt[];
    submissions: CodeSubmission[];
    interviews: InterviewSession[];
    analyses: ResumeAnalysis[];
    applications: any[];
    bookmarks: string[];
    topicMastery: Record<string, number>;
    weeklyGoals: any[];
    completedGoalsCount: number;
    totalGoalsCount: number;
  }> {
    return fetchJson('/progress/summary');
  },

  // Applications Tracker (Blueprint Page 2 & 5)
  async getApplications(): Promise<{ applications: any[] }> {
    return fetchJson('/applications');
  },

  async createApplication(payload: {
    company: string;
    role: string;
    stage: string;
    nextActionAt?: string;
    notes?: string;
    location?: string;
    salaryRange?: string;
  }): Promise<{ application: any }> {
    return fetchJson('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateApplication(id: string, updates: any): Promise<{ application: any }> {
    return fetchJson(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Bookmarks
  async getBookmarks(): Promise<{ bookmarks: string[] }> {
    return fetchJson('/bookmarks');
  },

  async addBookmark(questionId: string): Promise<{ bookmarks: string[] }> {
    return fetchJson('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    });
  },

  async removeBookmark(questionId: string): Promise<{ bookmarks: string[] }> {
    return fetchJson(`/bookmarks/${questionId}`, {
      method: 'DELETE',
    });
  },

  async generateStudyPlan(
    currentMastery: Record<string, number>,
    weakTopics: string[]
  ): Promise<{
    plan: NonNullable<LearningPlan['generatedPlan']>;
    notice: string;
  }> {
    return fetchJson('/progress/plan', {
      method: 'POST',
      body: JSON.stringify({ currentMastery, weakTopics }),
    });
  },

  // Admin Console
  async getAdminMetrics(): Promise<{
    metrics: ServiceMetrics;
    auditLogs: AuditLogEntry[];
    questionBanks: QuestionBank[];
    totalQuestionsInBank: number;
  }> {
    return fetchJson('/admin/metrics');
  },

  async createQuestion(payload: {
    bankId: string;
    topic: string;
    prompt: string;
    options: { id: string; text: string }[];
    answerKey: string;
    explanationRef: string;
  }): Promise<{ message: string }> {
    return fetchJson('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
