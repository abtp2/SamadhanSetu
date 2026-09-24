import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../api/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { JHARKHAND_HERO_IMAGES } from '../constants/jharkhandDistricts';
import { Ionicons } from '@expo/vector-icons';

const PARTNERS = [
  {
    code: 'BIT',
    name: 'BIT Mesra',
    fullName: 'Birla Institute of Technology',
    district: 'Ranchi',
    focus: 'IoT Sensors & Water Purification',
    icon: 'school',
  },
  {
    code: 'ISM',
    name: 'IIT (ISM) Dhanbad',
    fullName: 'Indian Institute of Technology (ISM)',
    district: 'Dhanbad',
    focus: 'Mining Ecology & Ground Hydrology',
    icon: 'cube',
  },
  {
    code: 'NIT',
    name: 'NIT Jamshedpur',
    fullName: 'National Institute of Technology',
    district: 'Jamshedpur',
    focus: 'Solar Microgrids & Automation',
    icon: 'flash',
  },
  {
    code: 'RU',
    name: 'Ranchi University',
    fullName: 'Ranchi State University',
    district: 'Ranchi',
    focus: 'Agrarian Sciences & Public Health',
    icon: 'leaf',
  },
  {
    code: 'TSF',
    name: 'Tata Steel CSR',
    fullName: 'Tata Steel Foundation',
    district: 'Jamshedpur',
    focus: 'Rural Pilot Grants & Skilling',
    icon: 'business',
  },
  {
    code: 'CCL',
    name: 'CCL Jharkhand',
    fullName: 'Central Coalfields CSR Cell',
    district: 'Ranchi',
    focus: 'Mobile Health Clinics & Clean Water',
    icon: 'shield-checkmark',
  },
];

const DEFAULT_CATEGORY_IMAGES = {
  'Water & sanitation':
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
  Environment:
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
  Energy:
    'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?auto=format&fit=crop&w=600&q=80',
  Agriculture:
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  Healthcare:
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  Education:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
  'Urban infrastructure':
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
};

const MOCK_CHALLENGES = [
  {
    _id: 'ch-kanke-01',
    title: 'High Fluoride Contamination in Handpumps at Arsande Village',
    category: 'Water & sanitation',
    district: 'Ranchi',
    location: 'Arsande, Kanke Block',
    urgency: 'HIGH',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    affectedPeople: '1,000 - 5,000 residents',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    media: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    _id: 'ch-bastacolla-02',
    title: 'Coal Mine Dust & Particulate Matter Spikes Near Bastacolla',
    category: 'Environment',
    district: 'Dhanbad',
    location: 'Bastacolla, Dhanbad',
    urgency: 'CRITICAL',
    priority: 'CRITICAL',
    status: 'VERIFIED',
    affectedPeople: '5,000 - 10,000 residents',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    media: [
      {
        url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    _id: 'ch-khunti-03',
    title: 'Lack of Cold Storage for Lac & Tomato Farmers in Murhu Block',
    category: 'Agriculture',
    district: 'Khunti',
    location: 'Murhu Haat, Khunti',
    urgency: 'HIGH',
    priority: 'HIGH',
    status: 'VERIFIED',
    affectedPeople: '1,000 - 5,000 residents',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    media: [
      {
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

const getTimeAgo = (dateString) => {
  if (!dateString) return '2d ago';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '2d ago';
    const diffMs = Math.max(0, new Date() - date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  } catch (_) {
    return '2d ago';
  }
};

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES);
  const [stats, setStats] = useState({
    totalChallenges: 12,
    verifiedChallenges: 8,
    activeProjects: 4,
    resolvedChallenges: 3,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Clean Single-Value Fade Animation for Hero Slideshow
  const [activeSlide, setActiveSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0.25,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setActiveSlide((prev) => (prev + 1) % JHARKHAND_HERO_IMAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const handleSelectSlide = (index) => {
    if (index === activeSlide) return;
    setActiveSlide(index);
  };

  const loadData = async () => {
    try {
      const [chalRes, statsRes] = await Promise.all([
        mobileApi.get('/challenges?limit=6'),
        mobileApi.get('/analytics/dashboard'),
      ]);
      if (chalRes && chalRes.success && chalRes.challenges?.length > 0) {
        setChallenges(chalRes.challenges);
      }
      if (statsRes && statsRes.success && statsRes.metrics) {
        setStats(statsRes.metrics);
      }
    } catch (_) {
      // Offline fallback uses MOCK_CHALLENGES
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCallJanSamvad = () => {
    Linking.openURL('tel:181').catch(() => {
      Alert.alert('Phone Call', 'Please dial 181 for CM Jan Samvad helpline.');
    });
  };

  const impactMetrics = [
    {
      key: 'reported',
      title: 'REPORTED',
      value: stats.totalChallenges || 12,
      sub: 'Grassroots problems',
      icon: 'document-text-outline',
    },
    {
      key: 'verified',
      title: 'VERIFIED',
      value: stats.verifiedChallenges || 8,
      sub: 'By local authorities',
      icon: 'checkmark-circle-outline',
    },
    {
      key: 'in_progress',
      title: 'IN PROGRESS',
      value: stats.activeProjects || 4,
      sub: 'University taskforces',
      icon: 'school-outline',
    },
    {
      key: 'resolved',
      title: 'RESOLVED',
      value: stats.resolvedChallenges || 3,
      sub: 'Piloted on ground',
      icon: 'ribbon-outline',
    },
  ];

  const workflowStages = [
    {
      step: '1. Report Issues',
      desc: 'Citizens geotag local problems with photos, urgency, and affected count.',
      icon: 'document-text-outline',
    },
    {
      step: '2. Engineer Solutions',
      desc: 'University student and faculty teams build working hardware and software prototypes.',
      icon: 'school-outline',
    },
    {
      step: '3. Field Deployment',
      desc: 'Corporate CSR programs fund deployment, and authorities certify field resolution.',
      icon: 'checkmark-circle-outline',
    },
  ];

  const currentHeroImg =
    JHARKHAND_HERO_IMAGES[activeSlide]?.url || JHARKHAND_HERO_IMAGES[0].url;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 1. Jharkhand Hero Banner with Fading Background Image */}
      <View style={styles.heroContainer}>
        <Animated.Image
          source={{ uri: currentHeroImg }}
          style={[styles.heroBackgroundImg, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
        <View pointerEvents="none" style={styles.heroScrim} />

        <View style={styles.heroInner}>
          {/* Hero Headline & Description (Matching Website Hero Section) */}
          <Text style={styles.heroTitle}>
            Solving Local Challenges Through Civic Collaboration
          </Text>

          <Text style={styles.heroDesc}>
            Report community issues across Jharkhand. Universities engineer practical prototypes, supported by CSR grants and state administration.
          </Text>

          {/* Action Buttons (Matching Website Hero Section) */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.primaryHeroBtn}
              onPress={() => navigation.navigate('Explore')}
              activeOpacity={0.85}
            >
              <Ionicons name="layers-outline" size={15} color="#cbd5e1" style={{ marginRight: 6 }} />
              <Text style={styles.primaryHeroBtnText}>Browse Issues</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryHeroBtn}
              onPress={() => navigation.navigate('Explore')}
              activeOpacity={0.85}
            >
              <Ionicons name="location-outline" size={15} color="#cbd5e1" style={{ marginRight: 6 }} />
              <Text style={styles.secondaryHeroBtnText}>District Map</Text>
            </TouchableOpacity>
          </View>

          {/* Slide Dots */}
          <View style={styles.dotsRow}>
            {JHARKHAND_HERO_IMAGES.map((item, idx) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => handleSelectSlide(idx)}
                style={[
                  styles.dotItem,
                  idx === activeSlide ? styles.dotItemActive : styles.dotItemInactive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* 2. Unified 4-Card State Impact Metrics */}
      <View style={styles.sectionBlock}>
        <View style={styles.metricsGrid}>
          {impactMetrics.map((m) => (
            <View key={m.key} style={styles.metricCard}>
              <View style={styles.metricTopRow}>
                <View style={styles.metricIconBox}>
                  <Ionicons name={m.icon} size={18} color="#0f2c59" />
                </View>
                <Text style={styles.metricLabel}>{m.title}</Text>
              </View>
              <Text style={styles.metricNumber}>{m.value}</Text>
              <Text style={styles.metricSub} numberOfLines={1}>
                {m.sub}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Recent Civic Challenges Feed Card */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>RECENT CIVIC CHALLENGES</Text>
              <Text style={styles.sectionSubtitle}>
                Live community submissions across Jharkhand
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Explore')}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View>
            {challenges.slice(0, 5).map((item, idx) => {
              const imageUrl =
                item.media?.[0]?.url ||
                DEFAULT_CATEGORY_IMAGES[item.category] ||
                DEFAULT_CATEGORY_IMAGES['Water & sanitation'];

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.challengeRow,
                    idx < Math.min(challenges.length, 5) - 1 && styles.rowDivider,
                  ]}
                  activeOpacity={0.82}
                  onPress={() =>
                    navigation.navigate('ChallengeDetail', {
                      id: item._id,
                      challenge: item,
                    })
                  }
                >
                  <Image source={{ uri: imageUrl }} style={styles.challengeImg} />

                  <View style={styles.challengeBody}>
                    <View style={styles.challengeTopLine}>
                      <Text style={styles.challengeCategory} numberOfLines={1}>
                        {item.category} • {item.district}
                      </Text>
                      <StatusBadge status={item.status} />
                    </View>

                    <Text style={styles.challengeTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.challengeBottomLine}>
                      <View style={styles.locWrap}>
                        <Ionicons name="location-outline" size={12} color="#64748b" />
                        <Text style={styles.locText} numberOfLines={1}>
                          {item.location || `${item.district}, Jharkhand`}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* 4. 4-Stage Ecosystem Workflow Card */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>HOW SAMADHANSETU WORKS</Text>
              <Text style={styles.sectionSubtitle}>
                End-to-end civic resolution from grassroots reporting to CSR field pilot
              </Text>
            </View>
          </View>

          <View style={styles.workflowList}>
            {workflowStages.map((w) => (
              <View key={w.step} style={styles.workflowItem}>
                <View style={styles.metricIconBox}>
                  <Ionicons name={w.icon} size={18} color="#0f2c59" />
                </View>
                <View style={styles.workflowTextCol}>
                  <Text style={styles.workflowStepTitle}>{w.step}</Text>
                  <Text style={styles.workflowStepDesc}>{w.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 5. Participating Partner Institutions */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>PARTICIPATING INSTITUTIONS</Text>
              <Text style={styles.sectionSubtitle}>
                Accredited Jharkhand universities & corporate CSR wings
              </Text>
            </View>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>{PARTNERS.length} Partners</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partnerScrollContent}
          >
            {PARTNERS.map((p) => (
              <View key={p.code} style={styles.partnerCard}>
                <View style={styles.partnerCardTop}>
                  <View style={styles.metricIconBox}>
                    <Ionicons name={p.icon} size={17} color="#0f2c59" />
                  </View>
                  <View style={styles.partnerDistPill}>
                    <Text style={styles.partnerDistText}>{p.district}</Text>
                  </View>
                </View>
                <Text style={styles.partnerName}>{p.name}</Text>
                <Text style={styles.partnerFull} numberOfLines={1}>
                  {p.fullName}
                </Text>
                <View style={styles.partnerFocusWrap}>
                  <Text style={styles.partnerFocus} numberOfLines={1}>
                    {p.focus}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 6. CM Jan Samvad (181) Citizen Helpline */}
      <View style={styles.sectionBlock}>
        <View style={styles.helplineCard}>
          <View style={styles.metricIconBox}>
            <Ionicons name="call-outline" size={18} color="#0f2c59" />
          </View>
          <View style={styles.helplineTextCol}>
            <Text style={styles.helplineEyebrow}>JHARKHAND CITIZEN HELPLINE</Text>
            <Text style={styles.helplineTitle}>CM Jan Samvad (181)</Text>
            <Text style={styles.helplineSub}>24x7 State Public Redressal Call Center</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCallJanSamvad}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={12} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.callBtnText}>Call 181</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 90 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroContainer: {
    backgroundColor: '#061326',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  heroBackgroundImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 19, 38, 0.78)',
  },
  heroInner: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 12.5,
    color: '#e2e8f0',
    lineHeight: 19,
    marginTop: 10,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  primaryHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 44, 89, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  primaryHeroBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  secondaryHeroBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  dotItem: {
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },
  dotItemActive: {
    width: 22,
    backgroundColor: '#ffffff',
  },
  dotItemInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionBlock: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    shadowRadius: 5,
    elevation: 2,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f2c59',
  },
  metricSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  sectionHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  challengeImg: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  challengeBody: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  challengeCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
    flex: 1,
    marginRight: 6,
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  challengeBottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 3,
  },
  timeText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  workflowList: {
    padding: 14,
  },
  workflowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  workflowTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  workflowStepTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  workflowStepDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginTop: 2,
  },
  partnerBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  partnerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f2c59',
  },
  partnerScrollContent: {
    padding: 14,
  },
  partnerCard: {
    width: 205,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  partnerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerDistPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  partnerDistText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  partnerName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  partnerFull: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  partnerFocusWrap: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  partnerFocus: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0f2c59',
  },
  helplineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  helplineTextCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  helplineEyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0f2c59',
    letterSpacing: 0.4,
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 1,
  },
  helplineSub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  callBtn: {
    backgroundColor: '#0f2c59',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
