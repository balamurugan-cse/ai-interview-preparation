import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Award,
} from 'lucide-react';
import { ResumeAnalysis } from '../../types';
import { api } from '../../api/client';
import { CardSkeleton } from '../common/SkeletonLoader';

interface ResumeAnalyzerViewProps {
  onAnalysisCompleted: () => void;
}

const SAMPLE_RESUME = `Palanibalamurugan
palanibalamurugan818@gmail.com | Portfolio: github.com/palanibala | Chennai, India

EDUCATION
B.Tech in Computer Science and Engineering | CGPA: 8.6/10 | Expected May 2026

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, SQL
Frontend: React 19, Next.js, Tailwind CSS, Redux Toolkit
Backend: Node.js, Express, REST APIs, PostgreSQL, MongoDB, Redis
Cloud & Tools: Google Cloud Platform (Cloud Run, Firestore), Docker, Git, Jest

EXPERIENCE & PROJECTS
1. DevPrep AI - Full Stack Placement Preparation Platform
- Developed a placement prep web platform using React, TypeScript, and Express.
- Connected Gemini API for resume analysis and automated interview question follow-ups.
- Configured timed aptitude quizzes with server-authoritative scoring and question palettes.
- Implemented isolated code runner simulation testing algorithms across multiple languages.

2. Cloud Microservice Task Orchestrator
- Built a REST API backend with Express and PostgreSQL managing task queues.
- Reduced database query times by adding composite indexes on active task columns.
- Deployed service to containerized Cloud Run environment.

3. Distributed Cache Simulation
- Implemented LRU caching structure in C++ with custom doubly-linked lists and hash maps.
- Handled concurrency using mutex locks and benchmarked hit rates under simulated workload.`;

export const ResumeAnalyzerView: React.FC<ResumeAnalyzerViewProps> = ({ onAnalysisCompleted }) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Candidate_Resume.pdf');
  const [targetRole, setTargetRole] = useState<string>('Software Development Engineer (SDE-1)');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdInput, setShowJdInput] = useState<boolean>(false);

  // Sample Job Description for Testing
  const SAMPLE_JD = `Role: Software Development Engineer (SDE-1)
Requirements:
- Strong proficiency in TypeScript, React 19, Node.js, and REST API architecture.
- Experience with relational and NoSQL databases (PostgreSQL, Redis) and database indexing.
- Familiarity with cloud services (Google Cloud Platform, Docker containerization).
- Solid grasp of data structures, algorithm complexity, and caching architectures.
- Experience with unit testing (Jest) and Git pull-request workflows.`;

  // Load sample resume for instant one-click testing
  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setFileName('Palanibalamurugan_SDE_Resume.pdf');
    setConsentGiven(true);
  };

  const handleLoadSampleJd = () => {
    setJobDescription(SAMPLE_JD);
    setShowJdInput(true);
  };

  // Drag and drop handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setResumeText(content || `Extracted text from uploaded file: ${file.name}\n\n${SAMPLE_RESUME}`);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setResumeText(content || `Extracted text from uploaded file: ${file.name}\n\n${SAMPLE_RESUME}`);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!consentGiven) {
      alert('You must accept the explicit privacy consent before analyzing resume content.');
      return;
    }
    if (!resumeText || resumeText.trim().length < 50) {
      alert('Please provide or upload a complete resume with project and skill sections.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.analyzeResume({
        resumeText,
        targetRole,
        fileName,
        consentGiven,
        jobDescription: showJdInput && jobDescription.trim().length > 20 ? jobDescription.trim() : undefined,
      });
      setAnalysisResult(res.analysis);
      onAnalysisCompleted();
    } catch (err: any) {
      alert(`Resume analysis failed: ${err?.message || 'Error communicating with AI service'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Grounded Resume Auditor</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Resume Alignment & Evidence Check
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Audits technical achievements against target placement criteria. Highlights grounded evidence, critical competency gaps, and XYZ format bullet rewrites.
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>Load Sample SDE Resume</span>
          </button>
        </div>
      </div>

      {/* Input Section (Upload Dropzone + Consent + Target Role) */}
      {!analysisResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Target Role Selector & Optional JD Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Target Placement Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Development Engineer (SDE-1), Full Stack Engineer, Cloud Specialist"
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Job Description Alignment Mode (Blueprint Page 2) */}
            <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={showJdInput}
                    onChange={(e) => setShowJdInput(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Match Against Specific Company Job Description (JD Alignment)</span>
                </label>
                {showJdInput && (
                  <button
                    type="button"
                    onClick={handleLoadSampleJd}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Load Sample SDE-1 JD
                  </button>
                )}
              </div>

              {showJdInput && (
                <div>
                  <textarea
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target Job Description (responsibilities, required skills, preferred qualifications)..."
                    className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Audits keyword coverage, prerequisite match %, and missing competencies directly against this job posting.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Upload Resume (PDF, DOCX, TXT) or Paste Content
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/40'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 stroke-[1.75]" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">
                Drag and drop your resume file here
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Supported formats: PDF, DOCX, TXT (Maximum 5MB)
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>

              {fileName && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Selected: {fileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Text Area for Resume Content preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Resume Text Content
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your raw resume text here or use the file upload above..."
              className="w-full text-xs font-mono p-4 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Mandatory Privacy Consent Checkbox (Blueprint Spec) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <div className="text-xs text-slate-700 space-y-1">
                <span className="font-semibold block text-slate-900">
                  Explicit Privacy Consent Notice
                </span>
                <p className="text-slate-500 leading-relaxed">
                  I give explicit consent to process this resume text with DevPrep AI and Google Cloud Run for placement preparation advice. I acknowledge that feedback is advisory coaching, does not fabricate achievements, and does not guarantee job placement.
                </p>
              </div>
            </label>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !consentGiven || resumeText.length < 50}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Resume with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Placement Readiness</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analyzing Skeleton Loader State */}
      {analyzing && (
        <div className="space-y-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={3} />
        </div>
      )}

      {/* Structured Feedback Results Panel (Blueprint Spec) */}
      {analysisResult && analysisResult.feedback && (
        <div className="space-y-6">
          {/* Header Score Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit Completed</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Resume Analysis Scorecard
                </h3>
                <p className="text-xs text-slate-500">
                  Target: <strong>{analysisResult.targetRole}</strong> • File: {analysisResult.fileName}
                </p>
              </div>

              <div className="text-center sm:text-right">
                <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 text-3xl font-extrabold">
                  {analysisResult.feedback.overallScore}/100
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Overall Alignment Rating
                </p>
              </div>
            </div>

            {/* Advisory Notice */}
            <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{analysisResult.notice}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                title="Print or save as PDF"
              >
                <span>Save / Print PDF Audit</span>
              </button>

              <button
                onClick={() => setAnalysisResult(null)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Upload / Analyze Another Resume <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Optional Job Description Alignment Card (Blueprint Page 2) */}
          {analysisResult.feedback.jobDescriptionMatch && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Company Job Description (JD) Alignment
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Semantic prerequisite and technical keyword alignment evaluation
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-extrabold">
                  {analysisResult.feedback.jobDescriptionMatch.matchPercentage}% Match Rate
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Matched Keywords */}
                <div className="p-3.5 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2">
                  <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wider">
                    Matched Role Keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.feedback.jobDescriptionMatch.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold text-[11px]"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2">
                  <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                    Missing Target Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.feedback.jobDescriptionMatch.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold text-[11px]"
                      >
                        ! {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-indigo-950 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                <strong>Alignment Tip:</strong> {analysisResult.feedback.jobDescriptionMatch.recommendation}
              </p>
            </div>
          )}

          {/* Section 1: Strengths & Gaps (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Verified Strengths
              </h4>
              <ul className="space-y-2.5">
                {analysisResult.feedback.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Gaps */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Areas to Strengthen
              </h4>
              <ul className="space-y-2.5">
                {analysisResult.feedback.gaps.map((gap, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Skill Evidence Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Skill Evidence Grounding Matrix
            </h4>
            <p className="text-xs text-slate-500">
              Evaluates whether technical skills declared on the resume are substantiated with concrete project implementations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.feedback.skillEvidence.map((se, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{se.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        se.strength === 'Strong'
                          ? 'bg-teal-100 text-teal-800'
                          : se.strength === 'Moderate'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {se.strength}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{se.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Before & After XYZ Rewrite Suggestions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Actionable Bullet Point Rewrites (XYZ Formula)
            </h4>

            <div className="space-y-4">
              {analysisResult.feedback.rewriteSuggestions.map((rw, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Original Bullet:
                    </span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      "{rw.original}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-teal-700 uppercase tracking-wider text-[10px]">
                      Recommended XYZ Rewrite:
                    </span>
                    <p className="text-slate-900 bg-teal-50/60 p-2.5 rounded-lg border border-teal-200 font-medium">
                      "{rw.improved}"
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Rationale: {rw.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Next Priority Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Next Recommended Actions</h4>
            <div className="space-y-2">
              {analysisResult.feedback.nextActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
