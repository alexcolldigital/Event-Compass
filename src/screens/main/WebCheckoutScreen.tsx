import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, SafeAreaView, Linking, Alert, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Params = {
  url?: string;
  checkoutUrl?: string;
  bookingId?: string;
  gateway?: string;
  paymentType?: 'deposit' | 'balance' | 'full';
  amountDue?: number;
};

const WebCheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const params = (route.params || {}) as Params;

  const checkoutUrl = params.url || params.checkoutUrl || '';
  const bookingId = params.bookingId || '';
  const gateway = params.gateway || 'paystack';
  const paymentType = params.paymentType || 'full';
  const amountDue = params.amountDue;

  const [isOpening, setIsOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  const colors = useMemo(() => ({
    bg: theme === 'dark' ? '#050816' : '#f5f7f2',
    surface: theme === 'dark' ? '#111827' : '#ffffff',
    text: theme === 'dark' ? '#f8fafc' : '#0f172a',
    muted: theme === 'dark' ? '#cbd5e1' : '#64748b',
    primary: '#1f7a4d',
    border: theme === 'dark' ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    success: '#16a34a',
    warning: '#d97706',
  }), [theme]);

  const gatewayLabel = gateway === 'flutterwave' ? 'Flutterwave' : 'Paystack';
  const gatewayIcon = gateway === 'flutterwave' ? 'lightning-bolt' : 'credit-card-outline';
  const paymentTypeLabel =
    paymentType === 'deposit' ? 'Deposit Payment' :
    paymentType === 'balance' ? 'Balance Payment' : 'Full Payment';

  const openCheckout = async () => {
    if (!checkoutUrl) {
      Alert.alert('Error', 'No payment URL available. Please go back and try again.');
      return;
    }
    try {
      setIsOpening(true);
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
        setOpened(true);
      } else {
        Alert.alert('Cannot open payment page', 'Please copy the link and open it in your browser.');
      }
    } catch {
      Alert.alert('Failed to open payment page', 'Please try again.');
    } finally {
      setIsOpening(false);
    }
  };

  useEffect(() => {
    if (checkoutUrl) openCheckout();
  }, []);

  const handleDone = () => {
    if (bookingId) {
      (navigation as any).navigate('BookingDetail', { bookingId });
    } else {
      (navigation as any).navigate('Bookings');
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.gatewayBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name={gatewayIcon as any} size={28} color={colors.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.gatewayName, { color: colors.text }]}>{gatewayLabel}</Text>
            <Text style={[styles.gatewaySubtitle, { color: colors.muted }]}>Secure checkout</Text>
          </View>
          <View style={[styles.secureBadge, { backgroundColor: '#ecfdf3' }]}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.success} />
            <Text style={[styles.secureBadgeText, { color: colors.success }]}>SSL</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Payment Type</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{paymentTypeLabel}</Text>
          </View>
          {bookingId ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Booking</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>#{bookingId.slice(-8).toUpperCase()}</Text>
            </View>
          ) : null}
          {amountDue ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Amount</Text>
              <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '900' }]}>
                ₦{Number(amountDue).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.statusCard, { backgroundColor: opened ? '#ecfdf3' : '#fff7ed', borderColor: opened ? '#86efac' : '#fde68a' }]}>
          {isOpening ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name={opened ? 'check-circle-outline' : 'information-outline'}
              size={20}
              color={opened ? colors.success : colors.warning}
            />
          )}
          <Text style={[styles.statusText, { color: opened ? colors.success : colors.warning }]}>
            {isOpening
              ? 'Opening payment page...'
              : opened
              ? `${gatewayLabel} checkout opened in your browser. Complete payment there, then return here.`
              : `Tap the button below to open ${gatewayLabel} checkout.`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: isOpening ? 0.7 : 1 }]}
          onPress={openCheckout}
          disabled={isOpening || !checkoutUrl}
          activeOpacity={0.85}
        >
          {isOpening ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="open-in-new" size={20} color="#fff" />
          )}
          <Text style={styles.primaryBtnText}>
            {isOpening ? 'Opening...' : `Open ${gatewayLabel} Checkout`}
          </Text>
        </TouchableOpacity>

        {opened && (
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="check" size={18} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
              I've completed payment — View Booking
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border, marginTop: 8 }]}
          onPress={() => (navigation as any).navigate('Bookings')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.muted }]}>Back to Bookings</Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          Your payment is processed securely by {gatewayLabel}. Event Compass does not store your card details.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  body: { flex: 1, padding: 20, gap: 14 },
  gatewayBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, padding: 16 },
  gatewayName: { fontSize: 18, fontWeight: '800' },
  gatewaySubtitle: { fontSize: 12, marginTop: 2 },
  secureBadge: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  secureBadgeText: { fontSize: 11, fontWeight: '800' },
  infoCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 14, fontWeight: '700' },
  statusCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  statusText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 16, paddingVertical: 14 },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },
  disclaimer: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 4 },
});

export default WebCheckoutScreen;
