import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  FileCheck,
  ShieldCheck,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building2,
  ExternalLink
} from 'lucide-react';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyPriority, setVerifyPriority] = useState('HIGH');
  const [assignedUniversity, setAssignedUniversity] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      const [qRes, uRes] = await Promise.all([
        api.get('/admin/verification-queue'),
        api.get('/admin/universities'),
      ]);

      if (qRes.success) {
        setQueue(qRes.challenges || []);
        if (qRes.challenges?.length > 0 && !selected) {
          selectChallenge(qRes.challenges[0]);
        }
      }
      if (uRes.success) {
        setUniversities(uRes.universities || []);
      }
    } catch (err) {
      console.error('Error fetching verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectChallenge = (c) => {
    setSelected(c);
    setVerifyStatus('VERIFIED');
    setVerifyPriority(c.priority || 'HIGH');
    setAssignedUniversity(c.assignedUniversity?._id || '');
    setAdminNotes(c.adminNotes || `Verified by Dept. of Higher Education. Recommended for ${c.district} technical institutes.`);
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
      };
      if (assignedUniversity) payload.assignedUniversity = assignedUniversity;

      const res = await api.patch(`/admin/verify/${selected._id}`, payload);
      if (res.success) {
        alert(`Challenge ${verifyStatus === 'VERIFIED' ? 'verified and published!' : 'updated.'}`);
        setSelected(null);
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
          State Administrative Review
        </span>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">Challenge Verification & Triage Queue</h1>
        <p className="text-xs text-slate-500">
          Review ground submissions with automated triage assistance, adjust priority thresholds, and route to appropriate university colleges.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading verification queue...</div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Verification Queue Clear!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All crowdsourced challenges have been validated and assigned to university engineering ecosystems.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Submissions Queue List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            <div className="p-3.5 bg-slate-50 font-bold text-xs text-slate-800 flex items-center justify-between sticky top-0 z-10 border-b border-slate-200">
              <span>Pending Reviews ({queue.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Click item to inspect</span>
            </div>

            {queue.map((c) => {
              const isSelected = selected && selected._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => selectChallenge(c)}
                  className={`p-3.5 cursor-pointer transition-colors space-y-1 text-xs ${
                    isSelected ? 'bg-sky-50/70 border-l-4 border-gov-800' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-gov-800 uppercase">{c.category}</span>
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </div>
                  <h4 className="font-semibold text-slate-900 leading-snug line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{c.location} ({c.district})</span>
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>AI Severity: {c.aiAnalysis?.severityScore || 6}/10</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: AI Triage & Admin Decision Panel (7 cols) */}
          {selected && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-gov-800 uppercase">{selected.category}</span>
                  <span className="text-slate-500">{selected.district}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selected.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selected.description}</p>
                <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500">
                  <span>Location: <strong className="text-slate-700">{selected.location}</strong></span>
                  <span>Impact: <strong className="text-slate-700">{selected.affectedPeople}</strong></span>
                </div>
              </div>

              {/* Automated Problem Triage Synthesis */}
              {selected.aiAnalysis && (
                <div className="bg-blue-50/60 p-4 rounded border border-blue-200 text-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                    <span className="font-bold text-gov-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gov-700" />
                      <span>Automated Problem Triage Synthesis</span>
                    </span>
                    <span className="font-semibold text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      Severity: {selected.aiAnalysis.severityScore}/10
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                    {selected.aiAnalysis.structuredSummary}
                  </p>

                  <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                    <p>
                      Recommended Department:{' '}
                      <span className="text-gov-800 font-semibold">
                        {selected.aiAnalysis.recommendedDomains?.join(', ')}
                      </span>
                    </p>
                    <p>
                      Suggested Target Institutions:{' '}
                      <span className="text-slate-800 font-medium">
                        {selected.aiAnalysis.suggestedUniversities?.join(', ')}
                      </span>
                    </p>
                  </div>

                  {selected.aiAnalysis.duplicateMatches?.length > 0 && (
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Duplicate warning: matches "{selected.aiAnalysis.duplicateMatches[0].title}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Administrative Decision Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs pt-1">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Administrative Decision & Assignment
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State Lifecycle Action</label>
                    <select
                      value={verifyStatus}
                      onChange={(e) => setVerifyStatus(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
                    >
                      <option value="VERIFIED">VERIFIED (Publish for Open Adoption)</option>
                      <option value="ASSIGNED">ASSIGNED (Directly Route to College)</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW (Hold for Local Verification)</option>
                      <option value="RESOLVED">RESOLVED (Pre-resolved on Ground)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority Classification</label>
                    <select
                      value={verifyPriority}
                      onChange={(e) => setVerifyPriority(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Route / Assign to University (Optional)
                  </label>
                  <select
                    value={assignedUniversity}
                    onChange={(e) => setAssignedUniversity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
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
                  <label className="block font-semibold text-slate-700 mb-1">Official Nodal Endorsement Instructions</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Updating...' : 'Publish Verification Decision'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
