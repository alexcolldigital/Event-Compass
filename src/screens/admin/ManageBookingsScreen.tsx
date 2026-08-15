import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert,
  TextInput, ScrollView, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/helpers.js';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const statusColor = (s) => ({ pending: '#f59e0b', confirmed: '#2563eb', completed: '#10b981', cancelled: '#dc2626' }[s] || '#6b7280');

export default function ManageBookingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [porPrices, setPorPrices] = useState({});
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { filter(); }, [search, status, bookings]);

  const load = async () => {
    setIsLoading(true);
    try {
      const r = await adminAPI.getAllBookings({ limit: 100 });
      setBookings(r.bookings || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const filter = () => {
    let f = bookings;
    if (search.trim()) {
      const t = search.toLowerCase();
      f = f.filter(b => {
        const client = b.client || {};
        const svc = b.service || b.venue || {};
        return (b.bookingNumber || '').toLowerCase().includes(t)
          || (client.email || '').toLowerCase().includes(t)
          || (`${client.firstName || ''} ${client.lastName || ''}`).toLowerCase().includes(t)
          || (svc.name || '').toLowerCase().includes(t);
      });
    }
    if (status !== 'all') f = f.filter(b => b.status === status);
    setFiltered(f);
  };

  const openDetail = async (booking) => {
    setModalVisible(true);
    setDetailLoading(true);
    try {
      const r = await adminAPI.getBookingById(booking._id);
      setSelectedBooking(r.booking);
    } catch (_) {
      setSelectedBooking(booking);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBooking(null);
    setPorPrices({});
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showToast('Please enter a rejection reason', 'error');
      return;
    }
    try {
      const r = await adminAPI.rejectBooking(selectedBooking._id, { reason: rejectReason.trim() });
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? r.booking : b));
      setSelectedBooking(r.booking);
      setRejectModalVisible(false);
      setRejectReason('');
      showToast('Booking rejected successfully');
    } catch (e: any) {
      showToast(e.message || 'Failed to reject booking', 'error');
    }
  };

  const handleAction = (action) => {
    if (!selectedBooking) return;
    const labels = { confirm: 'Confirm', complete: 'Complete', cancel: 'Cancel', reject: 'Reject' };

    if (action === 'confirm') {
      // Check for POR services in this booking
      const svc = selectedBooking.service || {};
      const isPor = svc._id && (!svc.pricing?.basePrice || svc.priceOnRequest);
      const porServiceList = isPor ? [{ serviceId: svc._id, serviceName: svc.name, price: '' }] : [];

      if (porServiceList.length > 0) {
        // Show price input alert for each POR service
        const missingPrices = porServiceList.filter((s) => !porPrices[s.serviceId]);
        if (missingPrices.length > 0) {
          Alert.alert(
            'Set Prices',
            `Please enter prices for the following services before confirming:\n${missingPrices.map((s) => s.serviceName).join(', ')}`,
          );
          return;
        }
      }

      const adminSetPrices = Object.entries(porPrices)
        .filter(([, price]) => price)
        .map(([serviceId, price]) => ({
          serviceId,
          serviceName: (selectedBooking.service?._id === serviceId ? selectedBooking.service?.name : '') || '',
          price: Number(price),
        }));

      Alert.alert('Confirm Booking', `Confirm booking ${selectedBooking.bookingNumber}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const r = await adminAPI.confirmBooking(selectedBooking._id, { adminSetPrices });
              setBookings((prev) => prev.map((b) => (b._id === selectedBooking._id ? r.booking : b)));
              setSelectedBooking(r.booking);
              setPorPrices({});
              showToast('Booking confirmed successfully');
            } catch (e: any) {
              showToast(e.message || 'Action failed', 'error');
            }
          },
        },
      ]);
      return;
    }

    if (action === 'reject') {
      setRejectReason('');
      setRejectModalVisible(true);
      return;
    }

    Alert.alert(
      `${labels[action]} Booking`,
      `${labels[action]} booking ${selectedBooking.bookingNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            try {
              let r;
              if (action === 'complete') r = await adminAPI.completeBooking(selectedBooking._id);
              else r = await adminAPI.cancelBooking(selectedBooking._id, { reason: 'Cancelled by admin' });
              setBookings(prev => prev.map(b => b._id === selectedBooking._id ? r.booking : b));
              setSelectedBooking(r.booking);
              showToast(`Booking ${action}ed successfully`);
            } catch (e: any) { showToast(e.message || 'Action failed', 'error'); }
          },
        },
      ]
    );
  };

  if (isLoading) return <Loading fullScreen />;

  const BookingCard = ({ item }) => {
    const client = item.client || {};
    const svc = item.service || item.venue || {};
    const amount = item.totalAmount || item.pricing?.totalAmount || 0;
    const sc = statusColor(item.status);
    return (
      <TouchableOpacity onPress={() => openDetail(item)} style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]} activeOpacity={0.85}>
        <View style={adminStyles.cardRow}>
          <Text style={[s.bookingNum, { color: c.text, fontFamily: font }]}>{item.bookingNumber}</Text>
          <View style={[adminStyles.badge, { backgroundColor: sc + '20' }]}>
            <Text style={[adminStyles.badgeText, { color: sc, fontFamily: font, textTransform: 'capitalize' }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[s.svcName, { color: c.muted, fontFamily: font }]}>{svc.name || 'Booked service'}</Text>
        <Text style={[s.clientName, { color: c.muted, fontFamily: font }]}>{client.firstName} {client.lastName}</Text>
        <View style={[adminStyles.cardRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar" size={14} color={c.muted} />
            <Text style={[s.dateText, { color: c.muted, fontFamily: font }]}> {formatDate(item.eventDate)}</Text>
          </View>
          <Text style={[s.amount, { color: c.primary, fontFamily: font }]}>{formatCurrency(amount)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const DetailRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={s.detailRow}>
      <Text style={[s.detailKey, { color: c.muted, fontFamily: font }]}>{label}</Text>
      <Text style={[s.detailVal, { color: valueColor || c.text, fontFamily: font }]} numberOfLines={2}>{value || '—'}</Text>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[s.sectionHeader, { color: c.primary, fontFamily: font }]}>{title}</Text>
  );

  const renderModal = () => {
    const b = selectedBooking;
    if (!b) return null;
    const client = b.client || {};
    const provider = b.serviceProvider || {};
    const svc = b.service || {};
    const venue = b.venue || {};
    const pricing = b.pricing || {};
    const payment = b.payment || {};
    const location = b.bookingLocation || {};
    const sc = statusColor(b.status);
    const amount = pricing.totalAmount || b.totalAmount || 0;

    return (
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, position: 'relative' }}>
          {/* Modal Header */}
          <View style={[s.modalHeader, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
            <TouchableOpacity onPress={closeModal} style={s.modalClose}>
              <MaterialCommunityIcons name="close" size={22} color={c.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.modalTitle, { color: c.text, fontFamily: font }]}>{b.bookingNumber}</Text>
              <View style={[adminStyles.badge, { backgroundColor: sc + '20', alignSelf: 'flex-start', marginTop: 2 }]}>
                <Text style={[adminStyles.badgeText, { color: sc, fontFamily: font, textTransform: 'capitalize' }]}>{b.status}</Text>
              </View>
            </View>
            <Text style={[s.modalAmount, { color: c.primary, fontFamily: font }]}>{formatCurrency(amount)}</Text>
          </View>

          {detailLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={{ color: c.muted, marginTop: 12, fontFamily: font }}>Loading details...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

              {/* Client Info */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="👤 Client Information" />
                <DetailRow label="Name" value={`${client.firstName || ''} ${client.lastName || ''}`.trim()} />
                <DetailRow label="Email" value={client.email} />
                <DetailRow label="Phone" value={client.phoneNumber} />
              </View>

              {/* Provider Info */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="🏢 Service Provider" />
                <DetailRow label="Business" value={provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim()} />
                <DetailRow label="Email" value={provider.email} />
                <DetailRow label="Phone" value={provider.phoneNumber} />
              </View>

              {/* Service / Venue */}
              {(svc.name || venue.name) && (
                <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <SectionHeader title={b.bookingType === 'venue' ? '🏛️ Venue Details' : '🎯 Service Details'} />
                  <DetailRow label="Name" value={svc.name || venue.name} />
                  <DetailRow label="Type" value={svc.serviceType || b.bookingType} />
                  {svc.description && <DetailRow label="Description" value={svc.description} />}
                  {svc.packages && svc.packages.length > 0 && (
                    <>
                      <Text style={[s.subHeader, { color: c.muted, fontFamily: font }]}>Packages</Text>
                      {svc.packages.map((pkg, i) => (
                        <View key={i} style={[s.packageRow, { borderColor: c.border }]}>
                          <Text style={[s.packageName, { color: c.text, fontFamily: font }]}>{pkg.name}</Text>
                          <Text style={[s.packagePrice, { color: c.primary, fontFamily: font }]}>{formatCurrency(pkg.price)}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              )}

              {/* Booking Details */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="📋 Booking Details" />
                <DetailRow label="Booking Type" value={b.bookingType} />
                <DetailRow label="Event Date" value={formatDateTime(b.eventDate)} />
                {b.eventEndDate && <DetailRow label="End Date" value={formatDateTime(b.eventEndDate)} />}
                {b.eventTime && <DetailRow label="Event Time" value={b.eventTime} />}
                {b.numberOfGuests && <DetailRow label="Guests" value={String(b.numberOfGuests)} />}
                {b.duration && <DetailRow label="Duration" value={`${b.duration} ${b.durationUnit || 'hours'}`} />}
                {b.specialRequirements && <DetailRow label="Special Requirements" value={b.specialRequirements} />}
                {b.clientNotes && <DetailRow label="Client Notes" value={b.clientNotes} />}
                {b.bookingRequestNote && <DetailRow label="Request Note" value={b.bookingRequestNote} />}
              </View>

              {/* Location */}
              {(location.state || location.address) && (
                <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <SectionHeader title="📍 Event Location" />
                  {location.address && <DetailRow label="Address" value={location.address} />}
                  {location.town && <DetailRow label="Town" value={location.town} />}
                  {location.lga && <DetailRow label="LGA" value={location.lga} />}
                  {location.state && <DetailRow label="State" value={location.state} />}
                  {location.country && <DetailRow label="Country" value={location.country} />}
                </View>
              )}

              {/* Pricing Breakdown */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="💰 Pricing Breakdown" />
                {pricing.basePrice != null && <DetailRow label="Base Price" value={formatCurrency(pricing.basePrice)} />}
                {pricing.quantity != null && <DetailRow label="Quantity" value={String(pricing.quantity)} />}
                {pricing.unitPrice != null && <DetailRow label="Unit Price" value={formatCurrency(pricing.unitPrice)} />}
                {pricing.subtotal != null && <DetailRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />}
                {pricing.discount != null && pricing.discount > 0 && <DetailRow label="Discount" value={`-${formatCurrency(pricing.discount)}`} valueColor="#dc2626" />}
                {pricing.tax != null && pricing.tax > 0 && <DetailRow label="Tax" value={formatCurrency(pricing.tax)} />}
                <View style={[s.totalRow, { borderTopColor: c.border }]}>
                  <Text style={[s.totalLabel, { color: c.text, fontFamily: font }]}>Total Amount</Text>
                  <Text style={[s.totalValue, { color: c.primary, fontFamily: font }]}>{formatCurrency(amount)}</Text>
                </View>
                {b.paymentPlan && b.paymentPlan !== 'full' && (
                  <>
                    <DetailRow label="Payment Plan" value={b.paymentPlan} />
                    {b.depositAmount != null && <DetailRow label="Deposit" value={formatCurrency(b.depositAmount)} />}
                    {b.balanceDue != null && <DetailRow label="Balance Due" value={formatCurrency(b.balanceDue)} />}
                  </>
                )}
              </View>

              {/* Payment Status */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="💳 Payment Status" />
                <DetailRow label="Status" value={payment.status || 'pending'} valueColor={payment.status === 'completed' ? '#10b981' : '#f59e0b'} />
                {payment.method && <DetailRow label="Method" value={payment.method} />}
                {payment.transactionId && <DetailRow label="Transaction ID" value={payment.transactionId} />}
                {payment.paymentDate && <DetailRow label="Paid On" value={formatDateTime(payment.paymentDate)} />}
                {payment.refundStatus && payment.refundStatus !== 'none' && (
                  <DetailRow label="Refund Status" value={payment.refundStatus} valueColor="#f59e0b" />
                )}
              </View>

              {/* Timeline */}
              <View style={[s.section, { backgroundColor: c.surface, borderColor: c.border }]}>
                <SectionHeader title="🕐 Timeline" />
                <DetailRow label="Booked On" value={formatDateTime(b.createdAt || b.bookingDate)} />
                {b.confirmedDate && <DetailRow label="Confirmed" value={formatDateTime(b.confirmedDate)} />}
                {b.completedDate && <DetailRow label="Completed" value={formatDateTime(b.completedDate)} />}
                {b.cancelledDate && <DetailRow label="Cancelled" value={formatDateTime(b.cancelledDate)} />}
                {b.cancellationReason && <DetailRow label="Cancel Reason" value={b.cancellationReason} />}
              </View>

              {/* Action Buttons */}
              {b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'rejected' && (
                <View style={[adminStyles.actionRow, { marginTop: 8 }]}>
                  {b.status === 'pending' && (() => {
                    const svc = b.service || {};
                    const isPor = svc._id && (!svc.pricing?.basePrice || svc.priceOnRequest);
                    return (
                      <>
                        {isPor && (
                          <View style={[s.porInputBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                            <Text style={[s.porInputLabel, { color: '#c2410c' }]}>
                              Set price for "{svc.name}" (price not static)
                            </Text>
                            <TextInput
                              style={[s.porInput, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
                              placeholder="Enter price (₦)"
                              placeholderTextColor={c.muted}
                              keyboardType="numeric"
                              value={porPrices[svc._id] || ''}
                              onChangeText={(val) => setPorPrices((prev) => ({ ...prev, [svc._id]: val }))}
                            />
                          </View>
                        )}
                        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#eff6ff' }]} onPress={() => handleAction('confirm')}>
                          <MaterialCommunityIcons name="check-circle" size={16} color="#2563eb" />
                          <Text style={[adminStyles.actionBtnText, { color: '#2563eb', fontFamily: font, marginTop: 2 }]}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fef3c7' }]} onPress={() => handleAction('reject')}>
                          <MaterialCommunityIcons name="close-circle-outline" size={16} color="#b45309" />
                          <Text style={[adminStyles.actionBtnText, { color: '#b45309', fontFamily: font, marginTop: 2 }]}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                  {b.status === 'confirmed' && (
                    <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#f0fdf4' }]} onPress={() => handleAction('complete')}>
                      <MaterialCommunityIcons name="check-all" size={16} color="#15803d" />
                      <Text style={[adminStyles.actionBtnText, { color: '#15803d', fontFamily: font, marginTop: 2 }]}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fff1f2' }]} onPress={() => handleAction('cancel')}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#dc2626" />
                    <Text style={[adminStyles.actionBtnText, { color: '#dc2626', fontFamily: font, marginTop: 2 }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
          {/* Toast inside modal */}
          {toast && (
            <View style={[s.toast, { backgroundColor: toast.type === 'success' ? '#15803d' : '#dc2626' }]}>
              <MaterialCommunityIcons name={toast.type === 'success' ? 'check-circle' : 'alert-circle'} size={16} color="#fff" />
              <Text style={[s.toastText, { fontFamily: font }]}>{toast.msg}</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Manage Bookings</Text>
      </View>

      <View style={[adminStyles.statsRow, { paddingHorizontal: 16, marginTop: 12 }]}>
        {[
          { label: 'Total', value: bookings.length, bg: '#eff6ff', color: '#2563eb' },
          { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, bg: '#fffbeb', color: '#d97706' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, bg: '#f0fdf4', color: '#15803d' },
        ].map(st => (
          <View key={st.label} style={[adminStyles.statCard, { backgroundColor: st.bg, borderColor: st.color + '30' }]}>
            <Text style={[adminStyles.statLabel, { color: st.color, fontFamily: font }]}>{st.label}</Text>
            <Text style={[adminStyles.statValue, { color: st.color, fontFamily: font }]}>{st.value}</Text>
          </View>
        ))}
      </View>

      <View style={[adminStyles.searchBar, { backgroundColor: c.surface, borderColor: c.inputBorder }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={c.muted} />
        <TextInput
          style={[adminStyles.searchInput, { color: c.text, fontFamily: font }]}
          placeholder="Search booking, client..."
          placeholderTextColor={c.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close-circle" size={18} color={c.muted} /></TouchableOpacity> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[adminStyles.chip, { backgroundColor: status === f ? c.primary : 'transparent', borderColor: status === f ? c.primary : c.inputBorder }]} onPress={() => setStatus(f)}>
            <Text style={[adminStyles.chipText, { color: status === f ? '#fff' : c.muted, fontFamily: font, textTransform: 'capitalize' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <BookingCard item={item} />}
        ListEmptyComponent={
          <View style={adminStyles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={c.muted} />
            <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No bookings found</Text>
          </View>
        }
      />

      {renderModal()}

      {/* Reject Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade" onRequestClose={() => setRejectModalVisible(false)}>
        <View style={s.rejectOverlay}>
          <View style={[s.rejectBox, { backgroundColor: c.surface }]}>
            <Text style={[s.rejectTitle, { color: c.text, fontFamily: font }]}>Reject Booking</Text>
            <Text style={[s.rejectSub, { color: c.muted, fontFamily: font }]}>Please provide a reason for rejection</Text>
            <TextInput
              style={[s.rejectInput, { color: c.text, borderColor: c.inputBorder, backgroundColor: c.bg, fontFamily: font }]}
              placeholder="Enter rejection reason..."
              placeholderTextColor={c.muted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={s.rejectActions}>
              <TouchableOpacity style={[s.rejectBtn, { backgroundColor: c.bg, borderColor: c.inputBorder, borderWidth: 1 }]} onPress={() => setRejectModalVisible(false)}>
                <Text style={[s.rejectBtnText, { color: c.muted, fontFamily: font }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.rejectBtn, { backgroundColor: '#dc2626' }]} onPress={handleReject}>
                <Text style={[s.rejectBtnText, { color: '#fff', fontFamily: font }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast && (
        <View style={[s.toast, { backgroundColor: toast.type === 'success' ? '#15803d' : '#dc2626' }]}>
          <MaterialCommunityIcons name={toast.type === 'success' ? 'check-circle' : 'alert-circle'} size={16} color="#fff" />
          <Text style={[s.toastText, { fontFamily: font }]}>{toast.msg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bookingNum: { fontSize: 14, fontWeight: '800' },
  svcName: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  clientName: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  dateText: { fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: '800' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 15, fontWeight: '800' },
  modalAmount: { fontSize: 18, fontWeight: '800' },
  section: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionHeader: { fontSize: 13, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  subHeader: { fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 },
  detailKey: { fontSize: 12, fontWeight: '600', flex: 1 },
  detailVal: { fontSize: 12, fontWeight: '700', flex: 1.5, textAlign: 'right' },
  packageRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, marginBottom: 4 },
  packageName: { fontSize: 12, fontWeight: '600' },
  packagePrice: { fontSize: 12, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 1 },
  totalLabel: { fontSize: 13, fontWeight: '800' },
  totalValue: { fontSize: 15, fontWeight: '800' },
  porInputBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, width: '100%' },
  porInputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  porInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, fontWeight: '600' },
  rejectOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  rejectBox: { width: '100%', borderRadius: 16, padding: 20 },
  rejectTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  rejectSub: { fontSize: 13, marginBottom: 12 },
  rejectInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  rejectActions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  rejectBtnText: { fontSize: 14, fontWeight: '700' },
  toast: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
});

