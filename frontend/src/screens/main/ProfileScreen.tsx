/**
 * Profile Screen
 * Clean profile workspace with curated account controls and a polished layout.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, StyleSheet, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import { useTheme } from '../../context/ThemeContext';
import { messageAPI } from '../../services/api.js';
import { useResponsive } from '../../utils/responsive';

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

  const { theme, preference, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const isDark = theme === 'dark';
  const { user, logout, isLoading } = useAuthStore();
  const [contactingSupport, setContactingSupport] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const { hPad, cols, colWidth } = useResponsive();
  const numStatCols = cols({ base: 3, sm: 3, md: 3 });
  const statW = colWidth(numStatCols, 10);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try { await logout(); } catch (error) { console.error('Logout failed', error); }
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
          <View style={styles.avatarWrap}>
            {user?.profileImage?.url ? <Image source={{ uri: user.profileImage.url }} style={styles.avatar} /> : <MaterialCommunityIcons name="account" size={70} color="#1f7a4d" />}
          </View>
          <Text style={styles.heroName}>{user?.firstName || 'Guest'} {user?.lastName || ''}</Text>
          <Text style={styles.heroRole}>{user?.role === 'service_provider' ? 'Service Provider' : 'Client'}</Text>
          {user?.businessName ? <Text style={styles.heroBusiness}>{user.businessName}</Text> : null}
        </View>

        {user?.role === 'service_provider' ? (
          <View style={[styles.statsRow, { flexWrap: 'wrap' }]}>
            {[{ label: 'Total Bookings', value: user.totalBookings || 0, icon: 'briefcase' }, { label: 'Rating', value: user.averageRating?.toFixed(1) || '0', icon: 'star' }, { label: 'Completed', value: user.completedBookings || 0, icon: 'check-circle' }].map((item) => (
              <View key={item.label} style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border, width: statW }]}> 
                <MaterialCommunityIcons name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account settings</Text>

          <View style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#6366f115' }]}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={22} color="#6366f1" />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Appearance</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['light', 'dark', 'system'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => opt === 'light' ? setLightTheme() : opt === 'dark' ? setDarkTheme() : setSystemTheme()}
                  style={[
                    styles.themeChip,
                    preference === opt && { backgroundColor: colors.primary },
                    preference !== opt && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.themeChipText, { color: preference === opt ? '#fff' : colors.muted }]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutButton}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="logout" size={32} color="#dc2626" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.muted }]}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} onPress={() => setShowLogoutModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={confirmLogout}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 96 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { width: 300, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 16 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 999, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  modalBtnDanger: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  modalBtnText: { fontSize: 15, fontWeight: '800' },
  otpInput: { width: '100%', borderWidth: 1.5, borderRadius: 12, fontSize: 28, fontWeight: '800', letterSpacing: 12, textAlign: 'center', paddingVertical: 14, marginBottom: 8 },
  otpError: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  themeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  themeChipText: { fontSize: 12, fontWeight: '700' },
});
