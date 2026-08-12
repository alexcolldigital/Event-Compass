import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
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
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { filter(); }, [search, status, bookings]);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getAllBookings({ limit: 100 }); setBookings(r.bookings || []); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const filter = () => {
    let f = bookings;
    if (search.trim()) {
      const t = search.toLowerCase();
      f = f.filter(b => {
        const client = b.client || b.clientId || {};
        const svc = b.service || b.serviceId || {};
        return (b.bookingNumber || '').toLowerCase().includes(t) || (client.email || '').toLowerCase().includes(t) || (svc.name || '').toLowerCase().includes(t);
      });
    }
    if (status !== 'all') f = f.filter(b => b.status === status);
    setFiltered(f);
  };

  const handleAction = (booking, action) => {
    Alert.alert(`${action.charAt(0).toUpperCase() + action.slice(1)} Booking`, `${action} booking ${booking.bookingNumber}?`, [
      { text: 'Cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          let r;
          if (action === 'confirm') r = await adminAPI.confirmBooking(booking._id);
          else if (action === 'complete') r = await adminAPI.completeBooking(booking._id);
          else r = await adminAPI.cancelBooking(booking._id, { reason: 'Cancelled by admin' });
          setBookings(prev => prev.map(b => b._id === booking._id ? r.booking : b));
          setExpanded(null);
          Alert.alert('Success', `Booking ${action}ed`);
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (isLoading) return <Loading fullScreen />;

  const BookingCard = ({ item }) => {
    const open = expanded === item._id;
    const client = item.client || item.clientId || {};
    const provider = item.serviceProvider || item.serviceProviderId || {};
    const svc = item.service || item.serviceId || item.venue || {};
    const amount = item.totalAmount || item.pricing?.totalAmount || 0;
    const sc = statusColor(item.status);

    return (
      <View>
        <TouchableOpacity onPress={() => setExpanded(open ? null : item._id)} style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
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

        {open && (
          <View style={[s.expandedCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            {[['Client', `${client.firstName} ${client.lastName}`], ['Email', client.email || 'N/A'], ['Provider', provider.businessName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'N/A'], ['Event Date', formatDateTime(item.eventDate)], ['Guests', item.numberOfGuests || 'N/A'], ['Amount', formatCurrency(amount)], ['Payment', item.paymentStatus || item.payment?.status || 'pending']].map(([k, v]) => (
              <View key={k} style={s.infoRow}>
                <Text style={[s.infoKey, { color: c.muted, fontFamily: font }]}>{k}</Text>
                <Text style={[s.infoVal, { color: c.text, fontFamily: font }]}>{v}</Text>
              </View>
            ))}
            <View style={adminStyles.actionRow}>
              {item.status === 'pending' && (
                <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#eff6ff' }]} onPress={() => handleAction(item, 'confirm')}>
                  <Text style={[adminStyles.actionBtnText, { color: '#2563eb', fontFamily: font }]}>Confirm</Text>
                </TouchableOpacity>
              )}
              {item.status === 'confirmed' && (
                <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#f0fdf4' }]} onPress={() => handleAction(item, 'complete')}>
                  <Text style={[adminStyles.actionBtnText, { color: '#15803d', fontFamily: font }]}>Complete</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'cancelled' && item.status !== 'completed' && (
                <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fff1f2' }]} onPress={() => handleAction(item, 'cancel')}>
                  <Text style={[adminStyles.actionBtnText, { color: '#dc2626', fontFamily: font }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
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
        {[{ label: 'Total', value: bookings.length, bg: '#eff6ff', color: '#2563eb' }, { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, bg: '#fffbeb', color: '#d97706' }, { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, bg: '#f0fdf4', color: '#15803d' }].map(st => (
          <View key={st.label} style={[adminStyles.statCard, { backgroundColor: st.bg, borderColor: st.color + '30' }]}>
            <Text style={[adminStyles.statLabel, { color: st.color, fontFamily: font }]}>{st.label}</Text>
            <Text style={[adminStyles.statValue, { color: st.color, fontFamily: font }]}>{st.value}</Text>
          </View>
        ))}
      </View>

      <View style={[adminStyles.searchBar, { backgroundColor: c.surface, borderColor: c.inputBorder }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={c.muted} />
        <TextInput style={[adminStyles.searchInput, { color: c.text, fontFamily: font }]} placeholder="Search booking, client..." placeholderTextColor={c.muted} value={search} onChangeText={setSearch} />
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bookingNum: { fontSize: 14, fontWeight: '800' },
  svcName: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  clientName: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  dateText: { fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 14, fontWeight: '800' },
  expandedCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: -8, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoKey: { fontSize: 12, fontWeight: '600' },
  infoVal: { fontSize: 12, fontWeight: '700' },
});
