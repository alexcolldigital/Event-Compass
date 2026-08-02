/**
 * Manage Bookings Screen
 * Admin screen for viewing and managing all system bookings
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { COLORS, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants.js';
import { formatDate, formatDateTime, formatCurrency, getStatusColor } from '../../utils/helpers.js';

const ManageBookingsScreen = () => {
  const navigation = useNavigation();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchText, filterStatus, bookings]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllBookings({ limit: 100 });
      setBookings(response.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (booking) => {
          const client = booking.clientId || booking.client || {};
          const service = booking.serviceId || booking.service || booking.venue || {};
          const text = searchText.toLowerCase();

          return (
            (booking.bookingNumber || '').toLowerCase().includes(text) ||
            (client.email || '').toLowerCase().includes(text) ||
            (service.name || '').toLowerCase().includes(text)
          );
        }
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    setFilteredBookings(filtered);
  };

  const BookingCard = ({ booking }) => {
    const statusColor = getStatusColor(booking.status);
    const client = booking.clientId || booking.client || {};
    const provider = booking.serviceProviderId || booking.serviceProvider || {};
    const service = booking.serviceId || booking.service || booking.venue || {};
    const totalAmount = booking.totalAmount || booking.pricing?.totalAmount || 0;
    const paymentStatus = booking.paymentStatus || booking.payment?.status || PAYMENT_STATUS.PENDING;

    return (
      <TouchableOpacity
        onPress={() =>
          setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)
        }
        className="bg-white p-3 rounded-lg mb-3 border border-gray-200"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-dark font-semibold">{booking.bookingNumber}</Text>
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColor + '20' }}>
                <Text
                  className="text-xs font-semibold text-center capitalize"
                  style={{ color: statusColor }}
                >
                  {booking.status}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 text-sm">{service.name || 'Booked service'}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {client.firstName} {client.lastName}
            </Text>

            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="calendar" size={14} color={COLORS.gray[400]} />
                <Text className="text-gray-600 text-xs ml-1">
                  {formatDate(booking.eventDate)}
                </Text>
              </View>
              <Text className="text-primary font-semibold text-sm">
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Expanded Details */}
        {selectedBooking?._id === booking._id && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            {/* Client Info */}
            <View className="mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold mb-2">Client</Text>
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
                <Text className="text-dark text-sm ml-2 font-semibold">
                  {client.firstName} {client.lastName}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="email" size={16} color={COLORS.gray[400]} />
                <Text className="text-gray-600 text-xs ml-2">{client.email || 'No email'}</Text>
              </View>
            </View>

            {/* Service Provider Info */}
            <View className="mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold mb-2">Service Provider</Text>
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="briefcase" size={16} color={COLORS.primary} />
                <Text className="text-dark text-sm ml-2 font-semibold">
                  {provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="email" size={16} color={COLORS.gray[400]} />
                <Text className="text-gray-600 text-xs ml-2">
                  {provider.email || 'No email'}
                </Text>
              </View>
            </View>

            {/* Booking Details */}
            <View className="mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold mb-2">Details</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 text-xs">Event Date</Text>
                <Text className="text-dark text-xs font-semibold">
                  {formatDateTime(booking.eventDate)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 text-xs">Guests</Text>
                <Text className="text-dark text-xs font-semibold">{booking.numberOfGuests}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-xs">Booking Date</Text>
                <Text className="text-dark text-xs font-semibold">
                  {formatDate(booking.createdAt)}
                </Text>
              </View>
            </View>

            {/* Payment Info */}
            <View className="mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold mb-2">Payment</Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-xs">Amount</Text>
                <Text className="text-dark text-xs font-semibold">
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-gray-600 text-xs">Status</Text>
                <View
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor:
                      paymentStatus === PAYMENT_STATUS.COMPLETED
                        ? '#dcfce7'
                        : paymentStatus === PAYMENT_STATUS.PENDING
                        ? '#fef3c7'
                        : '#fee2e2',
                  }}
                >
                  <Text
                    className="text-xs font-semibold capitalize"
                    style={{
                      color:
                        paymentStatus === PAYMENT_STATUS.COMPLETED
                          ? '#15803d'
                          : paymentStatus === PAYMENT_STATUS.PENDING
                          ? '#92400e'
                          : '#991b1b',
                    }}
                  >
                    {paymentStatus}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 bg-primary px-3 py-2 rounded-lg">
                <Text className="text-white text-xs font-semibold text-center">Details</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 border border-gray-300 px-3 py-2 rounded-lg">
                <Text className="text-dark text-xs font-semibold text-center">Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading bookings..." />;
  }

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Manage Bookings</Text>
      </View>

      {error && (
        <View className="mx-4 mt-3">
          <ErrorMessage error={error} />
        </View>
      )}

      {/* Search and Filter */}
      <View className="bg-white p-3 mx-3 mt-3 rounded-lg">
        {/* Search Input */}
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-3">
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray[400]} />
          <TextInput
            placeholder="Search by booking number, client, service..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 py-2 ml-2 text-dark"
            placeholderTextColor={COLORS.gray[400]}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: BOOKING_STATUS.PENDING },
            { label: 'Confirmed', value: BOOKING_STATUS.CONFIRMED },
            { label: 'Completed', value: BOOKING_STATUS.COMPLETED },
            { label: 'Cancelled', value: BOOKING_STATUS.CANCELLED },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              className={`py-2 px-3 rounded-lg border ${
                filterStatus === filter.value
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setFilterStatus(filter.value)}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === filter.value ? 'text-white' : 'text-dark'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Booking Stats */}
      <View className="flex-row gap-3 px-3 mt-3 mb-3">
        <View className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Text className="text-blue-700 text-xs font-semibold">Total</Text>
          <Text className="text-blue-900 text-2xl font-bold mt-1">{bookings.length}</Text>
        </View>
        <View className="flex-1 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <Text className="text-yellow-700 text-xs font-semibold">Pending</Text>
          <Text className="text-yellow-900 text-2xl font-bold mt-1">
            {bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length}
          </Text>
        </View>
        <View className="flex-1 bg-green-50 p-3 rounded-lg border border-green-200">
          <Text className="text-green-700 text-xs font-semibold">Completed</Text>
          <Text className="text-green-900 text-2xl font-bold mt-1">
            {bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length}
          </Text>
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <MaterialCommunityIcons name="calendar-blank" size={48} color={COLORS.gray[300]} />
            <Text className="text-gray-500 mt-3 font-semibold">No bookings found</Text>
            <Text className="text-gray-400 text-sm mt-1">Try adjusting your filters</Text>
          </View>
        }
        scrollEnabled={true}
      />
    </View>
  );
};

export default ManageBookingsScreen;
