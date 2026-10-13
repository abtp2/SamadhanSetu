import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ total: 0, aiVerified: 0, inProgress: 0, underReview: 0, resolved: 0 });
  const [selected, setSelected] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form (Admin Override)
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyPriority, setVerifyPriority] = useState('HIGH');
  const [assignedUniversity, setAssignedUniversity] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async (tab = activeTab) => {
    try {
      setLoading(true);
      const queryParam = tab === 'ALL' ? '' : `?status=${tab}`;
      const [qRes, uRes] = await Promise.all([
        api.get(`/admin/verification-queue${queryParam}`),
        api.get('/admin/universities'),
      ]);

      if (qRes.success) {
        setQueue(qRes.challenges || []);
        if (qRes.stats) setStats(qRes.stats);
        if (qRes.challenges?.length > 0) {
          selectChallenge(qRes.challenges[0]);
        } else {
          setSelected(null);
        }
      }
      if (uRes.success) {
        setUniversities(uRes.universities || []);
      }
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(activeTab);
  }, [activeTab]);

  const selectChallenge = (c) => {
    setSelected(c);
    setVerifyStatus(c.status || 'VERIFIED');
    setVerifyPriority(c.priority || 'HIGH');
    setAssignedUniversity(c.assignedUniversity?._id || c.assignedUniversity || '');
    setAdminNotes(c.adminNotes || '');
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const payload = {
        status: verifyStatus,
        priority: verifyPriority,
        adminNotes,
        assignedUniversity: assignedUniversity || null,
      };

      const res = await api.patch(`/admin/verify/${selected._id}`, payload);
      if (res.success) {
        alert('Challenge updated successfully.');
        fetchQueue(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = queue.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Issues & Ongoing Work</h1>
          <p className="text-xs text-slate-500">Autonomous AI triage, university assignments, and project tracking.</p>
        </div>
        <Link
          to="/admin/dashboard"
          className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { key: 'ALL', label: 'All', count: stats.total },
          { key: 'VERIFIED', label: 'Verified', count: stats.aiVerified },
          { key: 'IN_PROGRESS', label: 'In Progress', count: stats.inProgress },
          { key: 'UNDER_REVIEW', label: 'Under Review', count: stats.underReview },
          { key: 'RESOLVED', label: 'Resolved', count: stats.resolved },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              activeTab === t.key
                ? 'bg-gov-900 text-white border-gov-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[750px]">
          <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-slate-200 rounded text-xs bg-white"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredQueue.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading...</div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-700">No issues found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {filteredQueue.map((c) => {
                const isSelected = selected && selected._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => selectChallenge(c)}
                    className={`p-3 cursor-pointer transition-colors space-y-1.5 text-xs ${
                      isSelected ? 'bg-slate-100/80 border-l-3 border-slate-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 uppercase font-semibold text-[10px]">{c.category}</span>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 line-clamp-1">{c.title}</h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{c.district}</span>
                      </span>
                      {c.assignedUniversity && (
                        <span className="text-[10px] text-slate-600 truncate max-w-[150px]">
                          {c.assignedUniversity.name}
                        </span>
                      )}
                    </div>

                    {c.project && (
                      <div className="pt-1 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100">
                        <span>Project: {c.project.currentPhase || 'Active'}</span>
                        <span className="font-medium">{c.project.progressPercentage || 0}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Details & Override (7 cols) */}
        {selected ? (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
            {/* Issue Header */}
            <div className="border-b border-slate-100 pb-3 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">{selected.category}</span>
                <span className="text-slate-500">{selected.district}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{selected.title}</h2>
              <p className="text-slate-600 leading-relaxed pt-1">{selected.description}</p>
              <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1">
                <span>Location: <strong className="text-slate-700">{selected.location}</strong></span>
                <span>Impact: <strong className="text-slate-700">{selected.affectedPeople}</strong></span>
              </div>
            </div>

            {/* AI Decision Card (Clean Neutral Theme) */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-800 text-[11px]">
                <span>AI Verification & Routing</span>
                <span className="text-slate-500">Severity: {selected.aiAnalysis?.severityScore || 6}/10</span>
              </div>

              <p className="text-slate-700 text-[11px] leading-relaxed">
                {selected.aiAnalysis?.structuredSummary || selected.adminNotes}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Priority</span>
                  <span className="font-semibold text-slate-800">{selected.priority}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Routed University</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selected.assignedUniversity?.name || 'Open for adoption'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ongoing Project Work (If active) */}
            {selected.project && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">Project Status</span>
                  <Link
                    to={`/projects/${selected.project._id}`}
                    className="text-[11px] text-slate-700 hover:text-slate-900 underline flex items-center gap-1"
                  >
                    <span>View Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 font-medium">{selected.project.title}</span>
                  <span className="text-slate-600">{selected.project.currentPhase} ({selected.project.progressPercentage}%)</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gov-800 h-1.5 rounded-full"
                    style={{ width: `${selected.project.progressPercentage || 10}%` }}
                  />
                </div>
              </div>
            )}

            {/* Admin Override Controls */}
            <form onSubmit={handleVerifySubmit} className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Admin Controls
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Status</label>
                  <select
                    value={verifyStatus}
                    onChange={(e) => setVerifyStatus(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="VERIFIED">VERIFIED (Publish)</option>
                    <option value="ASSIGNED">ASSIGNED (Direct)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Hold)</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Priority</label>
                  <select
                    value={verifyPriority}
                    onChange={(e) => setVerifyPriority(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Assigned University</label>
                <select
                  value={assignedUniversity}
                  onChange={(e) => setAssignedUniversity(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="">-- Open for all eligible universities --</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gov-900 hover:bg-gov-800 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            Select an issue to inspect details.
          </div>
        )}
      </div>
    </div>
  );
};
