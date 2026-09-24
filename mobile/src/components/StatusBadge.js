import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
  AI_ANALYZED: { label: 'AI Analyzed', bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#ebf3fe', text: '#2563eb', border: '#dbeafe' },
  VERIFIED: { label: 'Verified', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  ASSIGNED: { label: 'Assigned', bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  IN_PROGRESS: { label: 'In Progress', bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  SOLUTION_SUBMITTED: { label: 'Solution Sent', bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
  PILOTING: { label: 'Piloting', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  IMPLEMENTED: { label: 'Implemented', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  RESOLVED: { label: 'Resolved', bg: '#e8f8f0', text: '#10b981', border: '#bbf7d0' },
};

export const StatusBadge = ({ status, style, textStyle }) => {
  const normalizedKey = status ? String(status).toUpperCase().replace(/\s+/g, '_') : 'SUBMITTED';
  const cfg = STATUS_CONFIG[normalizedKey] || {
    label: status || 'Pending',
    bg: '#f8fafc',
    text: '#475569',
    border: '#e2e8f0',
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: cfg.text }, textStyle]}>
        {cfg.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
