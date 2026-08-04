/**
 * Bookings Screen
 * Premium booking management with a marketplace-inspired layout.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';

export default function BookingsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('active');
  const { user } = useAuthStore();
  const { bookings, getMyClientBookings, getMyProviderBookings, isLoading } = useBookingStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const latestBooking = bookings?.[0] || null;

  const colors = {
    bg: isDark ? '#0b120d' : '#f5f7f2',
    surface: isDark ? '#151c16' : '#ffffff',
    surfaceAlt: isDark ? '#1d261f' : '#f3f6ef',
    text: isDark ? '#f4f8f1' : '#0f172a',
    muted: isDark ? '#9fb1a3' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  useEffect(() => {
    const status = selectedTab === 'cancelled' ? 'cancelled' : selectedTab === 'completed' ? 'completed' : user?.role === 'service_provider' ? 'confirmed' : 'pending';
    if (user?.role === 'service_provider') {
      getMyProviderBookings({ status });
    } else {
      getMyClientBookings({ status });
    }
  }, [selectedTab, user]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fff7ed', textColor: '#c2410c' };
      case 'confirmed':
        return { backgroundColor: '#eff6ff', textColor: '#2563eb' };
      case 'completed':
        return { backgroundColor: '#ecfdf3', textColor: '#15803d' };
      case 'cancelled':
        return { backgroundColor: '#fef2f2', textColor: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', textColor: '#4b5563' };
    }
  };

  const renderBookingItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity key={item._id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}> 
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{item.status?.toUpperCase()}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.service?.name || item.venue?.name || 'Booking'}</Text>
        <Text style={[styles.cardMeta, { color: colors.muted }]}>{item.bookingNumber || 'No reference'}</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>{new Date(item.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.eventTime || 'Flexible timing'}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="cash" size={18} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>₦{item.pricing?.totalAmount?.toLocaleString() || '0'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
          <Text style={styles.heroTitle}>My bookings</Text>
          <Text style={styles.heroSubtitle}>Stay on top of every event plan and client request.</Text>
        </View>

        {latestBooking && selectedTab === 'active' && latestBooking.status !== 'cancelled' && latestBooking.status !== 'completed' ? (
          <View style={[styles.successBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.successBadge}> 
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
            </View>
            <View style={styles.successContent}> 
              <Text style={[styles.successTitle, { color: colors.text }]}>Booking placed successfully</Text>
              <Text style={[styles.successCopy, { color: colors.muted }]}> 
                {latestBooking.bookingNumber || 'Your newest booking'} is ready to review.
                {latestBooking.payment?.status === 'pending' ? ' Payment is still pending.' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { bookingId: latestBooking._id })} style={[styles.successButton, { backgroundColor: colors.primary }]}> 
              <Text style={styles.successButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.tabsRow}>
          {[
            { key: 'active', label: 'Active', icon: 'clock-outline' },
            { key: 'completed', label: 'Completed', icon: 'check-circle-outline' },
            { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
          ].map((tab) => {
            const active = selectedTab === tab.key;
            return (
              <TouchableOpacity key={tab.key} onPress={() => setSelectedTab(tab.key)} style={[styles.tab, active ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <MaterialCommunityIcons name={tab.icon} size={16} color={active ? '#fff' : colors.muted} />
                <Text style={[styles.tabText, active ? { color: '#fff' } : { color: colors.text }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {bookings.length > 0 ? (
          <FlatList data={bookings} renderItem={renderBookingItem} keyExtractor={(item) => item._id} scrollEnabled={false} contentContainerStyle={styles.list} />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
            <MaterialCommunityIcons name="calendar-blank" size={66} color="#94a3b8" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No {selectedTab} bookings</Text>
            <Text style={[styles.emptyCopy, { color: colors.muted }]}>New bookings will be grouped here once they are created.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  hero: { borderRadius: 28, padding: 20, marginTop: 8, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 6 },
  successBanner: { borderRadius: 22, borderWidth: 1, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  successBadge: { width: 38, height: 38, borderRadius: 999, backgroundColor: 'rgba(31,122,77,0.12)', alignItems: 'center', justifyContent: 'center' },
  successContent: { flex: 1 },
  successTitle: { fontSize: 14, fontWeight: '800' },
  successCopy: { fontSize: 12, marginTop: 3, lineHeight: 18 },
  successButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  successButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1, paddingVertical: 10, gap: 6 },
  tabText: { fontSize: 13, fontWeight: '700' },
  list: { gap: 12 },
  card: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 10 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardMeta: { fontSize: 12, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  detailText: { fontSize: 13, fontWeight: '600' },
  emptyState: { borderRadius: 22, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptyCopy: { fontSize: 13, marginTop: 6, textAlign: 'center' },
});
