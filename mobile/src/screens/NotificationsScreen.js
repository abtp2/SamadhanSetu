import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { mobileApi } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';

const DEMO_NOTIFICATIONS = [
  {
    _id: 'demo-1',
    title: 'Challenge Adopted by BIT Mesra!',
    message:
      'Student team AquaSetu adopted your Kanke water report. Field work has commenced.',
    type: 'ADOPTED',
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    _id: 'demo-2',
    title: 'Verification Complete',
    message:
      'Government Admin verified your challenge and published it for university adoption.',
    type: 'VERIFIED',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'demo-3',
    title: 'CSR Grant Proposal Approved',
    message:
      'Tata Steel CSR Foundation committed ₹1,50,000 for field prototype deployment.',
    type: 'FUNDING',
    isRead: true,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
];

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'VERIFIED':
      return { name: 'shield-checkmark-outline', color: '#047857', bg: '#ecfdf5' };
    case 'ADOPTED':
      return { name: 'school-outline', color: '#0f2c59', bg: '#eff6ff' };
    case 'FUNDING':
      return { name: 'ribbon-outline', color: '#b45309', bg: '#fffbeb' };
    default:
      return { name: 'notifications-outline', color: '#0f2c59', bg: '#eff6ff' };
  }
};

export const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await mobileApi.get('/notifications');
      if (res.success && res.notifications?.length > 0) {
        setNotifications(res.notifications);
      }
    } catch (_) {
      // Keep fallback demo notifications
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifs();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await mobileApi.patch('/notifications/read-all');
    } catch (_) {}
  };

  const handleDismiss = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await mobileApi.delete(`/notifications/${id}`);
    } catch (_) {}
  };

  const handlePressNotification = async (item) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
      );
      try {
        await mobileApi.patch(`/notifications/${item._id}/read`);
      } catch (_) {}
    }

    if (item.relatedProjectId) {
      navigation.navigate('ProjectDetail', { id: item.relatedProjectId });
    } else if (item.relatedChallengeId) {
      navigation.navigate('ChallengeDetail', { id: item.relatedChallengeId });
    } else if (item.link) {
      if (item.link.includes('/projects/')) {
        const pid = item.link.split('/projects/')[1];
        if (pid) navigation.navigate('ProjectDetail', { id: pid });
      } else if (item.link.includes('/challenges/')) {
        const cid = item.link.split('/challenges/')[1];
        if (cid) navigation.navigate('ChallengeDetail', { id: cid });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Strip */}
      <View style={styles.topHeader}>
        <View style={styles.topLeft}>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadPill}>
              <Text style={styles.unreadPillText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.75}
          >
            <Ionicons name="checkmark-done" size={14} color="#0f2c59" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="notifications-off-outline" size={24} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>
              Updates on your challenges and projects will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const iconCfg = getTypeIcon(item.type);
          return (
            <TouchableOpacity
              style={[styles.card, !item.isRead && styles.cardUnread]}
              activeOpacity={0.82}
              onPress={() => handlePressNotification(item)}
            >
              <View style={[styles.iconBox, { backgroundColor: iconCfg.bg }]}>
                <Ionicons name={iconCfg.name} size={17} color={iconCfg.color} />
              </View>

              <View style={styles.cardMain}>
                <View style={styles.cardTopRow}>
                  <Text
                    style={[styles.title, !item.isRead && styles.titleUnread]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.timeText}>
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                  {(item.relatedChallengeId || item.relatedProjectId || item.link) && (
                    <Text style={styles.viewLinkText}>View details →</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => handleDismiss(item._id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={15} color="#94a3b8" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  unreadPill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f2c59',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: '#f8fbff',
    borderColor: '#bfdbfe',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  cardMain: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 3,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: '#0f172a',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0f2c59',
  },
  message: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  viewLinkText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f2c59',
  },
  dismissBtn: {
    padding: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
  },
  emptyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  emptySub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
});
