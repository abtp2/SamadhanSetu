import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import {
  Building2,
  Handshake,
  TrendingUp,
  MapPin,
  FolderGit2,
  Send,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Users,
  Award,
  GraduationCap,
} from 'lucide-react';

export const IndustryDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myCollaborations, setMyCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collaboration modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [collabType, setCollabType] = useState('CSR_GRANT');
  const [collabTitle, setCollabTitle] = useState('');
  const [collabOffer, setCollabOffer] = useState('');
  const [collabAmount, setCollabAmount] = useState(150000);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, collabRes] = await Promise.all([
        api.get('/projects?status=ACTIVE'),
        api.get('/collaborations/my'),
      ]);

      if (projRes.success) setProjects(projRes.projects || []);
      if (collabRes.success) setMyCollaborations(collabRes.collaborations || []);
    } catch (err) {
      console.error('Error fetching industry dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCollabModal = (p) => {
    setSelectedProject(p);
    setCollabTitle(`CSR Sponsorship for ${p.title}`);
    setCollabOffer(`Providing ₹1,50,000 prototype development funding and technical lab mentorship.`);
    setCollabAmount(150000);
    setCollabType('CSR_GRANT');
  };

  const handleSendCollaboration = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    try {
      const res = await api.post('/collaborations', {
        projectId: selectedProject._id,
        type: collabType,
        title: collabTitle,
        offerDetails: collabOffer,
        amountOffered: Number(collabAmount),
      });

      if (res.success) {
        alert('Collaboration offer sent to university team!');
        setSelectedProject(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting collaboration');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCommitted = myCollaborations
    .filter((c) => c.status === 'ACCEPTED')
    .reduce((sum, c) => sum + (c.amountOffered || 0), 0);

  const acceptedPartnerships = myCollaborations.filter((c) => c.status === 'ACCEPTED').length;

  const industryMetrics = [
    {
      title: 'GRANTS DISBURSED',
      value: `₹${totalCommitted.toLocaleString('en-IN')}`,
      sub: 'Accepted CSR funding',
      icon: Award,
    },
    {
      title: 'ACTIVE PARTNERSHIPS',
      value: acceptedPartnerships,
      sub: 'Approved collaborations',
      icon: Handshake,
    },
    {
      title: 'PROPOSALS SENT',
      value: myCollaborations.length,
      sub: 'Dispatched offers',
      icon: Send,
    },
    {
      title: 'COLLEGE PROJECTS',
      value: projects.length,
      sub: 'Seeking industry support',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
              Industry & CSR Innovation Wing
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">{user?.organizationName || 'Corporate Partner'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified university projects solving real problems in Jharkhand and offer grants, mentorship, or pilot infrastructure.
          </p>
        </div>
      </div>

      {/* Metric Cards (Unified Navy / Soft-Blue Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {industryMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                <m.icon className="w-4.5 h-4.5 text-gov-900" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {m.title}
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-gov-900 mt-1">
              {m.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Discover University Projects to Sponsor */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Discover University Projects Seeking Industry Support ({projects.length})
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active student teams and faculty mentors developing solutions for Jharkhand.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No active projects seeking collaboration.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gov-800 uppercase">{p.university?.name || 'University'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-gov-800 border border-blue-200/60 font-semibold text-[10px]">
                      Phase: {p.currentPhase}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.abstract}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Estimated Budget</span>
                      <span className="font-semibold text-slate-800">
                        ₹{(p.budgetEstimated || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Current Funding</span>
                      <span className="font-semibold text-emerald-700">
                        ₹{(p.budgetFunded || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-xs text-gov-800 hover:text-gov-900 font-semibold flex items-center gap-1"
                  >
                    <span>View Roadmap</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => openCollabModal(p)}
                    className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Offer CSR Partnership</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Partnerships List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            My Dispatched Collaboration Proposals ({myCollaborations.length})
          </h2>
        </div>

        {myCollaborations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No collaboration requests sent yet. Click "Offer CSR Partnership" on any project above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myCollaborations.map((c) => (
              <div key={c._id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900">{c.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{c.offerDetails}</p>
                  <p className="text-[11px] text-slate-500">
                    Target Project: <span className="font-semibold text-slate-800">{c.project?.title}</span> (
                    {c.project?.university?.name})
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-700">
                    ₹{(c.amountOffered || 0).toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/projects/${c.project?._id}`}
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    View Workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collaboration Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title="Submit Industry Collaboration & Funding Offer"
      >
        {selectedProject && (
          <form onSubmit={handleSendCollaboration} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-gov-800">Target University Project</span>
              <p className="font-bold text-slate-900">{selectedProject.title}</p>
              <p className="text-[11px] text-slate-500">{selectedProject.university?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Partnership Type</label>
                <select
                  value={collabType}
                  onChange={(e) => setCollabType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                >
                  <option value="CSR_GRANT">CSR Financial Grant</option>
                  <option value="EQUIPMENT">Equipment / Material Donation</option>
                  <option value="MENTORSHIP">Technical Mentorship</option>
                  <option value="PILOT_DEPLOYMENT">Site Pilot Access</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Committed Amount (INR)</label>
                <input
                  type="number"
                  value={collabAmount}
                  onChange={(e) => setCollabAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposal Subject Title</label>
              <input
                type="text"
                required
                value={collabTitle}
                onChange={(e) => setCollabTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Partnership Details & Scope</label>
              <textarea
                required
                rows={3}
                value={collabOffer}
                onChange={(e) => setCollabOffer(e.target.value)}
                placeholder="Specify lab resources, raw materials, or grant release stages..."
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded"
              >
                {submitting ? 'Submitting...' : 'Dispatch Partnership Proposal'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
