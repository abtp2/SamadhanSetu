import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { JHARKHAND_DISTRICTS } from '../constants/jharkhandDistricts';
import { SelectDropdown } from '../components/SelectDropdown';

const ROLES = [
  { key: 'citizen', label: 'Citizen', subtitle: 'Community member & resident' },
  { key: 'student', label: 'Student', subtitle: 'College student & problem solver' },
  { key: 'university', label: 'Faculty / Mentor', subtitle: 'Professor & academic reviewer' },
  { key: 'industry', label: 'Industry / CSR', subtitle: 'Corporate partner & project sponsor' },
];

export const LoginScreen = ({ navigation, route }) => {
  const { login, register } = useAuth();
  const initialMode = route?.params?.initialTab === 'register' ? 'register' : 'login';
  const [tab, setTab] = useState(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regStep, setRegStep] = useState('form'); // 'form' | 'otp'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('citizen');
  const [regDistrict, setRegDistrict] = useState('Ranchi');
  const [regUniversity, setRegUniversity] = useState('');
  const [regOrganization, setRegOrganization] = useState('');

  // OTP state
  const [regOtp, setRegOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Handle Real Login
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigation.navigate('Main', { screen: 'MyReports' });
    } catch (err) {
      Alert.alert('Sign In Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Validate Details and Send Email OTP
  const handleSendOtp = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      Alert.alert('Missing Fields', 'Please enter your name, email, and password.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await mobileApi.post('/auth/send-otp', {
        email: regEmail.trim().toLowerCase(),
      });
      setRegStep('otp');
      setOtpTimer(60);
      Alert.alert(
        'Verification Code Sent',
        res.message || `A 6-digit verification code has been sent to ${regEmail}.`
      );
    } catch (err) {
      Alert.alert('Verification Notice', err.message || 'Could not send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0 || sendingOtp) return;
    setSendingOtp(true);
    try {
      const res = await mobileApi.post('/auth/send-otp', {
        email: regEmail.trim().toLowerCase(),
      });
      setOtpTimer(60);
      Alert.alert(
        'Code Resent',
        res.message || `A new verification code was sent to ${regEmail}.`
      );
    } catch (err) {
      Alert.alert('Resend Failed', err.message || 'Could not resend verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndRegister = async () => {
    if (!regOtp || regOtp.trim().length < 6) {
      Alert.alert('Enter Code', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        district: regDistrict,
        universityName: regUniversity,
        organizationName: regOrganization,
        otp: regOtp.trim(),
      });

      Alert.alert(
        'Account Verified & Created!',
        `Johar, ${regName}! Your email has been verified and your account is active.`,
        [{ text: 'Continue', onPress: () => navigation.navigate('Main', { screen: 'Home' }) }]
      );
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Could not verify code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>SamadhanSetu</Text>
        <Text style={styles.brandSubtitle}>
          Civic Problem-Solving Network of Jharkhand
        </Text>
      </View>

      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'login' && styles.segmentBtnActive]}
          onPress={() => {
            setTab('login');
            setRegStep('form');
          }}
        >
          <Text style={[styles.segmentText, tab === 'login' && styles.segmentTextActive]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'register' && styles.segmentBtnActive]}
          onPress={() => setTab('register')}
        >
          <Text style={[styles.segmentText, tab === 'register' && styles.segmentTextActive]}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Real Sign In */}
      {tab === 'login' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to Your Account</Text>
          <Text style={styles.cardSub}>
            Access your submissions, project track records, and status updates
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. rahul.sharma@example.com"
            placeholderTextColor="#94a3b8"
            value={loginEmail}
            onChangeText={setLoginEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showLoginPassword}
              value={loginPassword}
              onChangeText={setLoginPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowLoginPassword(!showLoginPassword)}
            >
              <Ionicons
                name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchTabLink}
            onPress={() => setTab('register')}
          >
            <Text style={styles.switchTabLinkText}>
              Don't have an account? <Text style={{ fontWeight: '800', color: '#0f2c59' }}>Create one here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab 2: Real Account Creation - Step 1 Form */}
      {tab === 'register' && regStep === 'form' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join SamadhanSetu</Text>
          <Text style={styles.cardSub}>
            Create your verified account to report issues, solve challenges, or mentor projects
          </Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#94a3b8"
            value={regName}
            onChangeText={setRegName}
          />

          <Text style={styles.label}>Email Address (For Verification) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. rahul.sharma@example.com"
            placeholderTextColor="#94a3b8"
            value={regEmail}
            onChangeText={setRegEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Create Password (min 6 chars) *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showRegPassword}
              value={regPassword}
              onChangeText={setRegPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowRegPassword(!showRegPassword)}
            >
              <Ionicons
                name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* Select Role */}
          <Text style={styles.label}>I am participating as:</Text>
          <View style={{ gap: 6, marginBottom: 12 }}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleSelectCard, regRole === r.key && styles.roleSelectCardActive]}
                onPress={() => setRegRole(r.key)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.roleTitle, regRole === r.key && styles.roleTitleActive]}>
                    {r.label}
                  </Text>
                  {regRole === r.key && <Ionicons name="checkmark-circle" size={16} color="#0f2c59" />}
                </View>
                <Text style={styles.roleSub}>{r.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* District Select Dropdown */}
          <SelectDropdown
            label="Home District (Jharkhand) *"
            placeholder="Select District"
            value={regDistrict}
            options={JHARKHAND_DISTRICTS}
            onSelect={setRegDistrict}
            icon="location-outline"
            searchable
            containerStyle={{ marginBottom: 12 }}
          />

          {/* Conditional institution input */}
          {(regRole === 'student' || regRole === 'university') && (
            <>
              <Text style={styles.label}>College / University Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur"
                placeholderTextColor="#94a3b8"
                value={regUniversity}
                onChangeText={setRegUniversity}
              />
            </>
          )}

          {regRole === 'industry' && (
            <>
              <Text style={styles.label}>Organization / Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Tata Steel Foundation, BCCL, SAIL"
                placeholderTextColor="#94a3b8"
                value={regOrganization}
                onChangeText={setRegOrganization}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, sendingOtp && { opacity: 0.7 }]}
            onPress={handleSendOtp}
            disabled={sendingOtp}
          >
            {sendingOtp ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Verify Email & Continue →</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Tab 2: Step 2 - OTP Code Entry */}
      {tab === 'register' && regStep === 'otp' && (
        <View style={styles.card}>
          <View style={styles.otpHeaderBox}>
            <View style={styles.otpIconCircle}>
              <Ionicons name="mail-unread-outline" size={28} color="#0f2c59" />
            </View>
            <Text style={styles.cardTitle}>Verify Your Email</Text>
            <Text style={styles.cardSub}>
              We sent a 6-digit verification code to:
            </Text>
            <View style={styles.emailPill}>
              <Text style={styles.emailPillText}>{regEmail.trim().toLowerCase()}</Text>
            </View>
          </View>

          <Text style={styles.label}>Enter 6-Digit Code</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="••••••"
            placeholderTextColor="#cbd5e1"
            value={regOtp}
            onChangeText={setRegOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleVerifyAndRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Verify Code & Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.otpActionsRow}>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={otpTimer > 0 || sendingOtp}
              style={{ opacity: otpTimer > 0 ? 0.6 : 1 }}
            >
              <Text style={styles.resendLinkText}>
                {otpTimer > 0 ? `Resend Code in ${otpTimer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRegStep('form')}>
              <Text style={styles.editDetailsLinkText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Guest Mode Notice */}
      <View style={styles.guestNote}>
        <Ionicons name="information-circle-outline" size={16} color="#64748b" />
        <Text style={styles.guestNoteText}>
          You can also browse public challenges without signing in from the Explore tab.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f2c59',
    lineHeight: 28,
  },
  brandSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    lineHeight: 16,
  },
  segmentTextActive: {
    color: '#0f2c59',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f2c59',
    lineHeight: 22,
  },
  cardSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 14,
    lineHeight: 17,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    lineHeight: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    fontSize: 12.5,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    lineHeight: 17,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 12.5,
    color: '#0f172a',
    lineHeight: 17,
  },
  eyeBtn: {
    padding: 10,
  },
  submitBtn: {
    backgroundColor: '#0f2c59',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
    lineHeight: 17,
  },
  switchTabLink: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchTabLinkText: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },
  roleSelectCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  roleSelectCardActive: {
    borderColor: '#0f2c59',
    backgroundColor: '#eff6ff',
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 16,
  },
  roleTitleActive: {
    color: '#0f2c59',
    fontWeight: '800',
  },
  roleSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
  otpHeaderBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  otpIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emailPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  emailPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    lineHeight: 16,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#0f2c59',
    borderRadius: 8,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '800',
    color: '#0f2c59',
    textAlign: 'center',
    letterSpacing: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  otpActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  resendLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
    lineHeight: 16,
  },
  editDetailsLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 16,
  },
  guestNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  guestNoteText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
});
