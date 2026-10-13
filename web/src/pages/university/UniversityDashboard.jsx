import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Modal } from '../../components/Modal';
import {
  FolderGit2,
  CheckCircle2,
  MapPin,
  Plus,
  FileText,
  Award
} from 'lucide-react';

export const UniversityDashboard = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [openChallenges, setOpenChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adoption modal
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [projectBudget, setProjectBudget] = useState(150000);
  const [methodology, setMethodology] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, chalRes] = await Promise.all([
        api.get('/projects/my'),
        api.get('/challenges?status=VERIFIED&limit=8'),
      ]);
      if (projRes.success) setMyProjects(projRes.projects || []);
      if (chalRes.success) setOpenChallenges(chalRes.challenges || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdoptModal = (challenge) => {
    setSelectedChallenge(challenge);
    setProjectTitle(`Solution: ${challenge.title}`);
    setProjectAbstract(`Engineering intervention addressing ${challenge.category} in ${challenge.district}.`);
    setProjectBudget(150000);
    setMethodology('');
  };

  const handleAdopt = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    setSubmitting(true);
    try {
      const res = await api.post('/projects/adopt', {
        challengeId: selectedChallenge._id,
        title: projectTitle,
        abstract: projectAbstract,
        estimatedBudget: Number(projectBudget),
        methodology,
      });

      if (res.success) {
        setSelectedChallenge(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Adoption failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldPilotsCount = myProjects.filter((p) =>
    ['PILOT_DEPLOYMENT', 'RESOLVED'].includes(p.currentPhase)
  ).length;
  const totalCsrFunded = myProjects.reduce((sum, p) => sum + (p.budgetFunded || 0), 0);

  const universityMetrics = [
    { title: 'Adopted Projects', value: myProjects.length, icon: FolderGit2 },
    { title: 'Open Challenges', value: openChallenges.length, icon: FileText },
    { title: 'Field Pilots', value: fieldPilotsCount, icon: CheckCircle2 },
    { title: 'CSR Grants', value: `₹${totalCsrFunded.toLocaleString('en-IN')}`, icon: Award },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500">{user?.universityName || 'Jharkhand University'} • R&D Portal</p>
        </div>

        <Link
          to="/explore?status=VERIFIED"
          className="inline-flex items-center space-x-1.5 bg-gov-900 hover:bg-gov-800 text-white font-medium px-3.5 py-1.5 rounded text-xs transition-colors"
        >
          <span>Discover Challenges</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {universityMetrics.map((m) => (
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

      {/* Active Projects */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Projects ({myProjects.length})
          </h2>
          <Link to="/explore?status=VERIFIED" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            Explore →
          </Link>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active projects adopted yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myProjects.map((p) => (
              <div key={p._id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-slate-500 uppercase font-semibold">{p.challenge?.category || 'Civic'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{p.challenge?.district}</span>
                    <span className="px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Phase: {p.currentPhase || 'Active'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded"
                  >
                    Workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Verified Challenges */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verified Challenges Awaiting Adoption ({openChallenges.length})
          </h2>
          <Link to="/explore?status=VERIFIED" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View All →
          </Link>
        </div>

        {openChallenges.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No verified challenges awaiting adoption.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
            {openChallenges.map((c) => (
              <div
                key={c._id}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex flex-col justify-between space-y-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 uppercase font-semibold text-[10px]">{c.category}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{c.title}</h3>
                  <p className="text-slate-500 line-clamp-2 text-[11px] leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link to={`/challenges/${c._id}`} className="text-[11px] text-slate-600 hover:text-slate-900 underline">
                    Details →
                  </Link>
                  <button
                    onClick={() => openAdoptModal(c)}
                    className="bg-gov-900 hover:bg-gov-800 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adopt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adoption Modal */}
      <Modal
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        title="Adopt Challenge"
      >
        {selectedChallenge && (
          <form onSubmit={handleAdopt} className="space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 space-y-0.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500">{selectedChallenge.category}</span>
              <p className="font-semibold">{selectedChallenge.title}</p>
              <p className="text-slate-500 text-[11px]">{selectedChallenge.district}</p>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Project Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Abstract</label>
              <textarea
                required
                rows={2}
                value={projectAbstract}
                onChange={(e) => setProjectAbstract(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Estimated Budget (INR)</label>
                <input
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">University</label>
                <input
                  type="text"
                  disabled
                  value={user?.universityName || 'Partner University'}
                  className="w-full p-1.5 border border-slate-200 bg-slate-100 rounded text-xs text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Methodology</label>
              <textarea
                rows={2}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white font-medium rounded"
              >
                {submitting ? 'Adopting...' : 'Adopt Challenge'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
