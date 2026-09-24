import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../components/AppLogo';

const HELPLINES = [
  {
    name: 'CM Jan Samvad',
    number: '181',
    desc: 'Public grievances & citizen complaints',
    icon: 'chatbubble-ellipses-outline',
    bg: '#eff6ff',
    color: '#0f2c59',
  },
  {
    name: 'State Disaster Control',
    number: '1070',
    desc: 'Emergency relief & monsoon response',
    icon: 'shield-outline',
    bg: '#eff6ff',
    color: '#0f2c59',
  },
  {
    name: 'Women & Child Safety',
    number: '1091',
    desc: '24x7 women & child safety helpline',
    icon: 'heart-outline',
    bg: '#eff6ff',
    color: '#0f2c59',
  },
  {
    name: 'Unified Police Emergency',
    number: '112',
    desc: 'State police & rapid crisis dispatch',
    icon: 'alert-circle-outline',
    bg: '#eff6ff',
    color: '#0f2c59',
  },
  {
    name: 'Medical Ambulance',
    number: '108',
    desc: 'Free state emergency ambulance service',
    icon: 'medkit-outline',
    bg: '#eff6ff',
    color: '#0f2c59',
  },
];

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleCall = (number, name) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Phone Call', `Dial ${number} (${name}) on your phone keypad.`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() => {
        Alert.alert('Phone Call', `Dial ${number} (${name}) on your phone keypad.`);
      });
  };

  const getRoleBadgeStyle = (role) => {
    const r = role?.toLowerCase();
    let label = 'CITIZEN';
    if (r === 'student') label = 'STUDENT INNOVATOR';
    else if (r === 'university') label = 'FACULTY MENTOR';
    else if (r === 'industry') label = 'CSR / INDUSTRY PARTNER';
    else if (r === 'admin') label = 'GOVERNMENT ADMIN';

    return { bg: '#eff6ff', text: '#0f2c59', label };
  };

  const roleBadge = getRoleBadgeStyle(user?.role);

  // If user is NOT logged in: Show clean Guest / Welcome view
  if (!isAuthenticated || !user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 85 }}>
        {/* Guest Onboarding Card */}
        <View style={styles.guestHeroCard}>
          <AppLogo size="large" theme="dark" style={{ marginBottom: 12 }} />
          <Text style={styles.guestTitle}>Welcome to SamadhanSetu</Text>
          <Text style={styles.guestSubtitle}>
            Jharkhand's unified civic innovation and problem-solving network
          </Text>

          <View style={styles.guestBtnGroup}>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Login', { initialTab: 'login' })}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Login', { initialTab: 'register' })}
            >
              <Text style={styles.registerBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Participate in Governance</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="people-outline" size={18} color="#0f2c59" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.benefitTitle}>For Citizens</Text>
              <Text style={styles.benefitDesc}>Report neighborhood civic challenges and track real-time resolution from university teams.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitItem}>
            <Ionicons name="school-outline" size={18} color="#0f2c59" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.benefitTitle}>For Students & Innovators</Text>
              <Text style={styles.benefitDesc}>Form university taskforces, engineer validated solutions, and compete for development grants.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitItem}>
            <Ionicons name="flask-outline" size={18} color="#0f2c59" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.benefitTitle}>For Faculty Mentors</Text>
              <Text style={styles.benefitDesc}>Guide student projects, verify field milestones, and bridge academia with grassroots needs.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitItem}>
            <Ionicons name="business-outline" size={18} color="#0f2c59" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.benefitTitle}>For Industry & CSR</Text>
              <Text style={styles.benefitDesc}>Discover high-impact rural projects, deploy CSR capital, and monitor measurable social outcomes.</Text>
            </View>
          </View>
        </View>

        {/* Jharkhand Public Helplines (Clickable for Direct Dialing) */}
        <View style={styles.card}>
          <View style={styles.helplineHeaderRow}>
            <View>
              <Text style={styles.sectionHeader}>Jharkhand Public Helplines</Text>
              <Text style={styles.helplineSub}>Tap any helpline to call instantly</Text>
            </View>
            <Ionicons name="call" size={18} color="#0f2c59" />
          </View>

          <View style={{ gap: 8, marginTop: 10 }}>
            {HELPLINES.map((h) => (
              <TouchableOpacity
                key={h.number}
                style={styles.helplineItem}
                onPress={() => handleCall(h.number, h.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.helplineIconBox, { backgroundColor: h.bg }]}>
                  <Ionicons name={h.icon} size={18} color={h.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.helplineNameText}>{h.name}</Text>
                  <Text style={styles.helplineDescText}>{h.desc}</Text>
                </View>
                <View style={styles.callBadge}>
                  <Ionicons name="call" size={11} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.callBadgeText}>{h.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // If user IS logged in: Show real authenticated Profile
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 85 }}>
      {/* Profile Identity Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
          <Text style={[styles.roleText, { color: roleBadge.text }]}>{roleBadge.label}</Text>
        </View>
      </View>

      {/* Quick Navigation Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('MyReports')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="document-text" size={18} color="#0f2c59" />
            </View>
            <Text style={styles.actionTileTitle}>My Reports</Text>
            <Text style={styles.actionTileSub}>Track status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Report')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="add-circle" size={18} color="#0f2c59" />
            </View>
            <Text style={styles.actionTileTitle}>Report Issue</Text>
            <Text style={styles.actionTileSub}>Submit problem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => navigation.navigate('Explore')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="compass" size={18} color="#0f2c59" />
            </View>
            <Text style={styles.actionTileTitle}>Explore Grid</Text>
            <Text style={styles.actionTileSub}>All challenges</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Details */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoVal}>{user.role ? user.role.toUpperCase() : 'CITIZEN'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>District</Text>
          <Text style={styles.infoVal}>{user.district || 'Ranchi'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>State</Text>
          <Text style={styles.infoVal}>{user.state || 'Jharkhand'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={13} color="#15803d" style={{ marginRight: 4 }} />
            <Text style={styles.infoVal}>{user.email}</Text>
          </View>
        </View>
        {user.universityName ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>University / College</Text>
              <Text style={styles.infoVal}>{user.universityName}</Text>
            </View>
          </>
        ) : null}
        {user.organizationName ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organization</Text>
              <Text style={styles.infoVal}>{user.organizationName}</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Clickable Public Helplines */}
      <View style={styles.card}>
        <View style={styles.helplineHeaderRow}>
          <View>
            <Text style={styles.sectionHeader}>Jharkhand Public Helplines</Text>
            <Text style={styles.helplineSub}>Tap any number to call directly</Text>
          </View>
          <Ionicons name="call" size={18} color="#0f2c59" />
        </View>

        <View style={{ gap: 8, marginTop: 10 }}>
          {HELPLINES.map((h) => (
            <TouchableOpacity
              key={h.number}
              style={styles.helplineItem}
              onPress={() => handleCall(h.number, h.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.helplineIconBox, { backgroundColor: h.bg }]}>
                <Ionicons name={h.icon} size={18} color={h.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.helplineNameText}>{h.name}</Text>
                <Text style={styles.helplineDescText}>{h.desc}</Text>
              </View>
              <View style={styles.callBadge}>
                <Ionicons name="call" size={11} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.callBadgeText}>{h.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out of your account?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ]
          );
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#be123c" />
        <Text style={styles.logoutText}>Sign Out of SamadhanSetu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  guestHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  guestTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#0f2c59',
    marginTop: 8,
  },
  guestSubtitle: {
    fontSize: 11,
    lineHeight: 18,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  guestBtnGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  signInBtn: {
    flex: 1,
    backgroundColor: '#0f2c59',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
  },
  signInBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#0f2c59',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#0f2c59',
    fontSize: 12,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#0f2c59',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  email: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionTileTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  actionTileSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 11,
    lineHeight: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  benefitTitle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
    color: '#0f2c59',
  },
  benefitDesc: {
    fontSize: 10,
    lineHeight: 16,
    color: '#64748b',
    marginTop: 2,
  },
  helplineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  helplineSub: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748b',
    marginTop: 1,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helplineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineNameText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  helplineDescText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#64748b',
    marginTop: 1,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f2c59',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  callBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#be123c',
  },
});
