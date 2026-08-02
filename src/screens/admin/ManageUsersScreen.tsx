/**
 * Manage Users Screen
 * Admin screen for managing users, blocking, and verification
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { COLORS, USER_ROLES } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

const ManageUsersScreen = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchText, filterRole, users]);

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

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase()) ||
          (user.phoneNumber || user.phone || '').includes(searchText)
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleBlockUser = (user) => {
    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      user.isBlocked
        ? `Unblock ${user.firstName} ${user.lastName}?`
        : user.businessName
        ? `Block ${user.businessName}?`
        : `Block ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await adminAPI.blockUser(user._id, {
                reason: user.isBlocked ? undefined : 'Blocked by admin',
              });
              const updatedUsers = users.map((u) =>
                u._id === user._id ? response.user : u
              );
              setUsers(updatedUsers);
              setSelectedUser(null);
              Alert.alert('Success', `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to update user');
            }
          },
        },
      ]
    );
  };

  const handleVerifyUser = (user) => {
    Alert.alert(
      'Verify Provider',
      `Verify ${user.businessName} as a service provider?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Verify',
          onPress: async () => {
            try {
              const response = await adminAPI.verifyProvider(user._id);
              const updatedUsers = users.map((u) =>
                u._id === user._id ? response.user : u
              );
              setUsers(updatedUsers);
              setSelectedUser(null);
              Alert.alert('Success', 'Provider verified successfully');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to verify provider');
            }
          },
        },
      ]
    );
  };

  const UserCard = ({ user }) => {
    const isProvider = user.role === USER_ROLES.SERVICE_PROVIDER;

    return (
      <TouchableOpacity
        onPress={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
        className="bg-white p-3 rounded-lg mb-3 border border-gray-200"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1">
            <View className="w-12 h-12 bg-primary rounded-full justify-center items-center mr-3">
              <MaterialCommunityIcons name="account" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-semibold">
                {user.firstName} {user.lastName}
              </Text>
              {isProvider && (
                <Text className="text-gray-600 text-xs mt-1">{user.businessName}</Text>
              )}
              <Text className="text-gray-500 text-xs mt-1">{user.email}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="ml-2">
            {user.isBlocked ? (
              <View className="bg-red-100 px-2 py-1 rounded-full">
                <Text className="text-red-700 text-xs font-semibold">Blocked</Text>
              </View>
            ) : (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-semibold">Active</Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Info */}
        {selectedUser?._id === user._id && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-xs">Role</Text>
              <Text className="text-dark text-xs font-semibold capitalize">{user.role}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-xs">Phone</Text>
              <Text className="text-dark text-xs font-semibold">{user.phoneNumber || user.phone || 'Not provided'}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-xs">Total Bookings</Text>
              <Text className="text-dark text-xs font-semibold">{user.totalBookings}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-xs">Joined</Text>
              <Text className="text-dark text-xs font-semibold">
                {formatDate(user.createdAt)}
              </Text>
            </View>

            {user.isBlocked && user.blockReason && (
              <View className="bg-red-50 p-2 rounded mt-2 mb-2">
                <Text className="text-gray-600 text-xs font-semibold mb-1">Block Reason</Text>
                <Text className="text-red-700 text-xs">{user.blockReason}</Text>
              </View>
            )}

            {isProvider && (
              <View className="flex-row gap-2 mt-2">
                {user.isBusinessVerified || user.businessVerified ? (
                  <View className="flex-row items-center flex-1 bg-green-50 p-2 rounded">
                    <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
                    <Text className="text-green-700 text-xs ml-1 font-semibold">Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-1 bg-blue-50 p-2 rounded"
                    onPress={() => handleVerifyUser(user)}
                  >
                    <Text className="text-blue-700 text-xs font-semibold text-center">Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                className={`flex-1 px-3 py-2 rounded-lg ${
                  user.isBlocked ? 'bg-green-100' : 'bg-red-100'
                }`}
                onPress={() => handleBlockUser(user)}
              >
                <Text
                  className={`text-xs font-semibold text-center ${
                    user.isBlocked ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 px-3 py-2 rounded-lg border border-primary">
                <Text className="text-primary text-xs font-semibold text-center">Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading users..." />;
  }

  return (
    <View className="flex-1 bg-light">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Manage Users</Text>
      </View>

      {error && (
        <View className="mx-4 mt-3">
          <ErrorMessage error={error} />
        </View>
      )}

      {/* Search and Filter */}
      <View className="bg-white p-3 mx-3 mt-3 rounded-lg">
        {/* Search Input */}
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-3">
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray[400]} />
          <TextInput
            placeholder="Search by name, email, phone..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 py-2 ml-2 text-dark"
            placeholderTextColor={COLORS.gray[400]}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Role Filter */}
        <View className="flex-row gap-2">
          {[
            { label: 'All', value: 'all' },
            { label: 'Clients', value: USER_ROLES.CLIENT },
            { label: 'Providers', value: USER_ROLES.SERVICE_PROVIDER },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                filterRole === filter.value
                  ? 'bg-primary border-primary'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setFilterRole(filter.value)}
            >
              <Text
                className={`text-xs font-semibold text-center ${
                  filterRole === filter.value ? 'text-white' : 'text-dark'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Stats */}
      <View className="flex-row gap-3 px-3 mt-3">
        <View className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <Text className="text-blue-700 text-xs font-semibold">Total Users</Text>
          <Text className="text-blue-900 text-2xl font-bold mt-1">{users.length}</Text>
        </View>
        <View className="flex-1 bg-green-50 p-3 rounded-lg border border-green-200">
          <Text className="text-green-700 text-xs font-semibold">Active</Text>
          <Text className="text-green-900 text-2xl font-bold mt-1">
            {users.filter((u) => !u.isBlocked).length}
          </Text>
        </View>
        <View className="flex-1 bg-red-50 p-3 rounded-lg border border-red-200">
          <Text className="text-red-700 text-xs font-semibold">Blocked</Text>
          <Text className="text-red-900 text-2xl font-bold mt-1">
            {users.filter((u) => u.isBlocked).length}
          </Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={{ padding: 12, paddingTop: 12 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <MaterialCommunityIcons name="account-off" size={48} color={COLORS.gray[300]} />
            <Text className="text-gray-500 mt-3 font-semibold">No users found</Text>
            <Text className="text-gray-400 text-sm mt-1">Try adjusting your filters</Text>
          </View>
        }
        scrollEnabled={true}
      />

      {/* Action Bar */}
      <View className="bg-white border-t border-gray-200 p-3 flex-row gap-2">
        <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-2">
          <Text className="text-dark font-semibold text-center">Export</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-2">
          <Text className="text-dark font-semibold text-center">Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ManageUsersScreen;
