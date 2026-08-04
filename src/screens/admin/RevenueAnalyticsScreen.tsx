/**
 * Revenue Analytics Screen
 * Admin screen for viewing financial reports and revenue data
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';

const { width } = Dimensions.get('window');

const RevenueAnalyticsScreen = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    loadRevenueData();
  }, [timePeriod]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getRevenueAnalytics({ period: timePeriod });
      const rows = response.revenues || [];
      const data = rows.map((row) => ({
        date: timePeriod === 'daily' ? row._id : undefined,
        week: timePeriod === 'weekly' ? row._id : undefined,
        month: timePeriod === 'monthly' ? row._id : undefined,
        year: timePeriod === 'yearly' ? row._id : undefined,
        amount: row.totalRevenue || 0,
        bookings: row.transactionCount || 0,
      }));
      const totalRevenue = rows.reduce((sum, row) => sum + (row.totalRevenue || 0), 0);
      const platformFees = rows.reduce((sum, row) => sum + (row.platformFees || 0), 0);

      setRevenueData({
        totalRevenue,
        platformFees,
        providerPayouts: Math.max(totalRevenue - platformFees, 0),
        data,
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setIsLoading(false);
    }
  };

  const ChartBar = ({ amount, maxAmount, label, bookings }) => {
    const percentage = (amount / maxAmount) * 100;

    return (
      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-dark font-semibold text-sm">{label}</Text>
          <Text className="text-primary font-bold text-sm">{formatCurrency(amount)}</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <View
            className="bg-primary h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-1">{bookings} bookings</Text>
      </View>
    );
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading analytics..." />;
  }

  if (!revenueData) {
    return (
      <View className="flex-1 bg-light p-4">
        <ErrorMessage error={error || 'No data available'} />
      </View>
    );
  }

  const maxAmount = Math.max(...revenueData.data.map((d) => d.amount), 1);
  const totalBookings = revenueData.data.reduce((sum, d) => sum + d.bookings, 0);
  const averageTransaction = totalBookings > 0 ? revenueData.totalRevenue / totalBookings : 0;
  const commissionRate =
    revenueData.totalRevenue > 0
      ? (revenueData.platformFees / revenueData.totalRevenue) * 100
      : 0;

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Revenue Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Time Period Selector */}
        <View className="flex-row gap-2 px-3 mt-3 mb-3">
          {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
            <TouchableOpacity
              key={period}
              className={`flex-1 py-2 rounded-lg border ${
                timePeriod === period
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setTimePeriod(period)}
            >
              <Text
                className={`text-xs font-semibold text-center capitalize ${
                  timePeriod === period ? 'text-white' : 'text-dark'
                }`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Summary */}
        <View className="bg-white mx-3 p-4 rounded-lg mb-3">
          <Text className="text-dark text-lg font-bold mb-4">
            {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Revenue Summary
          </Text>

          {/* Total Revenue Card */}
          <View className="bg-gradient-to-r rounded-lg p-4 mb-3" style={{ backgroundColor: COLORS.primary }}>
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="currency-usd" size={20} color="white" />
              <Text className="text-white text-sm ml-2 font-semibold">Total Revenue</Text>
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(revenueData.totalRevenue)}
            </Text>
            <Text className="text-white text-xs mt-1 opacity-80">
              From all bookings and transactions
            </Text>
          </View>

          {/* Revenue Breakdown */}
          <View className="flex-row gap-3">
            {/* Platform Fees */}
            <View className="flex-1 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="percent" size={16} color={COLORS.warning} />
                <Text className="text-warning text-xs ml-1 font-semibold">Platform Fees</Text>
              </View>
              <Text className="text-orange-900 font-bold text-lg">
                {formatCurrency(revenueData.platformFees)}
              </Text>
              <Text className="text-orange-700 text-xs mt-1">
                {commissionRate.toFixed(1)}%
              </Text>
            </View>

            {/* Provider Payouts */}
            <View className="flex-1 bg-green-50 p-3 rounded-lg border border-green-200">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="wallet" size={16} color={COLORS.success} />
                <Text className="text-success text-xs ml-1 font-semibold">Provider Payouts</Text>
              </View>
              <Text className="text-green-900 font-bold text-lg">
                {formatCurrency(revenueData.providerPayouts)}
              </Text>
              <Text className="text-green-700 text-xs mt-1">
                {(100 - commissionRate).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Title */}
        <View className="px-3 mb-2">
          <Text className="text-dark font-semibold">
            Revenue by {timePeriod === 'daily' ? 'Day' : timePeriod === 'weekly' ? 'Week' : timePeriod === 'monthly' ? 'Month' : 'Year'}
          </Text>
        </View>

        {/* Revenue Chart */}
        <View className="bg-white mx-3 p-4 rounded-lg mb-3">
          {revenueData.data.map((item, index) => (
            <ChartBar
              key={index}
              amount={item.amount}
              maxAmount={maxAmount}
              label={item.date || item.week || item.month || item.year}
              bookings={item.bookings}
            />
          ))}
          {revenueData.data.length === 0 && (
            <View className="items-center justify-center py-8">
              <MaterialCommunityIcons name="chart-line" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3 font-semibold">No revenue yet</Text>
              <Text className="text-gray-400 text-sm mt-1">Completed payments will appear here</Text>
            </View>
          )}
        </View>

        {/* Additional Metrics */}
        <View className="bg-white mx-3 p-4 rounded-lg mb-3">
          <Text className="text-dark font-semibold mb-3">Key Metrics</Text>

          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200 mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center">
                <MaterialCommunityIcons name="chart-line" size={20} color={COLORS.info} />
              </View>
              <View className="ml-3">
                <Text className="text-gray-600 text-xs">Average Transaction</Text>
                <Text className="text-dark font-bold text-sm mt-1">
                  {formatCurrency(averageTransaction)}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between pb-3 border-b border-gray-200 mb-3">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-green-100 rounded-full justify-center items-center">
                <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.success} />
              </View>
              <View className="ml-3">
                <Text className="text-gray-600 text-xs">Total Bookings</Text>
                <Text className="text-dark font-bold text-sm mt-1">
                  {totalBookings}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-purple-100 rounded-full justify-center items-center">
                <MaterialCommunityIcons name="trending-up" size={20} color={COLORS.primary} />
              </View>
              <View className="ml-3">
                <Text className="text-gray-600 text-xs">Commission Rate</Text>
                <Text className="text-dark font-bold text-sm mt-1">
                  {commissionRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View className="bg-white mx-3 p-4 rounded-lg mb-6">
          <Text className="text-dark font-semibold mb-3">Export Data</Text>

          <View className="flex-row gap-2">
            <TouchableOpacity className="flex-1 border border-primary rounded-lg py-2">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="file-document-outline" size={18} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-2 text-sm">PDF</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 border border-primary rounded-lg py-2">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="file-excel" size={18} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-2 text-sm">Excel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 border border-primary rounded-lg py-2">
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons name="share-variant" size={18} color={COLORS.primary} />
                <Text className="text-primary font-semibold ml-2 text-sm">Share</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RevenueAnalyticsScreen;
