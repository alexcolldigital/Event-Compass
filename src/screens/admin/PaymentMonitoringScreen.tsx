import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';

const STATUS_FILTERS = ['all', 'pending', 'completed', 'failed', 'refunded'];
const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', failed: '#dc2626', refunded: '#6366f1', cancelled: '#6b7280' }[s] || '#6b7280');

export default function PaymentMonitoringScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, [filterStatus]);

  const load = async () => {
    setIsLoading(true);
    try {
      const q: any = { limit: 50 };
      if (filterStatus !== 'all') q.status = filterStatus;
      const r = await adminAPI.getAllPayments(q);
      setPayments(r.payments || []);
      setTotal(r.pagination?.total || 0);
    } catch (_) {} finally { setIsLoading(false); }
  };

  const PaymentCard = ({ item }) => {
    const sc = statusColor(item.status);
    return (
      <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={adminStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.txId, { color: c.text, fontFamily: font }]}>{item.transactionId}</Text>
            <Text style={[s.parties, { color: c.muted, fontFamily: font }]}>
              {item.payer?.firstName} {item.payer?.lastName} → {item.payee?.businessName || `${item.payee?.firstName} ${item.payee?.lastName}`}
            </Text>
          </View>
          <View style={[adminStyles.badge, { backgroundColor: sc + '20' }]}>
            <Text style={[adminStyles.badgeText, { color: sc, fontFamily: font, textTransform: 'capitalize' }]}>{item.status}</Text>
          </View>
        </View>
        <View style={[adminStyles.cardRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border }]}>
          <Text style={[s.amount, { color: c.primary, fontFamily: font }]}>{formatCurrency(item.amount)}</Text>
          <Text style={[s.date, { color: c.muted, fontFamily: font }]}>{formatDateTime(item.createdAt)}</Text>
        </View>
        <View style={adminStyles.cardRow}>
          <Text style={[s.fee, { color: c.muted, fontFamily: font }]}>Fee: {formatCurrency(item.platformFee || 0)}</Text>
          <Text style={[s.method, { color: c.muted, fontFamily: font, textTransform: 'capitalize' }]}>{item.paymentMethod}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Payment Monitoring</Text>
        <Text style={[s.totalText, { color: c.muted, fontFamily: font }]}>{total} total</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[adminStyles.chip, { backgroundColor: filterStatus === f ? c.primary : 'transparent', borderColor: filterStatus === f ? c.primary : c.inputBorder }]} onPress={() => setFilterStatus(f)}>
            <Text style={[adminStyles.chipText, { color: filterStatus === f ? '#fff' : c.muted, fontFamily: font, textTransform: 'capitalize' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Loading /> : (
        <FlatList
          data={payments}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <PaymentCard item={item} />}
          ListEmptyComponent={
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="credit-card-off" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No payments found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  totalText: { fontSize: 13, fontWeight: '600' },
  txId: { fontSize: 13, fontWeight: '800' },
  parties: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '800' },
  date: { fontSize: 11, fontWeight: '500' },
  fee: { fontSize: 11, fontWeight: '500' },
  method: { fontSize: 11, fontWeight: '600' },
});
