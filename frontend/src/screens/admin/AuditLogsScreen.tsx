import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatDateTime } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const RESOURCES = ['all', 'User', 'Service', 'Booking', 'Payment', 'Category', 'Coupon', 'Promotion', 'Notification', 'CMSPage'];
const ACTION_COLORS = { success: '#10b981', failure: '#ef4444', warning: '#f59e0b' };

export default function AuditLogsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterResource, setFilterResource] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { loadLogs(); }, [filterResource, page]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const query: Record<string, any> = { page, limit: 30 };
      if (filterResource !== 'all') query.resource = filterResource;
      const res = await adminAPI.getAuditLogs(query);
      setLogs(res.logs || []);
      setTotal(res.pagination?.total || 0);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const LogCard = ({ item }: { item: any }) => {
    const color = ACTION_COLORS[item.status] || '#6b7280';
    return (
      <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 13, flex: 1, marginRight: 8, fontFamily: appFont }} numberOfLines={1}>{item.action}</Text>
          <View style={[adminStyles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[adminStyles.badgeText, { color, textTransform: 'capitalize', fontFamily: appFont }]}>{item.status}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View style={[adminStyles.badge, { backgroundColor: C.surfaceAlt }]}>
            <Text style={[adminStyles.badgeText, { color: C.muted, fontFamily: appFont }]}>{item.resource}</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 12, flex: 1, fontFamily: appFont }}>
            by {item.actor?.firstName} {item.actor?.lastName} ({item.actorRole})
          </Text>
        </View>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: appFont }}>{formatDateTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Audit Logs</Text>
        <View style={[adminStyles.badge, { backgroundColor: C.surfaceAlt }]}>
          <Text style={[adminStyles.badgeText, { color: C.muted, fontFamily: appFont }]}>{total} total</Text>
        </View>
      </View>

      {/* Resource Filter */}
      <View style={[{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          {RESOURCES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[adminStyles.filterChip, { backgroundColor: filterResource === r ? C.primary : C.surface, borderColor: filterResource === r ? C.primary : C.inputBorder }]}
              onPress={() => { setFilterResource(r); setPage(1); }}
            >
              <Text style={[adminStyles.filterChipText, { color: filterResource === r ? '#fff' : C.text, fontFamily: appFont }]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={logs}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <LogCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No audit logs found</Text>
            </View>
          }
          ListFooterComponent={
            total > 30 ? (
              <View style={adminStyles.paginationRow}>
                <TouchableOpacity
                  style={[adminStyles.pageBtn, { borderColor: C.inputBorder, opacity: page === 1 ? 0.4 : 1 }]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <Text style={[adminStyles.pageBtnText, { color: C.text, fontFamily: appFont }]}>Prev</Text>
                </TouchableOpacity>
                <Text style={{ color: C.muted, fontFamily: appFont }}>Page {page}</Text>
                <TouchableOpacity
                  style={[adminStyles.pageBtn, { borderColor: C.inputBorder }]}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <Text style={[adminStyles.pageBtnText, { color: C.text, fontFamily: appFont }]}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
