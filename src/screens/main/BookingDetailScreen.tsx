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
import { BOOKING_STATUS, USER_ROLES } from '../../utils/constants.js';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers.js';

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

  const handlePayNow = async () => {
    try {
      setIsPaymentLoading(true);
      const origin = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:19007';
      const response = await createBookingPaymentSession(bookingId, origin);
      const sessionUrl = response.session?.url;

      if (!sessionUrl) {
        throw new Error('Unable to create payment session');
      }

      navigation.navigate('WebCheckout', { url: sessionUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to initiate payment right now';
      Alert.alert('Payment Error', message);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleReleaseEscrow = () => {
    Alert.alert('Release escrow', 'Release the held funds to the service provider?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Release',
        onPress: async () => {
          try {
            await releaseEscrow(bookingId);
            Alert.alert('Success', 'Escrow released to the provider.');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to release escrow';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleDisputeEscrow = () => {
    Alert.alert('Dispute escrow', 'Open a dispute for this booking?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Continue',
        onPress: async () => {
          try {
            await disputeEscrow(bookingId, 'Escrow dispute raised by the user.');
            Alert.alert('Success', 'Escrow dispute opened.');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to dispute escrow';
            Alert.alert('Error', message);
          }
        },
      },
    ]);
  };

  const handleContactAction = (type) => {
    const contactValue = type === 'call' ? (user?.phone || '') : (user?.email || '');
    if (!contactValue) {
      Alert.alert('Unavailable', 'Contact details are not available for this booking yet.');
      return;
    }

    const url = type === 'call' ? `tel:${contactValue}` : `mailto:${contactValue}`;
    Linking.openURL(url);
  };

  const isProvider = user?.role === USER_ROLES.SERVICE_PROVIDER;
  const isClient = user?.role === USER_ROLES.CLIENT;

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
  const isConfirmed = currentBooking.status === BOOKING_STATUS.CONFIRMED;
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
  const escrowStateMeta = (() => {
    if (!escrow.enabled) {
      return {
        label: 'Disabled',
        description: 'Escrow protection is not enabled for this booking.',
        backgroundColor: '#f3f4f6',
        textColor: '#4b5563',
        borderColor: 'rgba(15,23,42,0.08)',
      };
    }

    switch (escrow.releaseStatus) {
      case 'released':
        return {
          label: 'Released',
          description: 'The escrow funds have been released to the provider.',
          backgroundColor: '#ecfdf3',
          textColor: '#15803d',
          borderColor: 'rgba(22,163,74,0.2)',
        };
      case 'disputed':
        return {
          label: 'Disputed',
          description: 'Escrow is under dispute and requires review.',
          backgroundColor: '#fef2f2',
          textColor: '#dc2626',
          borderColor: 'rgba(220,38,38,0.2)',
        };
      default:
        return {
          label: 'Held',
          description: 'The payment is safely held in escrow until the booking is completed or resolved.',
          backgroundColor: '#eff6ff',
          textColor: '#2563eb',
          borderColor: 'rgba(37,99,235,0.18)',
        };
    }
  })();
  const contactName = isProvider
    ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
    : provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Service provider';
  const contactEmail = isProvider ? client.email : provider.email;
  const contactPhone = isProvider ? client.phone : provider.phone;

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

          <View style={[styles.escrowBanner, { backgroundColor: escrowStateMeta.backgroundColor, borderColor: escrowStateMeta.borderColor }]}> 
            <View style={styles.escrowBadge}> 
              <Text style={[styles.escrowBadgeText, { color: escrowStateMeta.textColor }]}>Escrow {escrowStateMeta.label}</Text>
            </View>
            <Text style={[styles.escrowDescription, { color: escrowStateMeta.textColor }]}>{escrowStateMeta.description}</Text>
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
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Tax</Text>
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

          <View style={[styles.paymentBanner, { backgroundColor: colors.surface, marginTop: 8 }]}> 
            <Text style={[styles.paymentLabel, { color: colors.muted }]}>Escrow</Text>
            <View style={[styles.paymentPill, { backgroundColor: escrow.enabled ? '#dcfce7' : '#f3f4f6' }]}> 
              <Text style={{ color: escrow.enabled ? '#15803d' : '#4b5563', fontSize: 12, fontWeight: '700' }}>{escrow.enabled ? escrow.releaseStatus === 'held' ? 'Funds held' : 'Enabled' : 'Disabled'}</Text>
            </View>
          </View>
          {escrow.enabled ? (
            <View style={[styles.paymentBanner, { backgroundColor: colors.surface, marginTop: 8 }]}> 
              <Text style={[styles.paymentLabel, { color: colors.muted }]}>Escrow policy</Text>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>{escrow.releaseTime === 'after_customer_confirmation' ? 'Released after event completion' : escrow.releaseTime === '48_hours' ? '48 Hours hold' : escrow.releaseTime}</Text>
            </View>
          ) : null}
        </Card>

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
              <Button title="Decline" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {isProvider && !isPending && !isCancelled ? (
            <View style={styles.buttonStack}> 
              <Button title="Mark as completed" onPress={handleCompleteBooking} variant="primary" fullWidth />
              {currentBooking.escrow?.enabled && currentBooking.escrow?.releaseStatus === 'held' ? (
                <Button title="Release escrow" onPress={handleReleaseEscrow} variant="secondary" fullWidth />
              ) : null}
            </View>
          ) : null}

          {isClient && isPending ? (
            <View style={styles.buttonStack}> 
              <View style={[styles.helperBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}> 
                <Text style={styles.helperText}>Your booking is still awaiting provider confirmation. Payment will unlock after confirmation.</Text>
              </View>
              <Button title="Cancel booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {isClient && !isPending && !isCancelled && currentBooking.payment?.status !== 'completed' ? (
            <View style={styles.buttonStack}> 
              <Button title="Pay now" onPress={handlePayNow} variant="primary" fullWidth isLoading={isPaymentLoading} />
              <Button title="Cancel booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          ) : null}

          {isClient && !isPending && !isCancelled && currentBooking.payment?.status === 'completed' ? (
            <View style={styles.buttonStack}> 
              <Button title="Payment completed" variant="outline" fullWidth disabled />
              {currentBooking.escrow?.enabled && currentBooking.escrow?.releaseStatus === 'held' ? (
                <Button title="Dispute escrow" onPress={handleDisputeEscrow} variant="danger" fullWidth />
              ) : null}
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
  helperBox: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 10 },
  helperText: { fontSize: 13, color: '#9a2c00', lineHeight: 18 },
  cancelBox: { borderWidth: 1, borderRadius: 18, padding: 12, marginTop: 12 },
  textInputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  textInput: { minHeight: 84, fontSize: 14 },
  cancelActions: { flexDirection: 'row' },
  secondaryAction: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginRight: 8 },
  secondaryActionText: { fontSize: 14, fontWeight: '700' },
  primaryAction: { flex: 1, backgroundColor: '#dc2626', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryActionText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default BookingDetailScreen;
