import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const STATUS_FILTERS = ['all', 'pending', 'completed', 'failed', 'refunded'];

const STATUS_COLORS = {
  completed: '#10b981', pending: '#f59e0b', failed: '#ef4444',
  refunded: '#6366f1', cancelled: '#6b7280',
};

export default function PaymentMonitoringScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadPayments(); }, [filterStatus, page]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const query: any = { page, limit: 20 };
      if (filterStatus !== 'all') query.status = filterStatus;
      const res = await adminAPI.getAllPayments(query);
      setPayments(res.payments || []);
      setTotal(res.pagination?.total || 0);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const PaymentCard = ({ item }) => {
    const color = STATUS_COLORS[item.status] || '#6b7280';
    return (
      <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={adminStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{item.transactionId}</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>
              {item.payer?.firstName} {item.payer?.lastName} → {item.payee?.businessName || `${item.payee?.firstName} ${item.payee?.lastName}`}
            </Text>
          </View>
          <View style={[adminStyles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[adminStyles.badgeText, { color, textTransform: 'capitalize' }]}>{item.status}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 15, fontFamily: appFont }}>{formatCurrency(item.amount)}</Text>
          <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{formatDateTime(item.createdAt)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>Fee: {formatCurrency(item.platformFee || 0)}</Text>
          <Text style={{ color: C.muted, fontSize: 12, textTransform: 'capitalize', fontFamily: appFont }}>{item.paymentMethod}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Payment Monitoring</Text>
        <View style={[adminStyles.badge, { backgroundColor: isDark ? '#1e3a5f' : '#eff6ff' }]}>
          <Text style={[adminStyles.badgeText, { color: '#2563eb', fontFamily: appFont }]}>{total} total</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={[{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[adminStyles.filterChip, { backgroundColor: filterStatus === s ? C.primary : C.surface, borderColor: filterStatus === s ? C.primary : C.inputBorder }]}
              onPress={() => { setFilterStatus(s); setPage(1); }}
            >
              <Text style={[adminStyles.filterChipText, { color: filterStatus === s ? '#fff' : C.text, textTransform: 'capitalize', fontFamily: appFont }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={payments}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PaymentCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="credit-card-off" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No payments found</Text>
            </View>
          }
          ListFooterComponent={
            total > 20 ? (
              <View style={adminStyles.paginationRow}>
                <TouchableOpacity
                  style={[adminStyles.pageBtn, { borderColor: C.inputBorder, opacity: page === 1 ? 0.4 : 1 }]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Text style={[adminStyles.pageBtnText, { color: C.text, fontFamily: appFont }]}>Prev</Text>
                </TouchableOpacity>
                <Text style={{ color: C.muted, fontFamily: appFont }}>Page {page}</Text>
                <TouchableOpacity
                  style={[adminStyles.pageBtn, { borderColor: C.inputBorder }]}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <Text style={[adminStyles.pageBtnText, { color: C.text, fontFamily: appFont }]}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
