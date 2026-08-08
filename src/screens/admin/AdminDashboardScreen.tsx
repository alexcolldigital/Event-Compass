import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';

const MENU_ITEMS = [
  { icon: 'account-multiple', label: 'User Management', screen: 'ManageUsers' },
  { icon: 'shield-check', label: 'Provider Approval', screen: 'ManageUsers', params: { filterRole: 'service_provider' } },
  { icon: 'calendar-check', label: 'Booking Management', screen: 'ManageBookings' },
  { icon: 'percent', label: 'Commission Management', screen: 'CommissionManagement' },
  { icon: 'credit-card-outline', label: 'Payment Monitoring', screen: 'PaymentMonitoring' },
  { icon: 'cash-refund', label: 'Refund Approval', screen: 'RefundApproval' },
  { icon: 'flag-outline', label: 'Content Moderation', screen: 'ContentModeration' },
  { icon: 'chart-bar', label: 'Reports Management', screen: 'ReportsManagement' },
  { icon: 'shape', label: 'Category Management', screen: 'CategoryManagement' },
  { icon: 'ticket-percent', label: 'Coupon Management', screen: 'CouponManagement' },
  { icon: 'bullhorn', label: 'Promotions', screen: 'PromotionsManagement' },
  { icon: 'chart-line', label: 'Analytics Dashboard', screen: 'AnalyticsDashboard' },
  { icon: 'bell-outline', label: 'Notification Management', screen: 'NotificationManagement' },
  { icon: 'file-document-outline', label: 'CMS Pages', screen: 'CMSManagement' },
  { icon: 'clipboard-list-outline', label: 'Audit Logs', screen: 'AuditLogs' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then((r) => setStats(r.stats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 py-8">
          <Text className="text-white text-3xl font-bold">Admin Dashboard</Text>
          <Text className="text-white/70 mt-1">Event Compass Management</Text>
        </View>

        {/* Quick Stats */}
        <View className="px-4 py-4">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <MaterialCommunityIcons name="account-multiple" size={28} color="#3b82f6" />
              <Text className="text-3xl font-bold text-blue-600 mt-2">{stats?.users.total || 0}</Text>
              <Text className="text-blue-700 text-xs mt-1">Total Users</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200">
              <MaterialCommunityIcons name="calendar-check" size={28} color="#10b981" />
              <Text className="text-3xl font-bold text-green-600 mt-2">{stats?.bookings.completed || 0}</Text>
              <Text className="text-green-700 text-xs mt-1">Completed</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <MaterialCommunityIcons name="clock-outline" size={28} color="#f59e0b" />
              <Text className="text-3xl font-bold text-yellow-600 mt-2">{stats?.bookings.pending || 0}</Text>
              <Text className="text-yellow-700 text-xs mt-1">Pending</Text>
            </View>
            <View className="flex-1 bg-orange-50 rounded-xl p-4 border border-orange-200">
              <MaterialCommunityIcons name="currency-usd" size={28} color="#f97316" />
              <Text className="text-xl font-bold text-orange-600 mt-2">
                ₦{((stats?.revenue.total || 0) / 1000000).toFixed(1)}M
              </Text>
              <Text className="text-orange-700 text-xs mt-1">Revenue</Text>
            </View>
          </View>
        </View>

        {/* Today */}
        <View className="mx-4 mb-4 bg-white rounded-xl p-4 border border-gray-200">
          <Text className="text-gray-800 font-bold mb-3">Today</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-500 text-xs">Bookings</Text>
              <Text className="text-2xl font-bold text-gray-800">{stats?.today.bookings || 0}</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Revenue</Text>
              <Text className="text-2xl font-bold text-gray-800">₦{(stats?.today.revenue || 0).toLocaleString()}</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Providers</Text>
              <Text className="text-2xl font-bold text-gray-800">{stats?.users.serviceProviders || 0}</Text>
            </View>
          </View>
        </View>

        {/* Management Menu */}
        <View className="px-4 pb-8">
          <Text className="text-gray-800 font-bold mb-3">Management</Text>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.screen + item.label}
              className="bg-white rounded-xl p-4 mb-2 flex-row items-center border border-gray-200"
              onPress={() => navigation.navigate(item.screen, item.params)}
            >
              <View className="w-10 h-10 rounded-lg bg-indigo-100 items-center justify-center">
                <MaterialCommunityIcons name={item.icon} size={22} color="#6366f1" />
              </View>
              <Text className="flex-1 ml-3 font-semibold text-gray-800">{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
