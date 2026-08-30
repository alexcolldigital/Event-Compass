import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';
import { goBackToAdminDashboard } from '../../utils/adminNavigation';

const PERIODS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y', label: '1 Year' },
];

const STATUS_COLORS = { completed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', confirmed: '#3b82f6' };
const ROLE_COLORS = { client: '#3b82f6', service_provider: '#10b981', admin: '#6366f1' };

export default function AnalyticsDashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

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

  const KPI_CARDS = analytics ? [
    { icon: 'account-plus', label: 'New Users', value: analytics.newUsers, accent: '#3b82f6', bg: isDark ? '#1e3a5f' : '#eff6ff', border: isDark ? '#1e40af' : '#bfdbfe' },
    { icon: 'calendar-plus', label: 'New Bookings', value: analytics.newBookings, accent: '#10b981', bg: isDark ? '#14532d' : '#f0fdf4', border: isDark ? '#166534' : '#bbf7d0' },
    { icon: 'currency-usd', label: 'Revenue', value: formatCurrency(analytics.revenue), accent: '#f97316', bg: isDark ? '#431407' : '#fff7ed', border: isDark ? '#9a3412' : '#fed7aa' },
    { icon: 'percent', label: 'Platform Fees', value: formatCurrency(analytics.platformFees), accent: '#a855f7', bg: isDark ? '#2d1b69' : '#f5f3ff', border: isDark ? '#5b21b6' : '#ddd6fe' },
  ] : [];

  const maxRevenue = analytics?.dailyRevenue?.length ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1) : 1;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Analytics Dashboard</Text>
      </View>

      {/* Period Selector */}
      <View style={[{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[adminStyles.filterChip, { backgroundColor: period === p.key ? C.primary : C.surface, borderColor: period === p.key ? C.primary : C.inputBorder }]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[adminStyles.filterChipText, { color: period === p.key ? '#fff' : C.text, fontFamily: appFont }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? <Loading /> : !analytics ? null : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
          {/* KPI Cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {KPI_CARDS.map((k) => (
              <View key={k.label} style={[adminStyles.statCard, { backgroundColor: k.bg, borderColor: k.border }]}>
                <MaterialCommunityIcons name={k.icon as any} size={22} color={k.accent} />
                <Text style={[adminStyles.statValue, { color: k.accent, fontFamily: appFont, fontSize: 18 }]}>{k.value}</Text>
                <Text style={[adminStyles.statLabel, { color: k.accent, fontFamily: appFont }]}>{k.label}</Text>
              </View>
            ))}
          </View>

          {/* Bookings by Status */}
          <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 12 }]}>
            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 14 }]}>Bookings by Status</Text>
            {(analytics.bookingsByStatus || []).map((b) => (
              <View key={b._id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: STATUS_COLORS[b._id] || C.muted }} />
                  <Text style={{ color: C.text, textTransform: 'capitalize', fontFamily: appFont }}>{b._id}</Text>
                </View>
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, fontFamily: appFont }}>{b.count}</Text>
              </View>
            ))}
          </View>

          {/* Users by Role */}
          <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, marginBottom: 12 }]}>
            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 14 }]}>Users by Role</Text>
            {(analytics.usersByRole || []).map((u) => (
              <View key={u._id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: ROLE_COLORS[u._id] || C.muted }} />
                  <Text style={{ color: C.text, textTransform: 'capitalize', fontFamily: appFont }}>{u._id?.replace(/_/g, ' ')}</Text>
                </View>
                <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, fontFamily: appFont }}>{u.count}</Text>
              </View>
            ))}
          </View>

          {/* Daily Revenue Chart */}
          {analytics.dailyRevenue?.length > 0 && (
            <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 14 }]}>Daily Revenue</Text>
              {analytics.dailyRevenue.slice(-14).map((d) => (
                <View key={d._id} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{d._id}</Text>
                    <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700', fontFamily: appFont }}>{formatCurrency(d.revenue)}</Text>
                  </View>
                  <View style={{ width: '100%', backgroundColor: C.border, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <View style={{ backgroundColor: C.primary, height: 8, borderRadius: 4, width: `${(d.revenue / maxRevenue) * 100}%` }} />
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
