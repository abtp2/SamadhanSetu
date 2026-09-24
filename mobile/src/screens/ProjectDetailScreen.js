import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { mobileApi } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { SelectDropdown } from '../components/SelectDropdown';
import { Ionicons } from '@expo/vector-icons';

export const ProjectDetailScreen = ({ route, navigation }) => {
  const { id, project: initialProject } = route.params || {};
  const { user } = useAuth();

  const [project, setProject] = useState(initialProject || null);
  const [team, setTeam] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(!initialProject);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Form states
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRole, setStudentRole] = useState('Hardware & IoT Engineer');

  // Industry Collab form
  const [collabType, setCollabType] = useState('CSR_GRANT');
  const [collabTitle, setCollabTitle] = useState('');
  const [collabOffer, setCollabOffer] = useState('');
  const [collabAmount, setCollabAmount] = useState('150000');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      const [projRes, collabRes] = await Promise.all([
        mobileApi.get(`/projects/${id}`),
        mobileApi.get(`/collaborations/project/${id}`),
      ]);

      if (projRes && projRes.success) {
        setProject(projRes.project);
        setTeam(projRes.team || null);
        setMilestones(projRes.milestones || []);
      }
      if (collabRes && collabRes.success) {
        setCollaborations(collabRes.collaborations || []);
      }
    } catch (err) {
      console.warn('Fetch project workspace error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjectData();
    setRefreshing(false);
  };

  const handleAddMilestone = async () => {
    if (!milestoneTitle.trim() || !milestoneDesc.trim()) {
      Alert.alert('Missing Fields', 'Please enter milestone title and description.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await mobileApi.post(`/projects/${id}/milestones`, {
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim(),
      });
      if (res.success) {
        setMilestoneModalOpen(false);
        setMilestoneTitle('');
        setMilestoneDesc('');
        fetchProjectData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!activeMilestone) return;
    setActionLoading(true);
    try {
      const res = await mobileApi.patch(
        `/projects/${id}/milestones/${activeMilestone._id}/submit`,
        {
          proofUrl: proofUrl.trim() || 'https://samadhansetu.gov.in/docs/lab-test-report.pdf',
          proofTitle: 'Verification Lab Test Report',
          notes: proofNotes.trim() || 'Prototype lab validation completed.',
        }
      );
      if (res.success) {
        setProofModalOpen(false);
        setActiveMilestone(null);
        setProofUrl('');
        setProofNotes('');
        fetchProjectData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit milestone proof');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyMilestone = (milestoneId) => {
    Alert.alert(
      'Verify Milestone',
      'Confirm academic verification of this milestone? This advances the project phase.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify Milestone',
          onPress: async () => {
            try {
              const res = await mobileApi.patch(
                `/projects/${id}/milestones/${milestoneId}/verify`,
                {
                  status: 'VERIFIED',
                  notes: 'Verified by Academic Faculty Mentor & State Nodal Officer.',
                }
              );
              if (res.success) fetchProjectData();
            } catch (err) {
              Alert.alert('Error', err.message || 'Verification failed');
            }
          },
        },
      ]
    );
  };

  const handleAddMember = async () => {
    if (!studentEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter the student email address.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await mobileApi.post(`/projects/${id}/team-members`, {
        studentEmail: studentEmail.trim(),
        roleInTeam: studentRole.trim() || 'Research Member',
      });
      if (res.success) {
        setMemberModalOpen(false);
        setStudentEmail('');
        fetchProjectData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add student member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollabStatus = async (collabId, status) => {
    try {
      const res = await mobileApi.patch(`/collaborations/${collabId}/status`, {
        status,
        responseNotes:
          status === 'ACCEPTED'
            ? 'Accepted by University PI and Student Lead.'
            : 'Declined.',
      });
      if (res.success) {
        fetchProjectData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update collaboration');
    }
  };

  const handleSendCollab = async () => {
    if (!collabTitle.trim() || !collabOffer.trim()) {
      Alert.alert('Missing Fields', 'Please enter proposal subject and scope details.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await mobileApi.post('/collaborations', {
        projectId: id,
        type: collabType,
        title: collabTitle.trim(),
        offerDetails: collabOffer.trim(),
        amountOffered: Number(collabAmount) || 0,
      });
      if (res.success) {
        setCollabModalOpen(false);
        Alert.alert('Success', 'CSR partnership proposal dispatched to university team!');
        fetchProjectData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit collaboration');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f2c59" />
      </View>
    );
  }

  const isTeamOrAdmin = ['student', 'university', 'admin'].includes(user?.role);
  const isMentorOrAdmin = ['university', 'admin'].includes(user?.role);
  const isIndustryOrAdmin = ['industry', 'admin'].includes(user?.role);

  const verifiedCount = milestones.filter((m) => m.status === 'VERIFIED').length;
  const projectMetrics = [
    {
      title: 'EST. BUDGET',
      value: `₹${(project.budgetEstimated || 0).toLocaleString('en-IN')}`,
      sub: 'Project requirement',
      icon: 'calculator-outline',
    },
    {
      title: 'CSR FUNDED',
      value: `₹${(project.budgetFunded || 0).toLocaleString('en-IN')}`,
      sub: 'Grants committed',
      icon: 'ribbon-outline',
    },
    {
      title: 'MILESTONES',
      value: `${verifiedCount}/${milestones.length}`,
      sub: 'Verified stages',
      icon: 'checkmark-done-outline',
    },
    {
      title: 'CURRENT PHASE',
      value: project.currentPhase || 'IDEATION',
      sub: `Status: ${project.status || 'ACTIVE'}`,
      icon: 'layers-outline',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Top Project Banner Card */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerTopRow}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrowText}>
              {project.university?.name || 'UNIVERSITY R&D'}
            </Text>
            <Text style={styles.eyebrowDot}>•</Text>
            <Text style={styles.eyebrowSub}>
              {project.challenge?.district || 'Jharkhand'}
            </Text>
          </View>
          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>Phase: {project.currentPhase}</Text>
          </View>
        </View>

        <Text style={styles.projectTitle}>{project.title}</Text>
        <Text style={styles.projectAbstract}>{project.abstract}</Text>

        {project.challenge && (
          <TouchableOpacity
            style={styles.linkedChallengeBox}
            onPress={() =>
              navigation.navigate('ChallengeDetail', {
                id: project.challenge._id,
                challenge: project.challenge,
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.linkedLabel}>ADDRESSING CITIZEN CHALLENGE</Text>
              <Text style={styles.linkedTitle} numberOfLines={1}>
                {project.challenge.title}
              </Text>
            </View>
            <Text style={styles.linkedLink}>View Challenge →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Unified 4-Card Project Metrics */}
      <View style={styles.metricsGrid}>
        {projectMetrics.map((m) => (
          <View key={m.title} style={styles.metricCard}>
            <View style={styles.metricTopRow}>
              <View style={styles.metricIconBox}>
                <Ionicons name={m.icon} size={17} color="#0f2c59" />
              </View>
              <Text style={styles.metricTitle} numberOfLines={1}>
                {m.title}
              </Text>
            </View>
            <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
              {m.value}
            </Text>
            <Text style={styles.metricSub} numberOfLines={1}>
              {m.sub}
            </Text>
          </View>
        ))}
      </View>

      {/* 3. Engineering Milestones & Verification Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              ENGINEERING MILESTONES ({milestones.length})
            </Text>
            <Text style={styles.sectionSub}>
              Stage-by-stage prototype development and faculty verification
            </Text>
          </View>
          {isTeamOrAdmin && (
            <TouchableOpacity
              style={styles.primarySmallBtn}
              onPress={() => setMilestoneModalOpen(true)}
            >
              <Ionicons name="add" size={14} color="#ffffff" />
              <Text style={styles.primarySmallBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {milestones.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No engineering milestones added yet.</Text>
          </View>
        ) : (
          <View>
            {milestones.map((m, idx) => (
              <View
                key={m._id || idx}
                style={[
                  styles.listRow,
                  idx < milestones.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle}>
                    {idx + 1}. {m.title}
                  </Text>
                  <View
                    style={[
                      styles.statusTag,
                      m.status === 'VERIFIED'
                        ? styles.statusVerified
                        : m.status === 'SUBMITTED'
                        ? styles.statusSubmitted
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        m.status === 'VERIFIED'
                          ? { color: '#047857' }
                          : m.status === 'SUBMITTED'
                          ? { color: '#1d4ed8' }
                          : { color: '#b45309' },
                      ]}
                    >
                      {m.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.rowDesc}>{m.description}</Text>

                {m.proofNotes ? (
                  <Text style={styles.proofNoteText}>Proof Notes: {m.proofNotes}</Text>
                ) : null}

                {isTeamOrAdmin && m.status !== 'VERIFIED' && (
                  <View style={styles.rowActions}>
                    {m.status === 'PENDING' && (
                      <TouchableOpacity
                        style={styles.secondarySmallBtn}
                        onPress={() => {
                          setActiveMilestone(m);
                          setProofModalOpen(true);
                        }}
                      >
                        <Text style={styles.secondarySmallBtnText}>Submit Lab Proof</Text>
                      </TouchableOpacity>
                    )}
                    {isMentorOrAdmin && (
                      <TouchableOpacity
                        style={styles.primarySmallBtn}
                        onPress={() => handleVerifyMilestone(m._id)}
                      >
                        <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
                        <Text style={styles.primarySmallBtnText}>Verify Milestone</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 4. Industry & CSR Collaboration Proposals */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              CSR & INDUSTRY COLLABORATIONS ({collaborations.length})
            </Text>
            <Text style={styles.sectionSub}>
              Corporate funding grants, lab equipment, and pilot support
            </Text>
          </View>
          {isIndustryOrAdmin && (
            <TouchableOpacity
              style={styles.primarySmallBtn}
              onPress={() => {
                setCollabTitle(`CSR Sponsorship for ${project.title}`);
                setCollabOffer(
                  'Providing prototype development funding and technical mentorship.'
                );
                setCollabModalOpen(true);
              }}
            >
              <Ionicons name="add" size={14} color="#ffffff" />
              <Text style={styles.primarySmallBtnText}>Offer CSR</Text>
            </TouchableOpacity>
          )}
        </View>

        {collaborations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No CSR collaboration proposals submitted for this project yet.
            </Text>
          </View>
        ) : (
          <View>
            {collaborations.map((c, idx) => (
              <View
                key={c._id || idx}
                style={[
                  styles.listRow,
                  idx < collaborations.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle}>{c.title}</Text>
                  <Text style={styles.grantAmountText}>
                    ₹{(c.amountOffered || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <Text style={styles.partnerOrgText}>
                  Partner: {c.organization?.name || c.offeredBy?.organizationName || 'CSR Partner'}{' '}
                  • {c.type}
                </Text>
                <Text style={styles.rowDesc}>{c.offerDetails}</Text>

                <View style={styles.collabBottomRow}>
                  <View
                    style={[
                      styles.statusTag,
                      c.status === 'ACCEPTED' ? styles.statusVerified : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        c.status === 'ACCEPTED' ? { color: '#047857' } : { color: '#b45309' },
                      ]}
                    >
                      {c.status}
                    </Text>
                  </View>

                  {isTeamOrAdmin && c.status === 'PENDING' && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.primarySmallBtn}
                        onPress={() => handleCollabStatus(c._id, 'ACCEPTED')}
                      >
                        <Text style={styles.primarySmallBtnText}>Accept Grant</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.secondarySmallBtn}
                        onPress={() => handleCollabStatus(c._id, 'DECLINED')}
                      >
                        <Text style={styles.secondarySmallBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 5. Taskforce & Faculty Mentor Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>UNIVERSITY TASKFORCE & MENTOR</Text>
            <Text style={styles.sectionSub}>
              Academic investigators and student engineering team
            </Text>
          </View>
          {isTeamOrAdmin && (
            <TouchableOpacity
              style={styles.secondarySmallBtn}
              onPress={() => setMemberModalOpen(true)}
            >
              <Text style={styles.secondarySmallBtnText}>+ Add Student</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ padding: 14, gap: 10 }}>
          <View style={styles.memberCard}>
            <View style={styles.metricIconBox}>
              <Ionicons name="school-outline" size={17} color="#0f2c59" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberRoleTag}>FACULTY MENTOR / PI</Text>
              <Text style={styles.memberName}>
                {project.mentor?.name || team?.mentor?.name || 'Faculty Coordinator'}
              </Text>
              <Text style={styles.memberEmail}>
                {project.mentor?.email || project.university?.name || 'Accredited Institution'}
              </Text>
            </View>
          </View>

          {team?.members?.map((mem, idx) => (
            <View key={idx} style={styles.memberCard}>
              <View style={styles.metricIconBox}>
                <Ionicons name="person-outline" size={16} color="#0f2c59" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberRoleTag}>{mem.roleInTeam || 'STUDENT ENGINEER'}</Text>
                <Text style={styles.memberName}>{mem.user?.name || 'Student Innovator'}</Text>
                <Text style={styles.memberEmail}>{mem.user?.email || ''}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Modal 1: Add Milestone */}
      <Modal visible={milestoneModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Engineering Milestone</Text>
            <Text style={styles.inputLabel}>Milestone Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lab Water Filtration Prototype Assembly"
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
            />
            <Text style={styles.inputLabel}>Deliverables & Technical Scope *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="Specify testing criteria and field validation metrics..."
              value={milestoneDesc}
              onChangeText={setMilestoneDesc}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondarySmallBtn}
                onPress={() => setMilestoneModalOpen(false)}
              >
                <Text style={styles.secondarySmallBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primarySmallBtn}
                onPress={handleAddMilestone}
                disabled={actionLoading}
              >
                <Text style={styles.primarySmallBtnText}>
                  {actionLoading ? 'Saving...' : 'Create Milestone'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Submit Milestone Proof */}
      <Modal visible={proofModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Milestone Proof</Text>
            <Text style={styles.inputLabel}>Proof Document / Report URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://samadhansetu.gov.in/docs/test-report.pdf"
              value={proofUrl}
              onChangeText={setProofUrl}
            />
            <Text style={styles.inputLabel}>Lab Observations & Field Notes *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="Summarize prototype test results..."
              value={proofNotes}
              onChangeText={setProofNotes}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondarySmallBtn}
                onPress={() => setProofModalOpen(false)}
              >
                <Text style={styles.secondarySmallBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primarySmallBtn}
                onPress={handleSubmitProof}
                disabled={actionLoading}
              >
                <Text style={styles.primarySmallBtnText}>
                  {actionLoading ? 'Submitting...' : 'Submit Proof'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Add Student Team Member */}
      <Modal visible={memberModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Student Taskforce Member</Text>
            <Text style={styles.inputLabel}>Student Registered Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. aarav@bitmesra.ac.in"
              autoCapitalize="none"
              keyboardType="email-address"
              value={studentEmail}
              onChangeText={setStudentEmail}
            />
            <Text style={styles.inputLabel}>Role in Project Team *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hardware & IoT Lead"
              value={studentRole}
              onChangeText={setStudentRole}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondarySmallBtn}
                onPress={() => setMemberModalOpen(false)}
              >
                <Text style={styles.secondarySmallBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primarySmallBtn}
                onPress={handleAddMember}
                disabled={actionLoading}
              >
                <Text style={styles.primarySmallBtnText}>
                  {actionLoading ? 'Adding...' : 'Add Member'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Offer CSR Collaboration */}
      <Modal visible={collabModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Offer CSR Partnership & Grant</Text>
            <SelectDropdown
              label="Partnership Type"
              value={collabType}
              options={[
                { label: 'CSR Financial Grant', value: 'CSR_GRANT' },
                { label: 'Equipment / Lab Material', value: 'EQUIPMENT' },
                { label: 'Technical Mentorship', value: 'MENTORSHIP' },
                { label: 'Site Pilot Deployment', value: 'PILOT_DEPLOYMENT' },
              ]}
              onSelect={setCollabType}
              searchable={false}
            />
            <Text style={styles.inputLabel}>Committed Grant Amount (INR)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={collabAmount}
              onChangeText={setCollabAmount}
            />
            <Text style={styles.inputLabel}>Proposal Title *</Text>
            <TextInput
              style={styles.input}
              value={collabTitle}
              onChangeText={setCollabTitle}
            />
            <Text style={styles.inputLabel}>Partnership Scope & Details *</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              multiline
              value={collabOffer}
              onChangeText={setCollabOffer}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondarySmallBtn}
                onPress={() => setCollabModalOpen(false)}
              >
                <Text style={styles.secondarySmallBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primarySmallBtn}
                onPress={handleSendCollab}
                disabled={actionLoading}
              >
                <Text style={styles.primarySmallBtnText}>
                  {actionLoading ? 'Sending...' : 'Send Offer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
  },
  eyebrowDot: {
    color: '#cbd5e1',
  },
  eyebrowSub: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
  },
  phasePill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f2c59',
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 23,
  },
  projectAbstract: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 6,
  },
  linkedChallengeBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  linkedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f2c59',
    letterSpacing: 0.4,
  },
  linkedTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 1,
  },
  linkedLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 4,
  },
  metricIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTitle: {
    flex: 1,
    textAlign: 'right',
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f2c59',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11.5,
    color: '#64748b',
  },
  listRow: {
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  rowDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 4,
  },
  proofNoteText: {
    fontSize: 10.5,
    color: '#0f2c59',
    backgroundColor: '#eff6ff',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  statusVerified: {
    backgroundColor: '#ecfdf5',
  },
  statusSubmitted: {
    backgroundColor: '#eff6ff',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  primarySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f2c59',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  primarySmallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  secondarySmallBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  secondarySmallBtnText: {
    color: '#0f2c59',
    fontSize: 11,
    fontWeight: '700',
  },
  grantAmountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  partnerOrgText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0f2c59',
    marginTop: 2,
  },
  collabBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  memberRoleTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0f2c59',
    letterSpacing: 0.4,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  memberEmail: {
    fontSize: 10.5,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f2c59',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
});
