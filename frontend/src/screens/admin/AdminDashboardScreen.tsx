import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const MENU_ITEMS = [
  { icon: 'account-multiple', label: 'User Management', screen: 'ManageUsers', accent: '#2563eb' },
  { icon: 'shield-check', label: 'Provider Approval', screen: 'ManageUsers', params: { filterRole: 'service_provider' }, accent: '#7c3aed' },
  { icon: 'calendar-check', label: 'Booking Management', screen: 'ManageBookings', accent: '#0f766e' },
  { icon: 'briefcase', label: 'Manage Services', screen: 'ManageServices', accent: '#1f7a4d' },
  { icon: 'percent', label: 'Commission Management', screen: 'CommissionManagement', accent: '#d97706' },
  { icon: 'credit-card-outline', label: 'Payment Monitoring', screen: 'PaymentMonitoring', accent: '#0ea5e9' },
  { icon: 'cash-refund', label: 'Refund Approval', screen: 'RefundApproval', accent: '#dc2626' },
  { icon: 'flag-outline', label: 'Content Moderation', screen: 'ContentModeration', accent: '#db2777' },
  { icon: 'chart-bar', label: 'Reports Management', screen: 'ReportsManagement', accent: '#4c51bf' },
  { icon: 'shape', label: 'Category Management', screen: 'CategoryManagement', accent: '#b45309' },
  { icon: 'ticket-percent', label: 'Coupon Management', screen: 'CouponManagement', accent: '#16a34a' },
  { icon: 'bullhorn', label: 'Promotions', screen: 'PromotionsManagement', accent: '#9333ea' },
  { icon: 'chart-line', label: 'Analytics Dashboard', screen: 'AnalyticsDashboard', accent: '#0f766e' },
  { icon: 'bell-outline', label: 'Notification Management', screen: 'NotificationManagement', accent: '#ec4899' },
  { icon: 'file-document-outline', label: 'CMS Pages', screen: 'CMSManagement', accent: '#64748b' },
  { icon: 'clipboard-list-outline', label: 'Audit Logs', screen: 'AuditLogs', accent: '#374151' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then((r) => setStats(r.stats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading />;

  const statCards = [
    { icon: 'account-multiple', label: 'Total Users', value: stats?.users.total || 0, accent: '#2563eb', bg: isDark ? '#1e3a5f' : '#eff6ff' },
    { icon: 'calendar-check', label: 'Completed', value: stats?.bookings.completed || 0, accent: '#1f7a4d', bg: isDark ? '#14532d' : '#f0fdf4' },
    { icon: 'clock-outline', label: 'Pending', value: stats?.bookings.pending || 0, accent: '#d97706', bg: isDark ? '#451a03' : '#fffbeb' },
    { icon: 'currency-usd', label: 'Revenue', value: `₦${((stats?.revenue.total || 0) / 1000000).toFixed(1)}M`, accent: '#dc2626', bg: isDark ? '#450a0a' : '#fff1f2' },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero Header */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Text style={styles.eyebrow}>ADMIN PANEL</Text>
          <Text style={styles.heroTitle}>Dashboard</Text>
          <Text style={styles.heroSubtitle}>Event Compass Management</Text>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg, borderColor: colors.border }]}>
              <MaterialCommunityIcons name={s.icon as any} size={24} color={s.accent} />
              <Text style={[styles.statValue, { color: s.accent, fontFamily: appFont }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted, fontFamily: appFont }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today Summary */}
        <View style={[styles.todayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: appFont }]}>Today</Text>
          <View style={styles.todayRow}>
            {[
              { label: 'Bookings', value: stats?.today.bookings || 0 },
              { label: 'Revenue', value: `₦${(stats?.today.revenue || 0).toLocaleString()}` },
              { label: 'Providers', value: stats?.users.serviceProviders || 0 },
            ].map((item) => (
              <View key={item.label} style={styles.todayItem}>
                <Text style={[styles.todayValue, { color: colors.text, fontFamily: appFont }]}>{item.value}</Text>
                <Text style={[styles.todayLabel, { color: colors.muted, fontFamily: appFont }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Management Menu */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: appFont, marginBottom: 12 }]}>Management</Text>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen + item.label}
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate(item.screen, item.params)}
            activeOpacity={0.82}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.accent}18` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={item.accent} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text, fontFamily: appFont }]}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  hero: { borderRadius: 28, padding: 24, marginTop: 8, marginBottom: 16 },
  eyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 20, borderWidth: 1, padding: 14 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  todayCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  todayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  todayItem: { alignItems: 'center' },
  todayValue: { fontSize: 20, fontWeight: '800' },
  todayLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  menuItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 10 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },
});
