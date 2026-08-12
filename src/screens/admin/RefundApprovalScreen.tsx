import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';

export default function RefundApprovalScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getPendingRefunds({ limit: 50 }); setRefunds(r.refunds || []); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const handleApprove = (item) => {
    Alert.alert('Approve Refund', `Approve refund of ${formatCurrency(item.refund?.amount || item.amount)}?`, [
      { text: 'Cancel' },
      { text: 'Approve', onPress: async () => {
        try { await adminAPI.approveRefund(item._id, {}); setRefunds(r => r.filter(x => x._id !== item._id)); Alert.alert('Success', 'Refund approved'); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const handleReject = (item) => {
    Alert.alert('Reject Refund', 'Reject this refund request?', [
      { text: 'Cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try { await adminAPI.rejectRefund(item._id, { reason: 'Rejected by admin' }); setRefunds(r => r.filter(x => x._id !== item._id)); Alert.alert('Done', 'Refund rejected'); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const RefundCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={adminStyles.cardRow}>
        <Text style={[s.txId, { color: c.text, fontFamily: font }]}>{item.transactionId}</Text>
        <Text style={[s.amount, { color: c.primary, fontFamily: font }]}>{formatCurrency(item.refund?.amount || item.amount)}</Text>
      </View>
      <Text style={[s.client, { color: c.muted, fontFamily: font }]}>{item.payer?.firstName} {item.payer?.lastName} · {item.payer?.email}</Text>
      <Text style={[s.booking, { color: c.muted, fontFamily: font }]}>Booking: {item.booking?.bookingNumber}</Text>
      {item.refund?.reason ? <Text style={[s.reason, { color: c.muted, fontFamily: font }]}>Reason: {item.refund.reason}</Text> : null}
      <Text style={[s.date, { color: c.muted, fontFamily: font }]}>Requested: {formatDateTime(item.refund?.requestedAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#f0fdf4' }]} onPress={() => handleApprove(item)}>
          <Text style={[adminStyles.actionBtnText, { color: '#15803d', fontFamily: font }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fff1f2' }]} onPress={() => handleReject(item)}>
          <Text style={[adminStyles.actionBtnText, { color: '#dc2626', fontFamily: font }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Refund Approval</Text>
        <View style={[adminStyles.badge, { backgroundColor: '#fee2e2' }]}>
          <Text style={[adminStyles.badgeText, { color: '#dc2626', fontFamily: font }]}>{refunds.length} pending</Text>
        </View>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={refunds}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <RefundCard item={item} />}
          ListEmptyComponent={
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No pending refunds</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  txId: { fontSize: 13, fontWeight: '800' },
  amount: { fontSize: 15, fontWeight: '800' },
  client: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  booking: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  reason: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  date: { fontSize: 11, marginTop: 2, marginBottom: 4 },
});
