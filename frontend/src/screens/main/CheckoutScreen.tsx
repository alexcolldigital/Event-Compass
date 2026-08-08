import React, { useMemo, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '../../context/cartStore.js';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';
import { bookingAPI } from '../../services/api.js';
import { buildCheckoutBookingDetails } from '../../utils/cartUtils';

const CheckoutScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const eventDetails = route?.params?.eventDetails;
  const { items, removeItem, updateItemQuantity, clearCart, getTotalAmount } = useCartStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    bg: theme === 'dark' ? '#050816' : '#f8fafc',
    surface: theme === 'dark' ? '#111827' : '#ffffff',
    text: theme === 'dark' ? '#f8fafc' : '#0f172a',
    muted: theme === 'dark' ? '#cbd5e1' : '#64748b',
    border: theme === 'dark' ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: theme === 'dark' ? '#34d399' : '#1f7a4d',
  };

  const totalAmount = useMemo(() => getTotalAmount(), [items, getTotalAmount]);

  const eventDate = eventDetails?.eventDate ? new Date(eventDetails.eventDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const eventTime = eventDetails?.eventTime || '12:00 PM';
  const locationState = eventDetails?.location?.state || 'Lagos';
  const locationCity = eventDetails?.location?.town || '';
  const locationAddress = eventDetails?.location?.address || '';

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert('Your cart is empty', 'Please add a service before continuing to checkout.');
      return;
    }
    if (!locationState.trim()) {
      Alert.alert('Location required', 'Please enter the state for your event.');
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

      const firstCheckout = response?.checkouts?.find((checkout: any) => checkout?.checkoutUrl) || null;
      clearCart();

      if (firstCheckout?.checkoutUrl) {
        Alert.alert('Success', 'Your booking is ready for payment.');
        navigation.navigate('WebCheckout', {
          checkoutUrl: firstCheckout.checkoutUrl,
          bookingId: firstCheckout.bookingId,
        });
        return;
      }

      if (response?.bookings?.length > 0) {
        Alert.alert('Success', 'Your bookings were created successfully. You can complete payment from the bookings screen.');
        navigation.navigate('Bookings');
        return;
      }

      throw new Error(response?.message || 'Failed to complete checkout');
    } catch (err: any) {
      Alert.alert('Checkout failed', err.message || 'Unable to complete checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemDecrease = (serviceId: string, quantity: number) => {
    if (quantity <= 1) return removeItem(serviceId);
    updateItemQuantity(serviceId, quantity - 1);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Cart Checkout</Text>
      </View>

      {/* Event details summary */}
      {items.length > 0 && eventDetails && (
        <View style={[styles.eventForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Event Details</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <SummaryRow icon="account" label={eventDetails.clientName} colors={colors} />
          <SummaryRow icon="phone" label={eventDetails.phoneNumber} colors={colors} />
          <SummaryRow icon="tag" label={eventDetails.eventType} colors={colors} />
          <SummaryRow icon="calendar" label={eventDate.toDateString()} colors={colors} />
          <SummaryRow icon="clock-outline" label={eventTime} colors={colors} />
          <SummaryRow icon="account-group" label={`${eventDetails.expectedGuests} guests`} colors={colors} />
          <SummaryRow icon="map-marker" label={`${locationAddress}, ${locationCity}, ${locationState}`} colors={colors} />
          {eventDetails.eventDescription ? <SummaryRow icon="text" label={eventDetails.eventDescription} colors={colors} /> : null}
        </View>
      )}
      {items.length > 0 && !eventDetails && (
        <View style={[styles.eventForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>No event details provided</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 4 }}>← Go back to fill event details</Text>
          </TouchableOpacity>
        </View>
      )}
      {items.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <MaterialCommunityIcons name="cart-off" size={64} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>Browse services and add one to start your booking.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <View key={item.serviceId} style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: colors.muted }]}>₦{(item.price || 0).toLocaleString()} × {item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.serviceId)} style={styles.removeButton}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={() => handleItemDecrease(item.serviceId, item.quantity || 1)} style={[styles.quantityControl, { borderColor: colors.border }]}> 
                  <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateItemQuantity(item.serviceId, (item.quantity || 1) + 1)} style={[styles.quantityControl, { borderColor: colors.border }]}> 
                  <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={[styles.orderSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: colors.muted }]}>Subtotal</Text>
              <Text style={[styles.summaryText, { color: colors.text }]}>₦{totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: colors.muted }]}>Tax</Text>
              <Text style={[styles.summaryText, { color: colors.text }]}>₦0</Text>
            </View>
            <View style={styles.summaryRow}> 
              <Text style={[styles.totalText, { color: colors.primary }]}>Total</Text>
              <Text style={[styles.totalText, { color: colors.primary }]}>₦{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
          <Button title="Place booking order" onPress={handlePlaceOrder} isLoading={isLoading} fullWidth variant="primary" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 16 },
  content: { padding: 16, gap: 14 },
  cartItem: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemTitle: { fontSize: 16, fontWeight: '800' },
  itemMeta: { fontSize: 13, marginTop: 4 },
  removeButton: { padding: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12 },
  quantityControl: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quantityText: { fontSize: 16, fontWeight: '700' },
  orderSummary: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryText: { fontSize: 14 },
  totalText: { fontSize: 18, fontWeight: '800' },
  emptyState: { flex: 1, margin: 24, borderWidth: 1, borderRadius: 20, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtext: { marginTop: 8, fontSize: 14, textAlign: 'center', maxWidth: 260 },
  eventForm: { margin: 16, marginBottom: 0, borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  formTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  formInput: { flex: 1, fontSize: 14 },
  formValue: { flex: 1, fontSize: 14 },
  summaryRowItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryRowText: { flex: 1, fontSize: 13 },
});

const SummaryRow = ({ icon, label, colors }: { icon: any; label: string; colors: any }) => (
  <View style={styles.summaryRowItem}>
    <MaterialCommunityIcons name={icon} size={15} color={colors.primary} />
    <Text style={[styles.summaryRowText, { color: colors.muted }]} numberOfLines={2}>{label}</Text>
  </View>
);

export default CheckoutScreen;
