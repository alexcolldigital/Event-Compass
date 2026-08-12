/**
 * Home Screen
 * Minimalist marketplace experience with bento-inspired cards and rich imagery.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import { useServiceStore } from '../../context/serviceStore.js';
import { useCartStore } from '../../context/cartStore';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { MarketplaceCard, FeatureCard, StatCard } from '../../components/Card.jsx';
import { useTheme } from '../../context/ThemeContext';
import { normalizeCartItem } from '../../utils/cartUtils';
import { serviceAPI } from '../../services/api.js';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const featureCategories = [
  { icon: <MaterialCommunityIcons name="tent" size={24} color="#2f855a" />, title: 'Canopies and Tent', description: 'Canopies, tents & marquees', count: 210, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="seat" size={24} color="#4c51bf" />, title: 'Chairs', description: 'Plastic, chivalry & bridal chairs', count: 340, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="table-furniture" size={24} color="#d97706" />, title: 'Tables', description: 'Plastic & banquet tables', count: 280, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="clipboard-list" size={24} color="#db2777" />, title: 'Event Planners and Managers', description: 'Full-service event planning', count: 180, variant: 'gradient' },
  { icon: <MaterialCommunityIcons name="store" size={24} color="#0f766e" />, title: 'Events Services Providers and Vendors', description: 'All-in-one event vendors', count: 420, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="handshake" size={24} color="#2563eb" />, title: 'Events Facilitators and Agents', description: 'Coordination & logistics', count: 95, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="account-star" size={24} color="#b45309" />, title: 'Special Events Hosts and Organizers', description: 'Hosts for special occasions', count: 110, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="home-city" size={24} color="#7c3aed" />, title: 'Events Venues', description: 'Halls, grounds & spaces', count: 450, variant: 'gradient' },
  { icon: <MaterialCommunityIcons name="palette" size={24} color="#db2777" />, title: 'Event Decorators', description: 'Floral & ambient styling', count: 380, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="face-woman-shimmer" size={24} color="#ec4899" />, title: 'Make-up Artists', description: 'Bridal & event make-up', count: 260, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="account-tie" size={24} color="#0f766e" />, title: 'Ushers', description: 'Professional event ushers', count: 140, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="shield-account" size={24} color="#374151" />, title: 'Bouncers', description: 'Security & crowd control', count: 90, variant: 'gradient' },
  { icon: <MaterialCommunityIcons name="warehouse" size={24} color="#b45309" />, title: 'Events Facilities Rental and Hiring Companies', description: 'Equipment & facility hire', count: 175, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="snowflake" size={24} color="#2563eb" />, title: 'Ice Chilling Services', description: 'Ice & chilling solutions', count: 60, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="truck-snowflake" size={24} color="#0f766e" />, title: 'Refrigerated Vans/Cooling Vans Providers', description: 'Cold chain transport', count: 45, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#4c51bf" />, title: 'Food Caterers', description: 'Premium culinary experiences', count: 320, variant: 'gradient' },
  { icon: <MaterialCommunityIcons name="bottle-wine" size={24} color="#7c3aed" />, title: 'Drinks Suppliers', description: 'Beverages for every event', count: 150, variant: 'primary' },
  { icon: <MaterialCommunityIcons name="music" size={24} color="#d97706" />, title: 'Music (D-J and Live Performances)', description: 'DJs & live bands', count: 280, variant: 'secondary' },
  { icon: <MaterialCommunityIcons name="microphone" size={24} color="#db2777" />, title: 'MCs and Compares', description: 'Masters of ceremony', count: 120, variant: 'accent' },
  { icon: <MaterialCommunityIcons name="emoticon-happy" size={24} color="#b45309" />, title: 'Comedians and Entertainers', description: 'Comedy & live entertainment', count: 85, variant: 'gradient' },
];



export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuthStore();
  const { services, getAllServices, isLoading, error } = useServiceStore();
  const { items, addItem } = useCartStore();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [searchInput, setSearchInput] = useState('');
  const [platformStats, setPlatformStats] = useState<{ completedBookings: number; verifiedVendors: number; totalClients: number; averageRating: string } | null>(null);
  const [categoryCountMap, setCategoryCountMap] = useState<Record<string, number>>({});

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
    serviceAPI.getPublicStats()
      .then((res: any) => {
        setPlatformStats(res.stats);
        const map = res.categoryCountMap || {};
        // If all counts are 0 (stats endpoint broken/empty), fetch counts per category
        const hasRealCounts = Object.keys(map).length > 0;
        if (hasRealCounts) {
          setCategoryCountMap(map);
        } else {
          fetchCategoryCountsFallback();
        }
      })
      .catch(() => fetchCategoryCountsFallback());
  }, []);

  const fetchCategoryCountsFallback = async () => {
    // Only fetch counts for the 5 visible categories to minimize requests
    const visibleTitles = featureCategories.slice(0, 5).map((c) => c.title);
    const results = await Promise.allSettled(
      visibleTitles.map((title) =>
        serviceAPI.getAllServices({ category: title, limit: 1 }).then((res: any) => ({
          title,
          count: res.pagination?.total ?? 0,
        }))
      )
    );
    const map: Record<string, number> = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled') map[r.value.title] = r.value.count;
    });
    setCategoryCountMap(map);
  };

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

  const handleAddToCart = (service: any) => {
    const cartItem = normalizeCartItem(service, 1);
    if (!cartItem) {
      return;
    }

    addItem(cartItem);
    Alert.alert('Added to cart', `${service.name} was added to your cart.`);
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
            <StatCard value={platformStats ? (platformStats.completedBookings >= 1000 ? `${(platformStats.completedBookings / 1000).toFixed(1)}K+` : `${platformStats.completedBookings}+`) : '—'} label="Events Completed" icon={<MaterialCommunityIcons name="calendar-check" size={22} color="#1f7a4d" />} />
            <StatCard value={platformStats ? `${platformStats.verifiedVendors}+` : '—'} label="Verified Vendors" icon={<MaterialCommunityIcons name="shield-check" size={22} color="#2563eb" />} />
            <StatCard value={platformStats ? (platformStats.totalClients >= 1000 ? `${(platformStats.totalClients / 1000).toFixed(1)}K+` : `${platformStats.totalClients}+`) : '—'} label="Happy Customers" icon={<MaterialCommunityIcons name="account-group" size={22} color="#d97706" />} />
            <StatCard value={platformStats ? `${platformStats.averageRating}/5` : '—'} label="Average Rating" icon={<MaterialCommunityIcons name="star-circle" size={22} color="#db2777" />} />
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
            {featureCategories.slice(0, 5).map((category, index) => (
              <FeatureCard key={index} icon={category.icon} title={category.title} description={category.description} count={categoryCountMap[category.title] ?? category.count} variant={category.variant} onPress={() => handleCategoryPress(category.title)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} />
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
                <MarketplaceCard key={service._id} image={service.images?.[0]?.url} images={service.images} title={service.name} subtitle={service.category} rating={service.averageRating || 4.5} reviewCount={service.totalReviews || 0} price={service.pricing?.basePrice || 0} unit={service.unit || 'booking'} category={service.serviceType} badge={service.availability?.isAvailable === false ? 'Unavailable' : 'Available'} onPress={() => navigation.navigate('ServiceDetail', { serviceId: service._id })} onAddToCart={() => handleAddToCart(service)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} />
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
