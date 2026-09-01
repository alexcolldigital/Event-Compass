import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBookingStore } from '../../context/bookingStore.js';
import { useAuthStore } from '../../context/authStore.js';
import Button from '../../components/Button.jsx';

export default function RefundRequestScreen({ route, navigation }: any) {
  const { booking } = route.params || {};
  const { theme } = useTheme();
  const { requestRefund, isLoading } = useBookingStore();
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

  const [reason, setReason] = useState('');

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const phoneNumber = user?.phoneNumber || '';
  const bookingCode = booking?.bookingNumber || '';

  const handleRequest = async () => {
    if (!reason.trim()) {
      return Alert.alert('Error', 'Please provide a reason for refund');
    }

    try {
      await requestRefund(booking._id, {
        reason: reason.trim(),
        amount: booking?.pricing?.totalAmount,
      });
      Alert.alert('Success', 'Refund request submitted successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit refund request');
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Request Refund</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Booking Information */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Booking Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="ticket" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.muted }]}>Booking Code</Text>
              <Text style={[styles.value, { color: colors.text }]}>{bookingCode}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="currency-ngn" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.muted }]}>Booking Amount</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                ₦{booking?.pricing?.totalAmount?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Your Information */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Information</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.muted }]}>Full Name</Text>
              <Text style={[styles.value, { color: colors.text }]}>{fullName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.muted }]}>Phone Number</Text>
              <Text style={[styles.value, { color: colors.text }]}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Refund Reason */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reason for Refund</Text>

          <View style={[styles.textArea, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Please provide detailed reason for refund request..."
              placeholderTextColor={colors.muted}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={5}
            />
          </View>

          <Text style={[styles.helperText, { color: colors.muted }]}>
            Be specific about your reason to help us process your request faster
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="Submit Refund Request"
          onPress={handleRequest}
          isLoading={isLoading}
          variant="primary"
          fullWidth
        />

        {/* Info Note */}
        <View style={[styles.infoNote, { backgroundColor: isDark ? '#1e3a2e' : '#ecfdf3', borderColor: colors.primary }]}>
          <MaterialCommunityIcons name="information" size={18} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.text }]}>
            Your refund request will be reviewed by the service provider. You will receive a response within 48 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginLeft: 12 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 12 },
  textArea: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 120 },
  textInput: { flex: 1, fontSize: 14 },
  helperText: { fontSize: 12, marginTop: 8 },
  infoNote: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 12, padding: 12, gap: 10 },
  noteText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
