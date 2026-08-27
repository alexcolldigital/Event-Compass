/**
 * ChatScreen
 * Real-time messaging with image/file sharing, read receipts, typing indicators,
 * and booking-linked conversations.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../context/authStore.js';
import { messageAPI } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attachment {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

interface ChatMessage {
  _id: string;
  sender: { _id: string; firstName: string; lastName: string; profileImage?: string; role: string };
  receiver: { _id: string };
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachment?: Attachment;
  readBy: { user: string; readAt: string }[];
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  isDeleted?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildConversationId = (userIdA: string, userIdB: string, bookingId?: string) => {
  const sorted = [userIdA, userIdB].sort().join('_');
  return bookingId ? `${sorted}_${bookingId}` : sorted;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  msg,
  isMine,
  colors,
  onLongPress,
}: {
  msg: ChatMessage;
  isMine: boolean;
  colors: Record<string, string>;
  onLongPress: () => void;
}) => {
  const isRead = msg.readBy?.some((r) => !isMine && r.user);
  const isImage = msg.type === 'image';
  const isFile = msg.type === 'file';
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemRow}>
        <Text style={[styles.systemText, { color: colors.muted }]}>{msg.content}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[styles.bubbleRow, isMine ? styles.bubbleRowRight : styles.bubbleRowLeft]}
    >
      <View
        style={[
          styles.bubble,
          isMine
            ? [styles.bubbleMine, { backgroundColor: colors.primary }]
            : [styles.bubbleTheirs, { backgroundColor: colors.surface, borderColor: colors.border }],
          msg.isDeleted && styles.bubbleDeleted,
        ]}
      >
        {isImage && msg.attachment?.url ? (
          <TouchableOpacity onPress={() => Linking.openURL(msg.attachment!.url)}>
            <Image source={{ uri: msg.attachment.url }} style={styles.attachmentImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : isFile && msg.attachment?.url ? (
          <TouchableOpacity
            style={[styles.fileRow, { backgroundColor: isMine ? 'rgba(255,255,255,0.15)' : colors.surfaceAlt }]}
            onPress={() => Linking.openURL(msg.attachment!.url)}
          >
            <MaterialCommunityIcons name="file-document-outline" size={28} color={isMine ? '#fff' : colors.primary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.fileName, { color: isMine ? '#fff' : colors.text }]} numberOfLines={1}>
                {msg.attachment.name || 'File'}
              </Text>
              <Text style={[styles.fileSize, { color: isMine ? 'rgba(255,255,255,0.7)' : colors.muted }]}>
                {formatFileSize(msg.attachment.size)}
              </Text>
            </View>
            <MaterialCommunityIcons name="download" size={20} color={isMine ? '#fff' : colors.primary} />
          </TouchableOpacity>
        ) : null}

        {msg.content && !(isImage && !msg.isDeleted) ? (
          <Text
            style={[
              styles.bubbleText,
              { color: isMine ? '#fff' : colors.text },
              msg.isDeleted && styles.deletedText,
            ]}
          >
            {msg.isDeleted ? 'This message was deleted' : msg.content}
          </Text>
        ) : null}

        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, { color: isMine ? 'rgba(255,255,255,0.7)' : colors.muted }]}>
            {formatTime(msg.createdAt)}
          </Text>
          {isMine && (
            <MaterialCommunityIcons
              name={msg.status === 'read' ? 'check-all' : msg.status === 'delivered' ? 'check-all' : 'check'}
              size={14}
              color={msg.status === 'read' ? '#a7f3d0' : 'rgba(255,255,255,0.6)'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const params = (route.params as any) || {};
  const booking = params.booking || null;
  const receiverParam = params.receiver || null;

  // Determine receiver from booking or direct param
  const receiver = receiverParam || (() => {
    if (!booking || !user) return null;
    const client = booking.client || booking.clientId || {};
    const provider = booking.serviceProvider || booking.serviceProviderId || {};
    const clientId = client._id || client;
    const providerId = provider._id || provider;
    return String(clientId) === String(user._id)
      ? { _id: String(providerId), firstName: provider.firstName || '', lastName: provider.lastName || '', businessName: provider.businessName || '', role: 'service_provider' }
      : { _id: String(clientId), firstName: client.firstName || '', lastName: client.lastName || '', role: 'client' };
  })();

  const conversationId = receiver && user
    ? buildConversationId(String(user._id), String(receiver._id), booking?._id)
    : null;

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.1)' : '#e2e8f0',
    primary: isDark ? '#34d399' : '#1f7a4d',
    inputBg: isDark ? '#1e293b' : '#f8fafc',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // ── Load messages ──────────────────────────────────────────────────────────

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setIsLoading(true);
      const res: any = await messageAPI.getMessages(conversationId);
      setMessages(res?.messages || []);
      await messageAPI.markRead(conversationId);
    } catch {
      // silent — show empty state
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // ── Socket.IO setup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!conversationId || !user) return;

    const connectSocket = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join', { userId: user._id, conversationIds: [conversationId] });
      });

      socket.on('new_message', (msg: ChatMessage) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Mark read immediately if we're in this conversation
        messageAPI.markRead(conversationId).catch(() => {});
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });

      socket.on('messages_read', ({ readBy }: { readBy: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            String(m.sender?._id) === String(user._id) ? { ...m, status: 'read' } : m
          )
        );
      });

      socket.on('typing_start', ({ userId, userName }: { userId: string; userName: string }) => {
        if (userId !== String(user._id)) {
          setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
        }
      });

      socket.on('typing_stop', ({ userId }: { userId: string }) => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      });

      socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
          )
        );
      });

      socket.on('conversation_cleared', ({ conversationId: clearedId }: { conversationId: string }) => {
        if (clearedId === conversationId) {
          setMessages([]);
        }
      });
    };

    loadMessages();
    connectSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, user]);

  // ── Typing indicator ───────────────────────────────────────────────────────

  const handleTyping = (text: string) => {
    setDraft(text);
    if (!socketRef.current || !conversationId || !user) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('typing_start', {
        conversationId,
        userId: String(user._id),
        userName: user.firstName,
      });
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit('typing_stop', { conversationId, userId: String(user._id) });
    }, 1500);
  };

  // ── Send message ───────────────────────────────────────────────────────────

  const sendText = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !receiver || isSending) return;

    // Block phone/social/URL leakage
    const hasPhone = /\b\+?\d[\d\s().-]{7,}\d\b/.test(trimmed);
    const hasSocial = /@\w+|instagram|facebook|twitter|x\.com|tiktok|linkedin|whatsapp/i.test(trimmed);
    const hasUrl = /(https?:\/\/|www\.)\S+/i.test(trimmed);
    if (hasPhone || hasSocial || hasUrl) {
      Alert.alert('Message blocked', 'Keep all communication inside the app. Phone numbers, social handles, and URLs are not allowed.');
      return;
    }

    setIsSending(true);
    setDraft('');
    isTypingRef.current = false;
    socketRef.current?.emit('typing_stop', { conversationId, userId: String(user?._id) });

    try {
      const fd = new FormData();
      fd.append('receiverId', String(receiver._id));
      fd.append('content', trimmed);
      if (booking?._id) fd.append('bookingId', booking._id);

      await messageAPI.sendMessage(fd);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send message');
      setDraft(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  // ── Pick image ─────────────────────────────────────────────────────────────

  const pickImage = async () => {
    setShowAttachMenu(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]) return;
    await sendAttachment(result.assets[0].uri, 'image/jpeg', 'photo.jpg');
  };

  const takePhoto = async () => {
    setShowAttachMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    await sendAttachment(result.assets[0].uri, 'image/jpeg', 'photo.jpg');
  };

  const sendAttachment = async (uri: string, mimeType: string, fileName: string) => {
    if (!receiver || isSending) return;
    setIsSending(true);
    try {
      const fd = new FormData();
      fd.append('receiverId', String(receiver._id));
      if (booking?._id) fd.append('bookingId', booking._id);
      fd.append('attachment', { uri, type: mimeType, name: fileName } as any);

      await messageAPI.sendMessage(fd);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send attachment');
    } finally {
      setIsSending(false);
    }
  };

  // ── Long press → delete ────────────────────────────────────────────────────

  const handleLongPress = (msg: ChatMessage) => {
    if (String(msg.sender?._id) !== String(user?._id)) return;
    Alert.alert('Delete message', 'Remove this message?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await messageAPI.deleteMessage(msg._id);
          } catch {
            Alert.alert('Error', 'Failed to delete message');
          }
        },
      },
    ]);
  };

  const handleClearConversation = () => {
    if (!conversationId || !user || (user.role !== 'admin' && user.role !== 'service_provider')) return;

    Alert.alert(
      'Clear chat session',
      'Confirm the client has no more questions. This will remove all messages in this chat session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isClearing ? 'Clearing...' : 'Clear chat',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              await messageAPI.clearConversation(conversationId);
              setMessages([]);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to clear the chat');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const receiverName = receiver
    ? (receiver as any).businessName || `${(receiver as any).firstName || ''} ${(receiver as any).lastName || ''}`.trim() || 'Chat'
    : 'Chat';

  const typingLabel = Object.values(typingUsers).join(', ');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="account" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
                {receiverName}
              </Text>
              {booking && (
                <Text style={[styles.headerSub, { color: colors.muted }]}>
                  Booking #{booking.bookingNumber || ''}
                </Text>
              )}
            </View>
          </View>

          {(user?.role === 'admin' || user?.role === 'service_provider') && (
            <TouchableOpacity
              onPress={handleClearConversation}
              disabled={isClearing}
              style={[styles.clearButton, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                {isClearing ? 'Clearing...' : 'Clear'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.secureTag, { backgroundColor: colors.surfaceAlt }]}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.primary} />
            <Text style={[styles.secureText, { color: colors.primary }]}>Secure</Text>
          </View>
        </View>

        {booking && (
          <View style={[styles.bookingBanner, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={colors.primary} />
            <Text style={[styles.bookingBannerText, { color: colors.muted }]}>
              {booking.bookingNumber} · {booking.status}
            </Text>
          </View>
        )}

        <View style={styles.messageArea}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <MaterialCommunityIcons name="message-outline" size={52} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>No messages yet</Text>
                  <Text style={[styles.emptySubText, { color: colors.muted }]}>Start the conversation below</Text>
                </View>
              }
              renderItem={({ item }) => (
                <MessageBubble
                  msg={item}
                  isMine={String(item.sender?._id) === String(user?._id)}
                  colors={colors}
                  onLongPress={() => handleLongPress(item)}
                />
              )}
            />
          )}
        </View>

        {typingLabel ? (
          <View style={[styles.typingRow, { backgroundColor: colors.bg }]}>
            <View style={styles.typingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: colors.muted }]} />
              ))}
            </View>
            <Text style={[styles.typingText, { color: colors.muted }]}>{typingLabel} is typing…</Text>
          </View>
        ) : null}

        {showAttachMenu && (
          <View style={[styles.attachMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.attachOption} onPress={pickImage}>
              <MaterialCommunityIcons name="image-multiple" size={24} color={colors.primary} />
              <Text style={[styles.attachLabel, { color: colors.text }]}>Photo Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachOption} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.attachLabel, { color: colors.text }]}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === 'android' ? 10 : 0,
            },
          ]}
        >
          <TouchableOpacity style={styles.attachBtn} onPress={() => setShowAttachMenu((v) => !v)}>
            <MaterialCommunityIcons name={showAttachMenu ? 'close' : 'paperclip'} size={22} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            value={draft}
            onChangeText={handleTyping}
            placeholder="Type a message…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={2000}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
          />

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: draft.trim() ? colors.primary : colors.surfaceAlt }]}
            onPress={sendText}
            disabled={!draft.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={18} color={draft.trim() ? '#fff' : colors.muted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  messageArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 15, fontWeight: '800', fontFamily: appFont },
  headerSub: { fontSize: 11, marginTop: 1, fontFamily: appFont },
  secureTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  secureText: { fontSize: 11, fontWeight: '700' },
  clearButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 6 },
  clearButtonText: { fontSize: 11, fontWeight: '800', fontFamily: appFont },
  bookingBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  bookingBannerText: { fontSize: 12, fontWeight: '600', fontFamily: appFont },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { paddingHorizontal: 12, paddingVertical: 16, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '700', marginTop: 12, fontFamily: appFont },
  emptySubText: { fontSize: 13, marginTop: 4, fontFamily: appFont },
  systemRow: { alignItems: 'center', marginVertical: 8 },
  systemText: { fontSize: 12, fontStyle: 'italic' },
  bubbleRow: { marginBottom: 8, maxWidth: '80%' },
  bubbleRowRight: { alignSelf: 'flex-end' },
  bubbleRowLeft: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, minWidth: 60 },
  bubbleMine: { borderBottomRightRadius: 4 },
  bubbleTheirs: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleDeleted: { opacity: 0.5 },
  bubbleText: { fontSize: 14, lineHeight: 20, fontFamily: appFont },
  deletedText: { fontStyle: 'italic' },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  bubbleTime: { fontSize: 10, fontFamily: appFont },
  attachmentImage: { width: 200, height: 160, borderRadius: 12, marginBottom: 4 },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 4 },
  fileName: { fontSize: 13, fontWeight: '700', fontFamily: appFont },
  fileSize: { fontSize: 11, marginTop: 2 },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  typingDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  typingText: { fontSize: 12, fontStyle: 'italic', fontFamily: appFont },
  attachMenu: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 24,
  },
  attachOption: { alignItems: 'center', gap: 4 },
  attachLabel: { fontSize: 11, fontWeight: '600', fontFamily: appFont },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachBtn: { padding: 6, marginBottom: 4 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: appFont,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});

export default ChatScreen;
