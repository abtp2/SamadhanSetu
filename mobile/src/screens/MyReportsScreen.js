import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { mobileApi } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SelectDropdown } from '../components/SelectDropdown';
import { JHARKHAND_DISTRICTS } from '../constants/jharkhandDistricts';
import { Ionicons } from '@expo/vector-icons';

export const MyReportsScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states across roles
  const [myChallenges, setMyChallenges] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [openChallenges, setOpenChallenges] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [myCollaborations, setMyCollaborations] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // Admin sub-navigation & filter
  const [adminView, setAdminView] = useState('queue'); // 'queue' | 'institutions'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedChallengeForAdopt, setSelectedChallengeForAdopt] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [projectBudget, setProjectBudget] = useState('150000');

  const [selectedProjectForCollab, setSelectedProjectForCollab] = useState(null);
  const [collabType, setCollabType] = useState('CSR_GRANT');
  const [collabTitle, setCollabTitle] = useState('');
  const [collabOffer, setCollabOffer] = useState('');
  const [collabAmount, setCollabAmount] = useState('150000');

  const [selectedChallengeForAdmin, setSelectedChallengeForAdmin] = useState(null);
  const [adminStatus, setAdminStatus] = useState('VERIFIED');
  const [adminPriority, setAdminPriority] = useState('HIGH');
  const [adminNote, setAdminNote] = useState('');

  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [uniName, setUniName] = useState('');
  const [uniDistrict, setUniDistrict] = useState('Ranchi');
  const [uniEmail, setUniEmail] = useState('');
  const [uniDomains, setUniDomains] = useState('Water & Civil, IoT, Renewable Energy');

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSector, setOrgSector] = useState('Steel, Mining & Rural CSR');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgBudget, setOrgBudget] = useState('1000000');

  const [submitting, setSubmitting] = useState(false);

  const role = user?.role?.toLowerCase() || 'citizen';

  const fetchDashboardData = async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      if (role === 'student' || role === 'university') {
        const [projRes, chalRes] = await Promise.all([
          mobileApi.get('/projects/my'),
          mobileApi.get('/challenges?status=VERIFIED'),
        ]);
        if (projRes?.success) setMyProjects(projRes.projects || []);
        if (chalRes?.success) {
          setOpenChallenges(
            (chalRes.challenges || []).filter((c) => !c.project)
          );
        }
      } else if (role === 'industry') {
        const [projRes, collabRes] = await Promise.all([
          mobileApi.get('/projects?status=ACTIVE'),
          mobileApi.get('/collaborations/my'),
        ]);
        if (projRes?.success) setActiveProjects(projRes.projects || []);
        if (collabRes?.success) setMyCollaborations(collabRes.collaborations || []);
      } else if (role === 'admin') {
        const [chalRes, projRes, uRes, oRes] = await Promise.all([
          mobileApi.get('/challenges?limit=60'),
          mobileApi.get('/projects'),
          mobileApi.get('/admin/universities'),
          mobileApi.get('/admin/organizations'),
        ]);
        if (chalRes?.success) setAllChallenges(chalRes.challenges || []);
        if (projRes?.success) setActiveProjects(projRes.projects || []);
        if (uRes?.success) setUniversities(uRes.universities || []);
        if (oRes?.success) setOrganizations(oRes.organizations || []);
      } else {
        const res = await mobileApi.get('/challenges/my');
        if (res?.success) setMyChallenges(res.challenges || []);
      }
    } catch (e) {
      console.warn('Dashboard fetch notice:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated, user?.role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Handlers
  const handleAdoptSubmit = async () => {
    if (!selectedChallengeForAdopt || !projectTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await mobileApi.post('/projects/adopt', {
        challengeId: selectedChallengeForAdopt._id,
        title: projectTitle.trim(),
        abstract: projectAbstract.trim(),
        estimatedBudget: Number(projectBudget) || 150000,
      });
      if (res.success) {
        setSelectedChallengeForAdopt(null);
        Alert.alert('Challenge Adopted!', 'Project workspace created successfully.');
        fetchDashboardData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Adoption failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCollaboration = async () => {
    if (!selectedProjectForCollab || !collabTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await mobileApi.post('/collaborations', {
        projectId: selectedProjectForCollab._id,
        type: collabType,
        title: collabTitle.trim(),
        offerDetails: collabOffer.trim(),
        amountOffered: Number(collabAmount) || 150000,
      });
      if (res.success) {
        setSelectedProjectForCollab(null);
        Alert.alert('Proposal Sent!', 'Collaboration offer sent to university team.');
        fetchDashboardData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminUpdate = async () => {
    if (!selectedChallengeForAdmin) return;
    setSubmitting(true);
    try {
      const res = await mobileApi.patch(
        `/challenges/${selectedChallengeForAdmin._id}/status`,
        {
          status: adminStatus,
          priority: adminPriority,
          note: adminNote.trim() || `Status updated to ${adminStatus}`,
        }
      );
      if (res.success) {
        setSelectedChallengeForAdmin(null);
        fetchDashboardData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Status update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUni = async () => {
    if (!uniName.trim() || !uniEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await mobileApi.post('/admin/universities', {
        name: uniName.trim(),
        district: uniDistrict,
        contactEmail: uniEmail.trim(),
        domains: uniDomains
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      });
      if (res.success) {
        setUniModalOpen(false);
        setUniName('');
        setUniEmail('');
        fetchDashboardData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add university');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !orgEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await mobileApi.post('/admin/organizations', {
        name: orgName.trim(),
        industrySector: orgSector.trim() || 'Manufacturing & CSR',
        contactEmail: orgEmail.trim(),
        fundingBudgetAvailable: Number(orgBudget) || 1000000,
      });
      if (res.success) {
        setOrgModalOpen(false);
        setOrgName('');
        setOrgEmail('');
        fetchDashboardData();
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add industry partner');
    } finally {
      setSubmitting(false);
    }
  };

  // Guest / Unauthenticated View
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestCard}>
          <View style={styles.guestIconBox}>
            <Ionicons name="grid-outline" size={28} color="#0f2c59" />
          </View>
          <Text style={styles.guestTitle}>Role Dashboard & Tracking</Text>
          <Text style={styles.guestSubtitle}>
            Sign in as a Citizen, Student/University Mentor, CSR Partner, or Nodal Admin to access your workspace and real-time status tracking.
          </Text>

          <TouchableOpacity
            style={styles.guestSignInBtn}
            onPress={() => navigation.navigate('Login', { initialTab: 'login' })}
          >
            <Text style={styles.guestSignInBtnText}>Sign In to Your Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestRegisterBtn}
            onPress={() => navigation.navigate('Login', { initialTab: 'register' })}
          >
            <Text style={styles.guestRegisterBtnText}>Create a New Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestExploreBtn}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.guestExploreBtnText}>Browse Public Challenges →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Compute Role Banner & Unified 4-Card Metrics (Matches Website Dashboards 1:1)
  let bannerEyebrow = 'CITIZEN CIVIC PORTAL';
  let bannerOrg = user.district || 'Jharkhand';
  let bannerSub = 'Track the live status and resolution progress of your neighborhood issues.';
  let metrics = [];

  if (role === 'student' || role === 'university') {
    bannerEyebrow = 'UNIVERSITY R&D INNOVATION CELL';
    bannerOrg = user.universityName || 'Accredited Institution';
    bannerSub =
      'Adopt verified civic challenges, mentor student taskforces, and log engineering milestones.';
    const totalGrants = myProjects.reduce((acc, p) => acc + (p.budgetFunded || 0), 0);
    const fieldPilots = myProjects.filter((p) =>
      ['FIELD_TESTING', 'DEPLOYMENT', 'COMPLETED'].includes(p.currentPhase)
    ).length;
    metrics = [
      {
        title: 'ADOPTED PROJECTS',
        value: myProjects.length,
        sub: 'Active R&D teams',
        icon: 'folder-open-outline',
      },
      {
        title: 'OPEN CHALLENGES',
        value: openChallenges.length,
        sub: 'Awaiting adoption',
        icon: 'sparkles-outline',
      },
      {
        title: 'FIELD PILOTS',
        value: fieldPilots,
        sub: 'Testing on ground',
        icon: 'checkmark-circle-outline',
      },
      {
        title: 'CSR GRANTS',
        value: `₹${totalGrants.toLocaleString('en-IN')}`,
        sub: 'Industry funding',
        icon: 'ribbon-outline',
      },
    ];
  } else if (role === 'industry') {
    bannerEyebrow = 'INDUSTRY & CSR INNOVATION WING';
    bannerOrg = user.organizationName || 'Corporate Partner';
    bannerSub =
      'Discover verified university projects solving real problems in Jharkhand and offer grants or mentorship.';
    const totalCommitted = myCollaborations
      .filter((c) => c.status === 'ACCEPTED')
      .reduce((sum, c) => sum + (c.amountOffered || 0), 0);
    const acceptedCount = myCollaborations.filter((c) => c.status === 'ACCEPTED').length;
    metrics = [
      {
        title: 'GRANTS DISBURSED',
        value: `₹${totalCommitted.toLocaleString('en-IN')}`,
        sub: 'Accepted CSR funding',
        icon: 'ribbon-outline',
      },
      {
        title: 'PARTNERSHIPS',
        value: acceptedCount,
        sub: 'Approved collaborations',
        icon: 'hand-left-outline',
      },
      {
        title: 'PROPOSALS SENT',
        value: myCollaborations.length,
        sub: 'Dispatched offers',
        icon: 'send-outline',
      },
      {
        title: 'COLLEGE PROJECTS',
        value: activeProjects.length,
        sub: 'Seeking CSR support',
        icon: 'school-outline',
      },
    ];
  } else if (role === 'admin') {
    bannerEyebrow = 'STATE NODAL ADMINISTRATION';
    bannerOrg = 'Govt. of Jharkhand';
    bannerSub =
      'Verify citizen submissions, manage priority levels, and oversee university-industry consortiums.';
    const awaiting = allChallenges.filter((c) =>
      ['SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW'].includes(c.status)
    ).length;
    const resolvedCount = allChallenges.filter((c) =>
      ['IMPLEMENTED', 'RESOLVED'].includes(c.status)
    ).length;
    metrics = [
      {
        title: 'TOTAL CHALLENGES',
        value: allChallenges.length,
        sub: 'Statewide reports',
        icon: 'document-text-outline',
      },
      {
        title: 'AWAITING REVIEW',
        value: awaiting,
        sub: 'Pending verification',
        icon: 'time-outline',
      },
      {
        title: 'ACTIVE PROJECTS',
        value: activeProjects.length,
        sub: 'University R&D teams',
        icon: 'school-outline',
      },
      {
        title: 'RESOLVED',
        value: resolvedCount,
        sub: 'Deployed on ground',
        icon: 'checkmark-circle-outline',
      },
    ];
  } else {
    const reviewing = myChallenges.filter((c) =>
      ['SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW'].includes(c.status)
    ).length;
    const inProg = myChallenges.filter((c) =>
      ['IN_PROGRESS', 'SOLUTION_SUBMITTED', 'PILOTING'].includes(c.status)
    ).length;
    const resCount = myChallenges.filter((c) =>
      ['IMPLEMENTED', 'RESOLVED'].includes(c.status)
    ).length;
    metrics = [
      {
        title: 'TOTAL REPORTED',
        value: myChallenges.length,
        sub: 'Your submissions',
        icon: 'document-text-outline',
      },
      {
        title: 'UNDER REVIEW',
        value: reviewing,
        sub: 'By local authorities',
        icon: 'time-outline',
      },
      {
        title: 'IN PROGRESS',
        value: inProg,
        sub: 'University teams',
        icon: 'school-outline',
      },
      {
        title: 'RESOLVED',
        value: resCount,
        sub: 'Piloted on ground',
        icon: 'checkmark-circle-outline',
      },
    ];
  }

  const filteredAdminChallenges =
    statusFilter === 'ALL'
      ? allChallenges
      : allChallenges.filter((c) => c.status === statusFilter);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Unified Top Welcome Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrowText}>{bannerEyebrow}</Text>
              <Text style={styles.eyebrowDot}>•</Text>
              <Text style={styles.eyebrowSub}>{bannerOrg}</Text>
            </View>
            <Text style={styles.bannerTitle}>Welcome, {user.name}</Text>
            <Text style={styles.bannerSub}>{bannerSub}</Text>
          </View>

          {role === 'citizen' && (
            <TouchableOpacity
              style={styles.amberActionBtn}
              onPress={() => navigation.navigate('Report')}
            >
              <Ionicons name="add-circle" size={15} color="#0f172a" />
              <Text style={styles.amberActionBtnText}>Report Issue</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Unified 4-Card Role Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
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

      {/* 3A. CITIZEN VIEW: My Submitted Challenges */}
      {role === 'citizen' && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              MY SUBMITTED CHALLENGES ({myChallenges.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Report')}>
              <Text style={styles.headerLink}>+ New Report</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator color="#0f2c59" size="small" />
            </View>
          ) : myChallenges.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>
                You haven't reported any challenges yet.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Report')}
              >
                <Text style={styles.primaryBtnText}>Submit Your First Challenge →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {myChallenges.map((c, idx) => (
                <View
                  key={c._id}
                  style={[
                    styles.listRow,
                    idx < myChallenges.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.rowMetaTop}>
                    <Text style={styles.rowCategory}>
                      {c.category} • {c.district}
                    </Text>
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </View>

                  <Text style={styles.rowTitle}>{c.title}</Text>
                  <Text style={styles.rowLoc}>📍 {c.location}</Text>

                  {c.project && (
                    <Text style={styles.adoptedText}>
                      Adopted Project Phase: {c.project.currentPhase || 'Active'}
                    </Text>
                  )}

                  <View style={styles.rowFooter}>
                    <StatusBadge status={c.status} />
                    <TouchableOpacity
                      style={styles.secondaryRowBtn}
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', { id: c._id, challenge: c })
                      }
                    >
                      <Text style={styles.secondaryRowBtnText}>View Status →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 3B. UNIVERSITY / STUDENT VIEW */}
      {(role === 'student' || role === 'university') && (
        <>
          {/* Active University Projects */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                ACTIVE UNIVERSITY PROJECTS ({myProjects.length})
              </Text>
            </View>

            {myProjects.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  No active projects yet. Adopt a verified challenge below!
                </Text>
              </View>
            ) : (
              <View>
                {myProjects.map((p, idx) => (
                  <View
                    key={p._id}
                    style={[
                      styles.listRow,
                      idx < myProjects.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.rowMetaTop}>
                      <Text style={styles.rowCategory}>
                        {p.university?.name || 'University Team'} •{' '}
                        {p.challenge?.district || 'Jharkhand'}
                      </Text>
                      <View style={styles.phasePill}>
                        <Text style={styles.phasePillText}>Phase: {p.currentPhase}</Text>
                      </View>
                    </View>

                    <Text style={styles.rowTitle}>{p.title}</Text>
                    <Text style={styles.rowDesc} numberOfLines={2}>
                      {p.abstract}
                    </Text>

                    <View style={styles.rowFooter}>
                      <Text style={styles.grantText}>
                        Funded: ₹{(p.budgetFunded || 0).toLocaleString('en-IN')} / ₹
                        {(p.budgetEstimated || 150000).toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity
                        style={styles.secondaryRowBtn}
                        onPress={() =>
                          navigation.navigate('ProjectDetail', { id: p._id, project: p })
                        }
                      >
                        <Text style={styles.secondaryRowBtnText}>Manage Workspace →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Verified Challenges Awaiting Adoption */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  VERIFIED CHALLENGES AWAITING ADOPTION ({openChallenges.length})
                </Text>
                <Text style={styles.sectionSub}>
                  Validated civic problems ready for university taskforce adoption
                </Text>
              </View>
            </View>

            <View style={{ padding: 14, gap: 12 }}>
              {openChallenges.map((c) => (
                <View key={c._id} style={styles.discoveryCard}>
                  <View style={styles.rowMetaTop}>
                    <Text style={styles.rowCategory}>
                      {c.category} • {c.district}
                    </Text>
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </View>
                  <Text style={styles.rowTitle}>{c.title}</Text>
                  <Text style={styles.rowDesc} numberOfLines={2}>
                    {c.description}
                  </Text>

                  <View style={styles.discoveryFooter}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ChallengeDetail', { id: c._id, challenge: c })
                      }
                    >
                      <Text style={styles.headerLink}>View Problem →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => {
                        setSelectedChallengeForAdopt(c);
                        setProjectTitle(`Engineering Solution: ${c.title}`);
                        setProjectAbstract(
                          `Developing a low-cost, field-validated engineering solution for ${c.title} in ${c.district}.`
                        );
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Adopt Challenge</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* 3C. INDUSTRY / CSR VIEW */}
      {role === 'industry' && (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  DISCOVER UNIVERSITY PROJECTS ({activeProjects.length})
                </Text>
                <Text style={styles.sectionSub}>
                  Active student teams and faculty mentors seeking CSR grants
                </Text>
              </View>
            </View>

            <View style={{ padding: 14, gap: 12 }}>
              {activeProjects.map((p) => (
                <View key={p._id} style={styles.discoveryCard}>
                  <View style={styles.rowMetaTop}>
                    <Text style={styles.rowCategory}>
                      {p.university?.name || 'University'}
                    </Text>
                    <View style={styles.phasePill}>
                      <Text style={styles.phasePillText}>Phase: {p.currentPhase}</Text>
                    </View>
                  </View>

                  <Text style={styles.rowTitle}>{p.title}</Text>
                  <Text style={styles.rowDesc} numberOfLines={2}>
                    {p.abstract}
                  </Text>

                  <View style={styles.budgetRow}>
                    <View>
                      <Text style={styles.budgetLabel}>Estimated Budget</Text>
                      <Text style={styles.budgetVal}>
                        ₹{(p.budgetEstimated || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.budgetLabel}>Current Funding</Text>
                      <Text style={[styles.budgetVal, { color: '#047857' }]}>
                        ₹{(p.budgetFunded || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.discoveryFooter}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ProjectDetail', { id: p._id, project: p })
                      }
                    >
                      <Text style={styles.headerLink}>View Roadmap →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => {
                        setSelectedProjectForCollab(p);
                        setCollabTitle(`CSR Sponsorship for ${p.title}`);
                        setCollabOffer(
                          'Providing ₹1,50,000 prototype development funding and technical lab mentorship.'
                        );
                      }}
                    >
                      <Text style={styles.primaryBtnText}>Offer CSR Partnership</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                MY DISPATCHED COLLABORATION PROPOSALS ({myCollaborations.length})
              </Text>
            </View>

            {myCollaborations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  No collaboration proposals sent yet.
                </Text>
              </View>
            ) : (
              <View>
                {myCollaborations.map((c, idx) => (
                  <View
                    key={c._id}
                    style={[
                      styles.listRow,
                      idx < myCollaborations.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.rowMetaTop}>
                      <Text style={styles.rowTitle}>{c.title}</Text>
                      <Text style={styles.grantText}>
                        ₹{(c.amountOffered || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={styles.rowDesc}>{c.offerDetails}</Text>
                    <View style={styles.rowFooter}>
                      <View style={styles.phasePill}>
                        <Text style={styles.phasePillText}>{c.status}</Text>
                      </View>
                      {c.project?._id && (
                        <TouchableOpacity
                          style={styles.secondaryRowBtn}
                          onPress={() =>
                            navigation.navigate('ProjectDetail', {
                              id: c.project._id,
                              project: c.project,
                            })
                          }
                        >
                          <Text style={styles.secondaryRowBtnText}>View Workspace →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {/* 3D. ADMIN VIEW: Verification Queue & Institutions Consortium */}
      {role === 'admin' && (
        <>
          <View style={styles.adminTabBar}>
            <TouchableOpacity
              style={[
                styles.adminTabBtn,
                adminView === 'queue' && styles.adminTabBtnActive,
              ]}
              onPress={() => setAdminView('queue')}
            >
              <Text
                style={[
                  styles.adminTabText,
                  adminView === 'queue' && styles.adminTabTextActive,
                ]}
              >
                Verification Queue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.adminTabBtn,
                adminView === 'institutions' && styles.adminTabBtnActive,
              ]}
              onPress={() => setAdminView('institutions')}
            >
              <Text
                style={[
                  styles.adminTabText,
                  adminView === 'institutions' && styles.adminTabTextActive,
                ]}
              >
                Institutions Consortium
              </Text>
            </TouchableOpacity>
          </View>

          {adminView === 'queue' ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  CHALLENGE VERIFICATION QUEUE ({filteredAdminChallenges.length})
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterPillsRow}
              >
                {['ALL', 'SUBMITTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.filterPill,
                      statusFilter === st && styles.filterPillActive,
                    ]}
                    onPress={() => setStatusFilter(st)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        statusFilter === st && styles.filterPillTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View>
                {filteredAdminChallenges.map((c, idx) => (
                  <View
                    key={c._id}
                    style={[
                      styles.listRow,
                      idx < filteredAdminChallenges.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.rowMetaTop}>
                      <Text style={styles.rowCategory}>
                        {c.category} • {c.district}
                      </Text>
                      <PriorityBadge priority={c.priority || c.urgency} />
                    </View>
                    <Text style={styles.rowTitle}>{c.title}</Text>
                    <Text style={styles.rowLoc}>📍 {c.location}</Text>

                    <View style={styles.rowFooter}>
                      <StatusBadge status={c.status} />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={styles.secondaryRowBtn}
                          onPress={() =>
                            navigation.navigate('ChallengeDetail', { id: c._id, challenge: c })
                          }
                        >
                          <Text style={styles.secondaryRowBtnText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.primaryBtn}
                          onPress={() => {
                            setSelectedChallengeForAdmin(c);
                            setAdminStatus(c.status || 'VERIFIED');
                            setAdminPriority(c.priority || c.urgency || 'HIGH');
                          }}
                        >
                          <Text style={styles.primaryBtnText}>Manage</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <>
              {/* Accredited Universities */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    ACCREDITED UNIVERSITIES ({universities.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setUniModalOpen(true)}
                  >
                    <Text style={styles.primaryBtnText}>+ Add University</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ padding: 14, gap: 10 }}>
                  {universities.map((u) => (
                    <View key={u._id} style={styles.discoveryCard}>
                      <View style={styles.rowMetaTop}>
                        <Text style={styles.rowTitle}>{u.name}</Text>
                        <View style={styles.phasePill}>
                          <Text style={styles.phasePillText}>{u.code || 'UNIV'}</Text>
                        </View>
                      </View>
                      <Text style={styles.rowLoc}>📍 {u.district}, Jharkhand</Text>
                      <Text style={styles.rowDesc}>
                        Domains: {(u.domains || []).join(', ') || 'Multidisciplinary Engineering'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Corporate CSR Partners */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    CORPORATE CSR PARTNERS ({organizations.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setOrgModalOpen(true)}
                  >
                    <Text style={styles.primaryBtnText}>+ Add Partner</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ padding: 14, gap: 10 }}>
                  {organizations.map((org) => (
                    <View key={org._id} style={styles.discoveryCard}>
                      <View style={styles.rowMetaTop}>
                        <Text style={styles.rowTitle}>{org.name}</Text>
                        <Text style={styles.grantText}>
                          ₹{(org.fundingBudgetAvailable || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={styles.rowCategory}>{org.industrySector}</Text>
                      {org.description ? (
                        <Text style={styles.rowDesc}>{org.description}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </>
      )}

      {/* Modal 1: Adopt Challenge */}
      <Modal visible={!!selectedChallengeForAdopt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adopt Challenge for University R&D</Text>
            <Text style={styles.inputLabel}>Project Title *</Text>
            <TextInput
              style={styles.input}
              value={projectTitle}
              onChangeText={setProjectTitle}
            />
            <Text style={styles.inputLabel}>Technical Abstract *</Text>
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
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryRowBtn}
                onPress={() => setSelectedChallengeForAdopt(null)}
              >
                <Text style={styles.secondaryRowBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleAdoptSubmit}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>
                  {submitting ? 'Adopting...' : 'Confirm Adoption'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: CSR Offer */}
      <Modal visible={!!selectedProjectForCollab} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Offer CSR Partnership & Grant</Text>
            <SelectDropdown
              label="Partnership Type"
              value={collabType}
              options={[
                { label: 'CSR Financial Grant', value: 'CSR_GRANT' },
                { label: 'Equipment / Material', value: 'EQUIPMENT' },
                { label: 'Technical Mentorship', value: 'MENTORSHIP' },
                { label: 'Site Pilot Access', value: 'PILOT_DEPLOYMENT' },
              ]}
              onSelect={setCollabType}
              searchable={false}
            />
            <Text style={styles.inputLabel}>Committed Grant (INR)</Text>
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
            <Text style={styles.inputLabel}>Partnership Scope *</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              multiline
              value={collabOffer}
              onChangeText={setCollabOffer}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryRowBtn}
                onPress={() => setSelectedProjectForCollab(null)}
              >
                <Text style={styles.secondaryRowBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendCollaboration}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>
                  {submitting ? 'Sending...' : 'Dispatch Proposal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Admin Manage Challenge */}
      <Modal visible={!!selectedChallengeForAdmin} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Challenge Status & Priority</Text>
            <SelectDropdown
              label="Status"
              value={adminStatus}
              options={[
                'SUBMITTED',
                'UNDER_REVIEW',
                'VERIFIED',
                'ASSIGNED',
                'IN_PROGRESS',
                'PILOTING',
                'RESOLVED',
              ]}
              onSelect={setAdminStatus}
              searchable={false}
            />
            <SelectDropdown
              label="Priority"
              value={adminPriority}
              options={['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']}
              onSelect={setAdminPriority}
              searchable={false}
            />
            <Text style={styles.inputLabel}>Official Remarks</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              multiline
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Verification remarks..."
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryRowBtn}
                onPress={() => setSelectedChallengeForAdmin(null)}
              >
                <Text style={styles.secondaryRowBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleAdminUpdate}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 4: Add University */}
      <Modal visible={uniModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Accredited University</Text>
            <Text style={styles.inputLabel}>University Name *</Text>
            <TextInput
              style={styles.input}
              value={uniName}
              onChangeText={setUniName}
              placeholder="e.g. Kolhan University"
            />
            <SelectDropdown
              label="District *"
              value={uniDistrict}
              options={JHARKHAND_DISTRICTS}
              onSelect={setUniDistrict}
            />
            <Text style={styles.inputLabel}>Official Nodal Email *</Text>
            <TextInput
              style={styles.input}
              value={uniEmail}
              onChangeText={setUniEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="nodal@university.ac.in"
            />
            <Text style={styles.inputLabel}>Key Research Domains</Text>
            <TextInput
              style={styles.input}
              value={uniDomains}
              onChangeText={setUniDomains}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryRowBtn}
                onPress={() => setUniModalOpen(false)}
              >
                <Text style={styles.secondaryRowBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleCreateUni}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>Save University</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 5: Add Industry Partner */}
      <Modal visible={orgModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Corporate CSR Partner</Text>
            <Text style={styles.inputLabel}>Company / Foundation Name *</Text>
            <TextInput
              style={styles.input}
              value={orgName}
              onChangeText={setOrgName}
              placeholder="e.g. Jindal Steel Foundation"
            />
            <Text style={styles.inputLabel}>Industry Sector *</Text>
            <TextInput
              style={styles.input}
              value={orgSector}
              onChangeText={setOrgSector}
            />
            <Text style={styles.inputLabel}>CSR Contact Email *</Text>
            <TextInput
              style={styles.input}
              value={orgEmail}
              onChangeText={setOrgEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="csr@company.com"
            />
            <Text style={styles.inputLabel}>CSR Budget Pool (INR)</Text>
            <TextInput
              style={styles.input}
              value={orgBudget}
              onChangeText={setOrgBudget}
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.secondaryRowBtn}
                onPress={() => setOrgModalOpen(false)}
              >
                <Text style={styles.secondaryRowBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleCreateOrg}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>Save Partner</Text>
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
  guestCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  guestIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f2c59',
    marginTop: 12,
  },
  guestSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 17,
  },
  guestSignInBtn: {
    backgroundColor: '#0f2c59',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  guestSignInBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  guestRegisterBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0f2c59',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  guestRegisterBtnText: {
    color: '#0f2c59',
    fontSize: 12,
    fontWeight: '800',
  },
  guestExploreBtn: {
    paddingVertical: 6,
  },
  guestExploreBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f2c59',
    letterSpacing: 0.5,
  },
  eyebrowDot: {
    color: '#cbd5e1',
  },
  eyebrowSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  amberActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  amberActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
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
    fontSize: 22,
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
  },
  sectionTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  sectionSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  headerLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  emptyBox: {
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  listRow: {
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  rowCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
    flex: 1,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 19,
  },
  rowLoc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  rowDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 4,
  },
  adoptedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
    marginTop: 5,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  primaryBtn: {
    backgroundColor: '#0f2c59',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  secondaryRowBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  secondaryRowBtnText: {
    color: '#0f2c59',
    fontSize: 11,
    fontWeight: '700',
  },
  phasePill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  phasePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  grantText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#047857',
  },
  discoveryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  discoveryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  budgetLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  budgetVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  adminTabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  adminTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  adminTabBtnActive: {
    backgroundColor: '#ffffff',
  },
  adminTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  adminTabTextActive: {
    color: '#0f2c59',
  },
  filterPillsRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: '#0f2c59',
  },
  filterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#ffffff',
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
