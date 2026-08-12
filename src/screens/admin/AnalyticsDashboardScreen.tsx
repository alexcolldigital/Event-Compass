import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency } from '../../utils/helpers.js';

const PERIODS = [{ key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' }, { key: '90d', label: '90 Days' }, { key: '1y', label: '1 Year' }];
const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', cancelled: '#dc2626', confirmed: '#2563eb' }[s] || '#6b7280');
const roleColor = (r) => ({ client: '#2563eb', service_provider: '#10b981', admin: '#7c3aed' }[r] || '#6b7280');

export default function AnalyticsDashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getAnalyticsDashboard({ period }); setAnalytics(r.analytics); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const maxRevenue = analytics?.dailyRevenue?.length ? Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1) : 1;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Analytics Dashboard</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p.key} style={[adminStyles.chip, { backgroundColor: period === p.key ? c.primary : 'transparent', borderColor: period === p.key ? c.primary : c.inputBorder }]} onPress={() => setPeriod(p.key)}>
            <Text style={[adminStyles.chipText, { color: period === p.key ? '#fff' : c.muted, fontFamily: font }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Loading /> : !analytics ? null : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={[adminStyles.statsRow, { flexWrap: 'wrap' }]}>
            {[{ icon: 'account-plus', label: 'New Users', value: analytics.newUsers, bg: '#eff6ff', color: '#2563eb' }, { icon: 'calendar-plus', label: 'New Bookings', value: analytics.newBookings, bg: '#f0fdf4', color: '#15803d' }, { icon: 'currency-usd', label: 'Revenue', value: formatCurrency(analytics.revenue), bg: '#fffbeb', color: '#d97706' }, { icon: 'percent', label: 'Platform Fees', value: formatCurrency(analytics.platformFees), bg: '#faf5ff', color: '#7c3aed' }].map(item => (
              <View key={item.label} style={[adminStyles.statCard, { width: '47%', backgroundColor: item.bg, borderColor: item.color + '30' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                <Text style={[adminStyles.statValue, { color: item.color, fontFamily: font, fontSize: 18 }]}>{item.value}</Text>
                <Text style={[adminStyles.statLabel, { color: item.color, fontFamily: font }]}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Bookings by Status</Text>
            {(analytics.bookingsByStatus || []).map(b => (
              <View key={b._id} style={[s.row, { borderBottomColor: c.border }]}>
                <View style={[s.dot, { backgroundColor: statusColor(b._id) }]} />
                <Text style={[s.rowLabel, { color: c.text, fontFamily: font, textTransform: 'capitalize' }]}>{b._id}</Text>
                <Text style={[s.rowValue, { color: c.text, fontFamily: font }]}>{b.count}</Text>
              </View>
            ))}
          </View>

          <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Users by Role</Text>
            {(analytics.usersByRole || []).map(u => (
              <View key={u._id} style={[s.row, { borderBottomColor: c.border }]}>
                <View style={[s.dot, { backgroundColor: roleColor(u._id) }]} />
                <Text style={[s.rowLabel, { color: c.text, fontFamily: font, textTransform: 'capitalize' }]}>{u._id?.replace(/_/g, ' ')}</Text>
                <Text style={[s.rowValue, { color: c.text, fontFamily: font }]}>{u.count}</Text>
              </View>
            ))}
          </View>

          {analytics.dailyRevenue?.length > 0 && (
            <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Daily Revenue</Text>
              {analytics.dailyRevenue.slice(-14).map(d => (
                <View key={d._id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[s.chartLabel, { color: c.muted, fontFamily: font }]}>{d._id}</Text>
                    <Text style={[s.chartValue, { color: c.primary, fontFamily: font }]}>{formatCurrency(d.revenue)}</Text>
                  </View>
                  <View style={[s.barBg, { backgroundColor: c.border }]}>
                    <View style={[s.barFill, { width: `${(d.revenue / maxRevenue) * 100}%` as any, backgroundColor: c.primary }]} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 15, fontWeight: '800' },
  chartLabel: { fontSize: 11, fontWeight: '600' },
  chartValue: { fontSize: 11, fontWeight: '800' },
  barBg: { height: 6, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 999 },
});
