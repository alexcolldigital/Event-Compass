import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency } from '../../utils/helpers.js';

const PERIODS = [{ key: 'daily', label: 'Daily' }, { key: 'weekly', label: 'Weekly' }, { key: 'monthly', label: 'Monthly' }, { key: 'yearly', label: 'Yearly' }];

export default function RevenueAnalyticsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    setIsLoading(true);
    try {
      const r = await adminAPI.getRevenueAnalytics({ period });
      const rows = r.revenues || [];
      const totalRevenue = rows.reduce((s, row) => s + (row.totalRevenue || 0), 0);
      const platformFees = rows.reduce((s, row) => s + (row.platformFees || 0), 0);
      setData({ totalRevenue, platformFees, providerPayouts: Math.max(totalRevenue - platformFees, 0), rows });
    } catch (_) {} finally { setIsLoading(false); }
  };

  if (isLoading) return <Loading fullScreen />;

  const maxAmount = data?.rows?.length ? Math.max(...data.rows.map(r => r.totalRevenue || 0), 1) : 1;
  const totalBookings = data?.rows?.reduce((s, r) => s + (r.transactionCount || 0), 0) || 0;
  const commissionRate = data?.totalRevenue > 0 ? (data.platformFees / data.totalRevenue) * 100 : 0;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Revenue Analytics</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p.key} style={[adminStyles.chip, { backgroundColor: period === p.key ? c.primary : 'transparent', borderColor: period === p.key ? c.primary : c.inputBorder }]} onPress={() => setPeriod(p.key)}>
            <Text style={[adminStyles.chipText, { color: period === p.key ? '#fff' : c.muted, fontFamily: font }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Hero revenue card */}
        <View style={[s.heroCard, { backgroundColor: c.primary }]}>
          <Text style={[s.heroLabel, { fontFamily: font }]}>Total Revenue</Text>
          <Text style={[s.heroValue, { fontFamily: font }]}>{formatCurrency(data?.totalRevenue || 0)}</Text>
          <Text style={[s.heroSub, { fontFamily: font }]}>From all completed transactions</Text>
        </View>

        {/* Breakdown */}
        <View style={adminStyles.statsRow}>
          <View style={[adminStyles.statCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <MaterialCommunityIcons name="percent" size={20} color="#d97706" />
            <Text style={[adminStyles.statValue, { color: '#92400e', fontFamily: font }]}>{formatCurrency(data?.platformFees || 0)}</Text>
            <Text style={[adminStyles.statLabel, { color: '#d97706', fontFamily: font }]}>Platform Fees ({commissionRate.toFixed(1)}%)</Text>
          </View>
          <View style={[adminStyles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <MaterialCommunityIcons name="wallet" size={20} color="#15803d" />
            <Text style={[adminStyles.statValue, { color: '#14532d', fontFamily: font }]}>{formatCurrency(data?.providerPayouts || 0)}</Text>
            <Text style={[adminStyles.statLabel, { color: '#15803d', fontFamily: font }]}>Provider Payouts</Text>
          </View>
        </View>

        {/* Key metrics */}
        <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Key Metrics</Text>
          {[{ icon: 'chart-line', label: 'Avg Transaction', value: formatCurrency(totalBookings > 0 ? (data?.totalRevenue || 0) / totalBookings : 0), color: '#2563eb' }, { icon: 'calendar-check', label: 'Total Bookings', value: totalBookings, color: '#15803d' }, { icon: 'trending-up', label: 'Commission Rate', value: `${commissionRate.toFixed(1)}%`, color: c.primary }].map(m => (
            <View key={m.label} style={[s.metricRow, { borderBottomColor: c.border }]}>
              <View style={[adminStyles.listIcon, { backgroundColor: `${m.color}18` }]}>
                <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.metricLabel, { color: c.muted, fontFamily: font }]}>{m.label}</Text>
                <Text style={[s.metricValue, { color: c.text, fontFamily: font }]}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Revenue by Period</Text>
          {data?.rows?.length === 0 ? (
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="chart-line" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No revenue data yet</Text>
            </View>
          ) : data?.rows?.map((row, i) => {
            const pct = ((row.totalRevenue || 0) / maxAmount) * 100;
            return (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[s.chartLabel, { color: c.muted, fontFamily: font }]}>{row._id}</Text>
                  <Text style={[s.chartValue, { color: c.primary, fontFamily: font }]}>{formatCurrency(row.totalRevenue || 0)}</Text>
                </View>
                <View style={[s.barBg, { backgroundColor: c.border }]}>
                  <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: c.primary }]} />
                </View>
                <Text style={[s.chartSub, { color: c.muted, fontFamily: font }]}>{row.transactionCount || 0} transactions</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 16 },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
  heroValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  metricRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  metricValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  chartLabel: { fontSize: 12, fontWeight: '600' },
  chartValue: { fontSize: 12, fontWeight: '800' },
  barBg: { height: 8, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 999 },
  chartSub: { fontSize: 11, marginTop: 2 },
});
