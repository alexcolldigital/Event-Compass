import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert,
  TextInput, StyleSheet, Modal, ScrollView,
} from 'react-native';
import Toast, { ToastType } from '../../components/Toast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, appFont as font } from '../../styles/adminStyles';
import { goBackToAdminDashboard } from '../../utils/adminNavigation';
import { formatDate } from '../../utils/helpers.js';

const ROLES = [
  { label: 'Client', value: 'client', icon: 'account', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Service Provider', value: 'service_provider', icon: 'briefcase', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Admin', value: 'admin', icon: 'shield-account', color: '#dc2626', bg: '#fff1f2' },
];

export default function ManageUsersScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Role picker modal state
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  useEffect(() => { load(); }, []);
  useEffect(() => { filter(); }, [search, roleFilter, users]);

  const load = async () => {
    setIsLoading(true);
    try {
      const r = await adminAPI.getAllUsers({ limit: 100 });
      setUsers(r.users || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const filter = () => {
    let f = users;
    if (search.trim()) f = f.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'all') f = f.filter(u => u.role === roleFilter);
    setFiltered(f);
  };

  const handleBlock = (user) => {
    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      `${user.isBlocked ? 'Unblock' : 'Block'} ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            try {
              const r = await adminAPI.blockUser(user._id, { reason: user.isBlocked ? undefined : 'Blocked by admin' });
              setUsers(prev => prev.map(u => u._id === user._id ? r.user : u));
              setExpanded(null);
            } catch (e) { showToast('error', e.message || 'Failed to update user'); }
          },
        },
      ]
    );
  };

  const handleVerify = (user) => {
    Alert.alert('Verify Provider', `Verify ${user.businessName || user.firstName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify', onPress: async () => {
          try {
            const r = await adminAPI.verifyProvider(user._id);
            setUsers(prev => prev.map(u => u._id === user._id ? r.user : u));
            setExpanded(null);
          } catch (e) { showToast('error', e.message || 'Failed to verify'); }
        },
      },
    ]);
  };

  const handleAssignRole = async (newRole: string) => {
    if (!roleModalUser || newRole === roleModalUser.role) {
      setRoleModalUser(null);
      return;
    }
    setRoleLoading(true);
    try {
      const r = await adminAPI.assignRole(roleModalUser._id, newRole);
      setUsers(prev => prev.map(u => u._id === roleModalUser._id ? r.user : u));
      setExpanded(null);
      setRoleModalUser(null);
      showToast('success', `Role updated to ${ROLES.find(r => r.value === newRole)?.label}`);
    } catch (e) {
      showToast('error', e.message || 'Failed to assign role');
    } finally {
      setRoleLoading(false);
    }
  };

  const ROLE_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Clients', value: 'client' },
    { label: 'Providers', value: 'service_provider' },
    { label: 'Admins', value: 'admin' },
  ];

  const roleBg = (role) => isDark ? `${role.color}24` : role.bg;
  const successBg = isDark ? 'rgba(22, 163, 74, 0.22)' : '#dcfce7';
  const dangerBg = isDark ? 'rgba(220, 38, 38, 0.22)' : '#fee2e2';
  const infoBg = isDark ? 'rgba(37, 99, 235, 0.22)' : '#eff6ff';
  const accentBg = isDark ? 'rgba(124, 58, 237, 0.22)' : '#f5f3ff';
  const successText = isDark ? '#86efac' : '#15803d';
  const dangerText = isDark ? '#fca5a5' : '#dc2626';
  const infoText = isDark ? '#93c5fd' : '#2563eb';
  const accentText = isDark ? '#c4b5fd' : '#7c3aed';

  const UserCard = ({ item }) => {
    const open = expanded === item._id;
    const isProvider = item.role === 'service_provider';
    const roleInfo = ROLES.find(r => r.value === item.role);
    return (
      <View>
        <TouchableOpacity
          onPress={() => setExpanded(open ? null : item._id)}
          style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}
          activeOpacity={0.85}
        >
          <View style={[adminStyles.listIcon, { backgroundColor: `${c.primary}18` }]}>
            <MaterialCommunityIcons name="account" size={22} color={c.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[adminStyles.listLabel, { color: c.text, fontFamily: font, marginLeft: 0 }]}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]}>{item.email}</Text>
            {isProvider && item.businessName
              ? <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]}>{item.businessName}</Text>
              : null}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={[adminStyles.badge, { backgroundColor: item.isBlocked ? dangerBg : successBg }]}>
              <Text style={[adminStyles.badgeText, { color: item.isBlocked ? dangerText : successText, fontFamily: font }]}>
                {item.isBlocked ? 'Blocked' : 'Active'}
              </Text>
            </View>
            {roleInfo && (
              <View style={[adminStyles.badge, { backgroundColor: roleBg(roleInfo) }]}>
                <Text style={[adminStyles.badgeText, { color: isDark ? accentText : roleInfo.color, fontFamily: font }]}>{roleInfo.label}</Text>
              </View>
            )}
          </View>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={c.muted} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {open && (
          <View style={[s.expandedCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            {[
              ['Role', item.role],
              ['Phone', item.phoneNumber || 'N/A'],
              ['Bookings', String(item.totalBookings || 0)],
              ['Joined', formatDate(item.createdAt)],
            ].map(([k, v]) => (
              <View key={k} style={s.infoRow}>
                <Text style={[s.infoKey, { color: c.muted, fontFamily: font }]}>{k}</Text>
                <Text style={[s.infoVal, { color: c.text, fontFamily: font }]}>{v}</Text>
              </View>
            ))}
            {item.isBlocked && item.blockReason ? (
              <View style={[s.reasonBox, { backgroundColor: dangerBg }]}>
                <Text style={{ color: dangerText, fontSize: 12, fontFamily: font }}>Reason: {item.blockReason}</Text>
              </View>
            ) : null}
            <View style={adminStyles.actionRow}>
              {isProvider && !(item.isBusinessVerified) && (
                <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: infoBg }]} onPress={() => handleVerify(item)}>
                  <Text style={[adminStyles.actionBtnText, { color: infoText, fontFamily: font }]}>Verify</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[adminStyles.actionBtn, { backgroundColor: item.isBlocked ? successBg : dangerBg }]}
                onPress={() => handleBlock(item)}
              >
                <Text style={[adminStyles.actionBtnText, { color: item.isBlocked ? successText : dangerText, fontFamily: font }]}>
                  {item.isBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[adminStyles.actionBtn, { backgroundColor: accentBg }]}
                onPress={() => setRoleModalUser(item)}
              >
                <Text style={[adminStyles.actionBtnText, { color: accentText, fontFamily: font }]}>Assign Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <Toast visible={toast.visible} type={toast.type} message={toast.message} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Manage Users</Text>
      </View>

      <View style={s.summaryRow}>
        {[
          { label: 'Total', value: users.length, bg: infoBg, color: infoText },
          { label: 'Active', value: users.filter(u => !u.isBlocked).length, bg: successBg, color: successText },
          { label: 'Blocked', value: users.filter(u => u.isBlocked).length, bg: dangerBg, color: dangerText },
        ].map(st => (
          <View key={st.label} style={[s.summaryCard, { backgroundColor: st.bg, borderColor: st.color + '30' }]}>
            <Text style={[s.summaryValue, { color: st.color, fontFamily: font }]}>{st.value}</Text>
            <Text style={[s.summaryLabel, { color: st.color, fontFamily: font }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.controlsWrap}>
        <View style={[s.searchBar, { backgroundColor: c.surface, borderColor: c.inputBorder }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={c.muted} />
          <TextInput
            style={[s.searchInput, { color: c.text, fontFamily: font }]}
            placeholder="Search name, email..."
            placeholderTextColor={c.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close-circle" size={18} color={c.muted} /></TouchableOpacity> : null}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters((value) => !value)}
          style={[s.filterToggle, { backgroundColor: showFilters || roleFilter !== 'all' ? c.primary : c.surface, borderColor: showFilters || roleFilter !== 'all' ? c.primary : c.inputBorder }]}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="filter-variant" size={18} color={showFilters || roleFilter !== 'all' ? '#fff' : c.muted} />
          {roleFilter !== 'all' ? <View style={s.filterDot} /> : null}
        </TouchableOpacity>
      </View>

      {showFilters ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[s.filterStrip, { backgroundColor: c.surface, borderColor: c.border }]}
          contentContainerStyle={s.filterContent}
        >
          {ROLE_FILTERS.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[adminStyles.chip, { backgroundColor: roleFilter === r.value ? c.primary : 'transparent', borderColor: roleFilter === r.value ? c.primary : c.inputBorder }]}
              onPress={() => setRoleFilter(r.value)}
            >
              <Text style={[adminStyles.chipText, { color: roleFilter === r.value ? '#fff' : c.muted, fontFamily: font }]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        style={s.userList}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        renderItem={({ item }) => <UserCard item={item} />}
        ListEmptyComponent={
          <View style={adminStyles.empty}>
            <MaterialCommunityIcons name="account-off" size={48} color={c.muted} />
            <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No users found</Text>
          </View>
        }
      />

      {/* Role Picker Modal */}
      <Modal
        visible={!!roleModalUser}
        transparent
        animationType="fade"
        onRequestClose={() => !roleLoading && setRoleModalUser(null)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => !roleLoading && setRoleModalUser(null)}
        >
          <View style={[s.roleSheet, { backgroundColor: c.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[s.roleSheetTitle, { color: c.text, fontFamily: font }]}>Assign Role</Text>
            {roleModalUser && (
              <Text style={[s.roleSheetSub, { color: c.muted, fontFamily: font }]}>
                {roleModalUser.firstName} {roleModalUser.lastName} · Current: {ROLES.find(r => r.value === roleModalUser.role)?.label || roleModalUser.role}
              </Text>
            )}
            <View style={[s.roleDivider, { backgroundColor: c.border }]} />
            {ROLES.map(r => {
              const isCurrent = roleModalUser?.role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[s.roleOption, { backgroundColor: isCurrent ? roleBg(r) : 'transparent', opacity: roleLoading ? 0.5 : 1 }]}
                  onPress={() => !roleLoading && handleAssignRole(r.value)}
                  disabled={roleLoading}
                  activeOpacity={0.75}
                >
                  <View style={[s.roleIconWrap, { backgroundColor: roleBg(r) }]}>
                    <MaterialCommunityIcons name={r.icon as any} size={20} color={isDark ? accentText : r.color} />
                  </View>
                  <Text style={[s.roleOptionLabel, { color: isCurrent ? (isDark ? accentText : r.color) : c.text, fontFamily: font }]}>{r.label}</Text>
                  {isCurrent && (
                    <MaterialCommunityIcons name="check-circle" size={18} color={isDark ? accentText : r.color} />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[s.cancelBtn, { borderColor: c.inputBorder }]}
              onPress={() => !roleLoading && setRoleModalUser(null)}
              disabled={roleLoading}
            >
              <Text style={[s.cancelBtnText, { color: c.muted, fontFamily: font }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  summaryCard: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  controlsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
    minHeight: 38,
  },
  filterToggle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#fef3c7',
  },
  filterStrip: {
    maxHeight: 52,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  userList: {
    flex: 1,
  },
  expandedCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: -8, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoKey: { fontSize: 12, fontWeight: '600' },
  infoVal: { fontSize: 12, fontWeight: '700' },
  reasonBox: { borderRadius: 10, padding: 8, marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  roleSheet: { width: '100%', borderRadius: 24, padding: 20, maxWidth: 400 },
  roleSheetTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  roleSheetSub: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  roleDivider: { height: 1, marginBottom: 12 },
  roleOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 8 },
  roleIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  roleOptionLabel: { flex: 1, fontSize: 15, fontWeight: '700' },
  cancelBtn: { marginTop: 4, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },
});
