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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { COLORS, BOOKING_STATUS, USER_ROLES } from '../../utils/constants.js';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '../../utils/helpers.js';

const BookingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;

  const { currentBooking, isLoading, error, getBookingById, confirmBooking, cancelBooking, completeBooking } =
    useBookingStore();
  const { user } = useAuthStore();

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    getBookingById(bookingId);
  }, [bookingId]);

  const handleConfirmBooking = () => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to confirm this booking?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await confirmBooking(bookingId);
              Alert.alert('Success', 'Booking confirmed!');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to confirm booking');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', onPress: () => {} },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelBooking(bookingId, cancelReason);
              Alert.alert('Success', 'Booking cancelled!');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleCompleteBooking = () => {
    Alert.alert(
      'Complete Booking',
      'Mark this booking as completed?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await completeBooking(bookingId);
              Alert.alert('Success', 'Booking marked as completed!');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to complete booking');
            }
          },
        },
      ]
    );
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
