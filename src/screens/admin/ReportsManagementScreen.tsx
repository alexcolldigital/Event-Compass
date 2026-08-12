import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency } from '../../utils/helpers.js';

const TYPES = [{ key: 'overview', label: 'Overview', icon: 'view-dashboard' }, { key: 'bookings', label: 'Bookings', icon: 'calendar-check' }, { key: 'users', label: 'Users', icon: 'account-group' }];
const statusColor = (s) => ({ completed: '#10b981', pending: '#f59e0b', cancelled: '#dc2626', confirmed: '#2563eb' }[s] || '#6b7280');

export default function ReportsManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [reportType, setReportType] = useState('overview');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, [reportType]);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getDetailedReports({ type: reportType }); setReport(r.report); }
    catch (_) {} finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Reports</Text>
      </View>

      <View style={[adminStyles.tabBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {TYPES.map(t => (
          <TouchableOpacity key={t.key} style={[adminStyles.tab, { borderBottomColor: reportType === t.key ? c.primary : 'transparent' }]} onPress={() => setReportType(t.key)}>
            <MaterialCommunityIcons name={t.icon as any} size={18} color={reportType === t.key ? c.primary : c.muted} />
            <Text style={[adminStyles.tabText, { color: reportType === t.key ? c.primary : c.muted, fontFamily: font, marginTop: 2 }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {reportType === 'overview' && report && (
            <>
              <View style={[adminStyles.statsRow, { flexWrap: 'wrap' }]}>
                {[{ label: 'Total Users', value: report.summary?.totalUsers || 0, bg: '#eff6ff', color: '#2563eb' }, { label: 'Total Bookings', value: report.summary?.totalBookings || 0, bg: '#f0fdf4', color: '#15803d' }, { label: 'Total Revenue', value: formatCurrency(report.summary?.totalRevenue || 0), bg: '#fffbeb', color: '#d97706' }].map(item => (
                  <View key={item.label} style={[adminStyles.statCard, { width: '47%', backgroundColor: item.bg, borderColor: item.color + '30' }]}>
                    <Text style={[adminStyles.statLabel, { color: item.color, fontFamily: font }]}>{item.label}</Text>
                    <Text style={[adminStyles.statValue, { color: item.color, fontFamily: font, fontSize: 18 }]}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Top Services</Text>
              {(report.topServices || []).map((svc, i) => (
                <View key={svc._id} style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Text style={[s.rank, { color: c.muted, fontFamily: font }]}>#{i + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.itemName, { color: c.text, fontFamily: font }]}>{svc.name}</Text>
                    <Text style={[s.itemSub, { color: c.muted, fontFamily: font }]}>{svc.totalBookings} bookings · ⭐ {svc.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}

              <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font, marginTop: 16 }]}>Top Providers</Text>
              {(report.topProviders || []).map((p, i) => (
                <View key={p._id} style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Text style={[s.rank, { color: c.muted, fontFamily: font }]}>#{i + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.itemName, { color: c.text, fontFamily: font }]}>{p.businessName || `${p.firstName} ${p.lastName}`}</Text>
                    <Text style={[s.itemSub, { color: c.muted, fontFamily: font }]}>{p.totalBookings} bookings · ⭐ {p.averageRating?.toFixed(1)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {reportType === 'bookings' && report && (report.data || []).map(d => (
            <View key={d._id} style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[s.dot, { backgroundColor: statusColor(d._id) }]} />
              <Text style={[s.itemName, { color: c.text, fontFamily: font, flex: 1, marginLeft: 10, textTransform: 'capitalize' }]}>{d._id}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.itemName, { color: c.text, fontFamily: font }]}>{d.count}</Text>
                <Text style={[s.itemSub, { color: c.muted, fontFamily: font }]}>{formatCurrency(d.revenue || 0)}</Text>
              </View>
            </View>
          ))}

          {reportType === 'users' && report && (report.data || []).map((d, i) => (
            <View key={i} style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={[s.itemName, { color: c.text, fontFamily: font, flex: 1 }]}>{d._id?.month} · <Text style={{ textTransform: 'capitalize' }}>{d._id?.role}</Text></Text>
              <Text style={[s.itemName, { color: c.text, fontFamily: font }]}>{d.count}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  rank: { fontSize: 13, fontWeight: '800', width: 28 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
