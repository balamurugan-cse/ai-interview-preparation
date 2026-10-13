/**
 * DevPrep AI - Smart Placement Preparation Platform
 * Production-grade React + TypeScript application mapped to DevPrep Architecture Blueprint
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { MobileNav } from './components/layout/MobileNav';

// Auth & Onboarding View
import { LandingAuthView } from './components/auth/LandingAuthView';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { ProfileSettingsModal } from './components/common/ProfileSettingsModal';

// Core Module Views
import { DashboardView } from './components/views/DashboardView';
import { AptitudeLabView } from './components/views/AptitudeLabView';
import { CodingLabView } from './components/views/CodingLabView';
import { ResumeAnalyzerView } from './components/views/ResumeAnalyzerView';
import { MockInterviewView } from './components/views/MockInterviewView';
import { ProgressAnalyticsView } from './components/views/ProgressAnalyticsView';
import { ApplicationsTrackerView } from './components/views/ApplicationsTrackerView';
import { AdminConsoleView } from './components/views/AdminConsoleView';

// API & Types
import { api } from './api/client';
import { UserProfile, TestAttempt, CodeSubmission, PlacementApplication } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('devprep_auth') === 'true';
  });

  // App State from server
  const [user, setUser] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [topicMastery, setTopicMastery] = useState<Record<string, number>>({});
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch initial profile & progress summary when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAppState();
    }
  }, [isAuthenticated]);

  const loadAppState = async () => {
    try {
      setLoading(true);
      const [profileRes, summaryRes] = await Promise.all([
        api.getProfile(),
        api.getProgressSummary(),
      ]);

      setUser(profileRes.user);
      setAttempts(summaryRes.attempts || []);
      setSubmissions(summaryRes.submissions || []);
      setApplications(summaryRes.applications || []);
      setTopicMastery(summaryRes.topicMastery || {});
      setWeeklyGoals(summaryRes.weeklyGoals || []);
      setReadinessScore(summaryRes.readinessScore || 0);
    } catch (err) {
      console.error('Failed to load application state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('devprep_auth', 'true');
    if (authenticatedUser.role === 'admin') {
      setCurrentView('admin');
    }
    loadAppState();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('devprep_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleExitAdminMode = async () => {
    if (!user) return;
    const updated: UserProfile = { ...user, role: 'learner' };
    setUser(updated);
    setCurrentView('dashboard');
    try {
      await api.updateProfile({ preferences: { ...user.preferences } });
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Unauthenticated or Explicit Log Out: Render dedicated User Login & Landing Portal
  if (!isAuthenticated) {
    return (
      <LandingAuthView
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  // 2. Authenticated Cockpit
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onRequireAdminLogin={() => setAdminModalOpen(true)}
        onExitAdminMode={handleExitAdminMode}
        onLogout={handleLogout}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={currentView}
        onSelectView={setCurrentView}
        user={user}
        onRequireAdminLogin={() => setAdminModalOpen(true)}
        onExitAdminMode={handleExitAdminMode}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <TopNav
          currentView={currentView}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          user={user}
          onRequireAdminLogin={() => setAdminModalOpen(true)}
          onExitAdminMode={handleExitAdminMode}
          onLogout={handleLogout}
          onOpenSettings={() => setProfileSettingsOpen(true)}
        />

        {/* View Canvas Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              user={user}
              attempts={attempts}
              submissions={submissions}
              topicMastery={topicMastery}
              weeklyGoals={weeklyGoals}
              readinessScore={readinessScore}
              loading={loading}
              onRefresh={loadAppState}
            />
          )}

          {currentView === 'aptitude' && (
            <AptitudeLabView onAttemptCompleted={loadAppState} />
          )}

          {currentView === 'coding' && (
            <CodingLabView onSubmissionCompleted={loadAppState} />
          )}

          {currentView === 'resume' && (
            <ResumeAnalyzerView onAnalysisCompleted={loadAppState} />
          )}

          {currentView === 'interview' && (
            <MockInterviewView user={user} onInterviewCompleted={loadAppState} />
          )}

          {currentView === 'analytics' && (
            <ProgressAnalyticsView
              attempts={attempts}
              submissions={submissions}
              topicMastery={topicMastery}
              weeklyGoals={weeklyGoals}
              readinessScore={readinessScore}
              onNavigateToAptitude={() => setCurrentView('aptitude')}
              onNavigateToCoding={() => setCurrentView('coding')}
            />
          )}

          {currentView === 'applications' && (
            <ApplicationsTrackerView
              applications={applications}
              onRefresh={loadAppState}
              onNavigateToCoding={() => setCurrentView('coding')}
              onNavigateToInterview={() => setCurrentView('interview')}
            />
          )}

          {currentView === 'admin' && (
            <AdminConsoleView
              user={user}
              onExitAdmin={handleExitAdminMode}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Dedicated Admin Login Gateway Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onAdminAuthenticated={(adminUser) => {
          handleAuthenticated(adminUser);
          setCurrentView('admin');
        }}
      />

      {/* Candidate Profile & Preferences Modal */}
      <ProfileSettingsModal
        isOpen={profileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
        user={user}
        onUpdated={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}
