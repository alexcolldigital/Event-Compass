import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/helpers.js';

const RESOURCES = ['all', 'User', 'Service', 'Booking', 'Payment', 'Category', 'Coupon', 'Promotion', 'Notification', 'CMSPage'];

export default function AuditLogsScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterResource, setFilterResource] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadLogs(); }, [filterResource, page]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const query: Record<string, any> = { page, limit: 30 };
      if (filterResource !== 'all') query.resource = filterResource;
      const res = await adminAPI.getAuditLogs(query);
      setLogs(res.logs || []);
      setTotal(res.pagination?.total || 0);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const actionColor = (status: string) => ({ success: '#10b981', failure: '#ef4444', warning: '#f59e0b' }[status] || '#6b7280');

  const LogCard = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-2 border border-gray-200">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-semibold text-gray-800 flex-1 mr-2 text-sm" numberOfLines={1}>{item.action}</Text>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: actionColor(item.status) + '20' }}>
          <Text className="text-xs font-semibold capitalize" style={{ color: actionColor(item.status) }}>{item.status}</Text>
        </View>
      </View>
      <View className="flex-row gap-2 mb-1">
        <View className="bg-gray-100 px-2 py-0.5 rounded">
          <Text className="text-gray-600 text-xs">{item.resource}</Text>
        </View>
        <Text className="text-gray-500 text-xs">by {item.actor?.firstName} {item.actor?.lastName} ({item.actorRole})</Text>
      </View>
      <Text className="text-gray-400 text-xs">{formatDateTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Audit Logs</Text>
        <Text className="text-gray-500 text-sm">{total} total</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100 px-3 py-2">
        {RESOURCES.map((r) => (
          <TouchableOpacity
            key={r}
            className={`mr-2 px-3 py-1 rounded-full border ${filterResource === r ? 'bg-primary border-primary' : 'border-gray-300'}`}
            onPress={() => { setFilterResource(r); setPage(1); }}
          >
            <Text className={`text-xs font-semibold ${filterResource === r ? 'text-white' : 'text-dark'}`}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Loading /> : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <LogCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="clipboard-list-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No audit logs found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
