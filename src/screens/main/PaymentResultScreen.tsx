import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/helpers.js';

const PaymentResultScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, status } = route.params || {};
  const { currentBooking, getBookingById, markBookingPaymentSuccess, isLoading, error } = useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;

      try {
        await getBookingById(bookingId);
        if (status === 'success' && bookingId) {
          await markBookingPaymentSuccess(bookingId);
        }
        setLoadError(null);
      } catch (err) {
        setLoadError(err.message || 'Unable to load booking details.');
      }
    };

    if (isAuthenticated) {
      loadBooking();
    }
  }, [bookingId, getBookingById, isAuthenticated]);

  const title =
    status === 'success'
      ? 'Payment Complete'
      : status === 'cancelled'
      ? 'Payment Cancelled'
      : 'Payment Result';

  const message =
    status === 'success'
      ? 'Thank you! Your payment was secured in escrow. The funds will be released after the event is completed and no dispute is raised.'
      : status === 'cancelled'
      ? 'The payment was cancelled. You can return to your booking to retry or choose another payment method.'
      : 'Your payment result could not be determined. Please check your booking status.';

  const handleGoToBooking = () => {
    if (bookingId) {
      navigation.navigate('BookingDetail', { bookingId });
    } else {
      navigation.navigate('BookingsScreen');
    }
  };

  const handleGoToBookings = () => {
    navigation.navigate('BookingsScreen');
  };

  if (isLoading && !loadError) {
    return <Loading fullScreen message="Loading payment result..." />;
  }

  return (
    <View className="flex-1 bg-light p-4 justify-center">
      <View className="bg-white rounded-3xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-dark mb-3">{title}</Text>
        <Text className="text-gray-600 text-base leading-7 mb-6">{message}</Text>

        {currentBooking && (
          <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-gray-200">
            <Text className="text-sm text-gray-500 mb-2">Booking</Text>
            <Text className="text-dark font-semibold text-lg">{currentBooking.bookingNumber}</Text>
            <Text className="text-gray-500 mt-1">
              Total: {formatCurrency(currentBooking.pricing?.totalAmount || 0)}
            </Text>
          </View>
        )}

        <Button
          title={bookingId ? 'View Booking' : 'View my bookings'}
          onPress={handleGoToBooking}
          variant="primary"
          fullWidth
        />
        <TouchableOpacity onPress={handleGoToBookings} className="mt-3">
          <Text className="text-center text-primary font-semibold">Back to bookings</Text>
        </TouchableOpacity>
      </View>
      {error && (
        <Text className="text-center text-red-600 mt-4">{error}</Text>
      )}
    </View>
  );
};

export default PaymentResultScreen;
