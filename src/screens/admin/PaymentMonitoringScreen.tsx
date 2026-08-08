import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency, formatDateTime } from '../../utils/helpers.js';

const STATUS_FILTERS = ['all', 'pending', 'completed', 'failed', 'refunded'];

export default function PaymentMonitoringScreen() {
  const navigation = useNavigation();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [filterStatus, page]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const query = { page, limit: 20 };
      if (filterStatus !== 'all') query.status = filterStatus;
      const res = await adminAPI.getAllPayments(query);
      setPayments(res.payments || []);
      setTotal(res.pagination?.total || 0);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', failed: '#ef4444', refunded: '#6366f1', cancelled: '#6b7280' }[s] || '#6b7280');

  const PaymentCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-800">{item.transactionId}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            {item.payer?.firstName} {item.payer?.lastName} → {item.payee?.businessName || `${item.payee?.firstName} ${item.payee?.lastName}`}
          </Text>
        </View>
        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: statusColor(item.status) + '20' }}>
          <Text className="text-xs font-semibold capitalize" style={{ color: statusColor(item.status) }}>{item.status}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <Text className="text-primary font-bold">{formatCurrency(item.amount)}</Text>
        <Text className="text-gray-400 text-xs">{formatDateTime(item.createdAt)}</Text>
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-gray-500 text-xs">Fee: {formatCurrency(item.platformFee || 0)}</Text>
        <Text className="text-gray-500 text-xs capitalize">{item.paymentMethod}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Payment Monitoring</Text>
        <Text className="text-gray-500 text-sm">{total} total</Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white px-3 py-2 border-b border-gray-100">
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            className={`mr-2 px-3 py-1 rounded-full border ${filterStatus === s ? 'bg-primary border-primary' : 'border-gray-300'}`}
            onPress={() => { setFilterStatus(s); setPage(1); }}
          >
            <Text className={`text-xs font-semibold capitalize ${filterStatus === s ? 'text-white' : 'text-dark'}`}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Loading /> : (
        <FlatList
          data={payments}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PaymentCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="credit-card-off" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No payments found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
