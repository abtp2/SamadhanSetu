import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import {
  Building2,
  Handshake,
  FolderGit2,
  ExternalLink,
  Award,
  CheckCircle2
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
      console.error('Error fetching data:', err);
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
    setCollabOffer(`Providing ₹1,50,000 prototype development funding.`);
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
        alert('Collaboration offer sent.');
        setSelectedProject(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error submitting offer');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCommitted = myCollaborations
    .filter((c) => c.status === 'ACCEPTED')
    .reduce((sum, c) => sum + (c.amountOffered || 0), 0);

  const acceptedPartnerships = myCollaborations.filter((c) => c.status === 'ACCEPTED').length;

  const industryMetrics = [
    { title: 'Grants Disbursed', value: `₹${totalCommitted.toLocaleString('en-IN')}`, icon: Award },
    { title: 'Partnerships', value: acceptedPartnerships, icon: Handshake },
    { title: 'Active Projects', value: projects.length, icon: FolderGit2 },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500">{user?.organizationName || 'CSR Foundation Partner'} • CSR Grants & Partnerships Portal</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {industryMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">{m.title}</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{m.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <m.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Discover University Projects to Sponsor */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            University Projects Seeking Support ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No active projects seeking collaboration.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            {projects.map((p) => (
              <div
                key={p._id}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex flex-col justify-between space-y-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 uppercase text-[10px]">{p.university?.name || 'University'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                      Phase: {p.currentPhase}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  <p className="text-slate-500 line-clamp-2 text-[11px] leading-relaxed">{p.abstract}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estimated</span>
                      <span className="font-medium text-slate-800">
                        ₹{(p.budgetEstimated || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Funded</span>
                      <span className="font-medium text-slate-800">
                        ₹{(p.budgetFunded || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-[11px] text-slate-600 hover:text-slate-900 underline"
                  >
                    Roadmap →
                  </Link>
                  <button
                    onClick={() => openCollabModal(p)}
                    className="bg-gov-900 hover:bg-gov-800 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                  >
                    <Handshake className="w-3 h-3" />
                    <span>Offer CSR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatched Proposals */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Collaboration Proposals ({myCollaborations.length})
          </h2>
        </div>

        {myCollaborations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No collaboration requests sent yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myCollaborations.map((c) => (
              <div key={c._id} className="p-3 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900">{c.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                        c.status === 'ACCEPTED'
                          ? 'bg-gov-900 text-white border-gov-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{c.offerDetails}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-900">
                    ₹{(c.amountOffered || 0).toLocaleString('en-IN')}
                  </span>
                  <Link
                    to={`/projects/${c.project?._id}`}
                    className="text-[11px] text-slate-600 hover:text-slate-900 underline"
                  >
                    View →
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
        title="Submit CSR Offer"
      >
        {selectedProject && (
          <form onSubmit={handleSendCollaboration} className="space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Target Project</span>
              <p className="font-semibold text-slate-900">{selectedProject.title}</p>
              <p className="text-[11px] text-slate-500">{selectedProject.university?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Partnership Type</label>
                <select
                  value={collabType}
                  onChange={(e) => setCollabType(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                >
                  <option value="CSR_GRANT">CSR Grant</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="MENTORSHIP">Mentorship</option>
                  <option value="PILOT_DEPLOYMENT">Pilot Site</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={collabAmount}
                  onChange={(e) => setCollabAmount(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Offer Details</label>
              <textarea
                rows={2}
                value={collabOffer}
                onChange={(e) => setCollabOffer(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white font-medium rounded"
              >
                {submitting ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
