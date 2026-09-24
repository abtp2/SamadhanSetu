import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIORITY_CONFIG = {
  LOW: { label: 'LOW', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  MEDIUM: { label: 'MEDIUM', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  HIGH: { label: 'HIGH', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  URGENT: { label: 'URGENT', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  CRITICAL: { label: 'CRITICAL', bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
};

export const PriorityBadge = ({ priority = 'MEDIUM' }) => {
  const p = (priority || 'MEDIUM').toUpperCase();
  const cfg = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.MEDIUM;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
