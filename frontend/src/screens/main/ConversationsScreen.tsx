/**
 * ConversationsScreen
 * Lists all conversations for the current user with last message preview and unread count.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import { messageAPI } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ConversationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.1)' : '#e2e8f0',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.conversations || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const getOtherParty = (conv: any) => {
    const msg = conv.lastMessage;
    if (!msg) return null;
    const senderId = msg.sender?._id || msg.sender;
    return String(senderId) === String(user?._id) ? msg.receiver : msg.sender;
  };

  const getDisplayName = (party: any) => {
    if (!party) return 'Unknown';
    return party.businessName || `${party.firstName || ''} ${party.lastName || ''}`.trim() || 'User';
  };

  const openChat = (conv: any) => {
    const other = getOtherParty(conv);
    const booking = conv.lastMessage?.booking || null;
    (navigation as any).navigate('Chat', { receiver: other, booking });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 96 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="message-outline" size={56} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              Start chatting from a booking detail page
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const other = getOtherParty(item);
          const name = getDisplayName(other);
          const lastMsg = item.lastMessage;
          const unread = item.unreadCount || 0;
          const preview =
            lastMsg?.isDeleted
              ? 'Message deleted'
              : lastMsg?.type === 'image'
              ? '📷 Image'
              : lastMsg?.type === 'file'
              ? `📎 ${lastMsg.attachment?.name || 'File'}`
              : lastMsg?.content || '';

          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => openChat(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="account" size={22} color="#fff" />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.rowTime, { color: colors.muted }]}>
                    {lastMsg?.createdAt ? formatTime(lastMsg.createdAt) : ''}
                  </Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={[styles.rowPreview, { color: colors.muted }]} numberOfLines={1}>
                    {preview}
                  </Text>
                  {unread > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                    </View>
                  )}
                </View>
                {lastMsg?.booking && (
                  <Text style={[styles.bookingTag, { color: colors.primary }]}>
                    #{lastMsg.booking.bookingNumber}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', fontFamily: appFont },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 14, fontFamily: appFont },
  emptySub: { fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 32, fontFamily: appFont },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rowName: { fontSize: 15, fontWeight: '700', fontFamily: appFont, flex: 1, marginRight: 8 },
  rowTime: { fontSize: 11, fontFamily: appFont },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowPreview: { fontSize: 13, flex: 1, marginRight: 8, fontFamily: appFont },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  bookingTag: { fontSize: 11, fontWeight: '700', marginTop: 3, fontFamily: appFont },
});

export default ConversationsScreen;
