/**
 * Service Detail Screen
 * Polished booking experience with a premium marketplace feel.
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Image, TouchableOpacity, Alert, StyleSheet, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useServiceStore } from '../../context/serviceStore.js';
import { useCartStore } from '../../context/cartStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { Card } from '../../components/Card.jsx';
import { useTheme } from '../../context/ThemeContext';
import { BOOKING_POLICY_ITEMS, isBookingPolicyAccepted } from '../../utils/bookingPolicies.js';
import { normalizeCartItem } from '../../utils/cartUtils';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const ServiceDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { serviceId } = (route.params as { serviceId?: string }) || {};

  const { currentService, isLoading, error, getServiceById } = useServiceStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  const [quantity, setQuantity] = useState(1);
  const [bookingLocation] = useState({
    country: 'Nigeria',
    state: '',
    city: '',
    lga: '',
    address: '',
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [cartToast, setCartToast] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (serviceId) {
      getServiceById(serviceId);
    }
  }, [serviceId]);

  const handleBooking = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select an event date');
      return;
    }

    if (!user) {
      Alert.alert('Sign in required', 'Please sign in again before making a booking.');
      navigation.goBack();
      return;
    }

    if (!currentService?._id) {
      Alert.alert('Error', 'Unable to book this service at the moment.');
      return;
    }

    if (!isBookingPolicyAccepted(policyAccepted)) {
      Alert.alert('Agreement required', 'Please review and accept the booking terms, privacy policy, and disclaimer before continuing.');
      return;
    }

    try {
      const cartItem = normalizeCartItem(currentService, quantity);
      addItem(cartItem);
      navigation.navigate('EventDetails' as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add service to cart';
      Alert.alert('Error', message);
    }
  };

  const showCartToast = () => {
    setCartToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const hideCartToast = () => {
    Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setCartToast(false)
    );
  };

  const handleAddToCart = () => {
    if (!currentService?._id) {
      Alert.alert('Error', 'Unable to add this service to your cart.');
      return;
    }

    const cartItem = normalizeCartItem(currentService, quantity);
    addItem(cartItem);
    showCartToast();
  };

  const handleAddToFavorites = () => {
    setIsFavorite((value) => !value);
    Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const setDateOffset = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setSelectedDate(date.toISOString());
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}> 
        <ErrorMessage error={error} />
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" fullWidth style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!currentService) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}> 
        <MaterialCommunityIcons name="alert-circle" size={64} color="#cbd5e1" />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Service not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} fullWidth style={{ marginTop: 16 }} />
      </View>
    );
  }

  const hasPrice = !!(currentService.pricing?.basePrice && Number(currentService.pricing.basePrice) > 0);
  const totalPrice = hasPrice ? currentService.pricing.basePrice * quantity : 0;
  const tax = totalPrice * 0.05;
  const finalPrice = totalPrice + tax;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Add to cart toast */}
      {cartToast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="cart-check" size={20} color={colors.primary} />
          <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={1}>
            {currentService?.name} added to cart
          </Text>
          <View style={styles.toastActions}>
            <TouchableOpacity
              onPress={() => { hideCartToast(); navigation.navigate('EventDetails' as never); }}
              style={[styles.toastBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.toastBtnPrimary}>View Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={hideCartToast} style={[styles.toastBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.toastBtnSecondary, { color: colors.text }]}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.headerButtons}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleButton}><MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <TouchableOpacity onPress={handleAddToFavorites} style={styles.circleButton}><MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#ef4444' : colors.primary} /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}> 
          {currentService.images && currentService.images.length > 0 ? <Image source={{ uri: currentService.images[0].url }} style={styles.image} resizeMode="cover" /> : <MaterialCommunityIcons name="briefcase" size={78} color="rgba(255,255,255,0.6)" />}
          <View style={styles.imageOverlay} />
          <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>{currentService.serviceType}</Text></View>
        </View>

        <Card variant="elevated" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{currentService.name}</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>{currentService.category}</Text>
            </View>
            <View style={styles.ratingPill}>
              <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{currentService.averageRating || '0'}</Text>
            </View>
          </View>
          <View style={styles.priceBlock}>
            {hasPrice ? (
              <Text style={[styles.priceLabel, { color: colors.muted }]}>Starting from</Text>
            ) : null}
            <Text style={[styles.price, { color: colors.primary }]}>
              {hasPrice ? `₦${currentService.pricing.basePrice.toLocaleString()}` : 'Not a static price'}
            </Text>
            {hasPrice ? (
              <Text style={[styles.unitText, { color: colors.muted }]}>per {currentService.unit || 'booking'}</Text>
            ) : null}
          </View>
        </Card>

        <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.copy, { color: colors.muted }]}>{currentService.description}</Text>
        </Card>

        <Card variant="filled" style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service provider</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerIcon}><MaterialCommunityIcons name="account" size={26} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.providerName, { color: colors.text }]}>{currentService.provider?.businessName || 'Service Provider'}</Text>
              <Text style={[styles.providerSubtitle, { color: colors.muted }]}>{currentService.serviceType}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
          </View>
        </Card>

        {currentService.packages && currentService.packages.length > 0 ? (
          <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Packages</Text>
            {currentService.packages.map((pkg: any, index: number) => (
              <View key={`${pkg.name}-${index}`} style={styles.packageRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.packageTitle, { color: colors.text }]}>{pkg.name}</Text>
                  <Text style={[styles.copy, { color: colors.muted }]}>{pkg.description}</Text>
                  <Text style={[styles.packagePrice, { color: colors.primary }]}>
                    {pkg.price && Number(pkg.price) > 0 ? `₦${pkg.price.toLocaleString()}` : 'Not a static price'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Complete your booking</Text>
          <View style={styles.selectorRow}> 
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepButton}><MaterialCommunityIcons name="minus" size={18} color={colors.primary} /></TouchableOpacity>
            <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepButton}><MaterialCommunityIcons name="plus" size={18} color={colors.primary} /></TouchableOpacity>
          </View>
          <View style={[styles.dateBox, { backgroundColor: colors.surfaceAlt }]}> 
            <Text style={[styles.dateTitle, { color: colors.text }]}>Event date</Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
          </View>
          <View style={styles.dateOptions}>
            {[{ label: '1 week', days: 7 }, { label: '2 weeks', days: 14 }, { label: '1 month', days: 30 }].map((option) => (
              <TouchableOpacity key={option.days} onPress={() => setDateOffset(option.days)} style={[styles.optionButton, { backgroundColor: colors.surfaceAlt }]}> 
                <Text style={[styles.optionText, { color: colors.primary }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.priceBox, { backgroundColor: colors.surfaceAlt }]}>
            {hasPrice ? (
              <>
                <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: colors.muted }]}>Subtotal</Text><Text style={[styles.priceKey, { color: colors.text }]}>₦{totalPrice.toLocaleString()}</Text></View>
                <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: colors.muted }]}>Tax (5%)</Text><Text style={[styles.priceKey, { color: colors.text }]}>₦{tax.toLocaleString()}</Text></View>
                <View style={styles.priceLine}><Text style={[styles.priceLabel, { color: colors.text }]}>Total</Text><Text style={[styles.total, { color: colors.primary }]}>₦{finalPrice.toLocaleString()}</Text></View>
              </>
            ) : (
              <View style={styles.priceLine}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Price</Text>
                <Text style={[styles.total, { color: colors.primary }]}>Not a static price</Text>
              </View>
            )}
          </View>
          <View style={[styles.locationBox, { backgroundColor: colors.surfaceAlt }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Service location</Text>
            <Text style={[styles.copy, { color: colors.muted }]}>Choose a Nigerian location that matches the provider's coverage.</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>State</Text>
              <Text style={[styles.inputValue, { color: colors.text }]}>{bookingLocation.state || 'Required'}</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>City</Text>
              <Text style={[styles.inputValue, { color: colors.text }]}>{bookingLocation.city || 'Required'}</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>LGA</Text>
              <Text style={[styles.inputValue, { color: colors.text }]}>{bookingLocation.lga || 'Optional'}</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
              <Text style={[styles.inputValue, { color: colors.text }]}>{bookingLocation.address || 'Optional'}</Text>
            </View>
          </View>

          <View style={[styles.policyBox, { backgroundColor: colors.surfaceAlt }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking agreement</Text>
            <Text style={[styles.copy, { color: colors.muted }]}>Please review the policy details below before confirming your booking.</Text>
            {BOOKING_POLICY_ITEMS.map((policy: { id: string; title: string; description: string }) => (
              <View key={policy.id} style={styles.policyItem}>
                <Text style={[styles.policyTitle, { color: colors.text }]}>{policy.title}</Text>
                <Text style={[styles.policyText, { color: colors.muted }]}>{policy.description}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setPolicyAccepted((value) => !value)}
              style={styles.policyCheckboxRow}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, policyAccepted && styles.checkboxActive]}>
                {policyAccepted ? <MaterialCommunityIcons name="check" size={16} color="#fff" /> : null}
              </View>
              <Text style={[styles.policyText, { color: colors.text, flex: 1 }]}>I agree to the terms, privacy policy, and disclaimer for this booking.</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ctaRow}>
            <Button title="Add to cart" onPress={handleAddToCart} variant="outline" size="lg" style={styles.ctaBtn} />
            <Button title="Continue to checkout" onPress={handleBooking} variant="primary" size="lg" style={styles.ctaBtn} />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerButtons: { position: 'absolute', top: 18, left: 16, right: 16, zIndex: 2, flexDirection: 'row', justifyContent: 'space-between' },
  circleButton: { width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  imageWrap: { height: 280, borderRadius: 28, overflow: 'hidden', marginTop: 8, marginBottom: 12, backgroundColor: '#d7e7de' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  imageBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  imageBadgeText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  card: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', fontFamily: appFont },
  subtitle: { fontSize: 13, marginTop: 4, fontFamily: appFont },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8e7', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '800', color: '#f59e0b' },
  priceBlock: { marginTop: 6 },
  priceLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', fontFamily: appFont },
  price: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  unitText: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10, fontFamily: appFont },
  copy: { fontSize: 14, lineHeight: 21, fontFamily: appFont },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  providerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#1f7a4d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  providerName: { fontSize: 15, fontWeight: '800', fontFamily: appFont },
  providerSubtitle: { fontSize: 12, marginTop: 2 },
  packageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  packageTitle: { fontSize: 14, fontWeight: '700', fontFamily: appFont },
  packagePrice: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  selectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stepButton: { width: 42, height: 42, borderRadius: 999, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: 20, fontWeight: '800', fontFamily: appFont },
  dateBox: { borderRadius: 16, padding: 12, marginBottom: 10 },
  dateTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', fontFamily: appFont },
  dateValue: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  dateOptions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  optionButton: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  optionText: { fontSize: 13, fontWeight: '700', fontFamily: appFont },
  priceBox: { borderRadius: 16, padding: 12, marginBottom: 14 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceKey: { fontSize: 14, fontWeight: '700', fontFamily: appFont },
  total: { fontSize: 18, fontWeight: '800' },
  locationBox: { borderRadius: 16, padding: 12, marginBottom: 14 },
  policyBox: { borderRadius: 16, padding: 12, marginBottom: 14 },
  policyItem: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.08)' },
  policyTitle: { fontSize: 13, fontWeight: '800', marginBottom: 4, fontFamily: appFont },
  policyText: { fontSize: 13, lineHeight: 20, fontFamily: appFont },
  policyCheckboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#1f7a4d', marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1f7a4d' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaBtn: { flex: 1 },
  toast: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 99, borderRadius: 18, borderWidth: 1, padding: 14, gap: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  toastText: { fontSize: 13, fontWeight: '700', flex: 1 },
  toastActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  toastBtn: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  toastBtnPrimary: { color: '#fff', fontSize: 13, fontWeight: '800' },
  toastBtnSecondary: { fontSize: 13, fontWeight: '700' },
  inputGroup: { marginTop: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', fontFamily: appFont },
  inputValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, fontFamily: appFont },
});

export default ServiceDetailScreen;
