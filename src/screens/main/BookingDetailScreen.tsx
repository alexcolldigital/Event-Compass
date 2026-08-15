/**
 * Booking Detail Screen
 * Polished booking details experience that matches the app marketplace UI.
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
import { Card } from '../../components/Card.jsx';
import { useTheme } from '../../context/ThemeContext';
import { BOOKING_STATUS, USER_ROLES, PAYMENT_PLAN } from '../../utils/constants.js';
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
    rejectBooking,
  } = useBookingStore();
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'paystack' | 'flutterwave' | null>(null);

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
    if (!bookingId || !isAuthenticated) return;
    getBookingById(bookingId);
  }, [bookingId, isAuthenticated]);

  const handleRejectBooking = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejecting this booking.');
      return;
    }
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectBooking(bookingId, rejectReason.trim());
            Alert.alert('Booking Rejected', 'The booking has been rejected and the client has been notified.');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reject booking');
          }
        },
      },
    ]);
  };

  const handleConfirmBooking = () => {
    Alert.alert('Confirm Booking', 'Are you sure you want to confirm this booking?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const response = await confirmBooking(bookingId);
            Alert.alert(
              'Booking Confirmed',
              'The booking has been confirmed. The client will now be prompted to complete payment.',
            );
            // If a checkout URL was generated, navigate to it so the client can pay
            if (response?.checkoutUrl) {
              navigation.navigate('WebCheckout', { url: response.checkoutUrl, bookingId });
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to confirm booking';
            Alert.alert('Error', message);
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
            const message = err instanceof Error ? err.message : 'Failed to cancel booking';
            Alert.alert('Error', message);
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
            const message = err instanceof Error ? err.message : 'Failed to complete booking';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handlePayNow = async (gateway?: 'paystack' | 'flutterwave') => {
    try {
      setIsPaymentLoading(true);
      const origin = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:19007';
      const response = await createBookingPaymentSession(bookingId, origin, gateway);
      const sessionUrl = response.checkoutUrl || response.session?.url;

      if (!sessionUrl) {
        throw new Error('Unable to create payment session');
      }

      navigation.navigate('WebCheckout', { url: sessionUrl, bookingId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to initiate payment right now';
      Alert.alert('Payment Error', message);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleSelectGatewayAndPay = () => {
    Alert.alert(
      'Choose Payment Method',
      'Select your preferred payment provider to complete this booking.',
      [
        { text: 'Paystack', onPress: () => handlePayNow('paystack') },
        { text: 'Flutterwave', onPress: () => handlePayNow('flutterwave') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReleaseEscrow = () => {};
  const handleDisputeEscrow = () => {};

  const handleContactAction = (type) => {
    if (type === 'message') {
      const otherParty = isProvider
        ? { _id: String(client._id || client), firstName: client.firstName || '', lastName: client.lastName || '', role: 'client' }
        : { _id: String(provider._id || provider), firstName: provider.firstName || '', lastName: provider.lastName || '', businessName: provider.businessName || '', role: provider.role || 'service_provider' };
      if (!otherParty._id || otherParty._id === 'undefined') {
        Alert.alert('Unavailable', 'Cannot open chat for this booking yet.');
        return;
      }
      (navigation as any).navigate('Chat', { receiver: otherParty, booking: currentBooking });
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

  // Payment plan helpers
  const paymentPlan = currentBooking?.paymentPlan;
  const isSplitPlan = paymentPlan === PAYMENT_PLAN.SPLIT_50_50 || paymentPlan === PAYMENT_PLAN.DEPOSIT_20;
  const depositAmount = currentBooking?.depositAmount || 0;
  const balanceDue = currentBooking?.balanceDue || 0;
  const depositPaid = currentBooking?.depositPaid || false;
  const balancePaid = currentBooking?.balancePaid || false;
  const balanceDeadline = currentBooking?.balanceDeadline;
  const isBalanceOverdue = balanceDeadline && !balancePaid && new Date() > new Date(balanceDeadline);
  const planLabel = paymentPlan === PAYMENT_PLAN.SPLIT_50_50 ? '50/50 Split' : paymentPlan === PAYMENT_PLAN.DEPOSIT_20 ? '20% Deposit' : 'Full Payment';

  if (isLoading) {
    return <Loading fullScreen message="Loading booking details..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
        <View style={styles.centerState}> 
          <ErrorMessage error={error} />
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" fullWidth style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentBooking) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
        <View style={styles.centerState}> 
          <MaterialCommunityIcons name="calendar-remove-outline" size={64} color="#cbd5e1" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Booking not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} fullWidth style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

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
  const escrow = currentBooking.escrow || {};
  const isPending = currentBooking.status === BOOKING_STATUS.PENDING;
  const isCancelled = currentBooking.status === BOOKING_STATUS.CANCELLED;

  const getStatusMeta = (status) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return { backgroundColor: '#fff7ed', textColor: '#c2410c' };
      case BOOKING_STATUS.CONFIRMED:
        return { backgroundColor: '#eff6ff', textColor: '#2563eb' };
      case BOOKING_STATUS.COMPLETED:
        return { backgroundColor: '#ecfdf3', textColor: '#15803d' };
      case BOOKING_STATUS.CANCELLED:
        return { backgroundColor: '#fef2f2', textColor: '#dc2626' };
      default:
        return { backgroundColor: '#f3f4f6', textColor: '#4b5563' };
    }
  };

  const statusMeta = getStatusMeta(currentBooking.status);
  const contactName = isProvider
    ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
    : provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Service provider';
  const contactEmail = isProvider ? client.email : provider.email;
  const contactPhone = isProvider ? client.phoneNumber : provider.phoneNumber;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}> 
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}> 
        <Card variant="elevated" style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.heroTopRow}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroEyebrow, { color: colors.muted }]}>Booking reference</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>#{currentBooking.bookingNumber}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.muted }]}>Created {formatDateTime(currentBooking.createdAt)}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusMeta.backgroundColor }]}> 
              <Text style={[styles.statusPillText, { color: statusMeta.textColor }]}>{currentBooking.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.heroMetrics}> 
            <View style={styles.metricBox}> 
              <MaterialCommunityIcons name="calendar-clock" size={18} color={colors.primary} />
              <Text style={[styles.metricText, { color: colors.text }]}>{formatDate(currentBooking.eventDate)}</Text>
            </View>
            <View style={styles.metricBox}> 
              <MaterialCommunityIcons name="account-group" size={18} color={colors.primary} />
              <Text style={[styles.metricText, { color: colors.text }]}>{quantity} guest{quantity > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined" style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking overview</Text>

          <View style={styles.infoRow}> 
            <View style={styles.infoIcon}><MaterialCommunityIcons name="briefcase-outline" size={18} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Service</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{service.name || 'Service'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}> 
            <View style={styles.infoIcon}><MaterialCommunityIcons name="calendar-range" size={18} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Event date</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(currentBooking.eventDate)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}> 
            <View style={styles.infoIcon}><MaterialCommunityIcons name="note-text-outline" size={18} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Special requirements</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{currentBooking.specialRequirements || 'No special requirements were added.'}</Text>
            </View>
          </View>
        </Card>

        <Card variant="filled" style={[styles.sectionCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pricing summary</Text>

          {currentBooking.adminSetPrices && currentBooking.adminSetPrices.length > 0 && (
            <View style={[styles.adminPriceBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
              <Text style={[styles.adminPriceTitle, { color: '#c2410c' }]}>Admin-set prices (added to total)</Text>
              {currentBooking.adminSetPrices.map((sp: any, i: number) => (
                <View key={i} style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: '#92400e' }]}>{sp.serviceName || 'Service'}</Text>
                  <Text style={[styles.priceValue, { color: '#c2410c', fontWeight: '800' }]}>{formatCurrency(sp.price)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.priceRow}> 
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Base price</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(basePrice)}</Text>
          </View>
          <View style={styles.priceRow}> 
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Guests</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{quantity}</Text>
          </View>
          <View style={styles.priceRow}> 
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Subtotal</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.priceRow}> 
              <Text style={[styles.priceLabel, { color: colors.muted }]}>Discount</Text>
              <Text style={[styles.priceValue, { color: '#16a34a' }]}>-{formatCurrency(discount)}</Text>
            </View>
          ) : null}
          <View style={styles.priceRow}> 
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Service & Delivery Fee</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(tax)}</Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}> 
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={[styles.paymentBanner, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.paymentLabel, { color: colors.muted }]}>Payment status</Text>
            <View style={[styles.paymentPill, { backgroundColor: currentBooking.payment?.status === 'completed' ? '#dcfce7' : currentBooking.payment?.status === 'pending' ? '#fef3c7' : '#fee2e2' }]}> 
              <Text style={{ color: currentBooking.payment?.status === 'completed' ? '#15803d' : currentBooking.payment?.status === 'pending' ? '#92400e' : '#991b1b', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{currentBooking.payment?.status || 'Pending'}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Plan Breakdown */}
        {isSplitPlan && (
          <Card variant="outlined" style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment plan — {planLabel}</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.muted }]}>Total amount</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{formatCurrency(totalAmount)}</Text>
            </View>

            <View style={styles.priceRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Deposit ({paymentPlan === PAYMENT_PLAN.DEPOSIT_20 ? '20%' : '50%'})</Text>
                {depositPaid && <View style={{ backgroundColor: '#dcfce7', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#15803d' }}>PAID</Text></View>}
              </View>
              <Text style={[styles.priceValue, { color: depositPaid ? '#15803d' : colors.text }]}>{formatCurrency(depositAmount)}</Text>
            </View>

            <View style={[styles.priceRow, styles.totalRow]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Balance due ({paymentPlan === PAYMENT_PLAN.DEPOSIT_20 ? '80%' : '50%'})</Text>
                {balancePaid && <View style={{ backgroundColor: '#dcfce7', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#15803d' }}>PAID</Text></View>}
                {isBalanceOverdue && <View style={{ backgroundColor: '#fee2e2', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#dc2626' }}>OVERDUE</Text></View>}
              </View>
              <Text style={[styles.totalValue, { color: balancePaid ? '#15803d' : isBalanceOverdue ? '#dc2626' : colors.primary }]}>{formatCurrency(balanceDue)}</Text>
            </View>

            {balanceDeadline && !balancePaid && (
              <View style={[styles.helperBox, { backgroundColor: isBalanceOverdue ? '#fef2f2' : '#fff7ed', borderColor: isBalanceOverdue ? '#fecaca' : '#fed7aa', marginTop: 8 }]}>
                <MaterialCommunityIcons name="clock-alert-outline" size={16} color={isBalanceOverdue ? '#dc2626' : '#c2410c'} />
                <Text style={{ fontSize: 13, color: isBalanceOverdue ? '#dc2626' : '#9a2c00', marginLeft: 6, flex: 1, lineHeight: 18 }}>
                  Balance must be paid by {formatDate(balanceDeadline)} (2 days before your event)
                </Text>
              </View>
            )}
          </Card>
        )}

        <Card variant="outlined" style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Party details</Text>
          <Text style={[styles.contactName, { color: colors.text }]}>{contactName}</Text>
          <Text style={[styles.contactMeta, { color: colors.muted }]}>{contactEmail || 'No email shared yet'}</Text>
          <Text style={[styles.contactMeta, { color: colors.muted }]}>{contactPhone || 'No phone shared yet'}</Text>

          <View style={styles.contactActions}> 
            <TouchableOpacity onPress={() => handleContactAction('call')} style={[styles.contactButton, { borderColor: colors.border }]}> 
              <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
              <Text style={[styles.contactButtonText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleContactAction('message')} style={[styles.contactButton, { borderColor: colors.border }]}> 
              <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} />
              <Text style={[styles.contactButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card variant="outlined" style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>

          {isProvider && isPending ? (
            <View style={styles.buttonStack}>
              <Button title="Confirm booking" onPress={handleConfirmBooking} variant="primary" fullWidth />
              <Button title="Reject booking" onPress={() => setShowRejectForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {showRejectForm && isPending ? (
            <View style={[styles.cancelBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca', marginTop: 8 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Reason for rejection</Text>
              <View style={[styles.textInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  placeholder="Enter a reason..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  placeholderTextColor={colors.muted}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
              <View style={styles.cancelActions}>
                <TouchableOpacity onPress={() => { setShowRejectForm(false); setRejectReason(''); }} style={[styles.secondaryAction, { borderColor: colors.border }]}>
                  <Text style={[styles.secondaryActionText, { color: colors.text }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRejectBooking} style={styles.primaryAction}>
                  <Text style={styles.primaryActionText}>Confirm Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {isProvider && !isPending && !isCancelled ? (
            <View style={styles.buttonStack}> 
              <Button title="Mark as completed" onPress={handleCompleteBooking} variant="primary" fullWidth />
            </View>
          ) : null}

          {isClient && isPending ? (
            <View style={styles.buttonStack}>
              <View style={[styles.helperBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                <Text style={styles.helperText}>Your booking request has been sent. Payment will be available once the provider confirms your booking.</Text>
              </View>
              <Button title="Cancel booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {isClient && !isPending && !isCancelled && currentBooking.payment?.status !== 'completed' ? (
            <View style={styles.buttonStack}>
              {isSplitPlan && depositPaid && !balancePaid ? (
                <>
                  <View style={[styles.helperBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', marginBottom: 8 }]}>
                    <Text style={{ fontSize: 13, color: '#1d4ed8', lineHeight: 18 }}>
                      Deposit paid ✔️  Balance of {formatCurrency(balanceDue)} is due by {balanceDeadline ? formatDate(balanceDeadline) : '2 days before event'}.
                    </Text>
                  </View>
                  <Button title={`Pay balance — ${formatCurrency(balanceDue)}`} onPress={handleSelectGatewayAndPay} variant="primary" fullWidth isLoading={isPaymentLoading} />
                </>
              ) : (
                <Button title={isSplitPlan ? `Pay deposit — ${formatCurrency(depositAmount)}` : 'Pay now'} onPress={handleSelectGatewayAndPay} variant="primary" fullWidth isLoading={isPaymentLoading} />
              )}
              <Button title="Cancel booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {isClient && !isPending && !isCancelled && currentBooking.payment?.status === 'completed' ? (
            <View style={styles.buttonStack}> 
              <Button title="Payment completed" variant="outline" fullWidth disabled />
              <Button title="Cancel booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {showCancelForm && !isCancelled ? (
            <View style={[styles.cancelBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}> 
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Reason for cancellation</Text>
              <View style={[styles.textInputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <TextInput
                  placeholder="Enter a reason..."
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  placeholderTextColor={colors.muted}
                  style={[styles.textInput, { color: colors.text }]}
                />
              </View>
              <View style={styles.cancelActions}> 
                <TouchableOpacity onPress={() => setShowCancelForm(false)} style={[styles.secondaryAction, { borderColor: colors.border }]}> 
                  <Text style={[styles.secondaryActionText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelBooking} style={styles.primaryAction}> 
                  <Text style={styles.primaryActionText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  iconButton: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(31,122,77,0.08)' },
  headerTitle: { fontSize: 18, fontWeight: '800', marginLeft: 12 },
  centerState: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  heroCard: { borderRadius: 28, padding: 18, marginTop: 16, marginBottom: 12 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroEyebrow: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { fontSize: 13, marginTop: 6 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heroMetrics: { flexDirection: 'row', marginTop: 14, flexWrap: 'wrap' },
  metricBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(31,122,77,0.08)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  metricText: { marginLeft: 6, fontSize: 12, fontWeight: '700' },
  escrowBanner: { marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 12 },
  escrowBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.7)' },
  escrowBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  escrowDescription: { fontSize: 13, fontWeight: '700', marginTop: 8, lineHeight: 18 },
  escrowBanner: { marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 12 },
  escrowBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.7)' },
  escrowBadgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  escrowDescription: { fontSize: 13, fontWeight: '700', marginTop: 8, lineHeight: 18 },
  sectionCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon: { width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(31,122,77,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  infoLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.6 },
  infoValue: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceLabel: { fontSize: 13, fontWeight: '600' },
  priceValue: { fontSize: 14, fontWeight: '700' },
  totalRow: { paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(15,23,42,0.08)' },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  paymentBanner: { marginTop: 10, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paymentLabel: { fontSize: 13, fontWeight: '700' },
  paymentPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  contactName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  contactMeta: { fontSize: 13, marginTop: 2 },
  contactActions: { flexDirection: 'row', marginTop: 14 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 16, paddingVertical: 12, marginRight: 8 },
  contactButtonText: { fontSize: 14, fontWeight: '700', marginLeft: 6 },
  buttonStack: { marginTop: 4 },
  helperBox: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' },
  helperText: { fontSize: 13, color: '#9a2c00', lineHeight: 18, flex: 1 },
  cancelBox: { borderWidth: 1, borderRadius: 18, padding: 12, marginTop: 12 },
  textInputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  textInput: { minHeight: 84, fontSize: 14 },
  cancelActions: { flexDirection: 'row' },
  secondaryAction: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginRight: 8 },
  secondaryActionText: { fontSize: 14, fontWeight: '700' },
  primaryAction: { flex: 1, backgroundColor: '#dc2626', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryActionText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  adminPriceBox: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 },
  adminPriceTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
});

export default BookingDetailScreen;
