import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/helpers.js';

const CHANNELS = ['in_app', 'email', 'push', 'all'];
const ROLES = ['all', 'client', 'service_provider', 'admin'];
const EMPTY_FORM = { title: '', message: '', type: 'broadcast', targetRole: 'all', channel: 'in_app' };

export default function NotificationManagementScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getNotifications({ limit: 50 });
      setNotifications(res.notifications || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.message) return Alert.alert('Error', 'Title and message are required');
    setIsSaving(true);
    try {
      const res = await adminAPI.createNotification(form);
      setNotifications((n) => [res.notification, ...n]);
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleSend = (item) => {
    Alert.alert('Send Notification', `Send "${item.title}" to ${item.targetRole === 'all' ? 'all users' : item.targetRole + 's'}?`, [
      { text: 'Cancel' },
      { text: 'Send', onPress: async () => {
        try {
          const res = await adminAPI.sendNotification(item._id);
          setNotifications((n) => n.map((x) => x._id === item._id ? res.notification : x));
          Alert.alert('Sent', 'Notification sent successfully');
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteNotification(item._id); setNotifications((n) => n.filter((x) => x._id !== item._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const statusColor = (s) => ({ sent: '#10b981', draft: '#f59e0b', scheduled: '#3b82f6' }[s] || '#6b7280');

  const NotifCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-bold text-gray-800 flex-1 mr-2">{item.title}</Text>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor(item.status) + '20' }}>
          <Text className="text-xs font-semibold capitalize" style={{ color: statusColor(item.status) }}>{item.status}</Text>
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>{item.message}</Text>
      <View className="flex-row gap-2 mb-2">
        <View className="bg-gray-100 px-2 py-0.5 rounded"><Text className="text-gray-600 text-xs capitalize">{item.targetRole}</Text></View>
        <View className="bg-gray-100 px-2 py-0.5 rounded"><Text className="text-gray-600 text-xs capitalize">{item.channel}</Text></View>
      </View>
      {item.sentAt && <Text className="text-gray-400 text-xs mb-2">Sent: {formatDateTime(item.sentAt)}</Text>}
      <View className="flex-row gap-2">
        {item.status === 'draft' && (
          <TouchableOpacity className="flex-1 bg-primary py-2 rounded-lg" onPress={() => handleSend(item)}>
            <Text className="text-white font-semibold text-center text-sm">Send Now</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity className="flex-1 bg-red-50 py-2 rounded-lg" onPress={() => handleDelete(item)}>
          <Text className="text-red-600 font-semibold text-center text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Notification Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white font-semibold text-sm">+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <NotifCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No notifications yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="bg-white rounded-t-2xl" contentContainerStyle={{ padding: 24 }}>
            <Text className="text-dark text-lg font-bold mb-4">New Notification</Text>
            <Text className="text-gray-600 text-sm mb-1">Title *</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Notification title" />
            <Text className="text-gray-600 text-sm mb-1">Message *</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.message} onChangeText={(v) => setForm((f) => ({ ...f, message: v }))} placeholder="Notification message" multiline numberOfLines={3} />
            <Text className="text-gray-600 text-sm mb-1">Target Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {ROLES.map((r) => (
                <TouchableOpacity key={r} className={`mr-2 px-3 py-2 rounded-lg border ${form.targetRole === r ? 'bg-primary border-primary' : 'border-gray-300'}`} onPress={() => setForm((f) => ({ ...f, targetRole: r }))}>
                  <Text className={`text-xs font-semibold capitalize ${form.targetRole === r ? 'text-white' : 'text-dark'}`}>{r.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="text-gray-600 text-sm mb-1">Channel</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {CHANNELS.map((c) => (
                <TouchableOpacity key={c} className={`mr-2 px-3 py-2 rounded-lg border ${form.channel === c ? 'bg-primary border-primary' : 'border-gray-300'}`} onPress={() => setForm((f) => ({ ...f, channel: c }))}>
                  <Text className={`text-xs font-semibold capitalize ${form.channel === c ? 'text-white' : 'text-dark'}`}>{c.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity className="flex-1 border border-gray-300 py-3 rounded-lg" onPress={() => setModalVisible(false)}>
                <Text className="text-dark font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary py-3 rounded-lg" onPress={handleCreate} disabled={isSaving}>
                <Text className="text-white font-semibold text-center">{isSaving ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
