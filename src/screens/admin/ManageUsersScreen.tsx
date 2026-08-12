import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatDate } from '../../utils/helpers.js';

export default function ManageUsersScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);
  useEffect(() => { filter(); }, [search, role, users]);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getAllUsers({ limit: 100 }); setUsers(r.users || []); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const filter = () => {
    let f = users;
    if (search.trim()) f = f.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
    if (role !== 'all') f = f.filter(u => u.role === role);
    setFiltered(f);
  };

  const handleBlock = (user) => {
    Alert.alert(user.isBlocked ? 'Unblock User' : 'Block User', `${user.isBlocked ? 'Unblock' : 'Block'} ${user.firstName} ${user.lastName}?`, [
      { text: 'Cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          const r = await adminAPI.blockUser(user._id, { reason: user.isBlocked ? undefined : 'Blocked by admin' });
          setUsers(prev => prev.map(u => u._id === user._id ? r.user : u));
          setExpanded(null);
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const handleVerify = (user) => {
    Alert.alert('Verify Provider', `Verify ${user.businessName}?`, [
      { text: 'Cancel' },
      { text: 'Verify', onPress: async () => {
        try {
          const r = await adminAPI.verifyProvider(user._id);
          setUsers(prev => prev.map(u => u._id === user._id ? r.user : u));
          setExpanded(null);
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const ROLES = [{ label: 'All', value: 'all' }, { label: 'Clients', value: 'client' }, { label: 'Providers', value: 'service_provider' }];

  const UserCard = ({ item }) => {
    const open = expanded === item._id;
    const isProvider = item.role === 'service_provider';
    return (
      <TouchableOpacity onPress={() => setExpanded(open ? null : item._id)} style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[adminStyles.listIcon, { backgroundColor: `${c.primary}18` }]}>
          <MaterialCommunityIcons name="account" size={22} color={c.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[adminStyles.listLabel, { color: c.text, fontFamily: font, marginLeft: 0 }]}>{item.firstName} {item.lastName}</Text>
          <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]}>{item.email}</Text>
          {isProvider && item.businessName ? <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]}>{item.businessName}</Text> : null}
        </View>
        <View style={[adminStyles.badge, { backgroundColor: item.isBlocked ? '#fee2e2' : '#dcfce7' }]}>
          <Text style={[adminStyles.badgeText, { color: item.isBlocked ? '#dc2626' : '#15803d', fontFamily: font }]}>{item.isBlocked ? 'Blocked' : 'Active'}</Text>
        </View>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={c.muted} style={{ marginLeft: 8 }} />
        {open && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 10 }} />
        )}
      </TouchableOpacity>
    );
  };

  const ExpandedCard = ({ item }) => {
    if (expanded !== item._id) return null;
    const isProvider = item.role === 'service_provider';
    return (
      <View style={[s.expandedCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        {[['Role', item.role], ['Phone', item.phoneNumber || item.phone || 'N/A'], ['Bookings', item.totalBookings || 0], ['Joined', formatDate(item.createdAt)]].map(([k, v]) => (
          <View key={k} style={s.infoRow}>
            <Text style={[s.infoKey, { color: c.muted, fontFamily: font }]}>{k}</Text>
            <Text style={[s.infoVal, { color: c.text, fontFamily: font }]}>{v}</Text>
          </View>
        ))}
        {item.isBlocked && item.blockReason ? (
          <View style={[s.reasonBox, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ color: '#dc2626', fontSize: 12, fontFamily: font }}>Reason: {item.blockReason}</Text>
          </View>
        ) : null}
        <View style={adminStyles.actionRow}>
          {isProvider && !(item.isBusinessVerified || item.businessVerified) && (
            <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#eff6ff' }]} onPress={() => handleVerify(item)}>
              <Text style={[adminStyles.actionBtnText, { color: '#2563eb', fontFamily: font }]}>Verify</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: item.isBlocked ? '#dcfce7' : '#fee2e2' }]} onPress={() => handleBlock(item)}>
            <Text style={[adminStyles.actionBtnText, { color: item.isBlocked ? '#15803d' : '#dc2626', fontFamily: font }]}>{item.isBlocked ? 'Unblock' : 'Block'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Manage Users</Text>
      </View>

      {/* Stats */}
      <View style={[adminStyles.statsRow, { paddingHorizontal: 16, marginTop: 12 }]}>
        {[{ label: 'Total', value: users.length, bg: '#eff6ff', color: '#2563eb' }, { label: 'Active', value: users.filter(u => !u.isBlocked).length, bg: '#f0fdf4', color: '#15803d' }, { label: 'Blocked', value: users.filter(u => u.isBlocked).length, bg: '#fff1f2', color: '#dc2626' }].map(s => (
          <View key={s.label} style={[adminStyles.statCard, { backgroundColor: s.bg, borderColor: s.color + '30' }]}>
            <Text style={[adminStyles.statLabel, { color: s.color, fontFamily: font }]}>{s.label}</Text>
            <Text style={[adminStyles.statValue, { color: s.color, fontFamily: font }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={[adminStyles.searchBar, { backgroundColor: c.surface, borderColor: c.inputBorder }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={c.muted} />
        <TextInput style={[adminStyles.searchInput, { color: c.text, fontFamily: font }]} placeholder="Search name, email..." placeholderTextColor={c.muted} value={search} onChangeText={setSearch} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close-circle" size={18} color={c.muted} /></TouchableOpacity> : null}
      </View>

      {/* Role filter */}
      <View style={[adminStyles.filterRow, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {ROLES.map(r => (
          <TouchableOpacity key={r.value} style={[adminStyles.chip, { backgroundColor: role === r.value ? c.primary : 'transparent', borderColor: role === r.value ? c.primary : c.inputBorder }]} onPress={() => setRole(r.value)}>
            <Text style={[adminStyles.chipText, { color: role === r.value ? '#fff' : c.muted, fontFamily: font }]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View>
            <UserCard item={item} />
            <ExpandedCard item={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={adminStyles.empty}>
            <MaterialCommunityIcons name="account-off" size={48} color={c.muted} />
            <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  expandedCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: -8, marginBottom: 10, marginHorizontal: 0 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoKey: { fontSize: 12, fontWeight: '600' },
  infoVal: { fontSize: 12, fontWeight: '700' },
  reasonBox: { borderRadius: 10, padding: 8, marginBottom: 8 },
});
