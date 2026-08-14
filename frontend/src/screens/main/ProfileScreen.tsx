/**
 * Profile Screen
 * Clean profile workspace with curated account controls and a polished layout.
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import { useTheme } from '../../context/ThemeContext';
import { messageAPI } from '../../services/api.js';

type ProfileScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

type MenuItem = {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [contactingSupport, setContactingSupport] = useState(false);

  const handleContactSupport = async () => {
    setContactingSupport(true);
    try {
      const res = await messageAPI.getAdminContacts();
      const admin = res.admins?.[0];
      if (!admin) {
        Alert.alert('Unavailable', 'No support agents are available right now.');
        return;
      }
      navigation.navigate('Chat', { receiver: admin });
    } catch {
      Alert.alert('Error', 'Could not connect to support. Please try again.');
    } finally {
      setContactingSupport(false);
    }
  };

  const colors = {
    bg: isDark ? '#0b120d' : '#f5f7f2',
    surface: isDark ? '#151c16' : '#ffffff',
    surfaceAlt: isDark ? '#1d261f' : '#f3f6ef',
    text: isDark ? '#f4f8f1' : '#0f172a',
    muted: isDark ? '#9fb1a3' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const menuItems: MenuItem[] = [
    ...(user?.role === 'admin' ? [{ icon: 'view-dashboard', label: 'Admin Dashboard', onPress: () => navigation.navigate('Admin' as never), color: '#1f7a4d' }] : []),
    { icon: 'account-edit', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile'), color: '#2563eb' },
    { icon: 'lock', label: 'Change Password', onPress: () => navigation.navigate('ChangePassword'), color: '#8b5cf6' },
    { icon: 'message-text', label: 'Messages', onPress: () => navigation.navigate('Conversations'), color: '#0ea5e9' },
    { icon: 'headset', label: 'Contact Support', onPress: handleContactSupport, color: '#f59e0b' },
    { icon: 'bell', label: 'Notifications', onPress: () => navigation.navigate('Notifications'), color: '#ec4899' },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport'), color: '#f59e0b' },
    ...(user?.role === 'service_provider' ? [{ icon: 'briefcase-plus', label: 'Manage Services', onPress: () => navigation.navigate('ProviderServices'), color: '#16a34a' }] : []),
    { icon: 'information', label: 'About', onPress: () => navigation.navigate('About'), color: '#0ea5e9' },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
          <View style={styles.avatarWrap}>
            {user?.profileImage?.url ? <Image source={{ uri: user.profileImage.url }} style={styles.avatar} /> : <MaterialCommunityIcons name="account" size={70} color="#1f7a4d" />}
          </View>
          <Text style={styles.heroName}>{user?.firstName || 'Guest'} {user?.lastName || ''}</Text>
          <Text style={styles.heroRole}>{user?.role === 'service_provider' ? 'Service Provider' : 'Client'}</Text>
          {user?.businessName ? <Text style={styles.heroBusiness}>{user.businessName}</Text> : null}
        </View>

        {user?.role === 'service_provider' ? (
          <View style={styles.statsRow}>
            {[{ label: 'Total Bookings', value: user.totalBookings || 0, icon: 'briefcase' }, { label: 'Rating', value: user.averageRating?.toFixed(1) || '0', icon: 'star' }, { label: 'Completed', value: user.completedBookings || 0, icon: 'check-circle' }].map((item) => (
              <View key={item.label} style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <MaterialCommunityIcons name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account settings</Text>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} onPress={item.onPress} style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}> 
                <MaterialCommunityIcons
                  name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={22}
                  color={item.color}
                />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              {item.label === 'Contact Support' && contactingSupport
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            handleLogout();
          }}
          style={styles.logoutButton}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  hero: { borderRadius: 28, padding: 24, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  avatarWrap: { width: 100, height: 100, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 999 },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroRole: { color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '700', marginTop: 6 },
  heroBusiness: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statTile: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 10 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
