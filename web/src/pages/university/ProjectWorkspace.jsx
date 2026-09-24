import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import {
  FolderGit2,
  Users2,
  CheckCircle2,
  Clock,
  Building2,
  GraduationCap,
  Plus,
  Send,
  ShieldCheck,
  FileCheck,
  ArrowLeft,
  Handshake,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Form states
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRole, setStudentRole] = useState('Hardware Engineer');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [projRes, collabRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/collaborations/project/${id}`),
      ]);

      if (projRes.success) {
        setProject(projRes.project);
        setTeam(projRes.team);
        setMilestones(projRes.milestones || []);
      }
      if (collabRes.success) {
        setCollaborations(collabRes.collaborations || []);
      }
    } catch (err) {
      console.error('Fetch project error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post(`/projects/${id}/milestones`, {
        title: milestoneTitle,
        description: milestoneDesc,
      });
      if (res.success) {
        setMilestoneModalOpen(false);
        setMilestoneTitle('');
        setMilestoneDesc('');
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/projects/${id}/milestones/${activeMilestone._id}/submit`, {
        proofUrl: proofUrl || 'https://samadhansetu.gov.in/docs/test-report.pdf',
        proofTitle: 'Verification Lab Test Report',
        notes: proofNotes,
      });
      if (res.success) {
        setProofModalOpen(false);
        setActiveMilestone(null);
        setProofUrl('');
        setProofNotes('');
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit proof');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyMilestone = async (milestoneId) => {
    if (!window.confirm('Confirm verification of this milestone? This will advance the project progress percentage.')) return;
    try {
      const res = await api.patch(`/projects/${id}/milestones/${milestoneId}/verify`, {
        status: 'VERIFIED',
        notes: 'Verified by Academic Faculty Mentor & State Nodal Officer.',
      });
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post(`/projects/${id}/team-members`, {
        studentEmail,
        roleInTeam: studentRole,
      });
      if (res.success) {
        setMemberModalOpen(false);
        setStudentEmail('');
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add student member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollabStatus = async (collabId, status) => {
    try {
      const res = await api.patch(`/collaborations/${collabId}/status`, {
        status,
        responseNotes: status === 'ACCEPTED' ? 'Accepted by University PI and Student Lead.' : 'Declined.',
      });
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update collaboration');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-base font-bold text-slate-800">Project Not Found</h2>
        <Link to="/university/dashboard" className="text-xs text-gov-800 hover:underline">
          Return to University Dashboard
        </Link>
      </div>
    );
  }

  const isMentorOrAdmin = user?.role === 'university' || user?.role === 'admin';

  return (
    <div className="space-y-6">
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

      {/* Project Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-gov-800 uppercase tracking-wider">
              {project.university?.name || 'Lead University'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">District: {project.challenge?.district || 'Jharkhand'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Phase: {project.currentPhase}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Status: {project.status}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{project.abstract}</p>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">Project Implementation Phase:</span>
            <span className="font-bold text-gov-800 capitalize">{project.currentPhase || 'Active'}</span>
          </div>
        </div>

        {/* Linked Challenge Snippet */}
        {project.challenge && (
          <div className="p-3 bg-gov-50/60 rounded border border-gov-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gov-900">Addressing Citizen Challenge:</span>
              <span className="text-slate-700">{project.challenge.title}</span>
            </div>
            <Link
              to={`/challenges/${project.challenge._id}`}
              className="font-semibold text-gov-800 hover:text-gov-900 underline"
            >
              View Original Challenge Report →
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Row: Budget & Beneficiaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Budget</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            ₹{(project.budgetEstimated || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">Total project expenditure</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Funded by CSR</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            ₹{(project.budgetFunded || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">Active industry grants</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <span className="text-xs font-semibold text-indigo-600 uppercase">Target Beneficiaries</span>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {project.beneficiaryCount || project.challenge?.affectedPeople || '3,500+'}
          </p>
          <p className="text-[11px] text-slate-400">Rural/urban population</p>
        </div>
      </div>

      {/* Team & Milestones 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Milestones (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-gov-800" />
                <span>Implementation Milestones Roadmap ({milestones.length})</span>
              </h2>
              <p className="text-[11px] text-slate-500">Track and verify deliverable phases.</p>
            </div>

            <button
              onClick={() => setMilestoneModalOpen(true)}
              className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">No milestones registered yet.</p>
            ) : (
              milestones.map((m) => (
                <div
                  key={m._id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2 bg-slate-50/50 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="font-mono font-bold text-slate-500">Step {m.order}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">
                          Target: {new Date(m.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 mt-0.5">{m.title}</h4>
                      {m.description && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{m.description}</p>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase shrink-0 border ${
                        m.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : m.status === 'SUBMITTED'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : m.status === 'IN_PROGRESS'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {m.verificationNotes && (
                    <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-600 italic">
                      "{m.verificationNotes}"
                    </div>
                  )}

                  {/* Action buttons for Milestone */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    {/* Submit Proof (for student/lead) */}
                    {m.status !== 'VERIFIED' && (
                      <button
                        onClick={() => {
                          setActiveMilestone(m);
                          setProofModalOpen(true);
                        }}
                        className="text-gov-800 hover:text-gov-900 font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Deliverable Proof</span>
                      </button>
                    )}

                    {/* Faculty / Admin Verify Button */}
                    {isMentorOrAdmin && m.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleVerifyMilestone(m._id)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 shadow-xs ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Approve Milestone</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Team Management & CSR Offers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Team Roster Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-gov-800" />
                <span>Taskforce Team Members</span>
              </h3>
              <button
                onClick={() => setMemberModalOpen(true)}
                className="text-gov-800 hover:text-gov-900 text-xs font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Leader */}
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{project.teamLeader?.name || 'Student Lead'}</p>
                  <p className="text-[11px] text-slate-500">{project.teamLeader?.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gov-100 text-gov-800 px-1.5 py-0.5 rounded">
                  Team Leader
                </span>
              </div>

              {/* Mentor */}
              {project.facultyMentor && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{project.facultyMentor.name}</p>
                    <p className="text-[11px] text-slate-500">{project.facultyMentor.email}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                    Faculty Mentor
                  </span>
                </div>
              )}

              {/* Student members */}
              {team?.studentMembers && team.studentMembers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Student Contributors:</span>
                  {team.studentMembers.map((m, idx) => (
                    <div key={idx} className="p-2 rounded border border-slate-100 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{m.user?.name || 'Student Member'}</span>
                      <span className="text-[11px] text-slate-500">{m.roleInTeam}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Industry & CSR Collaboration Requests */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="w-4 h-4 text-emerald-700" />
                <span>Industry & CSR Offers ({collaborations.length})</span>
              </h3>
            </div>

            {collaborations.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500">
                No industry collaboration offers yet. Verified projects appear in the Industry CSR portal.
              </p>
            ) : (
              <div className="space-y-3">
                {collaborations.map((collab) => (
                  <div
                    key={collab._id}
                    className="p-3 rounded border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-gov-800">{collab.organization?.name || 'CSR Partner'}</span>
                        <h4 className="font-semibold text-slate-900 mt-0.5">{collab.title}</h4>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          collab.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {collab.status}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">{collab.offerDetails}</p>

                    {collab.amountOffered > 0 && (
                      <p className="font-semibold text-emerald-700">
                        Offered Grant: ₹{collab.amountOffered.toLocaleString('en-IN')}
                      </p>
                    )}

                    {collab.status === 'PENDING' && (
                      <div className="flex justify-end space-x-2 pt-1 border-t border-slate-200">
                        <button
                          onClick={() => handleCollabStatus(collab._id, 'DECLINED')}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleCollabStatus(collab._id, 'ACCEPTED')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-2xs"
                        >
                          Accept Partnership
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Milestone */}
      <Modal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        title="Add Implementation Milestone"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Milestone Deliverable Title</label>
            <input
              type="text"
              required
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g., Milestone 4: Village Pilot Commissioning & User Training"
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description of Deliverable</label>
            <textarea
              rows={3}
              value={milestoneDesc}
              onChange={(e) => setMilestoneDesc(e.target.value)}
              placeholder="Specify the testing benchmarks, chemical thresholds, or software modules expected..."
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setMilestoneModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Saving...' : 'Register Milestone'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Submit Proof */}
      <Modal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="Submit Milestone Deliverable Proof"
      >
        <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Milestone Name</label>
            <input
              type="text"
              disabled
              value={activeMilestone?.title || ''}
              className="w-full p-2 border border-slate-200 bg-slate-100 rounded text-xs text-slate-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Deliverable Document / Report URL
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Executive Summary of Results</label>
            <textarea
              required
              rows={3}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder="Provide field testing numbers, test dates, lab verification data..."
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setProofModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Submitting...' : 'Submit for Faculty & Admin Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Student Member */}
      <Modal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="Add Student Member to Taskforce"
      >
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student Registered Email</label>
            <input
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="priyanka.h@iitism.ac.in"
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role in Innovation Team</label>
            <input
              type="text"
              value={studentRole}
              onChange={(e) => setStudentRole(e.target.value)}
              placeholder="e.g., Firmware Engineer / Data Analyst"
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setMemberModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 bg-gov-900 hover:bg-gov-800 text-white rounded font-semibold"
            >
              {actionLoading ? 'Adding...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
