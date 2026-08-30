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
  const [providerPrice, setProviderPrice] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);

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

  const isPriceOnRequest = !currentBooking?.pricing?.totalAmount || currentBooking?.pricing?.totalAmount === 0 || currentBooking?.service?.priceOnRequest;

  const handleConfirmBooking = () => {
    if (isPriceOnRequest && !providerPrice.trim()) {
      setShowPriceInput(true);
      return;
    }
    const parsedPrice = parseFloat(providerPrice.trim());
    if (isPriceOnRequest && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      Alert.alert('Price Required', 'Please enter a valid price for this service before confirming.');
      return;
    }
    const payload: any = {};
    if (providerPrice.trim() && !isNaN(parsedPrice) && parsedPrice > 0) {
      payload.price = parsedPrice;
    }
    Alert.alert('Confirm Booking', 'Are you sure you want to confirm this booking?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const response = await confirmBooking(bookingId, payload);
            Alert.alert('Booking Confirmed', 'The booking has been confirmed. The client will now be prompted to complete payment.');
            setShowPriceInput(false);
            if (response?.checkoutUrl) {
              (navigation as any).navigate('WebCheckout', { url: response.checkoutUrl, bookingId });
            }
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

  const handlePayNow = async (paymentType: 'deposit' | 'balance' | 'full' = 'full', gateway?: string) => {
    try {
      setIsPaymentLoading(true);
      const origin = process.env.EXPO_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:19007');
      const response = await createBookingPaymentSession(bookingId, origin, gateway);
      const sessionUrl = response?.checkoutUrl || response?.session?.url;
      if (!sessionUrl) throw new Error('No payment URL returned. Please try again.');
      const amountDue = response?.amountDue ||
        (paymentType === 'deposit' ? currentBooking?.depositAmount :
         paymentType === 'balance' ? currentBooking?.balanceDue :
         currentBooking?.pricing?.totalAmount);
      (navigation as any).navigate('WebCheckout', {
        url: sessionUrl,
        bookingId,
        gateway: response?.gateway || gateway || 'paystack',
        paymentType,
        amountDue,
      });
    } catch (err) {
      Alert.alert('Payment Error', err instanceof Error ? err.message : 'Unable to initiate payment right now');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePayBalance = async (gateway: string) => {
    try {
      setIsPaymentLoading(true);
      const origin = process.env.EXPO_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:19007');
      const response = await createBookingPaymentSession(bookingId, origin, gateway);
      const sessionUrl = response?.checkoutUrl || response?.session?.url;
      if (!sessionUrl) throw new Error('No payment URL returned. Please try again.');
      (navigation as any).navigate('WebCheckout', {
        url: sessionUrl,
        bookingId,
        gateway: response?.gateway || gateway,
        paymentType: 'balance',
        amountDue: response?.amountDue || currentBooking?.balanceDue,
      });
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
        : { _id: String(provider._id || provider), firstName: provider.firstName || '', lastName: provider.lastName || '', businessName: provider.businessName || '', role: provider.role || 'service_provider' };
      if (!otherParty._id || otherParty._id === 'undefined') {
        Alert.alert('Unavailable', 'Cannot open chat for this booking yet.');
        return;
      }
      (navigation as any).navigate('Chat', {
        receiverId: otherParty._id,
        receiverName: [otherParty.firstName, otherParty.lastName].filter(Boolean).join(' ') || otherParty.businessName,
        receiverRole: otherParty.role,
        bookingId: String(currentBooking._id),
      });
      return;
    }
    const contactValue = type === 'call' ? (isProvider ? client.phoneNumber : provider.phoneNumber) || '' : '';
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
  const receipt = currentBooking.receipt || {};
  const receiptItems = receipt.items || (
    currentBooking.adminSetPrices?.length
      ? currentBooking.adminSetPrices.map((item: any) => ({
          name: item.serviceName,
          quantity: 1,
          unitPrice: item.price,
          amount: item.price,
        }))
      : [{
          name: service.name || 'Service',
          category: service.category || service.subCategory || currentBooking.bookingType,
          quantity,
          unitPrice: pricing.unitPrice || basePrice,
          amount: subtotal || totalAmount,
        }]
  );
  const receiptAmounts = receipt.amounts || {
    subtotal,
    serviceAndDeliveryFee: pricing.serviceAndDeliveryFee || 0,
    discount,
    tax,
    totalAmount,
    amountPaid: currentBooking.balancePaid
      ? totalAmount
      : currentBooking.depositPaid
      ? currentBooking.depositAmount || 0
      : 0,
  };
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
            {(service.category || service.subCategory) ? (
              <View style={styles.tagRow}>
                {service.category ? (
                  <View style={[styles.tagGray, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.tagGrayText, { color: colors.muted }]}>{service.category}</Text>
                  </View>
                ) : null}
                {service.subCategory ? (
                  <View style={[styles.tagGray, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.tagGrayText, { color: colors.muted }]}>{service.subCategory}</Text>
                  </View>
                ) : null}
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

          {/* Admin-set prices breakdown */}
          {currentBooking.adminSetPrices && currentBooking.adminSetPrices.length > 0 && (
            <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Admin Adjusted Pricing</Text>
              {currentBooking.adminSetPrices.map((item: any, i: number) => (
                <View key={i} style={styles.priceRow}>
                  <Text style={[styles.label, { color: '#2563eb' }]}>{item.serviceName}</Text>
                  <Text style={[styles.value, { color: '#2563eb' }]}>{formatCurrency(item.price)}</Text>
                </View>
              ))}
            </View>
          )}

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

          {/* Payment Progress Section */}
          {(() => {
            const total = totalAmount;
            const isSplit = currentBooking.paymentPlan === 'split_50_50' || currentBooking.paymentPlan === 'deposit_20';
            const amountPaid = isSplit
              ? (currentBooking.balancePaid ? total : currentBooking.depositPaid ? (currentBooking.depositAmount || 0) : 0)
              : (paymentStatus === 'completed' ? total : 0);
            const remaining = Math.max(0, total - amountPaid);
            const paidPct = total > 0 ? Math.round((amountPaid / total) * 100) : 0;
            const balanceDeadline = currentBooking.balanceDeadline ? new Date(currentBooking.balanceDeadline) : null;
            const daysLeft = balanceDeadline ? Math.ceil((balanceDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isOverdue = daysLeft !== null && daysLeft < 0 && remaining > 0;
            const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && remaining > 0;
            const barColor = paidPct === 100 ? '#16a34a' : isOverdue ? '#dc2626' : isUrgent ? '#d97706' : colors.primary;

            return (
              <View style={{ marginTop: 14, backgroundColor: isDark ? '#1a2e1f' : '#f0fdf4', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: isDark ? '#166534' : '#bbf7d0' }}>
                <Text style={{ color: isDark ? '#86efac' : '#15803d', fontSize: 12, fontWeight: '800', marginBottom: 10, letterSpacing: 0.6 }}>PAYMENT PROGRESS</Text>

                {/* Progress Bar */}
                <View style={{ height: 10, backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
                  <View style={{ height: 10, width: `${paidPct}%`, backgroundColor: barColor, borderRadius: 999 }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Paid</Text>
                  <Text style={{ color: barColor, fontSize: 13, fontWeight: '800' }}>{paidPct}% — {formatCurrency(amountPaid)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Remaining</Text>
                  <Text style={{ color: remaining > 0 ? colors.danger : '#16a34a', fontSize: 13, fontWeight: '800' }}>
                    {remaining > 0 ? formatCurrency(remaining) : 'Fully Paid ✓'}
                  </Text>
                </View>

                {isSplit && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Plan</Text>
                    <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                      {currentBooking.paymentPlan === 'deposit_20' ? '20% Deposit + 80% Balance' : '50/50 Split'}
                    </Text>
                  </View>
                )}

                {balanceDeadline && remaining > 0 && (
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, borderRadius: 10, padding: 10, borderWidth: 1 },
                    isOverdue
                      ? { backgroundColor: isDark ? '#2d1515' : '#fef2f2', borderColor: '#fca5a5' }
                      : isUrgent
                      ? { backgroundColor: isDark ? '#2d1a00' : '#fff7ed', borderColor: '#fed7aa' }
                      : { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderColor: '#bfdbfe' }
                  ]}>
                    <MaterialCommunityIcons
                      name={isOverdue ? 'alert-circle' : isUrgent ? 'clock-alert' : 'calendar-clock'}
                      size={16}
                      color={isOverdue ? '#dc2626' : isUrgent ? '#d97706' : '#2563eb'}
                    />
                    <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: isOverdue ? '#dc2626' : isUrgent ? '#d97706' : '#2563eb' }}>
                      {isOverdue
                        ? `Balance overdue! Service may not be delivered.`
                        : isUrgent
                        ? `Balance due in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — pay now to secure service.`
                        : `Balance deadline: ${formatDate(balanceDeadline)} (${daysLeft} days left)`}
                    </Text>
                  </View>
                )}

                {paidPct === 100 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: isDark ? '#14532d' : '#dcfce7', borderRadius: 10, padding: 10 }}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#16a34a" />
                    <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>Payment complete — service confirmed.</Text>
                  </View>
                )}
              </View>
            );
          })()}
        </View>

        {/* Receipt */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.receiptHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 4 }]}>Receipt</Text>
              <Text style={[styles.meta, { color: colors.muted }]}>{receipt.receiptNumber || `RCPT-${currentBooking.bookingNumber}`}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.pillText, { color: colors.text }]}>{paymentStatus || 'Pending'}</Text>
            </View>
          </View>

          <View style={[styles.receiptEventBox, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.receiptEventTitle, { color: colors.text }]}>Event Details</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>Date: {formatDate(currentBooking.eventDate)}</Text>
            {currentBooking.eventTime ? <Text style={[styles.meta, { color: colors.muted }]}>Time: {currentBooking.eventTime}</Text> : null}
            <Text style={[styles.meta, { color: colors.muted }]}>Guests: {currentBooking.numberOfGuests || quantity}</Text>
            {currentBooking.bookingLocation?.address ? (
              <Text style={[styles.meta, { color: colors.muted }]}>Location: {currentBooking.bookingLocation.address}</Text>
            ) : null}
          </View>

          <Text style={[styles.receiptEventTitle, { color: colors.text }]}>Selected Services</Text>
          {receiptItems.map((item: any, index: number) => (
            <View key={`${item.name}-${index}`} style={[styles.receiptItem, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.value, { color: colors.text }]}>{item.name || 'Service'}</Text>
                <Text style={[styles.meta, { color: colors.muted }]}>
                  Qty {item.quantity || 1}{item.category ? ` - ${item.category}` : ''}
                </Text>
              </View>
              <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(item.amount || item.unitPrice || 0)}</Text>
            </View>
          ))}

          <View style={styles.receiptTotals}>
            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Subtotal</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(receiptAmounts.subtotal || 0)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Service & Delivery Fee</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(receiptAmounts.serviceAndDeliveryFee || 0)}</Text>
            </View>
            {receiptAmounts.discount > 0 ? (
              <View style={styles.priceRow}>
                <Text style={[styles.label, { color: colors.muted }]}>Discount</Text>
                <Text style={[styles.value, { color: '#16a34a' }]}>-{formatCurrency(receiptAmounts.discount)}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, { borderTopColor: colors.border, marginBottom: 6 }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(receiptAmounts.totalAmount || totalAmount)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Paid</Text>
              <Text style={[styles.value, { color: '#16a34a' }]}>{formatCurrency(receiptAmounts.amountPaid || 0)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Balance</Text>
              <Text style={[styles.value, { color: Math.max(0, (receiptAmounts.totalAmount || totalAmount) - (receiptAmounts.amountPaid || 0)) > 0 ? colors.danger : '#16a34a' }]}>
                {formatCurrency(Math.max(0, (receiptAmounts.totalAmount || totalAmount) - (receiptAmounts.amountPaid || 0)))}
              </Text>
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
              {/* Price input for priceOnRequest services */}
              {(showPriceInput || isPriceOnRequest) && (
                <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: isDark ? '#1e40af' : '#bfdbfe' }}>
                  <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {isPriceOnRequest ? 'Set Service Price (Required)' : 'Override Price (Optional)'}
                  </Text>
                  <View style={[styles.textInputWrap, { backgroundColor: colors.surface, borderColor: !providerPrice.trim() && isPriceOnRequest ? colors.danger : colors.border, marginBottom: 6 }]}>
                    <TextInput
                      style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}
                      placeholder="Enter price e.g. 50000"
                      placeholderTextColor={colors.muted}
                      value={providerPrice}
                      onChangeText={setProviderPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  {providerPrice.trim() && !isNaN(parseFloat(providerPrice)) && parseFloat(providerPrice) > 0 && (
                    <View style={{ backgroundColor: isDark ? '#14532d' : '#dcfce7', borderRadius: 10, padding: 10 }}>
                      <Text style={{ color: '#15803d', fontSize: 12 }}>Service: {formatCurrency(parseFloat(providerPrice))}</Text>
                      <Text style={{ color: '#15803d', fontSize: 12 }}>Platform fee (10%): {formatCurrency(parseFloat(providerPrice) * 0.10)}</Text>
                      <Text style={{ color: '#15803d', fontSize: 13, fontWeight: '800' }}>Client total: {formatCurrency(parseFloat(providerPrice) * 1.10)}</Text>
                    </View>
                  )}
                </View>
              )}
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

          {isClient && isPending && (
            <View style={[styles.actionGap, { marginTop: 8 }]}>
              <View style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1, borderRadius: 14, padding: 12 }}>
                <Text style={{ fontSize: 13, color: '#9a2c00', lineHeight: 18 }}>Your booking request has been sent. Payment will be available once the provider confirms your booking.</Text>
              </View>
            </View>
          )}

          {isClient && isConfirmed && (
            <View style={styles.actionGap}>
              {/* Full payment */}
              {currentBooking.paymentPlan === 'full' && paymentStatus !== 'completed' && (
                <View style={styles.actionGap}>
                  <Text style={[styles.label, { color: colors.muted, marginBottom: 4 }]}>Choose payment method:</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Pay via Paystack" onPress={() => handlePayNow('full', 'paystack')} isLoading={isPaymentLoading} variant="primary" style={{ flex: 1 }} />
                    <Button title="Pay via Flutterwave" onPress={() => handlePayNow('full', 'flutterwave')} isLoading={isPaymentLoading} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              )}

              {/* Deposit plan - deposit not yet paid */}
              {(currentBooking.paymentPlan === 'split_50_50' || currentBooking.paymentPlan === 'deposit_20') && !currentBooking.depositPaid && (
                <View style={styles.actionGap}>
                  <Text style={[styles.label, { color: colors.muted, marginBottom: 4 }]}>Pay deposit ({currentBooking.paymentPlan === 'deposit_20' ? '20%' : '50%'}) — {formatCurrency(currentBooking.depositAmount)}:</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Paystack" onPress={() => handlePayNow('deposit', 'paystack')} isLoading={isPaymentLoading} variant="primary" style={{ flex: 1 }} />
                    <Button title="Flutterwave" onPress={() => handlePayNow('deposit', 'flutterwave')} isLoading={isPaymentLoading} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              )}

              {/* Deposit plan - deposit paid, balance not yet paid */}
              {(currentBooking.paymentPlan === 'split_50_50' || currentBooking.paymentPlan === 'deposit_20') && currentBooking.depositPaid && !currentBooking.balancePaid && (
                <View style={styles.actionGap}>
                  <Text style={[styles.label, { color: colors.danger, marginBottom: 4 }]}>Balance due: {formatCurrency(currentBooking.balanceDue)} — must be paid before event date.</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Pay Balance via Paystack" onPress={() => handlePayBalance('paystack')} isLoading={isPaymentLoading} variant="primary" style={{ flex: 1 }} />
                    <Button title="Flutterwave" onPress={() => handlePayBalance('flutterwave')} isLoading={isPaymentLoading} variant="outline" style={{ flex: 1 }} />
                  </View>
                </View>
              )}

              {paymentStatus === 'completed' && currentBooking.balancePaid && (
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
  linkText: { fontSize: 13, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 16, fontWeight: '800' },
  paymentStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  receiptEventBox: { borderRadius: 14, padding: 12, marginBottom: 14 },
  receiptEventTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  receiptItem: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1 },
  receiptTotals: { marginTop: 2 },
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
