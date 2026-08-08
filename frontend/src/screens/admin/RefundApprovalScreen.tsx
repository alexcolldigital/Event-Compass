import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';

export default function RefundApprovalScreen() {
  const navigation = useNavigation();
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

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
    Alert.alert('Approve Refund', `Approve refund of ${formatCurrency(item.refund?.amount || item.amount)} to ${item.payer?.firstName}?`, [
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
    ]);
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
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between mb-2">
        <Text className="font-bold text-gray-800">{item.transactionId}</Text>
        <Text className="text-primary font-bold">{formatCurrency(item.refund?.amount || item.amount)}</Text>
      </View>
      <Text className="text-gray-600 text-sm">{item.payer?.firstName} {item.payer?.lastName} · {item.payer?.email}</Text>
      <Text className="text-gray-500 text-xs mt-1">Booking: {item.booking?.bookingNumber}</Text>
      {item.refund?.reason && <Text className="text-gray-500 text-xs mt-1">Reason: {item.refund.reason}</Text>}
      <Text className="text-gray-400 text-xs mt-1">Requested: {formatDateTime(item.refund?.requestedAt)}</Text>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity className="flex-1 bg-green-100 py-2 rounded-lg" onPress={() => handleApprove(item)}>
          <Text className="text-green-700 font-semibold text-center text-sm">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-100 py-2 rounded-lg" onPress={() => handleReject(item)}>
          <Text className="text-red-700 font-semibold text-center text-sm">Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Refund Approval</Text>
        <View className="bg-red-100 px-2 py-1 rounded-full">
          <Text className="text-red-700 text-xs font-bold">{refunds.length} pending</Text>
        </View>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={refunds}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <RefundCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3 font-semibold">No pending refunds</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
