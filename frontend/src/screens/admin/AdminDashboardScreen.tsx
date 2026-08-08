/**
 * Admin Dashboard Screen
 * Admin dashboard with statistics and management options
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';

type AdminDashboardNavigation = {
  navigate: (screen:
    | 'ManageUsers'
    | 'ManageBookings'
    | 'ManageServices'
    | 'RevenueAnalytics') => void;
};

// Define the stats type based on backend response
interface DashboardStats {
  users: {
    total: number;
    serviceProviders: number;
    clients: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
  };
  revenue: {
    total: number;
    platformFees: number;
  };
  today: {
    bookings: number;
    revenue: number;
  };
}

type AdminDashboardScreenProps = {
  navigation: AdminDashboardNavigation;
};

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      // The axios interceptor returns response.data directly, so response is the data object
      const response = await adminAPI.getDashboardStats() as unknown as { stats: DashboardStats };
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Type for menu items with proper icon name type
  type MenuItem = {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
    count: string | number | undefined;
    onPress: () => void;
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'account-multiple',
      label: 'Users',
      count: stats?.users.total,
      onPress: () => navigation.navigate('ManageUsers'),
    },
    {
      icon: 'calendar-check',
      label: 'Bookings',
      count: stats?.bookings.total,
      onPress: () => navigation.navigate('ManageBookings'),
    },
    {
      icon: 'briefcase',
      label: 'Services',
      count: 'Manage',
      onPress: () => navigation.navigate('ManageServices'),
    },
    {
      icon: 'currency-usd',
      label: 'Revenue',
      count: `₦${stats?.revenue.total?.toLocaleString() || 0}`,
      onPress: () => navigation.navigate('RevenueAnalytics'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-indigo-600 px-6 py-8">
          <Text className="text-white text-3xl font-bold">Admin Dashboard</Text>
          <Text className="text-white/70 mt-1">Event Compass Management</Text>
        </View>

        {/* Stats Overview */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Quick Stats
          </Text>

          {/* Main Stats */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <MaterialCommunityIcons
                name="account-multiple"
                size={32}
                color="#3b82f6"
              />
              <Text className="text-3xl font-bold text-blue-600 mt-2">
                {stats?.users.total || 0}
              </Text>
              <Text className="text-blue-700 text-sm">Total Users</Text>
            </View>

            <View className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
              <MaterialCommunityIcons
                name="calendar-check"
                size={32}
                color="#10b981"
              />
              <Text className="text-3xl font-bold text-green-600 mt-2">
                {stats?.bookings.completed || 0}
              </Text>
              <Text className="text-green-700 text-sm">Completed Bookings</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-purple-50 rounded-lg p-4 border border-purple-200">
              <MaterialCommunityIcons
                name="percent"
                size={32}
                color="#a855f7"
              />
              <Text className="text-3xl font-bold text-purple-600 mt-2">
                {stats?.bookings.pending || 0}
              </Text>
              <Text className="text-purple-700 text-sm">Pending Bookings</Text>
            </View>

            <View className="flex-1 bg-orange-50 rounded-lg p-4 border border-orange-200">
              <MaterialCommunityIcons
                name="currency-usd"
                size={32}
                color="#f97316"
              />
              <Text className="text-2xl font-bold text-orange-600 mt-2">
                ₦{(stats?.revenue.total || 0) / 1000000}M
              </Text>
              <Text className="text-orange-700 text-sm">Total Revenue</Text>
            </View>
          </View>
        </View>

        {/* Management Menu */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Management
          </Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white rounded-lg p-4 mb-3 flex-row items-center justify-between border border-gray-200"
              onPress={item.onPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-lg bg-indigo-100 items-center justify-center">
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#6366f1"
                  />
                </View>
                <View className="ml-4">
                  <Text className="font-semibold text-gray-800">
                    {item.label}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Total: {item.count}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#d1d5db"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Platform Overview
          </Text>

          <View className="bg-white rounded-lg p-4 border border-gray-200">
            <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-200">
              <View>
                <Text className="text-gray-600 text-sm">Service Providers</Text>
                <Text className="text-2xl font-bold text-gray-800 mt-1">
                  {stats?.users.serviceProviders || 0}
                </Text>
              </View>
              <View>
                <Text className="text-gray-600 text-sm">Clients</Text>
                <Text className="text-2xl font-bold text-gray-800 mt-1">
                  {stats?.users.clients || 0}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600 text-sm">Today Revenue</Text>
                <Text className="text-2xl font-bold text-gray-800 mt-1">
                  ₦{(stats?.today.revenue || 0).toLocaleString()}
                </Text>
              </View>
              <View>
                <Text className="text-gray-600 text-sm">Today Bookings</Text>
                <Text className="text-2xl font-bold text-gray-800 mt-1">
                  {stats?.today.bookings || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
