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
      if (!sessionUrl) throw new Error('Unable to create payment session');
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
    const contactValue = type === 'call' ? (contactPhone || '') : (contactEmail || '');
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
      <View className="flex-1 bg-light p-4">
        <ErrorMessage error={error} />
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  if (!currentBooking) {
    return (
      <View className="flex-1 bg-light p-4 justify-center items-center">
        <Text className="text-dark text-lg font-semibold mb-4">Booking not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
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
  const openVerification = () => navigation.navigate('VendorVerification', { provider: provider });

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Booking Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Status Card */}
        <View className="bg-white p-4 mx-4 mt-4 rounded-lg border-l-4" style={{ borderColor: statusColor }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm">Booking Status</Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-dark text-xs font-bold capitalize">{currentBooking.status}</Text>
            </View>
          </View>
          <Text className="text-dark text-2xl font-bold">
            Booking #{currentBooking.bookingNumber}
          </Text>
          <Text className="text-gray-500 text-xs mt-2">
            Created: {formatDateTime(currentBooking.createdAt)}
          </Text>
        </View>

        {/* Booking Information */}
        <View className="bg-white p-4 mx-4 mt-3 rounded-lg">
          <Text className="text-dark text-lg font-semibold mb-4">Booking Information</Text>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="briefcase" size={20} color={COLORS.primary} />
              <Text className="text-gray-600 ml-3 flex-1">Service</Text>
            </View>
            <Text className="text-dark font-semibold ml-8">
              {service.name || 'Service'}
            </Text>
          </View>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
              <Text className="text-gray-600 ml-3 flex-1">Event Date</Text>
            </View>
            <Text className="text-dark font-semibold ml-8">
              {formatDate(currentBooking.eventDate)}
            </Text>
          </View>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.primary} />
              <Text className="text-gray-600 ml-3 flex-1">Number of Guests</Text>
            </View>
            <Text className="text-dark font-semibold ml-8">{currentBooking.numberOfGuests}</Text>
          </View>

          {currentBooking.specialRequirements && (
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="note-text" size={20} color={COLORS.primary} />
                <Text className="text-gray-600 ml-3 flex-1">Special Requirements</Text>
              </View>
              <Text className="text-dark ml-8">{currentBooking.specialRequirements}</Text>
            </View>
          )}
        </View>

        {/* Trust and actions */}
        <View className="bg-white p-4 mx-4 mt-3 rounded-lg">
          <Text className="text-dark text-lg font-semibold mb-4">Trust & communication</Text>

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="shield-check" size={18} color={COLORS.primary} />
              <Text className="text-gray-600 ml-2">Vendor verified</Text>
            </View>
            <TouchableOpacity onPress={openVerification}>
              <Text className="text-primary font-semibold">View badges</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={18} color={COLORS.primary} />
              <Text className="text-gray-600 ml-2">Escrow status</Text>
            </View>
            <TouchableOpacity onPress={openEscrowStatus}>
              <Text className="text-primary font-semibold">Check status</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="message-text" size={18} color={COLORS.primary} />
              <Text className="text-gray-600 ml-2">Secure chat</Text>
            </View>
            <TouchableOpacity onPress={openChat}>
              <Text className="text-primary font-semibold">Open</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.primary} />
              <Text className="text-gray-600 ml-2">Dispute</Text>
            </View>
            <TouchableOpacity onPress={openDispute}>
              <Text className="text-primary font-semibold">Submit evidence</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pricing Information */}
        <View className="bg-white p-4 mx-4 mt-3 rounded-lg">
          <Text className="text-dark text-lg font-semibold mb-4">Pricing</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Base Price</Text>
            <Text className="text-dark font-semibold">{formatCurrency(basePrice)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Quantity</Text>
            <Text className="text-dark font-semibold">{quantity}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-dark font-semibold">{formatCurrency(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Discount</Text>
              <Text className="text-success font-semibold">-{formatCurrency(discount)}</Text>
            </View>
          )}

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Tax</Text>
            <Text className="text-dark font-semibold">{formatCurrency(tax)}</Text>
          </View>

          <View className="flex-row justify-between pt-3 border-t border-gray-200">
            <Text className="text-dark text-lg font-bold">Total Amount</Text>
            <Text className="text-primary text-lg font-bold">
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          {/* Payment Status */}
          <View className="mt-4 pt-4 border-t border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Payment Status</Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor:
                    currentBooking.payment?.status === 'completed'
                      ? '#dcfce7'
                      : currentBooking.payment?.status === 'pending'
                      ? '#fef3c7'
                      : '#fee2e2',
                }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{
                    color:
                      currentBooking.payment?.status === 'completed'
                        ? '#15803d'
                        : currentBooking.payment?.status === 'pending'
                        ? '#92400e'
                        : '#991b1b',
                  }}
                >
                  {currentBooking.payment?.status || 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Party Information */}
        <View className="bg-white p-4 mx-4 mt-3 rounded-lg">
          <Text className="text-dark text-lg font-semibold mb-4">Party Information</Text>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <Text className="text-gray-600 text-sm mb-2">
              {isProvider ? 'Client' : 'Service Provider'}
            </Text>
            <Text className="text-dark font-semibold">
              {isProvider
                ? client.firstName +
                  ' ' +
                  client.lastName
                : provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim()}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {isProvider ? client.email : provider.email}
            </Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 border border-primary rounded-lg py-3">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="phone" size={18} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-2">Call</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border border-primary rounded-lg py-3">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="message" size={18} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-2">Message</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="bg-white p-4 mx-4 mt-3 mb-6 rounded-lg">
          <Text className="text-dark text-lg font-semibold mb-4">Actions</Text>

          {/* For Provider */}
          {isProvider && isPending && (
            <View className="gap-2">
              <Button title="Confirm Booking" onPress={handleConfirmBooking} variant="primary" fullWidth />
              <Button title="Decline" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          )}

          {isProvider && isConfirmed && (
            <Button
              title="Mark as Completed"
              onPress={handleCompleteBooking}
              variant="primary"
              fullWidth
            />
          )}

          {/* For Client */}
          {isClient && isPending && (
            <Button title="Cancel Booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
          )}

          {isClient && isConfirmed && (
            <View className="gap-2">
              <Button title="View Payment Details" variant="outline" fullWidth />
              <Button title="Cancel Booking" onPress={() => setShowCancelForm(true)} variant="danger" fullWidth />
            </View>
          )}

          {/* Cancel Form */}
          {showCancelForm && !isCancelled && (
            <View className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <Text className="text-dark font-semibold mb-2">Reason for Cancellation</Text>
              <View className="bg-white border border-gray-300 rounded p-3 mb-3">
                <TextInput
                  className="text-gray-600"
                  placeholder="Enter reason..."
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                />
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 border border-gray-300 rounded-lg py-2"
                  onPress={() => setShowCancelForm(false)}
                >
                  <Text className="text-dark font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-red-500 rounded-lg py-2"
                  onPress={handleCancelBooking}
                >
                  <Text className="text-white font-semibold text-center">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingDetailScreen;
