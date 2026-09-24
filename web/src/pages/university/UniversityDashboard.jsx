import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Modal } from '../../components/Modal';
import {
  GraduationCap,
  FolderGit2,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Plus,
  Users,
  Building2,
  ExternalLink,
  FileText,
  Award,
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
      console.error('Error fetching university dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdoptModal = (challenge) => {
    setSelectedChallenge(challenge);
    setProjectTitle(`Solution Initiative: ${challenge.title}`);
    setProjectAbstract(`Multidisciplinary engineering intervention addressing ${challenge.category} in ${challenge.district}.`);
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
    {
      title: 'ADOPTED PROJECTS',
      value: myProjects.length,
      sub: 'Active university teams',
      icon: FolderGit2,
    },
    {
      title: 'OPEN CHALLENGES',
      value: openChallenges.length,
      sub: 'Verified & ready to adopt',
      icon: FileText,
    },
    {
      title: 'FIELD PILOTS',
      value: fieldPilotsCount,
      sub: 'Deployed on ground',
      icon: CheckCircle2,
    },
    {
      title: 'CSR GRANTS SECURED',
      value: `₹${totalCsrFunded.toLocaleString('en-IN')}`,
      sub: 'Committed industry funds',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
              University R&D Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">{user?.universityName || 'Jharkhand University'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500">
            Adopt verified societal challenges, form student innovation taskforces, and track deployment milestones.
          </p>
        </div>

        <Link
          to="/explore?status=VERIFIED"
          className="inline-flex items-center space-x-1.5 bg-gov-900 hover:bg-gov-800 text-white font-semibold px-4 py-2 rounded text-xs transition-colors shadow-xs"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Discover Open Challenges</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {universityMetrics.map((m) => (
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

      {/* Active Projects Workspace Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active University Projects ({myProjects.length})
            </h2>
            <p className="text-[11px] text-slate-500">Collaborative engineering taskforces and prototype pipelines.</p>
          </div>
          <Link to="/explore?status=VERIFIED" className="text-xs text-gov-800 font-semibold hover:underline">
            Explore More →
          </Link>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-slate-700">No active adopted projects yet</h3>
            <p className="text-xs text-slate-500">
              Browse the verified challenges below and click "Adopt Challenge" to launch your team.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myProjects.map((p) => (
              <div
                key={p._id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-semibold text-gov-800 uppercase">{p.challenge?.category || 'Civic'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{p.challenge?.district || 'Jharkhand'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                      Phase: {p.currentPhase || 'Active'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{p.abstract}</p>

                  <div className="pt-0.5 flex items-center space-x-3 text-xs text-slate-500">
                    <span>Budget: ₹{(p.budgetEstimated || 0).toLocaleString('en-IN')}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-gov-800 font-medium">
                      CSR Funded: ₹{(p.budgetFunded || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    Open Workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Verified Challenges Discovery Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Verified Challenges Awaiting University Adoption ({openChallenges.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Government-verified civic challenges categorized by engineering and research domains.
            </p>
          </div>
          <Link to="/explore?status=VERIFIED" className="text-xs text-gov-800 font-semibold hover:underline">
            View All ({openChallenges.length}) →
          </Link>
        </div>

        {openChallenges.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No verified challenges awaiting adoption at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {openChallenges.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gov-800 uppercase">{c.category}</span>
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.location} ({c.district})</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/challenges/${c._id}`}
                    className="text-xs font-semibold text-gov-800 hover:underline"
                  >
                    Read Details →
                  </Link>
                  <button
                    onClick={() => openAdoptModal(c)}
                    className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adopt Challenge</span>
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
        title="Adopt Verified Challenge for University Engineering Project"
      >
        {selectedChallenge && (
          <form onSubmit={handleAdopt} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 space-y-1">
              <span className="text-[10px] font-bold uppercase text-gov-800">{selectedChallenge.category}</span>
              <p className="font-semibold">{selectedChallenge.title}</p>
              <p className="text-slate-500 text-[11px]">{selectedChallenge.location} • {selectedChallenge.district}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Solution Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Technical Abstract <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={projectAbstract}
                onChange={(e) => setProjectAbstract(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (INR)</label>
                <input
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliated University</label>
                <input
                  type="text"
                  disabled
                  value={user?.universityName || 'BIT Mesra / NIT JSR'}
                  className="w-full p-2 border border-slate-200 bg-slate-100 rounded text-xs text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Methodology & Ground Deployment Plan</label>
              <textarea
                rows={2}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="Field sampling, low-cost prototype fabrication, and localized pilot handover..."
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white font-semibold rounded"
              >
                {submitting ? 'Creating Project...' : 'Confirm Adoption & Initialize Team'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
