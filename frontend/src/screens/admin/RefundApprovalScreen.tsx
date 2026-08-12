import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

export default function RefundApprovalScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadRefunds(); }, []);

  const loadRefunds = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getPendingRefunds({ limit: 50 });
      setRefunds(res.refunds || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const handleApprove = (item) => {
    Alert.alert(
      'Approve Refund',
      `Approve refund of ${formatCurrency(item.refund?.amount || item.amount)} to ${item.payer?.firstName}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Approve', onPress: async () => {
            try {
              await adminAPI.approveRefund(item._id, {});
              setRefunds((r) => r.filter((x) => x._id !== item._id));
              Alert.alert('Success', 'Refund approved');
            } catch (e) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  const handleReject = (item) => {
    Alert.prompt('Reject Refund', 'Enter rejection reason:', async (reason) => {
      if (!reason) return;
      try {
        await adminAPI.rejectRefund(item._id, { reason });
        setRefunds((r) => r.filter((x) => x._id !== item._id));
        Alert.alert('Done', 'Refund rejected');
      } catch (e) { Alert.alert('Error', e.message); }
    });
  };

  const RefundCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{item.transactionId}</Text>
        <Text style={{ color: C.primary, fontWeight: '800', fontSize: 15, fontFamily: appFont }}>{formatCurrency(item.refund?.amount || item.amount)}</Text>
      </View>
      <Text style={{ color: C.text, fontSize: 13, fontFamily: appFont }}>{item.payer?.firstName} {item.payer?.lastName}</Text>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{item.payer?.email}</Text>
      {item.booking?.bookingNumber && (
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>Booking: {item.booking.bookingNumber}</Text>
      )}
      {item.refund?.reason && (
        <View style={{ backgroundColor: isDark ? '#451a03' : '#fff7ed', borderRadius: 10, padding: 8, marginTop: 8 }}>
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', fontFamily: appFont }}>Reason</Text>
          <Text style={{ color: isDark ? '#fb923c' : '#c2410c', fontSize: 12, marginTop: 2, fontFamily: appFont }}>{item.refund.reason}</Text>
        </View>
      )}
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 6, fontFamily: appFont }}>Requested: {formatDateTime(item.refund?.requestedAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#14532d' : '#dcfce7' }]} onPress={() => handleApprove(item)}>
          <Text style={[adminStyles.actionBtnText, { color: '#166534', fontFamily: appFont }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleReject(item)}>
          <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Refund Approval</Text>
        <View style={[adminStyles.badge, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]}>
          <Text style={[adminStyles.badgeText, { color: '#b91c1c', fontFamily: appFont }]}>{refunds.length} pending</Text>
        </View>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={refunds}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <RefundCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No pending refunds</Text>
              <Text style={[adminStyles.emptySubtext, { color: C.muted, fontFamily: appFont }]}>All refunds have been processed</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
