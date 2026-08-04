import React, { useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore';
import { useBookingStore } from '../../context/bookingStore';
import { useCartStore } from '../../context/cartStore';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const { checkoutCart, isLoading } = useBookingStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [eventDate, setEventDate] = useState('2026-09-10');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [escrowEnabled, setEscrowEnabled] = useState(true);
  const [escrowReleaseTime, setEscrowReleaseTime] = useState('after_customer_confirmation');
  const [escrowDisputePolicy, setEscrowDisputePolicy] = useState('standard');

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0), [items]);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in before checking out.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Cart empty', 'Add a service to your cart first.');
      return;
    }

    if (!policyAccepted) {
      Alert.alert('Agreement required', 'Please review and accept the rental terms before checking out.');
      return;
    }

    try {
      const response = await checkoutCart({
        cartItems: items.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          specialRequirements: item.specialRequirements || notes,
        })),
        bookingDetails: {
          eventDate,
          clientNotes: notes,
          bookingLocation: {
            country: 'Nigeria',
            state: location.split(',')[0] || 'Lagos',
            city: location.split(',')[1] || 'Lagos',
            address: location,
          },
          escrow: {
            enabled: escrowEnabled,
            releaseTime: escrowReleaseTime,
            disputePolicy: escrowDisputePolicy,
          },
        },
      });

      clearCart();
      Alert.alert('Checkout complete', `You created ${response.bookings?.length || 0} booking(s).`);
      const parent = navigation.getParent?.();
      if (parent?.navigate) {
        parent.navigate('Bookings');
      } else {
        navigation.navigate('Bookings' as never);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to complete checkout';
      Alert.alert('Checkout failed', message);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.heroTitle, { color: colors.text }]}>Fun, fast, and secure</Text>
          <Text style={[styles.heroCopy, { color: colors.muted }]}>Review your cart, confirm your event details, and place everything in one smooth step.</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your selections</Text>
          {items.map((item) => (
            <View key={item.serviceId} style={[styles.itemRow, { borderColor: colors.border }]}> 
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.muted }]}>Qty {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>₦{((item.price || 0) * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Event details</Text>
          <Text style={[styles.label, { color: colors.text }]}>Date</Text>
          <TextInput value={eventDate} onChangeText={setEventDate} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} placeholder="YYYY-MM-DD" />
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput value={location} onChangeText={setLocation} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} placeholder="City, State" />
          <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} placeholder="Add any special requests" />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Escrow protection</Text>
          <View style={styles.escrowRow}> 
            <Text style={[styles.label, { color: colors.text }]}>Secure funds until the event is completed or disputes are resolved.</Text> 
            <TouchableOpacity onPress={() => setEscrowEnabled((value) => !value)} style={[styles.togglePill, { backgroundColor: escrowEnabled ? colors.primary : '#cbd5e1' }]}> 
              <Text style={styles.toggleText}>{escrowEnabled ? 'On' : 'Off'}</Text> 
            </TouchableOpacity> 
          </View> 
          {escrowEnabled ? (
            <View style={styles.escrowOptions}> 
              <View style={styles.escrowOptionRow}> 
                <Text style={[styles.label, { color: colors.text }]}>Release time</Text> 
                <TouchableOpacity onPress={() => setEscrowReleaseTime(escrowReleaseTime === 'after_customer_confirmation' ? '48_hours' : 'after_customer_confirmation')} style={[styles.optionChip, { borderColor: colors.border }]}> 
                  <Text style={[styles.optionChipText, { color: colors.text }]}>{escrowReleaseTime === 'after_customer_confirmation' ? 'After confirmation' : '48 Hours'}</Text> 
                </TouchableOpacity> 
              </View> 
              <View style={styles.escrowOptionRow}> 
                <Text style={[styles.label, { color: colors.text }]}>Dispute handling</Text> 
                <TouchableOpacity onPress={() => setEscrowDisputePolicy(escrowDisputePolicy === 'standard' ? 'mediation' : 'standard')} style={[styles.optionChip, { borderColor: colors.border }]}> 
                  <Text style={[styles.optionChipText, { color: colors.text }]}>{escrowDisputePolicy === 'standard' ? 'Standard' : 'Mediation'}</Text> 
                </TouchableOpacity> 
              </View> 
            </View>
          ) : null} 
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rental terms</Text>
          <Text style={[styles.label, { color: colors.text }]}>Please agree to the rental terms before placing your booking.</Text>
          <TouchableOpacity
            onPress={() => setPolicyAccepted((value) => !value)}
            style={[styles.policyRow, { borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, policyAccepted && styles.checkboxActive]}>
              {policyAccepted ? <MaterialCommunityIcons name="check" size={16} color="#fff" /> : null}
            </View>
            <Text style={[styles.policyLabel, { color: colors.text }]}>I agree to the rental terms, privacy policy, and disclaimer for these bookings.</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}><Text style={{ color: colors.muted }}>Subtotal</Text><Text style={{ color: colors.text }}>₦{subtotal.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text style={{ color: colors.muted }}>Tax</Text><Text style={{ color: colors.text }}>₦{tax.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.primary }]}>₦{total.toLocaleString()}</Text></View>
        </View>

        <Button title={isLoading ? 'Processing...' : 'Place booking'} onPress={handleCheckout} isLoading={isLoading} variant="primary" fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  heroCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  heroCopy: { fontSize: 14, lineHeight: 20 },
  sectionCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, minHeight: 92, textAlignVertical: 'top' },
  policyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: '#1f7a4d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#1f7a4d' },
  policyLabel: { flex: 1, fontSize: 13, lineHeight: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalText: { fontSize: 16, fontWeight: '800' },
  escrowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  escrowOptions: { marginTop: 8 },
  escrowOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  optionChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  optionChipText: { fontSize: 12, fontWeight: '700' },
  togglePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  toggleText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});

export default CheckoutScreen;
