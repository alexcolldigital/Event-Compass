import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatDateTime } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const CHANNELS = ['in_app', 'email', 'push', 'all'];
const ROLES = ['all', 'client', 'service_provider', 'admin'];
const EMPTY_FORM = { title: '', message: '', type: 'broadcast', targetRole: 'all', channel: 'in_app' };
const STATUS_COLORS = { sent: '#10b981', draft: '#f59e0b', scheduled: '#3b82f6' };

export default function NotificationManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

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

  const NotifCard = ({ item }) => {
    const color = STATUS_COLORS[item.status] || '#6b7280';
    return (
      <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8, fontFamily: appFont }}>{item.title}</Text>
          <View style={[adminStyles.badge, { backgroundColor: color + '20' }]}>
            <Text style={[adminStyles.badgeText, { color, textTransform: 'capitalize', fontFamily: appFont }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 13, marginBottom: 8, fontFamily: appFont }} numberOfLines={2}>{item.message}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
          <View style={[adminStyles.badge, { backgroundColor: C.surfaceAlt }]}>
            <Text style={[adminStyles.badgeText, { color: C.muted, textTransform: 'capitalize', fontFamily: appFont }]}>{item.targetRole}</Text>
          </View>
          <View style={[adminStyles.badge, { backgroundColor: C.surfaceAlt }]}>
            <Text style={[adminStyles.badgeText, { color: C.muted, textTransform: 'capitalize', fontFamily: appFont }]}>{item.channel}</Text>
          </View>
        </View>
        {item.sentAt && <Text style={{ color: C.muted, fontSize: 11, marginBottom: 8, fontFamily: appFont }}>Sent: {formatDateTime(item.sentAt)}</Text>}
        <View style={adminStyles.actionRow}>
          {item.status === 'draft' && (
            <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: C.primary }]} onPress={() => handleSend(item)}>
              <Text style={[adminStyles.actionBtnText, { color: '#fff', fontFamily: appFont }]}>Send Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleDelete(item)}>
            <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ChipSelector = ({ label, options, value, onChange }) => (
    <View style={adminStyles.formField}>
      <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 }, value === o ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder }]}
            onPress={() => onChange(o)}
          >
            <Text style={{ color: value === o ? '#fff' : C.text, fontSize: 12, fontWeight: '700', textTransform: 'capitalize', fontFamily: appFont }}>{o.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Notification Management</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>+ New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <NotifCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No notifications yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <ScrollView style={[adminStyles.modalSheet, { backgroundColor: C.surface }]} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[adminStyles.modalTitle, { color: C.text, fontFamily: appFont }]}>New Notification</Text>

            <View style={adminStyles.formField}>
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Title *</Text>
              <TextInput style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]} value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Notification title" placeholderTextColor={C.muted} />
            </View>
            <View style={adminStyles.formField}>
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Message *</Text>
              <TextInput style={[adminStyles.formInputMultiline, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]} value={form.message} onChangeText={(v) => setForm((f) => ({ ...f, message: v }))} placeholder="Notification message" placeholderTextColor={C.muted} multiline numberOfLines={3} />
            </View>

            <ChipSelector label="Target Role" options={ROLES} value={form.targetRole} onChange={(v) => setForm((f) => ({ ...f, targetRole: v }))} />
            <ChipSelector label="Channel" options={CHANNELS} value={form.channel} onChange={(v) => setForm((f) => ({ ...f, channel: v }))} />

            <View style={adminStyles.modalActions}>
              <TouchableOpacity style={[adminStyles.modalBtn, { borderWidth: 1, borderColor: C.inputBorder }]} onPress={() => setModalVisible(false)}>
                <Text style={[adminStyles.modalBtnText, { color: C.text, fontFamily: appFont }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.modalBtn, { backgroundColor: C.primary }]} onPress={handleCreate} disabled={isSaving}>
                <Text style={[adminStyles.modalBtnText, { color: '#fff', fontFamily: appFont }]}>{isSaving ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
