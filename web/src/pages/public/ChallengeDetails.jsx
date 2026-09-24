import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { LeafletMap } from '../../components/LeafletMap';
import { Modal } from '../../components/Modal';
import {
  MapPin,
  Users,
  Calendar,
  Sparkles,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Send,
  Layers,
  Info
} from 'lucide-react';

export const ChallengeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);

  // Adoption form
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [projectBudget, setProjectBudget] = useState(150000);
  const [methodology, setMethodology] = useState('');

  // Admin verification form
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyPriority, setVerifyPriority] = useState('HIGH');
  const [adminNotes, setAdminNotes] = useState('');

  // Industry collab form
  const [collabType, setCollabType] = useState('FUNDING');
  const [collabTitle, setCollabTitle] = useState('');
  const [collabOffer, setCollabOffer] = useState('');
  const [collabAmount, setCollabAmount] = useState(100000);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchChallenge = async () => {
    try {
      const res = await api.get(`/challenges/${id}`);
      if (res.success) {
        setChallenge(res.challenge);
        setProjectTitle(`Solution: ${res.challenge.title}`);
        setVerifyPriority(res.challenge.priority || 'HIGH');
      } else {
        setError('Challenge not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const handleAdopt = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/projects/adopt', {
        challengeId: challenge._id,
        title: projectTitle,
        abstract: projectAbstract,
        estimatedBudget: Number(projectBudget),
        methodology,
      });
      if (res.success) {
        setAdoptModalOpen(false);
        fetchChallenge();
      }
    } catch (err) {
      alert(err.message || 'Adoption failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/verify/${challenge._id}`, {
        status: verifyStatus,
        priority: verifyPriority,
        adminNotes,
      });
      if (res.success) {
        setVerifyModalOpen(false);
        fetchChallenge();
      }
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollab = async (e) => {
    e.preventDefault();
    if (!challenge.project) {
      alert('This challenge does not have an active project team yet.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post('/collaborations', {
        projectId: challenge.project._id,
        type: collabType,
        title: collabTitle,
        offerDetails: collabOffer,
        amountOffered: Number(collabAmount),
      });
      if (res.success) {
        alert('Collaboration proposal submitted successfully!');
        setCollabModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Collaboration request failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500">Loading challenge details...</div>;
  }

  if (error || !challenge) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">{error || 'Challenge not found'}</h2>
        <Link to="/explore" className="text-xs text-gov-800 hover:underline">
          Return to Explore Challenges
        </Link>
      </div>
    );
  }

  const ai = challenge.aiAnalysis;
  const project = challenge.project;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to previous page</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Challenge Overview & Photos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gov-800 uppercase tracking-wider">
                  {challenge.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-600">{challenge.district}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PriorityBadge priority={challenge.priority || challenge.urgency} />
                <StatusBadge status={challenge.status} />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {challenge.title}
            </h1>

            {/* Media Gallery / Photo */}
            {challenge.media && challenge.media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={challenge.media[0].url}
                  alt={challenge.title}
                  className="w-full h-64 object-cover"
                />
                {challenge.media[0].caption && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 border-t border-slate-200">
                    {challenge.media[0].caption}
                  </p>
                )}
              </div>
            )}

            {/* Problem Statement */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Problem Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {challenge.description}
              </p>
            </div>

            {/* Metadata Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gov-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Ground Location</p>
                  <p className="text-slate-600">{challenge.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-gov-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Affected Community</p>
                  <p className="text-slate-600">{challenge.affectedPeople}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-gov-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Reported On</p>
                  <p className="text-slate-600">
                    {new Date(challenge.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-gov-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Submitted By</p>
                  <p className="text-slate-600">{challenge.submittedBy?.name || 'Citizen'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Location Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gov-700" />
                <span>Geotagged Problem Location</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {challenge.coordinates?.lat?.toFixed(4)}, {challenge.coordinates?.lng?.toFixed(4)}
              </span>
            </div>
            <LeafletMap
              challenges={[challenge]}
              center={[challenge.coordinates?.lat || 23.3441, challenge.coordinates?.lng || 85.3096]}
              zoom={12}
              height="260px"
            />
          </div>
        </div>

        {/* Right Column: AI Analysis, Adoption Status & Action CTAs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Card based on Role */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Actions & Collaboration</h3>
            
            {/* If Admin: Verify button */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setVerifyModalOpen(true)}
                className="w-full bg-gov-900 hover:bg-gov-800 text-white font-semibold py-2.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify & Triage Challenge (Govt Nodal)</span>
              </button>
            )}

            {/* If Student/University and challenge not yet adopted: Adopt button */}
            {(user?.role === 'student' || user?.role === 'university') && !project && (
              <button
                onClick={() => setAdoptModalOpen(true)}
                className="w-full bg-gov-900 hover:bg-gov-800 text-white font-semibold py-2.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Adopt Challenge for University R&D</span>
              </button>
            )}

            {/* If Industry and Project is active: Offer collaboration */}
            {user?.role === 'industry' && project && (
              <button
                onClick={() => {
                  setCollabTitle(`CSR Funding & Deployment for ${project.title}`);
                  setCollabModalOpen(true);
                }}
                className="w-full bg-gov-900 hover:bg-gov-800 text-white font-semibold py-2.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Offer Industry CSR Support / Funding</span>
              </button>
            )}

            {/* Anonymous or Citizen prompt */}
            {!isAuthenticated && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600">
                <p>
                  Are you a university student, faculty mentor, or CSR foundation?{' '}
                  <Link to="/login" className="text-gov-800 font-semibold underline">
                    Log in
                  </Link>{' '}
                  to adopt this challenge or offer implementation grants.
                </p>
              </div>
            )}
          </div>

          {/* Automated Civic Analysis Panel */}
          {ai && (
            <div className="bg-white text-slate-800 rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gov-900">
                  <Sparkles className="w-3.5 h-3.5 text-gov-800" />
                  <span>Problem Assessment</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-gov-900 border border-blue-200">
                  Severity {ai.severityScore || 6}/10
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ai.structuredSummary}
              </p>

              {ai.recommendedDomains && ai.recommendedDomains.length > 0 && (
                <div className="pt-1 text-xs">
                  <span className="font-semibold text-slate-700">Recommended Domain: </span>
                  <span className="text-slate-600">{ai.recommendedDomains.join(', ')}</span>
                </div>
              )}

              {ai.suggestedUniversities && ai.suggestedUniversities.length > 0 && (
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">Target Institutions: </span>
                  <span className="text-slate-600">{ai.suggestedUniversities.join(' • ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Project Status Panel (if adopted) */}
          {project && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-gov-800" />
                  <span>Active University Project</span>
                </h3>
                <span className="text-xs font-semibold text-gov-800 capitalize">
                  Phase: {project.currentPhase || 'Active'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{project.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{project.abstract}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">Lead University</span>
                  <span className="font-medium text-slate-800 truncate block">
                    {project.university?.name || 'Academic Team'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Phase</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {project.currentPhase?.toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Funded Budget</span>
                  <span className="font-bold text-gov-900">
                    ₹{(project.budgetFunded || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Target Beneficiaries</span>
                  <span className="font-medium text-slate-800">
                    {project.beneficiaryCount || challenge.affectedPeople}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center justify-between p-2.5 bg-blue-50/70 rounded border border-blue-200/60 transition-colors"
                >
                  <span>Open Full Project Workspace & Milestones</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Adopt Challenge */}
      <Modal
        isOpen={adoptModalOpen}
        onClose={() => setAdoptModalOpen(false)}
        title="Adopt Challenge for University R&D Taskforce"
      >
        <form onSubmit={handleAdopt} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Solution Title</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Technical Abstract</label>
            <textarea
              required
              rows={3}
              value={projectAbstract}
              onChange={(e) => setProjectAbstract(e.target.value)}
              placeholder="Outline your team's engineering approach..."
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Budget Requirement (INR)</label>
            <input
              type="number"
              value={projectBudget}
              onChange={(e) => setProjectBudget(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Methodology & Ground Deployment Plan</label>
            <textarea
              rows={2}
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="Step 1 baseline sample, Step 2 prototype, Step 3 village pilot..."
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAdoptModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Initializing Project...' : 'Confirm Adoption & Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Admin Verification */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Admin Triage & Verification Decision"
      >
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Set Lifecycle Status</label>
              <select
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              >
                <option value="VERIFIED">VERIFIED (Publish to state universities)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Request more field data)</option>
                <option value="ASSIGNED">ASSIGNED (Direct assignment to university)</option>
                <option value="RESOLVED">RESOLVED (Issue resolved)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Override</label>
              <select
                value={verifyPriority}
                onChange={(e) => setVerifyPriority(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Administrative Endorsement Notes</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Official instructions for university R&D cells or district magistrates..."
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-gov-700"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setVerifyModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Saving...' : 'Publish Verification Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Industry Collaboration */}
      <Modal
        isOpen={collabModalOpen}
        onClose={() => setCollabModalOpen(false)}
        title="Submit Industry / CSR Collaboration Proposal"
      >
        <form onSubmit={handleCollab} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Collaboration Type</label>
              <select
                value={collabType}
                onChange={(e) => setCollabType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              >
                <option value="FUNDING">Financial Grant / CSR Funding</option>
                <option value="EQUIPMENT">Equipment & Lab Machinery</option>
                <option value="MENTORSHIP">Technical Industry Mentorship</option>
                <option value="PILOT_DEPLOYMENT">Field Pilot Deployment Site</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grant Offer Amount (INR)</label>
              <input
                type="number"
                value={collabAmount}
                onChange={(e) => setCollabAmount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Proposal Subject</label>
            <input
              type="text"
              required
              value={collabTitle}
              onChange={(e) => setCollabTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Offer Details & Resources Provided</label>
            <textarea
              required
              rows={3}
              value={collabOffer}
              onChange={(e) => setCollabOffer(e.target.value)}
              placeholder="Specify testing facility access, raw material supply, or funding disbursement schedule..."
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCollabModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Submitting...' : 'Dispatch Partnership Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
