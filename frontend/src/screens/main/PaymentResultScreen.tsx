import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBookingStore } from '../../context/bookingStore.js';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';

const PaymentResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route.params || {}) as { bookingId?: string; status?: 'success' | 'cancelled' | string };
  const status = params.status || 'success';
  const bookingId = params.bookingId || '';
  const { markBookingPaymentSuccess, currentBooking, getBookingById, isLoading } = useBookingStore();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(status === 'success' && !!bookingId);

  const colors = useMemo(
    () => ({
      bg: theme === 'dark' ? '#050816' : '#f5f7f2',
      surface: theme === 'dark' ? '#111827' : '#ffffff',
      text: theme === 'dark' ? '#f8fafc' : '#0f172a',
      muted: theme === 'dark' ? '#cbd5e1' : '#64748b',
      success: '#22c55e',
      danger: '#ef4444',
      primary: theme === 'dark' ? '#34d399' : '#1f7a4d',
      border: theme === 'dark' ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    }),
    [theme]
  );

  useEffect(() => {
    const finalizePayment = async () => {
      if (status !== 'success' || !bookingId) {
        setIsProcessing(false);
        return;
      }

      try {
        setIsProcessing(true);
        const result = await markBookingPaymentSuccess(bookingId);
        if (result?.booking?._id) {
          await getBookingById(result.booking._id);
        }
      } catch (error) {
        console.error('Failed to finalize payment', error);
      } finally {
        setIsProcessing(false);
      }
    };

    finalizePayment();
  }, [bookingId, status, markBookingPaymentSuccess, getBookingById]);

  if (isLoading || isProcessing) {
    return <Loading fullScreen message="Finalizing your payment..." />;
  }

  const isSuccess = status === 'success';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <MaterialCommunityIcons
          name={isSuccess ? 'check-circle-outline' : 'alert-circle-outline'}
          size={72}
          color={isSuccess ? colors.success : colors.danger}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {isSuccess ? 'Payment successful' : 'Payment cancelled'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {isSuccess
            ? 'Your booking is secured in escrow and the provider can now confirm the reservation.'
            : 'Your payment was not completed. You can retry or review your booking in the dashboard.'}
        </Text>
        {bookingId && (
          <Text style={[styles.bookingLabel, { color: colors.muted }]}>Booking #{bookingId}</Text>
        )}
        <View style={styles.actions}>
          <Button
            title={isSuccess ? 'View booking' : 'Back to bookings'}
            onPress={() => {
              if (isSuccess && bookingId) {
                // @ts-expect-error navigation route names are used dynamically in this app
                navigation.navigate('BookingDetail', { bookingId });
                return;
              }
              // @ts-expect-error navigation route names are used dynamically in this app
              navigation.navigate('Bookings');
            }}
            variant="primary"
            fullWidth
          />
          <Button
            title="Continue shopping"
            onPress={() => {
              // @ts-expect-error navigation route names are used dynamically in this app
              navigation.navigate('HomeScreen');
            }}
            variant="outline"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </View>
        {currentBooking && isSuccess ? (
          <Text style={[styles.helper, { color: colors.primary }]}>Escrow status: {currentBooking.escrow?.status || 'active'}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  title: { fontSize: 26, fontWeight: '800', marginTop: 18 },
  subtitle: { marginTop: 10, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bookingLabel: { marginTop: 12, fontSize: 12, fontWeight: '600' },
  actions: { width: '100%', marginTop: 22 },
  helper: { marginTop: 14, fontSize: 12, fontWeight: '700' },
});

export default PaymentResultScreen;
