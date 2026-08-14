/**
 * Booking Detail Screen
 * Displays detailed booking information with management options
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useTheme } from '../../context/ThemeContext';
import { BOOKING_STATUS, USER_ROLES } from '../../utils/constants.js';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '../../utils/helpers.js';

const BookingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = (route.params as { bookingId?: string }) || {};

  const {
    currentBooking,
    isLoading,
    error,
    getBookingById,
    confirmBooking,
    cancelBooking,
    completeBooking,
    createBookingPaymentSession,
    releaseEscrow,
    disputeEscrow,
  } = useBookingStore();
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const colors = {
    bg: isDark ? '#0b120d' : '#f5f7f2',
    surface: isDark ? '#151c16' : '#ffffff',
    surfaceAlt: isDark ? '#1d261f' : '#f3f6ef',
    text: isDark ? '#f4f8f1' : '#0f172a',
    muted: isDark ? '#9fb1a3' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
    danger: '#dc2626',
    dangerBg: isDark ? '#2d1515' : '#fef2f2',
  };

  useEffect(() => {
    if (!bookingId || !isAuthenticated) return;
    getBookingById(bookingId);
  }, [bookingId, isAuthenticated]);

  const handleConfirmBooking = () => {
    Alert.alert('Confirm Booking', 'Are you sure you want to confirm this booking?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await confirmBooking(bookingId);
            Alert.alert('Success', 'Booking confirmed!');
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to confirm booking');
          }
        },
      },
    ]);
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await cancelBooking(bookingId, cancelReason);
            Alert.alert('Success', 'Booking cancelled!');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel booking');
          }
        },
      },
    ]);
  };

  const handleCompleteBooking = () => {
    Alert.alert('Complete Booking', 'Mark this booking as completed?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            await completeBooking(bookingId);
            Alert.alert('Success', 'Booking marked as completed!');
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete booking');
          }
        },
      },
    ]);
  };

  const handlePayNow = async () => {
    try {
      setIsPaymentLoading(true);
      const origin = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:19007';
      const response = await createBookingPaymentSession(bookingId, origin);
      const sessionUrl = response.checkoutUrl || response.session?.url;
      if (!sessionUrl) throw new Error('Unable to create payment session');
      navigation.navigate('WebCheckout', { checkoutUrl: sessionUrl, bookingId });
    } catch (err) {
      Alert.alert('Payment Error', err instanceof Error ? err.message : 'Unable to initiate payment right now');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleContactAction = (type: string) => {
    if (type === 'message') {
      const otherParty = isProvider
        ? { _id: String(client._id || client), firstName: client.firstName || '', lastName: client.lastName || '', role: 'client' }
        : { _id: String(provider._id || provider), firstName: provider.firstName || '', lastName: provider.lastName || '', businessName: provider.businessName || '', role: 'service_provider' };
      if (!otherParty._id || otherParty._id === 'undefined') {
        Alert.alert('Unavailable', 'Cannot open chat for this booking yet.');
        return;
      }
      (navigation as any).navigate('Chat', { receiver: otherParty, booking: currentBooking });
      return;
    }
    const contactValue = type === 'call' ? (isProvider ? client.phone : provider.phone) || '' : '';
    if (!contactValue) {
      Alert.alert('Unavailable', 'Contact details are not available for this booking yet.');
      return;
    }
    Linking.openURL(`tel:${contactValue}`);
  };

  const isProvider = user?.role === USER_ROLES.SERVICE_PROVIDER;
  const isClient = user?.role === USER_ROLES.CLIENT;

  if (isLoading) return <Loading fullScreen message="Loading booking details..." />;

  if (error) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={styles.content}>
          <ErrorMessage error={error} />
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentBooking) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, styles.centered]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(currentBooking.status);
  const service = currentBooking.serviceId || currentBooking.service || currentBooking.venue || {};
  const client = currentBooking.clientId || currentBooking.client || {};
  const provider = currentBooking.serviceProviderId || currentBooking.serviceProvider || {};
  const pricing = currentBooking.pricing || {};
  const basePrice = currentBooking.basePrice || pricing.basePrice || 0;
  const quantity = currentBooking.quantity || pricing.quantity || currentBooking.numberOfGuests || 1;
  const subtotal = currentBooking.subtotal || pricing.subtotal || 0;
  const discount = currentBooking.discount || pricing.discount || 0;
  const tax = currentBooking.tax || pricing.tax || 0;
  const totalAmount = currentBooking.totalAmount || pricing.totalAmount || 0;
  const isPending = currentBooking.status === BOOKING_STATUS.PENDING;
  const isConfirmed = currentBooking.status === BOOKING_STATUS.CONFIRMED;
  const isCompleted = currentBooking.status === BOOKING_STATUS.COMPLETED;
  const isCancelled = currentBooking.status === BOOKING_STATUS.CANCELLED;

  const openEscrowStatus = () => navigation.navigate('EscrowStatus', { booking: currentBooking });
  const openChat = () => navigation.navigate('Chat', { booking: currentBooking, receiver: isProvider ? client : provider });
  const openDispute = () => navigation.navigate('DisputeEvidence', { booking: currentBooking });
  const openVerification = () => navigation.navigate('VendorVerification', { provider });

  const paymentStatus = currentBooking.payment?.status;
  const paymentPillBg = paymentStatus === 'completed' ? '#ecfdf3' : paymentStatus === 'pending' ? '#fff7ed' : '#fef2f2';
  const paymentPillText = paymentStatus === 'completed' ? '#15803d' : paymentStatus === 'pending' ? '#c2410c' : '#dc2626';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero Banner */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Booking Details</Text>
          <Text style={styles.heroSubtitle}>#{currentBooking.bookingNumber}</Text>
        </View>

        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.muted }]}>Booking Status</Text>
            <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.pillText, { color: colors.text }]}>{currentBooking.status?.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.bookingNum, { color: colors.text }]}>Booking #{currentBooking.bookingNumber}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Created: {formatDateTime(currentBooking.createdAt)}</Text>

          {/* Admin note — shown to client after accept or reject */}
          {currentBooking.adminNote ? (
            <View style={[
              styles.adminNoteBox,
              currentBooking.status === 'rejected'
                ? { backgroundColor: colors.dangerBg, borderColor: '#fca5a5' }
                : { backgroundColor: '#ecfdf3', borderColor: '#86efac' },
            ]}>
              <MaterialCommunityIcons
                name={currentBooking.status === 'rejected' ? 'close-circle-outline' : 'check-circle-outline'}
                size={16}
                color={currentBooking.status === 'rejected' ? colors.danger : '#15803d'}
              />
              <Text style={[
                styles.adminNoteText,
                { color: currentBooking.status === 'rejected' ? colors.danger : '#15803d' },
              ]}>
                {currentBooking.status === 'rejected' ? 'Rejected: ' : 'Admin: '}{currentBooking.adminNote}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Booking Information */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Information</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconLabel}>
              <MaterialCommunityIcons name="briefcase" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.muted, marginLeft: 10 }]}>Service</Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{service.name || 'Service'}</Text>
            {service.serviceType ? (
              <View style={styles.tagRow}>
                <View style={styles.tagGreen}><Text style={styles.tagGreenText}>{service.serviceType}</Text></View>
                {service.category ? <View style={[styles.tagGray, { backgroundColor: colors.surfaceAlt }]}><Text style={[styles.tagGrayText, { color: colors.muted }]}>{service.category}</Text></View> : null}
                {service.subCategory ? <View style={[styles.tagGray, { backgroundColor: colors.surfaceAlt }]}><Text style={[styles.tagGrayText, { color: colors.muted }]}>{service.subCategory}</Text></View> : null}
              </View>
            ) : null}
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconLabel}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.muted, marginLeft: 10 }]}>Event Date</Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{formatDate(currentBooking.eventDate)}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconLabel}>
              <MaterialCommunityIcons name="account-multiple" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.muted, marginLeft: 10 }]}>Number of Guests</Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{currentBooking.numberOfGuests}</Text>
          </View>

          {currentBooking.specialRequirements ? (
            <View style={styles.infoRowLast}>
              <View style={styles.iconLabel}>
                <MaterialCommunityIcons name="note-text" size={20} color={colors.primary} />
                <Text style={[styles.label, { color: colors.muted, marginLeft: 10 }]}>Special Requirements</Text>
              </View>
              <Text style={[styles.value, { color: colors.text }]}>{currentBooking.specialRequirements}</Text>
            </View>
          ) : null}
        </View>

        {/* Trust & Communication */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trust & Communication</Text>

          {[
            { icon: 'shield-check', label: 'Vendor verified', actionLabel: 'View badges', onPress: openVerification },
            { icon: 'cash-multiple', label: 'Escrow status', actionLabel: 'Check status', onPress: openEscrowStatus },
            { icon: 'message-text', label: 'Secure chat', actionLabel: 'Open', onPress: openChat },
            { icon: 'alert-circle', label: 'Dispute', actionLabel: 'Submit evidence', onPress: openDispute },
          ].map((item, i, arr) => (
            <View key={item.label} style={[styles.trustRow, i < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.iconLabel}>
                <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.label, { color: colors.muted, marginLeft: 8 }]}>{item.label}</Text>
              </View>
              <TouchableOpacity onPress={item.onPress}>
                <Text style={[styles.linkText, { color: colors.primary }]}>{item.actionLabel}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing</Text>

          {[
            { label: 'Base Price', value: `${formatCurrency(basePrice)}${service.pricing?.unit ? ` / ${service.pricing.unit.replace('_', ' ')}` : ''}` },
            { label: 'Quantity', value: String(quantity) },
            { label: 'Subtotal', value: formatCurrency(subtotal) },
            ...(discount > 0 ? [{ label: 'Discount', value: `-${formatCurrency(discount)}`, isDiscount: true }] : []),
            { label: 'Tax', value: formatCurrency(tax) },
          ].map((row: any) => (
            <View key={row.label} style={styles.priceRow}>
              <Text style={[styles.label, { color: colors.muted }]}>{row.label}</Text>
              <Text style={[styles.value, { color: row.isDiscount ? '#16a34a' : colors.text }]}>{row.value}</Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={[styles.paymentStatusRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>Payment Status</Text>
            <View style={[styles.pill, { backgroundColor: paymentPillBg }]}>
              <Text style={[styles.pillText, { color: paymentPillText }]}>{paymentStatus || 'Pending'}</Text>
            </View>
          </View>
        </View>

        {/* Party Information */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Party Information</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.muted }]}>{isProvider ? 'Client' : 'Service Provider'}</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {isProvider
                ? `${client.firstName} ${client.lastName}`
                : provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim()}
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{isProvider ? client.email : provider.email}</Text>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity style={[styles.contactBtn, { borderColor: colors.primary }]} onPress={() => handleContactAction('call')}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
              <Text style={[styles.contactBtnText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, { borderColor: colors.primary }]} onPress={() => handleContactAction('message')}>
              <MaterialCommunityIcons name="message" size={18} color={colors.primary} />
              <Text style={[styles.contactBtnText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 0 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>

          {isProvider && isPending && (
            <View style={styles.actionGap}>
              <Button title="Confirm Booking" onPress={handleConfirmBooking} variant="primary" fullWidth />
              <Button title="Decline" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          )}

          {isProvider && isConfirmed && (
            <Button title="Mark as Completed" onPress={handleCompleteBooking} variant="primary" fullWidth />
          )}

          {isClient && isPending && (
            <Button title="Cancel Booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
          )}

          {isClient && isConfirmed && (
            <View style={styles.actionGap}>
              {paymentStatus !== 'completed' ? (
                <Button
                  title={isPaymentLoading ? 'Opening Payment...' : 'Pay Now'}
                  onPress={handlePayNow}
                  isLoading={isPaymentLoading}
                  variant="primary"
                  fullWidth
                />
              ) : (
                <Button title="Payment Completed" variant="outline" fullWidth />
              )}
              <Button title="Cancel Booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          )}

          {showCancelForm && !isCancelled && (
            <View style={[styles.cancelForm, { backgroundColor: colors.dangerBg, borderColor: '#fca5a5' }]}>
              <Text style={[styles.value, { color: colors.text, marginBottom: 8 }]}>Reason for Cancellation</Text>
              <View style={[styles.textInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={{ color: colors.text }}
                  placeholder="Enter reason..."
                  placeholderTextColor={colors.muted}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                />
              </View>
              <View style={styles.cancelBtns}>
                <TouchableOpacity style={[styles.cancelSecondary, { borderColor: colors.border }]} onPress={() => setShowCancelForm(false)}>
                  <Text style={[styles.value, { color: colors.text, textAlign: 'center' }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelPrimary} onPress={handleCancelBooking}>
                  <Text style={styles.cancelPrimaryText}>Confirm Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  hero: { borderRadius: 28, padding: 20, marginTop: 8, marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  card: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bookingNum: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  meta: { fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  infoRow: { paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1 },
  infoRowLast: { paddingBottom: 4 },
  iconLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13 },
  value: { fontSize: 14, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagGreen: { backgroundColor: '#ecfdf3', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagGreenText: { color: '#1f7a4d', fontSize: 11, fontWeight: '700' },
  tagGray: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagGrayText: { fontSize: 11, fontWeight: '700' },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  linkText: { fontSize: 13, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 16, fontWeight: '800' },
  paymentStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'capitalize' },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 16, paddingVertical: 12, gap: 6 },
  contactBtnText: { fontSize: 14, fontWeight: '700' },
  actionGap: { gap: 10 },
  cancelForm: { marginTop: 14, padding: 14, borderRadius: 16, borderWidth: 1 },
  textInputWrap: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  cancelBtns: { flexDirection: 'row', gap: 10 },
  cancelSecondary: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10 },
  cancelPrimary: { flex: 1, backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  cancelPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  adminNoteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 10 },
  adminNoteText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});

export default BookingDetailScreen;
