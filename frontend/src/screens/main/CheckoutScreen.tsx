import React, { useMemo, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../context/cartStore.js';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';
import { bookingAPI } from '../../services/api.js';
import { buildCheckoutBookingDetails } from '../../utils/cartUtils';

export default function CheckoutScreen({ navigation, route }: { navigation: any; route: any }) {
  const eventDetails = route?.params?.eventDetails;
  const { items, removeItem, updateItemQuantity, clearCart, getTotalAmount } = useCartStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
    danger: '#dc2626',
  };

  const [isLoading, setIsLoading] = useState(false);
  const totalAmount = useMemo(() => getTotalAmount(), [items, getTotalAmount]);

  const eventDate = eventDetails?.eventDate
    ? new Date(eventDetails.eventDate)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const eventTime = eventDetails?.eventTime || '12:00 PM';
  const locationState = eventDetails?.location?.state || 'Lagos';
  const locationCity = eventDetails?.location?.town || '';
  const locationAddress = eventDetails?.location?.address || '';

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add a service before checking out.');
      return;
    }
    if (!locationState.trim()) {
      Alert.alert('Location required', 'Please provide the event state.');
      return;
    }
    setIsLoading(true);
    try {
      const bookingDetails = buildCheckoutBookingDetails({
        eventDate: eventDate.toISOString(),
        eventTime,
        bookingLocation: {
          country: 'Nigeria',
          state: locationState,
          city: locationCity || locationState,
          lga: eventDetails?.location?.lga || locationCity || locationState,
          address: locationAddress || locationState,
        },
        clientName: eventDetails?.clientName,
        phoneNumber: eventDetails?.phoneNumber,
        clientAddress: eventDetails?.clientAddress,
        eventType: eventDetails?.eventType,
        eventDescription: eventDetails?.eventDescription,
        expectedGuests: eventDetails?.expectedGuests,
        additionalNotes: eventDetails?.additionalNotes,
      });

      const response: any = await bookingAPI.checkoutCart({
        cartItems: items.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          specialRequirements: item.specialRequirements || '',
          price: item.price || 0,
          name: item.name,
        })),
        bookingDetails,
      });

      clearCart();

      if (response?.bookings?.length > 0) {
        Alert.alert('Booking Request Sent', 'Your booking has been submitted. You will be notified once the admin reviews it.');
        navigation.navigate('Bookings');
        return;
      }

      throw new Error(response?.message || 'Checkout failed');
    } catch (err: any) {
      Alert.alert('Checkout failed', err.message || 'Unable to complete checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  const adjustQty = (serviceId: string, qty: number, delta: number) => {
    const next = qty + delta;
    if (next < 1) return removeItem(serviceId);
    updateItemQuantity(serviceId, next);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Review & Submit</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 14 }}>Step 3 of 3 — Preview & confirm</Text>
        </View>
        {items.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="cart-off" size={64} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Browse services and add one to start your booking.</Text>
          <Button title="Browse Services" onPress={() => navigation.navigate('Search')} variant="primary" size="lg" style={{ marginTop: 20 }} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Event details summary */}
            {eventDetails ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Event Details</Text>
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <SummaryRow icon="account" label={eventDetails.clientName} color={colors.primary} muted={colors.muted} />
                <SummaryRow icon="phone" label={eventDetails.phoneNumber} color={colors.primary} muted={colors.muted} />
                <SummaryRow icon="tag" label={eventDetails.eventType} color={colors.primary} muted={colors.muted} />
                <SummaryRow icon="calendar" label={eventDate.toDateString()} color={colors.primary} muted={colors.muted} />
                <SummaryRow icon="clock-outline" label={eventTime} color={colors.primary} muted={colors.muted} />
                <SummaryRow icon="account-group" label={`${eventDetails.expectedGuests} guests`} color={colors.primary} muted={colors.muted} />
                <SummaryRow
                  icon="map-marker"
                  label={[locationAddress, locationCity, locationState].filter(Boolean).join(', ')}
                  color={colors.primary}
                  muted={colors.muted}
                />
                {eventDetails.eventDescription ? (
                  <SummaryRow icon="text" label={eventDetails.eventDescription} color={colors.primary} muted={colors.muted} />
                ) : null}
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                <View style={styles.cardHeaderRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#d97706" />
                  <Text style={[styles.cardTitle, { color: '#92400e', marginLeft: 8 }]}>No event details</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={{ color: '#d97706', fontWeight: '700', fontSize: 13, marginTop: 4 }}>← Go back to fill event details</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Cart items */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cart Items</Text>
            {items.map((item) => (
              <View key={item.serviceId} style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.itemTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemPrice, { color: colors.muted }]}>
                      ₦{(item.price || 0).toLocaleString()} × {item.quantity}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.serviceId)} style={styles.removeBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => adjustQty(item.serviceId, item.quantity || 1, -1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => adjustQty(item.serviceId, item.quantity || 1, 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.itemSubtotal, { color: colors.primary }]}>
                    ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Order summary */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₦{totalAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Service fee</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₦0</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.primary }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>₦{totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.footerTotal}>
              <Text style={[styles.footerTotalLabel, { color: colors.muted }]}>Total</Text>
              <Text style={[styles.footerTotalValue, { color: colors.primary }]}>₦{totalAmount.toLocaleString()}</Text>
            </View>
            <Button
              title={isLoading ? 'Submitting...' : 'Submit Booking Request'}
              onPress={handlePlaceOrder}
              isLoading={isLoading}
              variant="primary"
              size="lg"
              style={{ flex: 1, marginLeft: 12 }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, color, muted }: { icon: any; label: string; color: string; muted: string }) {
  if (!label) return null;
  return (
    <View style={styles.summaryRowItem}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.summaryRowText, { color: muted }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginLeft: 14, flex: 1 },
  badge: { backgroundColor: '#fff', borderRadius: 999, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#1f7a4d', fontSize: 12, fontWeight: '800' },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  editLink: { fontSize: 13, fontWeight: '700' },
  summaryRowItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  summaryRowText: { flex: 1, fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  cartItem: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start' },
  itemName: { fontSize: 15, fontWeight: '800' },
  itemPrice: { fontSize: 13, marginTop: 4 },
  removeBtn: { padding: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  itemSubtotal: { marginLeft: 'auto', fontSize: 14, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  totalRow: { borderTopWidth: 1, marginTop: 4, paddingTop: 12 },
  totalLabel: { fontSize: 17, fontWeight: '800' },
  totalValue: { fontSize: 17, fontWeight: '800' },
  footer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  footerTotal: { alignItems: 'flex-start' },
  footerTotalLabel: { fontSize: 12, fontWeight: '600' },
  footerTotalValue: { fontSize: 20, fontWeight: '900' },
  emptyWrap: { flex: 1, margin: 24, borderWidth: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 260 },
});
