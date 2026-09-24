import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

export const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss splash screen after 1.6s
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f2c59" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Official Website Emblem: Devanagari 'स' */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemBox}>
            <Text style={styles.emblemChar}>स</Text>
          </View>
        </View>

        {/* Brand Titles */}
        <Text style={styles.brandTitle}>SamadhanSetu</Text>
        <Text style={styles.stateTag}>GOVERNMENT OF JHARKHAND</Text>
        <Text style={styles.tagline}>
          Civic Problem-Solving & University Innovation Network
        </Text>

        {/* Loading Indicator */}
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#38bdf8" />
          <Text style={styles.loadingText}>Initializing Civic Grid...</Text>
        </View>
      </Animated.View>

      {/* Footer Meta */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Department of Higher Education & Civic Administration
        </Text>
        <Text style={styles.versionText}>v1.0.0 • State Edition</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f2c59',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  emblemContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  emblemBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemChar: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0f2c59',
    includeFontPadding: false,
    textAlign: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  stateTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 10,
    lineHeight: 17,
  },
  loaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 36,
  },
  loadingText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
    marginTop: 3,
  },
});
