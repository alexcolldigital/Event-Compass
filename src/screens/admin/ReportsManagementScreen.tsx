import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/helpers.js';

const REPORT_TYPES = [
  { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'users', label: 'Users', icon: 'account-group' },
];

export default function ReportsManagementScreen() {
  const navigation = useNavigation();
  const [reportType, setReportType] = useState('overview');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadReport(); }, [reportType]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getDetailedReports({ type: reportType });
      setReport(res.report);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', confirmed: '#3b82f6' }[s] || '#6b7280');

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Reports Management</Text>
      </View>

      {/* Type Selector */}
      <View className="flex-row bg-white border-b border-gray-200">
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            className={`flex-1 py-3 border-b-2 items-center ${reportType === t.key ? 'border-primary' : 'border-transparent'}`}
            onPress={() => setReportType(t.key)}
          >
            <MaterialCommunityIcons name={t.icon} size={18} color={reportType === t.key ? COLORS.primary : COLORS.gray[400]} />
            <Text className={`text-xs font-semibold mt-1 ${reportType === t.key ? 'text-primary' : 'text-gray-500'}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <ScrollView className="flex-1 p-4">
          {reportType === 'overview' && report && (
            <>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <Text className="text-blue-700 text-xs">Total Users</Text>
                  <Text className="text-blue-900 text-2xl font-bold mt-1">{report.summary?.totalUsers || 0}</Text>
                </View>
                <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-200">
                  <Text className="text-green-700 text-xs">Total Bookings</Text>
                  <Text className="text-green-900 text-2xl font-bold mt-1">{report.summary?.totalBookings || 0}</Text>
                </View>
              </View>
              <View className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4">
                <Text className="text-orange-700 text-xs">Total Revenue</Text>
                <Text className="text-orange-900 text-2xl font-bold mt-1">{formatCurrency(report.summary?.totalRevenue || 0)}</Text>
              </View>

              <Text className="font-bold text-gray-800 mb-3">Top Services</Text>
              {(report.topServices || []).map((s, i) => (
                <View key={s._id} className="bg-white rounded-xl p-3 mb-2 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-400 font-bold w-6">#{i + 1}</Text>
                  <View className="flex-1 ml-2">
                    <Text className="font-semibold text-gray-800">{s.name}</Text>
                    <Text className="text-gray-500 text-xs">{s.totalBookings} bookings · ⭐ {s.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}

              <Text className="font-bold text-gray-800 mb-3 mt-4">Top Providers</Text>
              {(report.topProviders || []).map((p, i) => (
                <View key={p._id} className="bg-white rounded-xl p-3 mb-2 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-400 font-bold w-6">#{i + 1}</Text>
                  <View className="flex-1 ml-2">
                    <Text className="font-semibold text-gray-800">{p.businessName || `${p.firstName} ${p.lastName}`}</Text>
                    <Text className="text-gray-500 text-xs">{p.totalBookings} bookings · ⭐ {p.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {reportType === 'bookings' && report && (
            <>
              <Text className="font-bold text-gray-800 mb-3">Bookings by Status</Text>
              {(report.data || []).map((d) => (
                <View key={d._id} className="bg-white rounded-xl p-4 mb-2 border border-gray-200 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColor(d._id) }} />
                    <Text className="font-semibold text-gray-800 capitalize">{d._id}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-gray-800">{d.count}</Text>
                    <Text className="text-gray-500 text-xs">{formatCurrency(d.revenue || 0)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {reportType === 'users' && report && (
            <>
              <Text className="font-bold text-gray-800 mb-3">User Growth by Month</Text>
              {(report.data || []).map((d, i) => (
                <View key={i} className="bg-white rounded-xl p-3 mb-2 border border-gray-200 flex-row justify-between">
                  <Text className="text-gray-600">{d._id?.month} · <Text className="capitalize">{d._id?.role}</Text></Text>
                  <Text className="font-bold text-gray-800">{d.count}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
