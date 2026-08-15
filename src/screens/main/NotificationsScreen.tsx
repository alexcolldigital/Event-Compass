import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import { authAPI } from '../../services/api';
import { navigationRef } from '../../navigation/navigationRef';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_TYPES = [
  {
    key: 'bookingUpdates',
    icon: 'calendar-check',
    title: 'Booking Updates',
    body: 'Get notified when your booking status changes.',
  },
  {
    key: 'paymentConfirmation',
    icon: 'credit-card-check',
    title: 'Payment Confirmation',
    body: 'Receive alerts when payments are processed.',
  },
  {
    key: 'bookingReminder',
    icon: 'bell-ring',
    title: 'Booking Reminder',
    body: 'Reminders 24 hours before your event.',
  },
  {
    key: 'cancellationAlert',
    icon: 'calendar-remove',
    title: 'Cancellation Alerts',
    body: 'Be informed immediately if a booking is cancelled.',
  },
  {
    key: 'promotional',
    icon: 'tag-heart',
    title: 'Promotional Notifications',
    body: 'Deals, offers, and new services on Event Compass.',
  },
  {
    key: 'newMessage',
    icon: 'message-text',
    title: 'New Message Notifications',
    body: 'Get push alerts when you receive a new message.',
  },
];

const DEFAULT_PREFS = {
  bookingUpdates: true,
  paymentConfirmation: true,
  bookingReminder: true,
  cancellationAlert: true,
  promotional: true,
  newMessage: true,
};

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const isDark = theme === 'dark';

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newslettersEnabled, setNewslettersEnabled] = useState(true);
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
    section: isDark ? '#172033' : '#f3f6ef',
  };

  useEffect(() => {
    if (user?.preferences) {
      setEmailEnabled(user.preferences.notifications ?? true);
      setNewslettersEnabled(user.preferences.newsletters ?? true);
      if (user.preferences.pushPrefs) {
        setPrefs({ ...DEFAULT_PREFS, ...user.preferences.pushPrefs });
      }
    }
    registerForPushNotifications();
    loadFeed();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      loadFeed();
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.bookingId) {
        // Navigate using navigationRef to avoid stack issues
        if (navigationRef.isReady()) {
          navigationRef.navigate('Bookings' as never, { screen: 'BookingDetail', params: { bookingId: data.bookingId } } as never);
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user]);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const res: any = await authAPI.getMyNotifications({ limit: 30 });
      setFeedItems(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (_) {}
    setFeedLoading(false);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await authAPI.markNotificationRead(id);
      setFeedItems((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await authAPI.markAllNotificationsRead();
      setFeedItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      setPushEnabled(false);
      return;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1f7a4d',
      });
    }
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      if (tokenData?.data) {
        await authAPI.saveFcmToken(tokenData.data);
      }
    } catch (_) {}
  };

  const togglePref = (key: string) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        preferences: {
          notifications: emailEnabled,
          newsletters: newslettersEnabled,
          pushPrefs: prefs,
        },
      });
      Alert.alert('Saved', 'Notification preferences updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSwitch = (value: boolean, onChange: (v: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#d1d5db', true: '#34d399' }}
      thumbColor={value ? '#10b981' : '#f8fafc'}
    />
  );

  const NOTIF_ICONS: Record<string, string> = {
    booking_accepted: 'calendar-check',
    booking_rejected: 'calendar-remove',
    booking_update: 'calendar-clock',
    payment_confirmation: 'credit-card-check',
    deposit_paid: 'cash-check',
    booking_reminder: 'bell-ring',
    cancellation_alert: 'calendar-remove',
    promotional: 'tag-heart',
    new_message: 'message-text',
    general: 'bell',
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Manage how Event Compass keeps you informed.</Text>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
              Feed {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'feed' ? (
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={feedLoading} onRefresh={loadFeed} tintColor={colors.primary} />}
          contentContainerStyle={[styles.content, feedItems.length === 0 && styles.emptyContainer]}
          ListHeaderComponent={
            feedItems.length > 0 && unreadCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            !feedLoading ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>No notifications yet</Text>
              </View>
            ) : <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          }
          renderItem={({ item }) => {
            const icon = NOTIF_ICONS[item.notifType] || 'bell';
            const isUnread = !item.isRead;
            return (
              <TouchableOpacity
                style={[styles.feedItem, { backgroundColor: isUnread ? (isDark ? '#1a2744' : '#f0fdf4') : colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  if (isUnread) handleMarkRead(item._id);
                  if (item.relatedId && ['booking_accepted','booking_rejected','booking_update','cancellation_alert','payment_confirmation','deposit_paid','booking_reminder'].includes(item.notifType)) {
                    if (navigationRef.isReady()) {
                      navigationRef.navigate('Bookings' as never, { screen: 'BookingDetail', params: { bookingId: item.relatedId } } as never);
                    }
                  }
                }}
              >
                <View style={[styles.feedIconWrap, { backgroundColor: isUnread ? colors.primary : colors.section }]}>
                  <MaterialCommunityIcons name={icon as any} size={20} color={isUnread ? '#fff' : colors.muted} />
                </View>
                <View style={styles.feedText}>
                  <Text style={[styles.feedTitle, { color: colors.text, fontWeight: isUnread ? '700' : '500' }]}>{item.title}</Text>
                  <Text style={[styles.feedBody, { color: colors.muted }]}>{item.message}</Text>
                  <Text style={[styles.feedTime, { color: colors.muted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Email & Newsletter */}
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>EMAIL</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Email notifications</Text>
                <Text style={[styles.rowBody, { color: colors.muted }]}>Booking updates and service reminders.</Text>
              </View>
              {renderSwitch(emailEnabled, setEmailEnabled)}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Newsletter emails</Text>
                <Text style={[styles.rowBody, { color: colors.muted }]}>Tips, updates, and new service alerts.</Text>
              </View>
              {renderSwitch(newslettersEnabled, setNewslettersEnabled)}
            </View>
          </View>

          {/* Push Notifications */}
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>PUSH NOTIFICATIONS</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {NOTIFICATION_TYPES.map((item, index) => (
              <View key={item.key}>
                <View style={styles.row}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={colors.primary}
                    style={styles.icon}
                  />
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.rowBody, { color: colors.muted }]}>{item.body}</Text>
                  </View>
                  {renderSwitch(prefs[item.key], () => togglePref(item.key))}
                </View>
                {index < NOTIFICATION_TYPES.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>

          <Button
            title={isSaving ? 'Saving...' : 'Save preferences'}
            onPress={handleSave}
            variant="primary"
            fullWidth
            isLoading={isSaving}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  emptyContainer: { flexGrow: 1 },
  header: { borderRadius: 28, padding: 22, marginBottom: 4, margin: 16 },
  backButton: {
    width: 44, height: 44, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#1f7a4d', fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowBody: { fontSize: 13, lineHeight: 18 },
  icon: { marginRight: 12 },
  divider: { height: 1, marginHorizontal: -16 },
  markAllBtn: { alignSelf: 'flex-end', marginBottom: 8, paddingHorizontal: 4 },
  markAllText: { fontSize: 13, fontWeight: '700' },
  feedItem: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  feedIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  feedText: { flex: 1 },
  feedTitle: { fontSize: 14, marginBottom: 2 },
  feedBody: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  feedTime: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15 },
});
