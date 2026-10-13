import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PlacementApplication, ApplicationStage } from '../../types';
import { api } from '../../api/client';
import { EmptyState } from '../common/EmptyState';

interface ApplicationsTrackerViewProps {
  applications: PlacementApplication[];
  onRefresh: () => void;
  onNavigateToCoding: () => void;
  onNavigateToInterview: () => void;
}

const STAGES: { stage: ApplicationStage; label: string; badgeColor: string }[] = [
  { stage: 'Applied', label: 'Applied', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { stage: 'Online Assessment', label: 'Online Assessment (OA)', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
  { stage: 'Technical Round 1', label: 'Technical Round 1', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { stage: 'System Design', label: 'System Design', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { stage: 'HR / Offer', label: 'Offer Received', badgeColor: 'bg-teal-50 text-teal-800 border-teal-200' },
  { stage: 'Rejected', label: 'Archived', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export const ApplicationsTrackerView: React.FC<ApplicationsTrackerViewProps> = ({
  applications,
  onRefresh,
  onNavigateToCoding,
  onNavigateToInterview,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [company, setCompany] = useState<string>('');
  const [role, setRole] = useState<string>('Software Development Engineer');
  const [stage, setStage] = useState<ApplicationStage>('Applied');
  const [nextActionAt, setNextActionAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<string>('Bengaluru / Hybrid');
  const [salaryRange, setSalaryRange] = useState<string>('₹24 - 30 LPA');
  const [saving, setSaving] = useState<boolean>(false);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setSaving(true);
    try {
      await api.createApplication({
        company: company.trim(),
        role: role.trim(),
        stage,
        nextActionAt: nextActionAt.trim(),
        notes: notes.trim(),
        location: location.trim(),
        salaryRange: salaryRange.trim(),
      });
      setShowAddModal(false);
      setCompany('');
      setNotes('');
      setNextActionAt('');
      onRefresh();
    } catch (err: any) {
      alert(`Error creating application: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStage = async (appId: string, currentStage: ApplicationStage) => {
    const stageOrder: ApplicationStage[] = [
      'Applied',
      'Online Assessment',
      'Technical Round 1',
      'System Design',
      'HR / Offer',
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      try {
        await api.updateApplication(appId, { stage: nextStage });
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (appId: string) => {
    if (confirm('Delete this company application record?')) {
      try {
        await api.deleteApplication(appId);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Placement Application Tracker (Firestore applications collection)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Applications & Drive Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Track hiring pipeline stages from OA to final offers. Ground your practice milestones in specific upcoming company deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table List
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No company applications tracked yet"
          description="Log placement drives, upcoming campus rounds, or off-campus referrals to track milestones and schedule preparation sprints."
          actionText="Log First Application"
          onAction={() => setShowAddModal(true)}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Pipeline Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.filter((s) => s.stage !== 'Rejected').map((col) => {
            const items = applications.filter((a) => a.stage === col.stage);
            return (
              <div
                key={col.stage}
                className="bg-slate-100/70 rounded-2xl p-4 flex flex-col min-h-[500px] border border-slate-200/80"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {items.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5 hover:border-indigo-300 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {app.company}
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-indigo-700 font-medium">
                        {app.role}
                      </div>

                      {app.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      {app.salaryRange && (
                        <div className="flex items-center gap-1.5 text-[11px] text-teal-700 font-semibold">
                          <DollarSign className="w-3 h-3 text-teal-600" />
                          <span>{app.salaryRange}</span>
                        </div>
                      )}

                      {app.nextActionAt && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 font-medium">
                          <span className="font-bold block">Next Milestone:</span>
                          {app.nextActionAt}
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                          "{app.notes}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                        {col.stage !== 'HR / Offer' && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, app.stage)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Next Action</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{app.company}</td>
                    <td className="py-3.5 px-4 text-indigo-700 font-semibold">{app.role}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {app.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{app.location || '—'}</td>
                    <td className="py-3.5 px-4 text-amber-800 font-medium">
                      {app.nextActionAt || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Track New Application</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Atlassian, Adobe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Position / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE-1, Software Engineer Intern"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ApplicationStage)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {STAGES.map((s) => (
                      <option key={s.stage} value={s.stage}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. ₹20 - 25 LPA"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Action Date & Milestone</label>
                <input
                  type="text"
                  value={nextActionAt}
                  onChange={(e) => setNextActionAt(e.target.value)}
                  placeholder="e.g. OA scheduled for Sunday 10:00 AM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preparation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Topics to focus on (e.g. Dynamic Programming, Trees, Operating Systems)..."
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
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
