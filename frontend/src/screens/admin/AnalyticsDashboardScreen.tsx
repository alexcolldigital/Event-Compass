import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/helpers.js';

const PERIODS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y', label: '1 Year' },
];

export default function AnalyticsDashboardScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getAnalyticsDashboard({ period });
      setAnalytics(res.analytics);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', confirmed: '#3b82f6' }[s] || '#6b7280');
  const roleColor = (r) => ({ client: '#3b82f6', service_provider: '#10b981', admin: '#6366f1' }[r] || '#6b7280');

  const maxRevenue = analytics?.dailyRevenue?.length ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1) : 1;

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Analytics Dashboard</Text>
      </View>

      {/* Period Selector */}
      <View className="flex-row bg-white border-b border-gray-200 px-3 py-2">
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            className={`mr-2 px-3 py-1.5 rounded-full border ${period === p.key ? 'bg-primary border-primary' : 'border-gray-300'}`}
            onPress={() => setPeriod(p.key)}
          >
            <Text className={`text-xs font-semibold ${period === p.key ? 'text-white' : 'text-dark'}`}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : !analytics ? null : (
        <ScrollView className="flex-1 p-4">
          {/* KPI Cards */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <MaterialCommunityIcons name="account-plus" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-blue-800 mt-2">{analytics.newUsers}</Text>
              <Text className="text-blue-600 text-xs mt-1">New Users</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200">
              <MaterialCommunityIcons name="calendar-plus" size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-green-800 mt-2">{analytics.newBookings}</Text>
              <Text className="text-green-600 text-xs mt-1">New Bookings</Text>
            </View>
          </View>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-orange-50 rounded-xl p-4 border border-orange-200">
              <MaterialCommunityIcons name="currency-usd" size={24} color="#f97316" />
              <Text className="text-xl font-bold text-orange-800 mt-2">{formatCurrency(analytics.revenue)}</Text>
              <Text className="text-orange-600 text-xs mt-1">Revenue</Text>
            </View>
            <View className="flex-1 bg-purple-50 rounded-xl p-4 border border-purple-200">
              <MaterialCommunityIcons name="percent" size={24} color="#a855f7" />
              <Text className="text-xl font-bold text-purple-800 mt-2">{formatCurrency(analytics.platformFees)}</Text>
              <Text className="text-purple-600 text-xs mt-1">Platform Fees</Text>
            </View>
          </View>

          {/* Bookings by Status */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-3">Bookings by Status</Text>
            {(analytics.bookingsByStatus || []).map((b) => (
              <View key={b._id} className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColor(b._id) }} />
                  <Text className="text-gray-700 capitalize">{b._id}</Text>
                </View>
                <Text className="font-bold text-gray-800">{b.count}</Text>
              </View>
            ))}
          </View>

          {/* Users by Role */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-3">Users by Role</Text>
            {(analytics.usersByRole || []).map((u) => (
              <View key={u._id} className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: roleColor(u._id) }} />
                  <Text className="text-gray-700 capitalize">{u._id?.replace(/_/g, ' ')}</Text>
                </View>
                <Text className="font-bold text-gray-800">{u.count}</Text>
              </View>
            ))}
          </View>

          {/* Daily Revenue Chart */}
          {analytics.dailyRevenue?.length > 0 && (
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <Text className="font-bold text-gray-800 mb-3">Daily Revenue</Text>
              {analytics.dailyRevenue.slice(-14).map((d) => (
                <View key={d._id} className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600 text-xs">{d._id}</Text>
                    <Text className="text-primary text-xs font-semibold">{formatCurrency(d.revenue)}</Text>
                  </View>
                  <View className="w-full bg-gray-100 rounded-full h-2">
                    <View className="bg-primary h-2 rounded-full" style={{ width: `${(d.revenue / maxRevenue) * 100}%` }} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
