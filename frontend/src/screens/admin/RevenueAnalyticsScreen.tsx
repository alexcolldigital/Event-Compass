import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { formatCurrency } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';
import { goBackToAdminDashboard } from '../../utils/adminNavigation';

const RevenueAnalyticsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => { loadRevenueData(); }, [timePeriod]);

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
      setRevenueData({ totalRevenue, platformFees, providerPayouts: Math.max(totalRevenue - platformFees, 0), data });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen message="Loading analytics..." />;

  if (!revenueData) {
    return (
      <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
        <View style={{ padding: 16 }}><ErrorMessage error={error || 'No data available'} /></View>
      </SafeAreaView>
    );
  }

  const maxAmount = Math.max(...revenueData.data.map((d) => d.amount), 1);
  const totalBookings = revenueData.data.reduce((sum, d) => sum + d.bookings, 0);
  const averageTransaction = totalBookings > 0 ? revenueData.totalRevenue / totalBookings : 0;
  const commissionRate = revenueData.totalRevenue > 0 ? (revenueData.platformFees / revenueData.totalRevenue) * 100 : 0;

  const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

  const METRIC_ROWS = [
    { icon: 'chart-line', bg: isDark ? '#1e3a5f' : '#eff6ff', color: C.info, label: 'Average Transaction', value: formatCurrency(averageTransaction) },
    { icon: 'calendar-check', bg: isDark ? '#14532d' : '#f0fdf4', color: C.success, label: 'Total Bookings', value: totalBookings },
    { icon: 'trending-up', bg: isDark ? '#2d1b69' : '#f5f3ff', color: C.primary, label: 'Commission Rate', value: `${commissionRate.toFixed(1)}%` },
  ];

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Revenue Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {/* Hero */}
        <View style={[adminStyles.hero, { backgroundColor: C.primary, marginTop: 12 }]}>
          <Text style={[adminStyles.heroEyebrow, { fontFamily: appFont }]}>ADMIN</Text>
          <Text style={[adminStyles.heroTitle, { fontFamily: appFont }]}>Revenue Analytics</Text>
          <Text style={[adminStyles.heroSubtitle, { fontFamily: appFont }]}>{formatCurrency(revenueData.totalRevenue)} total</Text>
        </View>

        {/* Period Selector */}
        <View style={[adminStyles.filterRow, { marginBottom: 16 }]}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[adminStyles.filterChip, { flex: 1, alignItems: 'center', backgroundColor: timePeriod === p ? C.primary : C.surface, borderColor: timePeriod === p ? C.primary : C.inputBorder }]}
              onPress={() => setTimePeriod(p)}
            >
              <Text style={[adminStyles.filterChipText, { color: timePeriod === p ? '#fff' : C.text, fontFamily: appFont, textTransform: 'capitalize' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Summary */}
        <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 16 }]}>
          <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 16, textTransform: 'capitalize' }]}>
            {timePeriod} Revenue Summary
          </Text>

          {/* Total Revenue */}
          <View style={{ backgroundColor: C.primary, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, marginLeft: 8, fontWeight: '600', fontFamily: appFont }}>Total Revenue</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', fontFamily: appFont }}>{formatCurrency(revenueData.totalRevenue)}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4, fontFamily: appFont }}>From all bookings and transactions</Text>
          </View>

          {/* Breakdown */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: isDark ? '#451a03' : '#fff7ed', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: isDark ? '#92400e' : '#fed7aa' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="percent" size={14} color={C.warning} />
                <Text style={{ color: C.warning, fontSize: 11, marginLeft: 4, fontWeight: '700', fontFamily: appFont }}>Platform Fees</Text>
              </View>
              <Text style={{ color: isDark ? '#fed7aa' : '#7c2d12', fontWeight: '800', fontSize: 16, fontFamily: appFont }}>{formatCurrency(revenueData.platformFees)}</Text>
              <Text style={{ color: isDark ? '#fb923c' : '#c2410c', fontSize: 11, marginTop: 2, fontFamily: appFont }}>{commissionRate.toFixed(1)}%</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? '#14532d' : '#f0fdf4', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: isDark ? '#166534' : '#bbf7d0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="wallet" size={14} color={C.success} />
                <Text style={{ color: C.success, fontSize: 11, marginLeft: 4, fontWeight: '700', fontFamily: appFont }}>Provider Payouts</Text>
              </View>
              <Text style={{ color: isDark ? '#bbf7d0' : '#14532d', fontWeight: '800', fontSize: 16, fontFamily: appFont }}>{formatCurrency(revenueData.providerPayouts)}</Text>
              <Text style={{ color: isDark ? '#4ade80' : '#166534', fontSize: 11, marginTop: 2, fontFamily: appFont }}>{(100 - commissionRate).toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 16 }]}>
          <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 16 }]}>
            Revenue by {timePeriod === 'daily' ? 'Day' : timePeriod === 'weekly' ? 'Week' : timePeriod === 'monthly' ? 'Month' : 'Year'}
          </Text>
          {revenueData.data.length === 0 ? (
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="chart-line" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No revenue yet</Text>
              <Text style={[adminStyles.emptySubtext, { color: C.muted, fontFamily: appFont }]}>Completed payments will appear here</Text>
            </View>
          ) : revenueData.data.map((item, index) => (
            <View key={index} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 13, fontFamily: appFont }}>{item.date || item.week || item.month || item.year}</Text>
                <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13, fontFamily: appFont }}>{formatCurrency(item.amount)}</Text>
              </View>
              <View style={{ width: '100%', backgroundColor: C.border, borderRadius: 6, height: 10, overflow: 'hidden' }}>
                <View style={{ backgroundColor: C.primary, height: 10, borderRadius: 6, width: `${(item.amount / maxAmount) * 100}%` }} />
              </View>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2, fontFamily: appFont }}>{item.bookings} bookings</Text>
            </View>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 16 }]}>
          <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 16 }]}>Key Metrics</Text>
          {METRIC_ROWS.map((m, i) => (
            <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: i < METRIC_ROWS.length - 1 ? 14 : 0, marginBottom: i < METRIC_ROWS.length - 1 ? 14 : 0, borderBottomWidth: i < METRIC_ROWS.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: m.bg, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={m.icon} size={20} color={m.color} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{m.label}</Text>
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, marginTop: 2, fontFamily: appFont }}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export */}
        <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 14 }]}>Export Data</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[{ icon: 'file-document-outline', label: 'PDF' }, { icon: 'file-excel', label: 'Excel' }, { icon: 'share-variant', label: 'Share' }].map((btn) => (
              <TouchableOpacity key={btn.label} style={{ flex: 1, borderWidth: 1, borderColor: C.primary, borderRadius: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={btn.icon} size={16} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: '700', marginLeft: 6, fontSize: 13, fontFamily: appFont }}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RevenueAnalyticsScreen;
