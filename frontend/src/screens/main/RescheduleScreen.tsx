import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';

export default function RescheduleScreen({ route, navigation }: any) {
  const { booking } = route.params || {};
  const { theme } = useTheme();
  const { requestReschedule, respondReschedule, isLoading } = useBookingStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
    input: isDark ? '#1e293b' : '#f1f5f9',
  };

  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const hasPendingReschedule = booking?.reschedule?.status === 'pending';
  const isRequester = booking?.reschedule?.requestedBy === user?._id;
  const canRespond = hasPendingReschedule && !isRequester;

  const handleRequest = async () => {
    if (!reason.trim()) return Alert.alert('Please provide a reason');
    try {
      await requestReschedule(booking._id, {
        newDate: newDate.toISOString(),
        newTime,
        reason,
      });
      Alert.alert('Success', 'Reschedule request sent');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send request');
    }
  };

  const handleRespond = async (accept: boolean) => {
    try {
      await respondReschedule(booking._id, { accept });
      Alert.alert('Success', accept ? 'Reschedule accepted' : 'Reschedule rejected');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to respond');
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reschedule Booking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.bookingRef, { color: colors.muted }]}>#{booking?.bookingNumber}</Text>
          <Text style={[styles.currentDate, { color: colors.text }]}>
            Current date: {booking?.eventDate ? new Date(booking.eventDate).toDateString() : '—'}
          </Text>
        </View>

        {canRespond ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reschedule Request</Text>
            <View style={styles.row}>
              <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                New date: {booking.reschedule.newDate ? new Date(booking.reschedule.newDate).toDateString() : '—'}
              </Text>
            </View>
            {booking.reschedule.newTime ? (
              <View style={styles.row}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{booking.reschedule.newTime}</Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <MaterialCommunityIcons name="text" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.muted }]}>{booking.reschedule.reason}</Text>
            </View>
            <View style={styles.respondRow}>
              <TouchableOpacity
                style={[styles.respondBtn, { backgroundColor: '#fee2e2' }]}
                onPress={() => handleRespond(false)}
              >
                <Text style={{ color: '#dc2626', fontWeight: '700' }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.respondBtn, { backgroundColor: '#dcfce7' }]}
                onPress={() => handleRespond(true)}
              >
                <Text style={{ color: '#15803d', fontWeight: '700' }}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Request New Date</Text>

            <TouchableOpacity
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.inputText, { color: colors.text }]}>{newDate.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setNewDate(date);
                }}
              />
            )}

            <View style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
              <TextInput
                style={[styles.inputText, { color: colors.text, flex: 1 }]}
                placeholder="New time (e.g. 3:00 PM)"
                placeholderTextColor={colors.muted}
                value={newTime}
                onChangeText={setNewTime}
              />
            </View>

            <View style={[styles.textArea, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <TextInput
                style={[{ color: colors.text, flex: 1 }]}
                placeholder="Reason for rescheduling..."
                placeholderTextColor={colors.muted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
              />
            </View>

            <Button title="Send Reschedule Request" onPress={handleRequest} isLoading={isLoading} variant="primary" fullWidth />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginLeft: 12 },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  bookingRef: { fontSize: 12, fontWeight: '600' },
  currentDate: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, flex: 1 },
  respondRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  respondBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  inputText: { fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 100 },
});
