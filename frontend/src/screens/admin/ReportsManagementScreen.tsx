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

const REPORT_TYPES = [
  { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-check' },
  { key: 'users', label: 'Users', icon: 'account-group' },
];

const STATUS_COLORS = { completed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', confirmed: '#3b82f6' };

export default function ReportsManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

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

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Reports Management</Text>
      </View>

      {/* Type Tabs */}
      <View style={[adminStyles.tabBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[adminStyles.tab, { borderBottomColor: reportType === t.key ? C.primary : 'transparent' }]}
            onPress={() => setReportType(t.key)}
          >
            <MaterialCommunityIcons name={t.icon as any} size={18} color={reportType === t.key ? C.primary : C.muted} />
            <Text style={[adminStyles.tabText, { color: reportType === t.key ? C.primary : C.muted, fontFamily: appFont, marginTop: 2 }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {reportType === 'overview' && report && (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={[adminStyles.statCard, { flex: 1, backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderColor: isDark ? '#1e40af' : '#bfdbfe' }]}>
                  <Text style={[adminStyles.statLabel, { color: '#2563eb', fontFamily: appFont }]}>Total Users</Text>
                  <Text style={[adminStyles.statValue, { color: '#2563eb', fontFamily: appFont }]}>{report.summary?.totalUsers || 0}</Text>
                </View>
                <View style={[adminStyles.statCard, { flex: 1, backgroundColor: isDark ? '#14532d' : '#f0fdf4', borderColor: isDark ? '#166534' : '#bbf7d0' }]}>
                  <Text style={[adminStyles.statLabel, { color: '#1f7a4d', fontFamily: appFont }]}>Total Bookings</Text>
                  <Text style={[adminStyles.statValue, { color: '#1f7a4d', fontFamily: appFont }]}>{report.summary?.totalBookings || 0}</Text>
                </View>
              </View>
              <View style={[adminStyles.card, { backgroundColor: isDark ? '#451a03' : '#fff7ed', borderColor: isDark ? '#92400e' : '#fed7aa', marginBottom: 20 }]}>
                <Text style={[adminStyles.statLabel, { color: '#d97706', fontFamily: appFont }]}>Total Revenue</Text>
                <Text style={[adminStyles.statValue, { color: '#d97706', fontFamily: appFont }]}>{formatCurrency(report.summary?.totalRevenue || 0)}</Text>
              </View>

              <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 10 }]}>Top Services</Text>
              {(report.topServices || []).map((s, i) => (
                <View key={s._id} style={[adminStyles.listItem, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <Text style={{ color: C.muted, fontWeight: '800', width: 24, fontFamily: appFont }}>#{i + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{s.name}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{s.totalBookings} bookings · ⭐ {s.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}

              <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginTop: 16, marginBottom: 10 }]}>Top Providers</Text>
              {(report.topProviders || []).map((p, i) => (
                <View key={p._id} style={[adminStyles.listItem, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <Text style={{ color: C.muted, fontWeight: '800', width: 24, fontFamily: appFont }}>#{i + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{p.businessName || `${p.firstName} ${p.lastName}`}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{p.totalBookings} bookings · ⭐ {p.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {reportType === 'bookings' && report && (
            <>
              <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>Bookings by Status</Text>
              {(report.data || []).map((d) => (
                <View key={d._id} style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, marginRight: 10, backgroundColor: STATUS_COLORS[d._id] || C.muted }} />
                    <Text style={{ color: C.text, fontWeight: '700', textTransform: 'capitalize', fontFamily: appFont }}>{d._id}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: C.text, fontWeight: '800', fontSize: 16, fontFamily: appFont }}>{d.count}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{formatCurrency(d.revenue || 0)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {reportType === 'users' && report && (
            <>
              <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>User Growth by Month</Text>
              {(report.data || []).map((d, i) => (
                <View key={i} style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between' }]}>
                  <Text style={{ color: C.muted, fontSize: 13, fontFamily: appFont }}>{d._id?.month} · <Text style={{ textTransform: 'capitalize' }}>{d._id?.role}</Text></Text>
                  <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, fontFamily: appFont }}>{d.count}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
