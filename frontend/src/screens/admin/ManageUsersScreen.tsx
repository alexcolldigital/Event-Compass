import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, SafeAreaView, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { USER_ROLES } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const ManageUsersScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
    role: USER_ROLES.CLIENT,
    businessName: '',
  });

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { filterUsers(); }, [searchText, filterRole, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllUsers({ limit: 100 });
      setUsers(response.users || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchText.trim()) {
      filtered = filtered.filter((u) =>
        u.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (u.phoneNumber || u.phone || '').includes(searchText)
      );
    }
    if (filterRole !== 'all') filtered = filtered.filter((u) => u.role === filterRole);
    setFilteredUsers(filtered);
  };

  const handleBlockUser = (user) => {
    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      user.isBlocked
        ? `Unblock ${user.firstName} ${user.lastName}?`
        : `Block ${user.businessName || `${user.firstName} ${user.lastName}`}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await adminAPI.blockUser(user._id, { reason: user.isBlocked ? undefined : 'Blocked by admin' });
              setUsers(users.map((u) => u._id === user._id ? response.user : u));
              setSelectedUser(null);
              Alert.alert('Success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            } catch (err) { Alert.alert('Error', err.message || 'Failed to update user'); }
          },
        },
      ]
    );
  };

  const handleAssignRole = (user) => {
    const roles = [
      { label: 'Client', value: 'client' },
      { label: 'Service Provider', value: 'service_provider' },
      { label: 'Admin', value: 'admin' },
    ];
    Alert.alert(
      'Assign Role',
      `Current role: ${user.role}\nSelect new role for ${user.firstName} ${user.lastName}:`,
      [
        ...roles.filter(r => r.value !== user.role).map(r => ({
          text: r.label,
          onPress: async () => {
            try {
              const response = await adminAPI.assignRole(user._id, r.value);
              setUsers(users.map(u => u._id === user._id ? response.user : u));
              setSelectedUser(null);
              Alert.alert('Success', `User role updated to ${r.label}`);
            } catch (err) { Alert.alert('Error', err.message || 'Failed to assign role'); }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleVerifyUser = (user) => {
    Alert.alert('Verify Provider', `Verify ${user.businessName} as a service provider?`, [
      { text: 'Cancel' },
      {
        text: 'Verify',
        onPress: async () => {
          try {
            const response = await adminAPI.verifyProvider(user._id);
            setUsers(users.map((u) => u._id === user._id ? response.user : u));
            setSelectedUser(null);
            Alert.alert('Success', 'Provider verified successfully');
          } catch (err) { Alert.alert('Error', err.message || 'Failed to verify provider'); }
        },
      },
    ]);
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phoneNumber || !newUser.password) {
      Alert.alert('Missing fields', 'Please fill in all required details.');
      return;
    }

    if (newUser.password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }

    if (newUser.password !== newUser.passwordConfirm) {
      Alert.alert('Passwords do not match', 'Please re-enter the same password to continue.');
      return;
    }

    try {
      const response = await adminAPI.createUser({
        ...newUser,
        businessName: newUser.businessName || undefined,
      });
      setUsers((current) => [response.user, ...current]);
      setSelectedUser(null);
      setShowAddUserModal(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        passwordConfirm: '',
        role: USER_ROLES.CLIENT,
        businessName: '',
      });
      Alert.alert('Success', `User ${response.user.firstName} ${response.user.lastName} created successfully.`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create user');
    }
  };

  const ROLE_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Clients', value: USER_ROLES.CLIENT },
    { label: 'Providers', value: USER_ROLES.SERVICE_PROVIDER },
  ];

  const STAT_CARDS = [
    { label: 'Total', value: users.length, accent: '#2563eb', bg: isDark ? '#1e3a5f' : '#eff6ff', border: isDark ? '#1e40af' : '#bfdbfe' },
    { label: 'Active', value: users.filter((u) => !u.isBlocked).length, accent: '#1f7a4d', bg: isDark ? '#14532d' : '#f0fdf4', border: isDark ? '#166534' : '#bbf7d0' },
    { label: 'Blocked', value: users.filter((u) => u.isBlocked).length, accent: '#dc2626', bg: isDark ? '#450a0a' : '#fff1f2', border: isDark ? '#991b1b' : '#fecaca' },
  ];

  const UserCard = ({ user }) => {
    const isProvider = user.role === USER_ROLES.SERVICE_PROVIDER;
    const expanded = selectedUser?._id === user._id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedUser(expanded ? null : user)}
        style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}
        activeOpacity={0.85}
      >
        <View style={adminStyles.cardRow}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.primary + '22', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialCommunityIcons name="account" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>
              {user.firstName} {user.lastName}
            </Text>
            {isProvider && <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{user.businessName}</Text>}
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 1, fontFamily: appFont }}>{user.email}</Text>
          </View>
          <View style={[adminStyles.badge, { backgroundColor: user.isBlocked ? '#fee2e2' : '#dcfce7' }]}>
            <Text style={[adminStyles.badgeText, { color: user.isBlocked ? '#b91c1c' : '#166534' }]}>
              {user.isBlocked ? 'Blocked' : 'Active'}
            </Text>
          </View>
        </View>

        {expanded && (
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border }}>
            {[
              { label: 'Role', value: user.role },
              { label: 'Phone', value: user.phoneNumber || user.phone || 'Not provided' },
              { label: 'Bookings', value: user.totalBookings },
              { label: 'Joined', value: formatDate(user.createdAt) },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{row.label}</Text>
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '700', fontFamily: appFont, textTransform: 'capitalize' }}>{row.value}</Text>
              </View>
            ))}

            {user.isBlocked && user.blockReason && (
              <View style={{ backgroundColor: isDark ? '#450a0a' : '#fff1f2', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <Text style={{ color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 2, fontFamily: appFont }}>Block Reason</Text>
                <Text style={{ color: '#dc2626', fontSize: 12, fontFamily: appFont }}>{user.blockReason}</Text>
              </View>
            )}

            {isProvider && (
              <View style={{ marginBottom: 10 }}>
                {user.isBusinessVerified || user.businessVerified ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#14532d' : '#f0fdf4', padding: 10, borderRadius: 10 }}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={C.success} />
                    <Text style={{ color: '#166534', fontSize: 12, marginLeft: 6, fontWeight: '700', fontFamily: appFont }}>Verified Provider</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{ backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', padding: 10, borderRadius: 10, alignItems: 'center' }}
                    onPress={() => handleVerifyUser(user)}
                  >
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '700', fontFamily: appFont }}>Verify Provider</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={adminStyles.actionRow}>
              <TouchableOpacity
                style={[adminStyles.actionBtn, { backgroundColor: user.isBlocked ? '#dcfce7' : '#fee2e2' }]}
                onPress={() => handleBlockUser(user)}
              >
                <Text style={[adminStyles.actionBtnText, { color: user.isBlocked ? '#166534' : '#b91c1c' }]}>
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[adminStyles.actionBtn, { backgroundColor: '#f5f3ff' }]}
                onPress={() => handleAssignRole(user)}
              >
                <Text style={[adminStyles.actionBtnText, { color: '#7c3aed' }]}>Assign Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <Loading fullScreen message="Loading users..." />;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Manage Users</Text>
        <TouchableOpacity onPress={() => setShowAddUserModal(true)}>
          <MaterialCommunityIcons name="account-plus" size={26} color={C.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Hero */}
            <View style={[adminStyles.hero, { backgroundColor: C.primary, marginTop: 12 }]}>
              <Text style={[adminStyles.heroEyebrow, { fontFamily: appFont }]}>ADMIN</Text>
              <Text style={[adminStyles.heroTitle, { fontFamily: appFont }]}>User Management</Text>
              <Text style={[adminStyles.heroSubtitle, { fontFamily: appFont }]}>{users.length} registered users</Text>
            </View>

            {error && <View style={{ marginBottom: 12 }}><ErrorMessage error={error} /></View>}

            {/* Search */}
            <View style={[adminStyles.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={C.muted} />
              <TextInput
                placeholder="Search by name, email, phone..."
                value={searchText}
                onChangeText={(t) => { setSearchText(t); }}
                style={[adminStyles.searchInput, { color: C.text, fontFamily: appFont }]}
                placeholderTextColor={C.muted}
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter */}
            <View style={adminStyles.filterRow}>
              {ROLE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[adminStyles.filterChip, { flex: 1, alignItems: 'center', backgroundColor: filterRole === f.value ? C.primary : C.surface, borderColor: filterRole === f.value ? C.primary : C.inputBorder }]}
                  onPress={() => setFilterRole(f.value)}
                >
                  <Text style={[adminStyles.filterChipText, { color: filterRole === f.value ? '#fff' : C.text, fontFamily: appFont }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats */}
            <View style={adminStyles.statsGrid}>
              {STAT_CARDS.map((s) => (
                <View key={s.label} style={[adminStyles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={[adminStyles.statLabel, { color: s.accent, fontFamily: appFont }]}>{s.label}</Text>
                  <Text style={[adminStyles.statValue, { color: s.accent, fontFamily: appFont }]}>{s.value}</Text>
                </View>
              ))}
            </View>

            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont }]}>Users</Text>
          </>
        }
        ListEmptyComponent={
          <View style={adminStyles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={48} color={C.muted} />
            <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No users found</Text>
            <Text style={[adminStyles.emptySubtext, { color: C.muted, fontFamily: appFont }]}>Try adjusting your filters</Text>
          </View>
        }
      />

      <Modal visible={showAddUserModal} animationType="slide" transparent={false}>
        <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
          <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}> 
            <TouchableOpacity onPress={() => setShowAddUserModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={C.text} />
            </TouchableOpacity>
            <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Add User</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={[adminStyles.formSection, { backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 16 }]}> 
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>First Name</Text>
              <TextInput value={newUser.firstName} onChangeText={(text) => setNewUser({ ...newUser, firstName: text })} placeholder="First name" style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Last Name</Text>
              <TextInput value={newUser.lastName} onChangeText={(text) => setNewUser({ ...newUser, lastName: text })} placeholder="Last name" style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Email</Text>
              <TextInput value={newUser.email} onChangeText={(text) => setNewUser({ ...newUser, email: text })} placeholder="user@email.com" keyboardType="email-address" style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Phone Number</Text>
              <TextInput value={newUser.phoneNumber} onChangeText={(text) => setNewUser({ ...newUser, phoneNumber: text })} placeholder="+2348000000000" keyboardType="phone-pad" style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Role</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {['client', 'service_provider', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setNewUser({ ...newUser, role })}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center', backgroundColor: newUser.role === role ? C.primary : C.surfaceAlt, borderColor: newUser.role === role ? C.primary : C.inputBorder }}
                  >
                    <Text style={{ color: newUser.role === role ? '#fff' : C.text, fontWeight: '700', fontFamily: appFont, textTransform: 'capitalize' }}>{role.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Business Name (optional)</Text>
              <TextInput value={newUser.businessName} onChangeText={(text) => setNewUser({ ...newUser, businessName: text })} placeholder="Business name" style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Password</Text>
              <TextInput value={newUser.password} onChangeText={(text) => setNewUser({ ...newUser, password: text })} placeholder="Minimum 6 characters" secureTextEntry style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont, marginTop: 12 }]}>Confirm Password</Text>
              <TextInput value={newUser.passwordConfirm} onChangeText={(text) => setNewUser({ ...newUser, passwordConfirm: text })} placeholder="Repeat password" secureTextEntry style={[adminStyles.formInput, { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder, color: C.text, fontFamily: appFont }]} placeholderTextColor={C.muted} />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity style={[adminStyles.modalBtn, { flex: 1, borderWidth: 1, borderColor: C.inputBorder }]} onPress={() => setShowAddUserModal(false)}>
                  <Text style={[adminStyles.modalBtnText, { color: C.text, fontFamily: appFont }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[adminStyles.modalBtn, { flex: 1, backgroundColor: C.primary }]} onPress={handleCreateUser}>
                  <Text style={[adminStyles.modalBtnText, { color: '#fff', fontFamily: appFont }]}>Create User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageUsersScreen;
