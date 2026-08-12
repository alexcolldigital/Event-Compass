import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import { authAPI } from '../../services/api';

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

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.bookingId) {
        navigation.navigate('BookingDetail', { bookingId: data.bookingId });
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user]);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'web') return;
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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Manage how Event Compass keeps you informed.</Text>
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { borderRadius: 28, padding: 22, marginBottom: 20 },
  backButton: {
    width: 44, height: 44, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowBody: { fontSize: 13, lineHeight: 18 },
  icon: { marginRight: 12 },
  divider: { height: 1, marginHorizontal: -16 },
});
