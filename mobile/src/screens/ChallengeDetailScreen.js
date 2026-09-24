import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { mobileApi } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SelectDropdown } from '../components/SelectDropdown';
import { LeafletWebViewMap } from '../components/LeafletWebViewMap';
import { Ionicons } from '@expo/vector-icons';

export const ChallengeDetailScreen = ({ route, navigation }) => {
  const { id, challenge: initialData } = route.params || {};
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Adoption form
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [projectBudget, setProjectBudget] = useState('150000');
  const [methodology, setMethodology] = useState('');

  // Admin verification form
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyPriority, setVerifyPriority] = useState('HIGH');
  const [adminNotes, setAdminNotes] = useState('');

  // Industry collab form
  const [collabType, setCollabType] = useState('CSR_GRANT');
  const [collabTitle, setCollabTitle] = useState('');
  const [collabOffer, setCollabOffer] = useState('');
  const [collabAmount, setCollabAmount] = useState('150000');

  const fetchDetails = async () => {
    const targetId = id || initialData?._id;
    if (!targetId) return;
    try {
      const res = await mobileApi.get(`/challenges/${targetId}`);
      if (res.success && res.challenge) {
        setChallenge(res.challenge);
        setProjectTitle(`Engineering Solution: ${res.challenge.title}`);
        setProjectAbstract(
          `Field-ready engineering prototype to resolve ${res.challenge.title} in ${res.challenge.district}.`
        );
        setVerifyStatus(res.challenge.status || 'VERIFIED');
        setVerifyPriority(res.challenge.priority || res.challenge.urgency || 'HIGH');
      }
    } catch (_) {
      // Keep initialData if offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetails();
    setRefreshing(false);
  };

  const handleAdopt = async () => {
    if (!projectTitle.trim() || !projectAbstract.trim()) {
      Alert.alert('Missing Fields', 'Please enter project title and technical abstract.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await mobileApi.post('/projects/adopt', {
        challengeId: challenge._id,
        title: projectTitle.trim(),
        abstract: projectAbstract.trim(),
        estimatedBudget: Number(projectBudget) || 150000,
        methodology: methodology.trim() || 'Field survey, lab prototyping, and pilot testing.',
      });
      if (res.success) {
        setAdoptModalOpen(false);
        Alert.alert('Challenge Adopted!', 'Your university project workspace is now live.');
        fetchDetails();
      }
    } catch (err) {
      Alert.alert('Adoption Failed', err.message || 'Could not adopt challenge.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      const res = await mobileApi.patch(`/challenges/${challenge._id}/status`, {
        status: verifyStatus,
        priority: verifyPriority,
        note: adminNotes.trim() || `Status updated to ${verifyStatus} by Nodal Admin.`,
      });
      if (res.success) {
        setVerifyModalOpen(false);
        Alert.alert('Updated', 'Challenge verification status updated.');
        fetchDetails();
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update challenge status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCollab = async () => {
    if (!challenge.project?._id) return;
    if (!collabTitle.trim() || !collabOffer.trim()) {
      Alert.alert('Missing Fields', 'Please enter proposal subject and details.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await mobileApi.post('/collaborations', {
        projectId: challenge.project._id,
        type: collabType,
        title: collabTitle.trim(),
        offerDetails: collabOffer.trim(),
        amountOffered: Number(collabAmount) || 100000,
      });
      if (res.success) {
        setCollabModalOpen(false);
        Alert.alert('Proposal Sent!', 'Your CSR collaboration offer was sent to the university team.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit collaboration.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !challenge) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0f2c59" />
      </View>
    );
  }

  const ai = challenge.aiAnalysis;
  const project = challenge.project;
  const coords = challenge.coordinates || { lat: 23.3441, lng: 85.3096 };
  const canAdopt =
    ['student', 'university', 'admin'].includes(user?.role) && !project;
  const canVerify = user?.role === 'admin';
  const canSponsor =
    ['industry', 'admin'].includes(user?.role) && !!project;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Primary Challenge Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderBar}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{challenge.category}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.districtText}>{challenge.district}</Text>
          </View>
          <View style={styles.badgeRow}>
            <PriorityBadge priority={challenge.priority || challenge.urgency} />
            <StatusBadge status={challenge.status} />
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.title}>{challenge.title}</Text>

          {challenge.media && challenge.media[0]?.url ? (
            <Image
              source={{ uri: challenge.media[0].url }}
              style={styles.heroImg}
              resizeMode="cover"
            />
          ) : null}

          <Text style={styles.sectionHeading}>PROBLEM DESCRIPTION</Text>
          <Text style={styles.description}>{challenge.description}</Text>

          {/* Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconBox}>
                <Ionicons name="location-outline" size={16} color="#0f2c59" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Ground Location</Text>
                <Text style={styles.metaValue}>
                  {challenge.location || `${challenge.district}, Jharkhand`}
                </Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <View style={styles.metaIconBox}>
                <Ionicons name="people-outline" size={16} color="#0f2c59" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Affected Community</Text>
                <Text style={styles.metaValue}>
                  {challenge.affectedPeople || 'Community Residents'}
                </Text>
              </View>
            </View>
          </View>

          {/* Role Action Bar */}
          {(canAdopt || canVerify || canSponsor) && (
            <View style={styles.actionRow}>
              {canAdopt && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setAdoptModalOpen(true)}
                >
                  <Ionicons name="school-outline" size={15} color="#ffffff" />
                  <Text style={styles.primaryActionBtnText}>Adopt as University Project</Text>
                </TouchableOpacity>
              )}

              {canVerify && (
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => setVerifyModalOpen(true)}
                >
                  <Ionicons name="shield-checkmark-outline" size={15} color="#0f2c59" />
                  <Text style={styles.secondaryActionBtnText}>Manage Status</Text>
                </TouchableOpacity>
              )}

              {canSponsor && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    setCollabTitle(`CSR Sponsorship for ${project.title}`);
                    setCollabOffer(
                      'Providing prototype development grant and field deployment mentorship.'
                    );
                    setCollabModalOpen(true);
                  }}
                >
                  <Ionicons name="business-outline" size={15} color="#ffffff" />
                  <Text style={styles.primaryActionBtnText}>Offer CSR Grant</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 2. Adopted University Project Card */}
      {project && (
        <View style={styles.card}>
          <View style={styles.cardHeaderBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="school" size={15} color="#0f2c59" />
              <Text style={styles.cardHeaderTitle}>ADOPTED UNIVERSITY R&D PROJECT</Text>
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>
                Phase: {project.currentPhase || 'ACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            {project.abstract ? (
              <Text style={styles.projectAbstract}>{project.abstract}</Text>
            ) : null}

            <View style={styles.projectActionFooter}>
              <Text style={styles.projectMetaText}>
                Budget: ₹{(project.budgetEstimated || 150000).toLocaleString('en-IN')}
              </Text>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() =>
                  navigation.navigate('ProjectDetail', {
                    id: project._id,
                    project,
                  })
                }
              >
                <Text style={styles.primaryActionBtnText}>Open Project Workspace →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 3. Automated Civic Analysis Card */}
      {ai && (
        <View style={styles.card}>
          <View style={styles.cardHeaderBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={15} color="#0f2c59" />
              <Text style={styles.cardHeaderTitle}>AUTOMATED CIVIC TRIAGE</Text>
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseBadgeText}>
                Severity: {ai.severityScore || 7}/10
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.description}>{ai.structuredSummary}</Text>

            {ai.recommendedDomains && ai.recommendedDomains.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.metaLabel}>Recommended Engineering Domains</Text>
                <View style={styles.tagWrap}>
                  {ai.recommendedDomains.map((dom, i) => (
                    <View key={i} style={styles.domainPill}>
                      <Text style={styles.domainPillText}>{dom}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {ai.suggestedUniversities && ai.suggestedUniversities.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.metaLabel}>Suggested Academic Institutions</Text>
                <Text style={styles.metaValue}>
                  {ai.suggestedUniversities.join(' • ')}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 4. Geotagged Map Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="map-outline" size={15} color="#0f2c59" />
            <Text style={styles.cardHeaderTitle}>GEOTAGGED PROBLEM LOCATION</Text>
          </View>
          <Text style={styles.coordsText}>
            {coords.lat?.toFixed(4)}°, {coords.lng?.toFixed(4)}°
          </Text>
        </View>
        <View style={{ padding: 12 }}>
          <LeafletWebViewMap
            challenges={[challenge]}
            center={coords}
            zoom={11}
            height={200}
          />
        </View>
      </View>

      {/* Modal 1: Adopt Challenge as University Project */}
      <Modal visible={adoptModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adopt Challenge for University R&D</Text>
            <Text style={styles.inputLabel}>Proposed Project Title *</Text>
            <TextInput
              style={styles.input}
              value={projectTitle}
              onChangeText={setProjectTitle}
            />
            <Text style={styles.inputLabel}>Technical Abstract & Approach *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              value={projectAbstract}
              onChangeText={setProjectAbstract}
            />
            <Text style={styles.inputLabel}>Estimated Prototype Budget (INR) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={projectBudget}
              onChangeText={setProjectBudget}
            />
            <Text style={styles.inputLabel}>Engineering Methodology</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lab testing, IoT sensor calibration, field pilot"
              value={methodology}
              onChangeText={setMethodology}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => setAdoptModalOpen(false)}
              >
                <Text style={styles.secondaryActionBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleAdopt}
                disabled={actionLoading}
              >
                <Text style={styles.primaryActionBtnText}>
                  {actionLoading ? 'Submitting...' : 'Confirm Adoption'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Admin Verification & Status Update */}
      <Modal visible={verifyModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Challenge Status & Priority</Text>
            <SelectDropdown
              label="Lifecycle Status"
              value={verifyStatus}
              options={[
                'SUBMITTED',
                'UNDER_REVIEW',
                'VERIFIED',
                'ASSIGNED',
                'IN_PROGRESS',
                'PILOTING',
                'RESOLVED',
              ]}
              onSelect={setVerifyStatus}
              searchable={false}
            />
            <SelectDropdown
              label="Priority Level"
              value={verifyPriority}
              options={['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']}
              onSelect={setVerifyPriority}
              searchable={false}
            />
            <Text style={styles.inputLabel}>Official Nodal Remarks</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              multiline
              placeholder="Add verification notes for university teams..."
              value={adminNotes}
              onChangeText={setAdminNotes}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => setVerifyModalOpen(false)}
              >
                <Text style={styles.secondaryActionBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleVerify}
                disabled={actionLoading}
              >
                <Text style={styles.primaryActionBtnText}>
                  {actionLoading ? 'Updating...' : 'Save Status'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Industry CSR Collaboration */}
      <Modal visible={collabModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Offer CSR Partnership & Grant</Text>
            <SelectDropdown
              label="Partnership Type"
              value={collabType}
              options={[
                { label: 'CSR Financial Grant', value: 'CSR_GRANT' },
                { label: 'Equipment / Material Donation', value: 'EQUIPMENT' },
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
            <Text style={styles.inputLabel}>Proposal Subject *</Text>
            <TextInput
              style={styles.input}
              value={collabTitle}
              onChangeText={setCollabTitle}
            />
            <Text style={styles.inputLabel}>Partnership Scope *</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              multiline
              value={collabOffer}
              onChangeText={setCollabOffer}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => setCollabModalOpen(false)}
              >
                <Text style={styles.secondaryActionBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleSendCollab}
                disabled={actionLoading}
              >
                <Text style={styles.primaryActionBtnText}>
                  {actionLoading ? 'Sending...' : 'Dispatch Offer'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
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
  cardHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
  },
  dot: {
    color: '#cbd5e1',
  },
  districtText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardBody: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24,
    marginBottom: 12,
  },
  heroImg: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  description: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 20,
  },
  metaGrid: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f2c59',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  secondaryActionBtnText: {
    color: '#0f2c59',
    fontSize: 11.5,
    fontWeight: '700',
  },
  phaseBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f2c59',
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  projectAbstract: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 4,
  },
  projectActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  projectMetaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  domainPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  domainPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  coordsText: {
    fontSize: 10,
    fontWeight: '600',
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
