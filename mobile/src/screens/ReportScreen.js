import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { mobileApi } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  JHARKHAND_DISTRICTS,
  AFFECTED_PEOPLE_OPTIONS,
  getCoordinatesForDistrict,
} from '../constants/jharkhandDistricts';
import { LeafletWebViewMap } from '../components/LeafletWebViewMap';
import { SelectDropdown } from '../components/SelectDropdown';

const CATEGORIES = [
  'Water & sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Energy',
  'Rural livelihoods',
  'Accessibility',
  'Urban infrastructure',
  'Public services',
];

export const ReportScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water & sanitation');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Location & Geotag
  const initialDistrict = user?.district || 'Ranchi';
  const [district, setDistrict] = useState(initialDistrict);
  const [locationText, setLocationText] = useState(`${initialDistrict} District, Jharkhand`);
  const [coordinates, setCoordinates] = useState(() => getCoordinatesForDistrict(initialDistrict));
  const [isGps, setIsGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Media, Cloudinary Upload & Urgency
  const [imageUri, setImageUri] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProvider, setUploadProvider] = useState('');
  const [urgency, setUrgency] = useState('HIGH');
  const [affectedPeople, setAffectedPeople] = useState('500 - 1,000 residents');
  const [submitting, setSubmitting] = useState(false);

  // Handle District selection
  const handleSelectDistrict = (d) => {
    setDistrict(d);
    if (!isGps) {
      const coords = getCoordinatesForDistrict(d);
      setCoordinates(coords);
      if (
        !locationText ||
        locationText.includes('District, Jharkhand') ||
        locationText.includes('GPS Location:')
      ) {
        setLocationText(`${d} District, Jharkhand`);
      }
    }
  };

  // Auto-fetch device GPS location
  const handleGetLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Using district central coordinates.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setCoordinates(newCoords);
      setIsGps(true);
      setLocationText(
        `GPS Location: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`
      );
      Alert.alert(
        'Precise GPS Acquired',
        `Pinned to Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`
      );
    } catch (_) {
      Alert.alert('GPS Notice', 'Could not acquire GPS. Pinned to district center.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Upload selected/captured image to Cloudinary via backend /api/upload
  const processAndUploadAsset = async (asset) => {
    if (!asset) return;
    setImageUri(asset.uri);
    setUploadingImage(true);
    setUploadProvider('');

    try {
      const mimeType = asset.mimeType || 'image/jpeg';
      const dataUrl = asset.base64
        ? `data:${mimeType};base64,${asset.base64}`
        : asset.uri;

      if (asset.base64) {
        const res = await mobileApi.post('/upload', { image: dataUrl });
        if (res && res.success && res.url) {
          setUploadedImageUrl(res.url);
          setUploadProvider(res.provider || 'cloudinary');
          return;
        }
      }
      setUploadedImageUrl(dataUrl);
    } catch (err) {
      console.warn('Cloudinary upload fallback notice:', err.message);
      const mimeType = asset.mimeType || 'image/jpeg';
      setUploadedImageUrl(
        asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Pick from gallery
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery permissions to attach photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processAndUploadAsset(result.assets[0]);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  // Capture with camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to capture field photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processAndUploadAsset(result.assets[0]);
      }
    } catch (e) {
      console.warn('Camera capture error:', e);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setUploadedImageUrl('');
    setUploadProvider('');
  };

  const handleSubmit = async () => {
    if (uploadingImage) {
      Alert.alert('Upload in Progress', 'Please wait a moment for the photo upload to complete.');
      return;
    }

    setSubmitting(true);
    try {
      const finalMediaUrl = uploadedImageUrl || imageUri;
      const payload = {
        title,
        category,
        description,
        district,
        location: locationText || `${district} Community Site`,
        coordinates,
        affectedPeople,
        urgency,
        reporterName: user?.name || guestName || 'Resident Citizen',
        reporterEmail: user?.email || guestEmail || '',
        media: finalMediaUrl ? [{ url: finalMediaUrl, type: 'image' }] : [],
      };

      await mobileApi.post('/challenges', payload);

      const resetForm = () => {
        setStep(1);
        setTitle('');
        setDescription('');
        setImageUri(null);
        setUploadedImageUrl('');
        setUploadProvider('');
      };

      Alert.alert(
        'Issue Submitted Successfully!',
        'Your report has been registered. It will be reviewed by district nodal authorities and routed to university engineering teams.',
        isAuthenticated
          ? [
              {
                text: 'Go to My Dashboard',
                onPress: () => {
                  resetForm();
                  navigation.navigate('MyReports');
                },
              },
            ]
          : [
              {
                text: 'Sign In to Track',
                onPress: () => {
                  resetForm();
                  navigation.navigate('Login');
                },
              },
              {
                text: 'Explore Issues',
                onPress: () => {
                  resetForm();
                  navigation.navigate('Explore');
                },
              },
            ]
      );
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Could not submit challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Banner Card */}
      <View style={styles.bannerCard}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrowText}>CITIZEN CIVIC PORTAL</Text>
          <Text style={styles.eyebrowDot}>•</Text>
          <Text style={styles.eyebrowSub}>{district}</Text>
        </View>
        <Text style={styles.bannerTitle}>Report a Community Challenge</Text>
        <Text style={styles.bannerSub}>
          Submit verified local issues with location and photo proof for university R&D resolution.
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepHeader}>
        <TouchableOpacity style={styles.stepIndicator} onPress={() => setStep(1)}>
          <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Details</Text>
        </TouchableOpacity>
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <TouchableOpacity
          style={styles.stepIndicator}
          onPress={() => title && description && setStep(2)}
        >
          <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>Location</Text>
        </TouchableOpacity>
        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
        <TouchableOpacity
          style={styles.stepIndicator}
          onPress={() => title && description && setStep(3)}
        >
          <Text style={[styles.stepNum, step === 3 && styles.stepNumActive]}>3</Text>
          <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Verify & Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Step 1: Problem Details */}
      {step === 1 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderBar}>
            <Text style={styles.cardHeaderTitle}>STEP 1: PROBLEM OVERVIEW</Text>
          </View>

          <View style={styles.cardBody}>
            {user ? (
              <View style={styles.userBanner}>
                <Ionicons name="person-circle" size={18} color="#0f2c59" />
                <Text style={styles.userBannerText}>
                  Reporting as <Text style={{ fontWeight: '800' }}>{user.name}</Text> (
                  {user.role ? user.role.toUpperCase() : 'CITIZEN'} • {user.district || 'Jharkhand'})
                </Text>
              </View>
            ) : (
              <View style={styles.guestBanner}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#0f2c59" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.guestBannerTitle}>Reporting as Community Citizen</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.guestBannerLink}>Sign In to track your resolution →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={styles.label}>Challenge Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., High Fluoride Contamination in Village Handpumps"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />

            <SelectDropdown
              label="Problem Category *"
              placeholder="Select Problem Category"
              value={category}
              options={CATEGORIES}
              onSelect={setCategory}
              icon="grid-outline"
              containerStyle={{ marginBottom: 12 }}
            />

            <Text style={styles.label}>Detailed Problem Description *</Text>
            <TextInput
              style={[styles.input, { height: 105, textAlignVertical: 'top' }]}
              multiline
              placeholder="Describe the ground situation, root cause if known, and how it impacts daily life..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
            />

            {!user && (
              <>
                <Text style={styles.label}>Your Name / Organization (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ramesh Mahto"
                  placeholderTextColor="#94a3b8"
                  value={guestName}
                  onChangeText={setGuestName}
                />

                <Text style={styles.label}>Your Contact Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. resident@jharkhand.gov.in"
                  placeholderTextColor="#94a3b8"
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.btn, (!title || !description) && { opacity: 0.5 }]}
              disabled={!title || !description}
              onPress={() => setStep(2)}
            >
              <Text style={styles.btnText}>Next: District & Geotag →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 2: District & Geotag */}
      {step === 2 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderBar}>
            <Text style={styles.cardHeaderTitle}>STEP 2: GEOTAG & JHARKHAND DISTRICT</Text>
          </View>

          <View style={styles.cardBody}>
            <TouchableOpacity
              style={[styles.gpsBtn, isGps && styles.gpsBtnSuccess]}
              onPress={handleGetLocation}
              disabled={gpsLoading}
            >
              {gpsLoading ? (
                <ActivityIndicator color="#0f2c59" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={isGps ? 'checkmark-circle' : 'navigate'}
                    size={17}
                    color={isGps ? '#15803d' : '#0f2c59'}
                  />
                  <Text style={[styles.gpsBtnText, isGps && styles.gpsBtnTextSuccess]}>
                    {isGps
                      ? 'GPS Pinpoint Verified (Tap to Recalibrate)'
                      : 'Use My Current GPS Coordinates'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <SelectDropdown
              label="District (All Districts of Jharkhand) *"
              placeholder="Select District"
              value={district}
              options={JHARKHAND_DISTRICTS}
              onSelect={handleSelectDistrict}
              icon="location-outline"
              searchable
              containerStyle={{ marginBottom: 12 }}
            />

            <Text style={styles.label}>Specific Location / Block / Village *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Arsande Village, Kanke Block"
              placeholderTextColor="#94a3b8"
              value={locationText}
              onChangeText={setLocationText}
            />

            {/* Interactive Geotag Map Preview */}
            <View style={styles.mapPreviewCard}>
              <View style={styles.mapHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons
                    name={isGps ? 'navigate' : 'location'}
                    size={15}
                    color={isGps ? '#0284c7' : '#0f2c59'}
                  />
                  <Text style={styles.mapTitle}>
                    {isGps ? 'Precise GPS Pinpoint' : `${district} District Center`}
                  </Text>
                </View>
                <Text style={styles.mapCoordsText}>
                  {coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°
                </Text>
              </View>
              <LeafletWebViewMap
                singlePoint={{
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                  title: title || `${district} Problem Site`,
                  location: locationText || `${district}, Jharkhand`,
                  isGps,
                }}
                height={170}
                zoom={isGps ? 14 : 11}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => setStep(3)}>
                <Text style={styles.btnText}>Next: Impact & Photo →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Step 3: Affected People Select, Urgency & Cloudinary Photo Upload */}
      {step === 3 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderBar}>
            <Text style={styles.cardHeaderTitle}>STEP 3: IMPACT SCALE & CLOUDINARY PHOTO</Text>
          </View>

          <View style={styles.cardBody}>
            {/* Select Dropdown for Estimated Affected People (matches website <select>) */}
            <SelectDropdown
              label="Estimated Affected People *"
              placeholder="Select Affected Population Scale"
              value={affectedPeople}
              options={AFFECTED_PEOPLE_OPTIONS}
              onSelect={setAffectedPeople}
              icon="people-outline"
              searchable={false}
              containerStyle={{ marginBottom: 14 }}
            />

            <Text style={styles.label}>Perceived Urgency Level *</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.urgencyBtn, urgency === u && styles.urgencyBtnActive]}
                  onPress={() => setUrgency(u)}
                >
                  <Text style={[styles.urgencyText, urgency === u && styles.urgencyTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Field Photo / Visual Evidence (Cloudinary Upload)</Text>
            <View style={styles.photoButtonRow}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={handlePickImage}
                disabled={uploadingImage}
              >
                <Ionicons name="images-outline" size={16} color="#0f2c59" />
                <Text style={styles.photoActionBtnText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={handleTakePhoto}
                disabled={uploadingImage}
              >
                <Ionicons name="camera-outline" size={16} color="#0f2c59" />
                <Text style={styles.photoActionBtnText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            {imageUri ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImg} />
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.uploadingText}>Uploading to Cloudinary...</Text>
                  </View>
                )}
                {!uploadingImage && uploadedImageUrl ? (
                  <View style={styles.cloudBadge}>
                    <Ionicons name="cloud-done" size={12} color="#ffffff" />
                    <Text style={styles.cloudBadgeText}>
                      {uploadProvider === 'cloudinary' ? 'Cloudinary Verified' : 'Photo Ready'}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.removeImgBtn} onPress={handleRemoveImage}>
                  <Ionicons name="close" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoDropzone} onPress={handlePickImage}>
                <Ionicons name="cloud-upload-outline" size={26} color="#64748b" />
                <Text style={styles.photoDropzoneTitle}>
                  Tap to upload or capture field photo
                </Text>
                <Text style={styles.photoDropzoneSub}>
                  Automatically hosted via Cloudinary CDN
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { flex: 1, backgroundColor: '#f59e0b' }]}
                disabled={submitting || uploadingImage}
                onPress={handleSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#0f172a" size="small" />
                ) : (
                  <Text style={[styles.btnText, { color: '#0f172a', fontWeight: '800' }]}>
                    Submit Challenge Report →
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f2c59',
    letterSpacing: 0.6,
  },
  eyebrowDot: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  eyebrowSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  bannerTitle: {
    fontSize: 17,
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    fontWeight: '800',
  },
  stepNumActive: {
    backgroundColor: '#0f2c59',
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#0f2c59',
    fontWeight: '800',
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: '#0f2c59',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 10,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  gpsBtnSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  gpsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  gpsBtnTextSuccess: {
    color: '#15803d',
  },
  mapPreviewCard: {
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mapTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  mapCoordsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  urgencyBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  urgencyBtnActive: {
    backgroundColor: '#0f2c59',
    borderColor: '#0f2c59',
  },
  urgencyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  urgencyTextActive: {
    color: '#ffffff',
  },
  photoButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  photoActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  photoDropzone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  photoDropzoneTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6,
  },
  photoDropzoneSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  previewBox: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  previewImg: {
    width: '100%',
    height: 165,
    resizeMode: 'cover',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  cloudBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(4, 120, 87, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cloudBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    backgroundColor: '#0f2c59',
    borderRadius: 6,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  userBannerText: {
    fontSize: 11,
    color: '#0f2c59',
    flex: 1,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  guestBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  guestBannerLink: {
    fontSize: 10.5,
    color: '#1d4ed8',
    fontWeight: '600',
    marginTop: 2,
  },
});
