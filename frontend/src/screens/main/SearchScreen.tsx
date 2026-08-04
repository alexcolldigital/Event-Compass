/**
 * Search Screen
 * Marketplace-style discovery with rich cards and fast filters.
 */

import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useServiceStore } from '../../context/serviceStore.js';
import { useCartStore } from '../../context/cartStore.js';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { MarketplaceCard } from '../../components/Card.jsx';
import { useTheme } from '../../context/ThemeContext';
import { normalizeCartItem } from '../../utils/cartUtils';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const SERVICE_CATEGORIES = [
  { id: 1, name: 'Catering', icon: 'silverware-fork-knife' },
  { id: 2, name: 'DJ/Music', icon: 'music' },
  { id: 3, name: 'Decor', icon: 'palette' },
  { id: 4, name: 'Photography', icon: 'camera' },
  { id: 5, name: 'Venues', icon: 'home-city' },
];

export default function SearchScreen({ navigation }: { navigation: any }) {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { services, getAllServices, searchServices, isLoading, error } = useServiceStore();
  const { addItem } = useCartStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const params = (route.params as { initialQuery?: string; initialCategory?: string } | undefined) || {};

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  const fetchServices = async ({ keyword, category }: { keyword?: string; category?: string } = {}) => {
    try {
      if (keyword || category) {
        await searchServices({ keyword, category });
      } else {
        await getAllServices({ limit: 20 });
      }
    } catch (err) {
      // store takes care of error state
    }
  };

  useEffect(() => {
    if (params.initialQuery) {
      setSearchQuery(params.initialQuery);
      setSelectedCategory(null);
      fetchServices({ keyword: params.initialQuery });
    } else if (params.initialCategory) {
      setSelectedCategory(params.initialCategory);
      setSearchQuery('');
      fetchServices({ category: params.initialCategory });
    } else {
      fetchServices();
    }
  }, [route.params]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await fetchServices({ keyword: searchQuery, category: selectedCategory || undefined });
    } else if (selectedCategory) {
      await fetchServices({ category: selectedCategory });
    } else {
      await fetchServices();
    }
  };

  const handleCategorySelect = async (categoryName: string | null) => {
    const nextCategory = categoryName === null ? null : selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(nextCategory);
    setSearchQuery('');
    if (nextCategory) {
      await fetchServices({ category: nextCategory });
    } else {
      await fetchServices();
    }
  };

  const clearFilters = async () => {
    setSearchQuery('');
    setSelectedCategory(null);
    await fetchServices();
  };

  const displayedServices = services;

  const handleAddToCart = (service: any) => {
    const cartItem = normalizeCartItem(service, 1);
    if (!cartItem) {
      return;
    }

    addItem(cartItem);
    Alert.alert('Added to cart', `${service.name} was added to your cart.`);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}> 
          <Text style={styles.heroTitle}>Discover services</Text>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <MaterialCommunityIcons name="magnify" size={22} color={colors.primary} />
            <TextInput
              placeholder="Search venues, decor, DJs..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSearch}>
                <MaterialCommunityIcons name="tune" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          {error ? <ErrorMessage error={error} /> : null}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse categories</Text>
            {selectedCategory ? (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {SERVICE_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.name;
              return (
                <TouchableOpacity key={category.id} onPress={() => handleCategorySelect(isActive ? null : category.name)} style={[styles.chip, isActive ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                  <MaterialCommunityIcons name={category.icon as any} size={18} color={isActive ? '#fff' : colors.primary} />
                  <Text style={[styles.chipText, isActive ? { color: '#fff' } : { color: colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedCategory ? `${selectedCategory} services` : searchQuery ? 'Search results' : 'Featured services'}</Text>
            {displayedServices.length > 0 ? <Text style={[styles.resultText, { color: colors.primary }]}>{displayedServices.length} results</Text> : null}
          </View>
          {isLoading ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : displayedServices.length > 0 ? (
            <View style={styles.marketplaceGrid}>
              {displayedServices.map((service: any) => (
                <MarketplaceCard key={service._id} image={service.images?.[0]?.url} title={service.name} subtitle={service.serviceType} rating={service.averageRating || 4.5} reviewCount={service.totalReviews || 0} price={service.pricing?.basePrice || 0} unit={service.unit || 'booking'} category={service.serviceType} badge={service.availability?.isAvailable === false ? 'Unavailable' : 'Available'} onPress={() => navigation.navigate('ServiceDetail', { serviceId: service._id })} onAddToCart={() => handleAddToCart(service)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
              <MaterialCommunityIcons name="magnify" size={56} color="#94a3b8" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches yet</Text>
              <Text style={[styles.emptyCopy, { color: colors.muted }]}>Try a broader keyword or choose another category.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  hero: { borderRadius: 28, padding: 18, marginTop: 8, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 12, fontFamily: appFont },
  searchBar: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 14, fontWeight: '600', fontFamily: appFont },
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: appFont },
  linkText: { fontSize: 13, fontWeight: '700', fontFamily: appFont },
  resultText: { fontSize: 12, fontWeight: '700' },
  chipsRow: { paddingVertical: 4, gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  chipText: { fontSize: 13, fontWeight: '700', fontFamily: appFont },
  marketplaceGrid: { gap: 12 },
  emptyState: { borderRadius: 22, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, fontFamily: appFont },
  emptyCopy: { fontSize: 13, marginTop: 6, textAlign: 'center', fontFamily: appFont },
});
