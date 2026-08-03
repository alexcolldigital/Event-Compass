import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';

export default function NotificationsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const isDark = theme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newslettersEnabled, setNewslettersEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setNotificationsEnabled(user.preferences.notifications ?? true);
      setNewslettersEnabled(user.preferences.newsletters ?? true);
    }
  }, [user]);

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        preferences: {
          notifications: notificationsEnabled,
          newsletters: newslettersEnabled,
        },
      });
      Alert.alert('Success', 'Notification preferences saved successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

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

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Email notifications</Text>
              <Text style={[styles.cardBody, { color: colors.muted }]}>Receive booking updates and service reminders by email.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#34d399' }}
              thumbColor={notificationsEnabled ? '#10b981' : '#f8fafc'}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Newsletter emails</Text>
              <Text style={[styles.cardBody, { color: colors.muted }]}>Receive occasional updates, tips, and new service alerts.</Text>
            </View>
            <Switch
              value={newslettersEnabled}
              onValueChange={setNewslettersEnabled}
              trackColor={{ false: '#d1d5db', true: '#34d399' }}
              thumbColor={newslettersEnabled ? '#10b981' : '#f8fafc'}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>What changes here</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>These settings are saved to your account and used by the server to control email delivery.</Text>
        </View>

        <Button
          title={isSaving ? 'Saving...' : 'Save preferences'}
          onPress={handleSavePreferences}
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
  content: { padding: 16, paddingBottom: 32 },
  header: { borderRadius: 28, padding: 22, marginBottom: 18 },
  backButton: { width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 14 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardBody: { fontSize: 14, lineHeight: 22 },
});
