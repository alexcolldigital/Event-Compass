/**
 * Home Screen
 * Minimalist marketplace experience with bento-inspired cards and rich imagery.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import { useServiceStore } from '../../context/serviceStore.js';
import { useCartStore } from '../../context/cartStore';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { MarketplaceCard, FeatureCard, StatCard } from '../../components/Card.jsx';
import { useTheme } from '../../context/ThemeContext';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const featureCategories = [
  { icon: <MaterialCommunityIcons name="map-marker-radius" size={24} color="#2f855a" />, title: 'Venues', description: 'Stunning, curated locations', count: 450, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="food-fork-drink" size={24} color="#4c51bf" />, title: 'Catering', description: 'Premium culinary experiences', count: 320, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="party-popper" size={24} color="#d97706" />, title: 'Entertainment', description: 'Live bands and DJs', count: 280, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="auto-fix" size={24} color="#db2777" />, title: 'Decor', description: 'Floral and ambient styling', count: 380, variant: 'gradient' },
  { icon: <MaterialCommunityIcons name="camera-iris" size={24} color="#0f766e" />, title: 'Photography', description: 'Modern content capture', count: 190, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="van-utility" size={24} color="#2563eb" />, title: 'Transport', description: 'Reliable guest mobility', count: 160, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="cake-variant" size={24} color="#b45309" />, title: 'Desserts', description: 'Custom celebration cakes', count: 120, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="speaker" size={24} color="#7c3aed" />, title: 'AV & Light', description: 'Sound and lighting setup', count: 95, variant: 'gradient' },
];

const stats = [
  { value: '15K+', label: 'Events Completed', icon: <MaterialCommunityIcons name="calendar-star" size={22} color="#1f7a4d" />, trend: '+12%', trendUp: true },
  { value: '2.5K+', label: 'Verified Vendors', icon: <MaterialCommunityIcons name="shield-check" size={22} color="#2563eb" />, trend: '+8%', trendUp: true },
  { value: '50K+', label: 'Happy Customers', icon: <MaterialCommunityIcons name="account-group" size={22} color="#d97706" />, trend: '+15%', trendUp: true },
  { value: '4.9/5', label: 'Average Rating', icon: <MaterialCommunityIcons name="medal" size={22} color="#db2777" />, trend: '+0.1', trendUp: true },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthStore();
  const { services, getAllServices, isLoading, error } = useServiceStore();
  const { items } = useCartStore();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [searchInput, setSearchInput] = useState('');

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  useEffect(() => {
    getAllServices({ limit: 8 }).catch(() => {});
  }, []);

  const handleTabNavigate = (routeName: string, params?: Record<string, unknown>) => {
    const parent = navigation.getParent?.();
    const topNav = parent?.getParent?.() || parent;

    if (topNav?.navigate) {
      if (routeName === 'Search') {
        topNav.navigate(routeName, {
          screen: 'SearchScreen',
          params,
        });
      } else if (routeName === 'ProviderServices') {
        topNav.navigate('Profile', {
          screen: 'ProviderServices',
          params,
        });
      } else {
        topNav.navigate(routeName as any);
      }
      return;
    }

    if (routeName === 'Search') {
      navigation.navigate('SearchScreen', params);
    } else if (routeName === 'ProviderServices') {
      navigation.navigate(routeName as any, params);
    } else {
      navigation.navigate(routeName as any);
    }
  };

  const handleSearch = () => {
    const query = searchInput.trim();
    handleTabNavigate('Search', { initialQuery: query || undefined });
  };

  const handleCategoryPress = (categoryName: string) => {
    handleTabNavigate('Search', { initialCategory: categoryName });
  };

  const handleRefresh = async () => {
    try {
      await getAllServices({ limit: 8 });
    } catch (err) {
      // The store already surfaces the error state.
    }
  };

  if (isLoading && services.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}> 
        <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>
              <Text style={styles.heroTitle}>{user?.firstName || 'Guest'}</Text>
              <Text style={styles.heroSubtitle}>Ready to book premium services?</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Checkout' as never)}>
              <MaterialCommunityIcons name="cart-outline" size={22} color="#fff" />
              {items.length > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{items.length}</Text></View> : null}
            </TouchableOpacity>
          </View>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <MaterialCommunityIcons name="magnify" size={22} color={colors.primary} />
            <TextInput
              placeholder="Search venues, catering, DJs..."
              placeholderTextColor={colors.muted}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              style={[styles.searchText, { color: colors.text }]}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch}>
              <MaterialCommunityIcons name="arrow-right-circle" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <ErrorMessage error={error} />
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleRefresh} style={styles.iconAction}>
                <MaterialCommunityIcons name="refresh" size={18} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconAction}>
                <MaterialCommunityIcons name={isDark ? 'weather-sunny' : 'weather-night'} size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.quickGrid}>
            {[
              { label: 'Explore', icon: 'magnify', screen: 'Search', accent: '#1f7a4d' },
              { label: 'Bookings', icon: 'calendar-check', screen: 'Bookings', accent: '#7c3aed' },
              { label: 'Profile', icon: 'account', screen: 'Profile', accent: '#ec4899' },
              ...(user?.role === 'service_provider' ? [{ label: 'Add Service', icon: 'briefcase-plus', screen: 'ProviderServices', accent: '#16a34a', params: { showForm: true } }] : []),
            ].map((item) => (
              <TouchableOpacity key={item.label} style={[styles.quickCard, { backgroundColor: item.accent }]} onPress={() => handleTabNavigate(item.screen, item.params)}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color="#fff" />
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlights</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <StatCard key={index} value={stat.value} label={stat.label} icon={stat.icon} trend={stat.trend} trendUp={stat.trendUp} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Categories</Text>
            <TouchableOpacity onPress={() => handleTabNavigate('Search')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {featureCategories.map((category, index) => (
              <FeatureCard key={index} icon={category.icon} title={category.title} description={category.description} count={category.count} variant={category.variant} onPress={() => handleCategoryPress(category.title)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
            <TouchableOpacity onPress={() => handleTabNavigate('Search')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
          </View>
          {services.length > 0 ? (
            <View style={styles.marketplaceGrid}>
              {services.map((service: any) => (
                <MarketplaceCard key={service._id} image={service.images?.[0]?.url} title={service.name} subtitle={service.category} rating={service.averageRating || 4.5} reviewCount={service.totalReviews || 0} price={service.pricing?.basePrice || 0} unit={service.unit || 'booking'} category={service.serviceType} badge={service.availability?.isAvailable === false ? 'Unavailable' : 'Available'} onPress={() => navigation.navigate('ServiceDetail', { serviceId: service._id })} style={{ backgroundColor: colors.surface, borderColor: colors.border }} />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
              <MaterialCommunityIcons name="inbox-outline" size={54} color="#94a3b8" />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No services available yet</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleTabNavigate('Search')}>
          <View style={styles.bannerBadge}><Text style={styles.bannerBadgeText}>NEW</Text></View>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Limited time offers for premium bookers</Text>
          <Text style={[styles.bannerCopy, { color: colors.muted }]}>Discover exclusive discounts, seasonal packages, and fast booking availability.</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 32, paddingHorizontal: 16 },
  hero: { borderRadius: 28, padding: 20, marginTop: 8, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 6, fontFamily: appFont },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 14, marginTop: 6, fontFamily: appFont },
  iconButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#fef3c7', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  cartBadgeText: { color: '#92400e', fontSize: 11, fontWeight: '800' },
  searchBar: { marginTop: 16, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchText: { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: appFont },
  errorWrap: { marginBottom: 10 },
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconAction: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.05)' },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: appFont },
  linkText: { fontSize: 13, fontWeight: '700', fontFamily: appFont },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, borderRadius: 20, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', minHeight: 104 },
  quickLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 8, fontFamily: appFont },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  marketplaceGrid: { gap: 12 },
  emptyCard: { borderRadius: 22, borderWidth: 1, paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700', marginTop: 10, fontFamily: appFont },
  banner: { borderRadius: 24, borderWidth: 1, padding: 18, marginTop: 8 },
  bannerBadge: { alignSelf: 'flex-start', backgroundColor: '#ecfdf3', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8 },
  bannerBadgeText: { color: '#1f7a4d', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6, fontFamily: appFont },
  bannerCopy: { fontSize: 13, lineHeight: 18, fontFamily: appFont },
});
