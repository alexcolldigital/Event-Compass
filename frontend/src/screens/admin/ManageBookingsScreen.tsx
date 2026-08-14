import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, SafeAreaView, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants.js';
import { formatDate, formatDateTime, formatCurrency, getStatusColor } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const ManageBookingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionModal, setActionModal] = useState<{ booking: any; type: 'accept' | 'reject' } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { filterBookings(); }, [searchText, filterStatus, bookings]);

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
    if (searchText.trim()) {
      filtered = filtered.filter((b) => {
        const client = b.client || b.clientId || {};
        const service = b.service || b.serviceId || b.venue || {};
        const text = searchText.toLowerCase();
        return (
          (b.bookingNumber || '').toLowerCase().includes(text) ||
          (client.email || '').toLowerCase().includes(text) ||
          (service.name || '').toLowerCase().includes(text)
        );
      });
    }
    if (filterStatus !== 'all') filtered = filtered.filter((b) => b.status === filterStatus);
    setFilteredBookings(filtered);
  };

  const handleBookingAction = async (booking, action) => {
    if (action === 'accept') {
      setActionNote('');
      setActionModal({ booking, type: 'accept' });
    } else if (action === 'reject') {
      setActionNote('');
      setActionModal({ booking, type: 'reject' });
    } else if (action === 'complete') {
      Alert.alert('Complete Booking', `Complete booking ${booking.bookingNumber}?`, [
        { text: 'Cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const response = await adminAPI.completeBooking(booking._id);
              setBookings((prev) => prev.map((b) => b._id === booking._id ? response.booking : b));
              setSelectedBooking(null);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to complete booking');
            }
          },
        },
      ]);
    }
  };

  const submitActionModal = async () => {
    if (!actionModal) return;
    if (actionModal.type === 'reject' && !actionNote.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      let response;
      if (actionModal.type === 'accept') {
        response = await adminAPI.confirmBooking(actionModal.booking._id, { message: actionNote.trim() || undefined });
      } else {
        response = await adminAPI.rejectBooking(actionModal.booking._id, { reason: actionNote.trim() });
      }
      setBookings((prev) => prev.map((b) => b._id === actionModal.booking._id ? response.booking : b));
      setSelectedBooking(null);
      setActionModal(null);
      Alert.alert('Done', actionModal.type === 'accept' ? 'Booking accepted.' : 'Booking rejected.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: BOOKING_STATUS.PENDING },
    { label: 'Confirmed', value: BOOKING_STATUS.CONFIRMED },
    { label: 'Rejected', value: BOOKING_STATUS.REJECTED },
    { label: 'Completed', value: BOOKING_STATUS.COMPLETED },
    { label: 'Cancelled', value: BOOKING_STATUS.CANCELLED },
  ];

  const STAT_CARDS = [
    { label: 'Total', value: bookings.length, accent: '#2563eb', bg: isDark ? '#1e3a5f' : '#eff6ff', border: isDark ? '#1e40af' : '#bfdbfe' },
    { label: 'Pending', value: bookings.filter((b) => b.status === BOOKING_STATUS.PENDING).length, accent: '#d97706', bg: isDark ? '#451a03' : '#fffbeb', border: isDark ? '#92400e' : '#fde68a' },
    { label: 'Done', value: bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length, accent: '#1f7a4d', bg: isDark ? '#14532d' : '#f0fdf4', border: isDark ? '#166534' : '#bbf7d0' },
  ];

  const BookingCard = ({ booking }) => {
    const statusColor = getStatusColor(booking.status);
    const client = booking.client || booking.clientId || {};
    const provider = booking.serviceProvider || booking.serviceProviderId || {};
    const service = booking.service || booking.serviceId || booking.venue || {};
    const totalAmount = booking.totalAmount || booking.pricing?.totalAmount || 0;
    const paymentStatus = booking.paymentStatus || booking.payment?.status || PAYMENT_STATUS.PENDING;
    const expanded = selectedBooking?._id === booking._id;

    const payBg = paymentStatus === PAYMENT_STATUS.COMPLETED ? (isDark ? '#14532d' : '#dcfce7')
      : paymentStatus === PAYMENT_STATUS.PENDING ? (isDark ? '#451a03' : '#fef3c7')
      : (isDark ? '#450a0a' : '#fee2e2');
    const payColor = paymentStatus === PAYMENT_STATUS.COMPLETED ? '#15803d'
      : paymentStatus === PAYMENT_STATUS.PENDING ? '#92400e' : '#991b1b';

    return (
      <TouchableOpacity
        onPress={() => setSelectedBooking(expanded ? null : booking)}
        style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}
        activeOpacity={0.85}
      >
        <View style={adminStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{booking.bookingNumber}</Text>
              <View style={[adminStyles.badge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[adminStyles.badgeText, { color: statusColor, textTransform: 'capitalize' }]}>{booking.status}</Text>
              </View>
            </View>
            <Text style={{ color: C.muted, fontSize: 13, fontFamily: appFont }}>{service.name || 'Booked service'}</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{client.firstName} {client.lastName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar" size={13} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 12, marginLeft: 4, fontFamily: appFont }}>{formatDate(booking.eventDate)}</Text>
              </View>
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {expanded && (
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border }}>
            {[
              { label: 'Client', value: `${client.firstName} ${client.lastName}` },
              { label: 'Email', value: client.email || 'No email' },
              { label: 'Phone', value: client.phoneNumber || 'N/A' },
              { label: 'Provider', value: provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider' },
              { label: 'Event Date', value: formatDateTime(booking.eventDate) },
              { label: 'Event Time', value: booking.eventTime || 'N/A' },
              { label: 'Event Type', value: booking.eventType || 'N/A' },
              { label: 'Guests', value: booking.numberOfGuests || 'N/A' },
              { label: 'Location', value: booking.bookingLocation ? [booking.bookingLocation.address, booking.bookingLocation.lga, booking.bookingLocation.state].filter(Boolean).join(', ') : 'N/A' },
              { label: 'Special Req.', value: booking.specialRequirements || 'None' },
              { label: 'Notes', value: booking.clientNotes || booking.bookingRequestNote || 'None' },
              { label: 'Booked', value: formatDate(booking.createdAt) },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{row.label}</Text>
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '700', fontFamily: appFont, flex: 1, textAlign: 'right', marginLeft: 8 }}>{row.value}</Text>
              </View>
            ))}

            {booking.adminNote ? (
              <View style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <Text style={{ color: '#2563eb', fontSize: 12, fontFamily: appFont, fontWeight: '700' }}>Admin Note: {booking.adminNote}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>Payment</Text>
              <View style={[adminStyles.badge, { backgroundColor: payBg }]}>
                <Text style={[adminStyles.badgeText, { color: payColor, textTransform: 'capitalize' }]}>{paymentStatus}</Text>
              </View>
            </View>

            <View style={adminStyles.actionRow}>
              {booking.status === BOOKING_STATUS.PENDING && (
                <>
                  <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#14532d' : '#dcfce7', flex: 1 }]} onPress={() => handleBookingAction(booking, 'accept')}>
                    <Text style={[adminStyles.actionBtnText, { color: '#166534', fontFamily: appFont }]}>✓ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2', flex: 1 }]} onPress={() => handleBookingAction(booking, 'reject')}>
                    <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>✗ Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              {booking.status === BOOKING_STATUS.CONFIRMED && (
                <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', flex: 1 }]} onPress={() => handleBookingAction(booking, 'complete')}>
                  <Text style={[adminStyles.actionBtnText, { color: '#2563eb', fontFamily: appFont }]}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <Loading fullScreen message="Loading bookings..." />;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Manage Bookings</Text>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={[adminStyles.hero, { backgroundColor: C.primary, marginTop: 12 }]}>
              <Text style={[adminStyles.heroEyebrow, { fontFamily: appFont }]}>ADMIN</Text>
              <Text style={[adminStyles.heroTitle, { fontFamily: appFont }]}>Manage Bookings</Text>
              <Text style={[adminStyles.heroSubtitle, { fontFamily: appFont }]}>{bookings.length} total bookings</Text>
            </View>

            {error && <View style={{ marginBottom: 12 }}><ErrorMessage error={error} /></View>}

            <View style={[adminStyles.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={C.muted} />
              <TextInput
                placeholder="Search by booking number, client, service..."
                value={searchText}
                onChangeText={setSearchText}
                style={[adminStyles.searchInput, { color: C.text, fontFamily: appFont }]}
                placeholderTextColor={C.muted}
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {STATUS_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[adminStyles.filterChip, { marginRight: 8, backgroundColor: filterStatus === f.value ? C.primary : C.surface, borderColor: filterStatus === f.value ? C.primary : C.inputBorder }]}
                  onPress={() => setFilterStatus(f.value)}
                >
                  <Text style={[adminStyles.filterChipText, { color: filterStatus === f.value ? '#fff' : C.text, fontFamily: appFont }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={adminStyles.statsGrid}>
              {STAT_CARDS.map((s) => (
                <View key={s.label} style={[adminStyles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={[adminStyles.statLabel, { color: s.accent, fontFamily: appFont }]}>{s.label}</Text>
                  <Text style={[adminStyles.statValue, { color: s.accent, fontFamily: appFont }]}>{s.value}</Text>
                </View>
              ))}
            </View>

            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>Bookings</Text>
          </>
        }
        ListEmptyComponent={
          <View style={adminStyles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={C.muted} />
            <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No bookings found</Text>
            <Text style={[adminStyles.emptySubtext, { color: C.muted, fontFamily: appFont }]}>Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Accept / Reject Modal */}
      <Modal visible={!!actionModal} transparent animationType="fade" onRequestClose={() => !actionLoading && setActionModal(null)}>
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={() => !actionLoading && setActionModal(null)}>
          <View style={[ms.sheet, { backgroundColor: C.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[ms.sheetTitle, { color: C.text, fontFamily: appFont }]}>
              {actionModal?.type === 'accept' ? '✓ Accept Booking' : '✗ Reject Booking'}
            </Text>
            <Text style={[ms.sheetSub, { color: C.muted, fontFamily: appFont }]}>
              {actionModal?.booking?.bookingNumber}
            </Text>
            <View style={[ms.divider, { backgroundColor: C.border }]} />
            <Text style={[ms.noteLabel, { color: C.muted, fontFamily: appFont }]}>
              {actionModal?.type === 'accept' ? 'Acceptance message (optional)' : 'Reason for rejection *'}
            </Text>
            <TextInput
              style={[ms.noteInput, { color: C.text, borderColor: C.border, backgroundColor: C.bg, fontFamily: appFont }]}
              placeholder={actionModal?.type === 'accept' ? 'e.g. Your booking has been approved...' : 'e.g. Date not available...'}
              placeholderTextColor={C.muted}
              value={actionNote}
              onChangeText={setActionNote}
              multiline
              numberOfLines={3}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                style={[ms.btn, { backgroundColor: C.bg, borderColor: C.border, borderWidth: 1, flex: 1 }]}
                onPress={() => !actionLoading && setActionModal(null)}
                disabled={actionLoading}
              >
                <Text style={[ms.btnText, { color: C.muted, fontFamily: appFont }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ms.btn, { backgroundColor: actionModal?.type === 'accept' ? '#166534' : '#b91c1c', flex: 1, opacity: actionLoading ? 0.6 : 1 }]}
                onPress={submitActionModal}
                disabled={actionLoading}
              >
                <Text style={[ms.btnText, { color: '#fff', fontFamily: appFont }]}>
                  {actionLoading ? 'Processing...' : actionModal?.type === 'accept' ? 'Accept' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageBookingsScreen;

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { width: '100%', borderRadius: 24, padding: 20, maxWidth: 420 },
  sheetTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  sheetSub: { fontSize: 13, marginBottom: 12 },
  divider: { height: 1, marginBottom: 14 },
  noteLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  noteInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 14 },
  btn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '800' },
});
