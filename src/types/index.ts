/**
 * DevPrep AI Data Types mapped to Firestore Schema Blueprint
 */

export type UserRole = 'learner' | 'content_manager' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  preferences: {
    targetRole: string;
    weeklyGoalHours: number;
    preferredLanguage: string;
  };
  consentFlags: {
    resumeAiProcessing: boolean;
    analyticsTracking: boolean;
  };
  createdAt: string;
}

export type QuestionCategory = 'quantitative' | 'logical' | 'verbal' | 'core_cs';

export interface QuestionBank {
  id: string;
  title: string;
  category: QuestionCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  version: number;
  published: boolean;
  durationMinutes: number;
  totalQuestions: number;
  description: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  bankId: string;
  topic: string;
  prompt: string;
  options: QuestionOption[];
  explanation?: string; // Revealed only after submission
}

export interface TestAttempt {
  id: string;
  uid: string;
  bankId: string;
  bankTitle: string;
  bankCategory: QuestionCategory;
  bankVersion: number;
  startedAt: string;
  submittedAt?: string;
  durationMinutes: number;
  answers: Record<string, string>; // questionId -> optionId
  markedForReview: string[]; // questionId[]
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  topicBreakdown?: Record<string, { total: number; correct: number; percentage: number }>;
  timeSpentSeconds?: number;
}

export type CodingDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: CodingDifficulty;
  category: string;
  prompt: string;
  constraints: string[];
  starterCode: Record<string, string>; // language -> code
  languageSet: string[];
  sampleTestCases: {
    input: string;
    expectedOutput: string;
    explanation?: string;
  }[];
  hints: string[];
}

export interface CodeSubmission {
  id: string;
  uid: string;
  challengeId: string;
  challengeTitle: string;
  language: string;
  code: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  testSummary: {
    passed: number;
    total: number;
    tests: {
      name: string;
      passed: boolean;
      output: string;
      expected: string;
    }[];
  };
  runtimeMs: number;
  memoryMb: number;
  submittedAt: string;
}

export interface ResumeSkillEvidence {
  skill: string;
  evidence: string;
  strength: 'Strong' | 'Moderate' | 'Needs Evidence';
}

export interface ResumeRewriteSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface JobDescriptionMatch {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendation: string;
}

export interface ResumeFeedback {
  overallScore: number;
  strengths: string[];
  skillEvidence: ResumeSkillEvidence[];
  gaps: string[];
  rewriteSuggestions: ResumeRewriteSuggestion[];
  nextActions: string[];
  jobDescriptionMatch?: JobDescriptionMatch;
}

export interface ResumeAnalysis {
  id: string;
  uid: string;
  fileName: string;
  targetRole: string;
  status: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  feedback?: ResumeFeedback;
  notice: string;
  createdAt: string;
}

export interface InterviewTurn {
  turnNumber: number;
  question: string;
  userAnswer?: string;
  feedback?: {
    score: number;
    observations: string[];
    suggestedFollowUp?: string;
  };
  timestamp: string;
}

export interface InterviewFeedback {
  overallScore: number;
  technicalDepthScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvementAreas: string[];
  actionablePracticePlan: string[];
}

export interface InterviewSession {
  id: string;
  uid: string;
  targetRole: string;
  level: 'junior' | 'mid' | 'senior';
  interviewType: 'technical' | 'behavioral' | 'system_design';
  rubricVersion: string;
  turns: InterviewTurn[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  feedback?: InterviewFeedback;
  createdAt: string;
}

export interface GoalItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  targetDate: string;
}

export interface DailyMilestone {
  day: string;
  focus: string;
  recommendedTasks: string[];
}

export interface LearningPlan {
  uid: string;
  weeklyGoals: GoalItem[];
  topicMastery: Record<string, number>;
  streak: number;
  updatedAt: string;
  generatedPlan?: {
    weekSummary: string;
    dailyMilestones: DailyMilestone[];
  };
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details?: string;
}

export interface ServiceMetrics {
  totalLearners: number;
  activeAttempts: number;
  submissionsToday: number;
  p95LatencyMs: number;
  errorRatePercent: number;
  quotaUsedPercent: number;
  cloudRunStatus: 'HEALTHY' | 'DEGRADED';
}

export type ApplicationStage =
  | 'Applied'
  | 'Online Assessment'
  | 'Technical Round 1'
  | 'System Design'
  | 'HR / Offer'
  | 'Rejected';

export interface PlacementApplication {
  id: string;
  uid: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedDate: string;
  nextActionAt?: string;
  notes?: string;
  location?: string;
  salaryRange?: string;
}
