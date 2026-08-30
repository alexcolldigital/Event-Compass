import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';

export default function ChangePasswordScreen({ navigation, route }: { navigation: any; route: any }) {
  const { changePassword, sendChangePasswordOtp } = useAuthStore() as any;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const otpVerified = route?.params?.otpVerified === true;

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(otpVerified);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Auto-send OTP when screen mounts (if not already verified)
  useEffect(() => {
    if (!otpVerified) {
      handleSendOtp();
    }
  }, []);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await sendChangePasswordOtp();
      navigation.navigate('Verify', { mode: 'change-password' });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'At least 6 characters';
    else if (form.newPassword === form.currentPassword) e.newPassword = 'Must differ from current password';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getStrength = (pw: string) => {
    if (!pw) return null;
    if (pw.length >= 12 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw))
      return { label: 'Strong', color: '#16a34a', pct: 100 };
    if (pw.length >= 8) return { label: 'Medium', color: '#d97706', pct: 66 };
    return { label: 'Weak', color: '#dc2626', pct: 33 };
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword, form.confirmPassword);
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.newPassword);
  const matches = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;

  if (!otpVerified) {
    return null; // navigating to Verify screen
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="shield-lock" size={22} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Use a strong password with uppercase, lowercase, numbers, and special characters.
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={form.currentPassword}
            onChangeText={(v) => set('currentPassword', v)}
            secureTextEntry
            icon="lock"
            error={errors.currentPassword}
            returnKeyType="next"
          />
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={form.newPassword}
            onChangeText={(v) => set('newPassword', v)}
            secureTextEntry
            icon="lock-reset"
            error={errors.newPassword}
            returnKeyType="next"
          />
          {strength && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthHeader}>
                <Text style={[styles.strengthLabel, { color: colors.muted }]}>Password Strength</Text>
                <Text style={[styles.strengthLabel, { color: strength.color, fontWeight: '800' }]}>{strength.label}</Text>
              </View>
              <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                <View style={[styles.strengthFill, { width: `${strength.pct}%` as any, backgroundColor: strength.color }]} />
              </View>
            </View>
          )}
          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChangeText={(v) => set('confirmPassword', v)}
            secureTextEntry
            icon="lock-check"
            error={errors.confirmPassword}
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
          />
          {form.newPassword && form.confirmPassword ? (
            <View style={[styles.matchRow, { backgroundColor: matches ? '#f0fdf4' : '#fef2f2' }]}>
              <MaterialCommunityIcons
                name={matches ? 'check-circle' : 'close-circle'}
                size={18}
                color={matches ? '#16a34a' : '#dc2626'}
              />
              <Text style={[styles.matchText, { color: matches ? '#16a34a' : '#dc2626' }]}>
                {matches ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Requirements */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.reqTitle, { color: colors.text }]}>Requirements</Text>
          {[
            { text: 'At least 6 characters', met: form.newPassword.length >= 6 },
            { text: 'At least 8 characters (recommended)', met: form.newPassword.length >= 8 },
            { text: 'Uppercase & lowercase letters', met: /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword) },
            { text: 'Contains a number', met: /[0-9]/.test(form.newPassword) },
          ].map((r, i) => (
            <View key={i} style={styles.reqRow}>
              <MaterialCommunityIcons name={r.met ? 'check-circle' : 'circle-outline'} size={18} color={r.met ? '#16a34a' : colors.muted} />
              <Text style={[styles.reqText, { color: r.met ? '#16a34a' : colors.muted }]}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button title={loading ? 'Updating...' : 'Change Password'} onPress={handleSubmit} isLoading={loading} fullWidth variant="primary" size="lg" />
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" fullWidth size="lg" style={{ marginTop: 10 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginLeft: 14 },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 20, padding: 16 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  strengthWrap: { marginTop: -8, marginBottom: 12 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  strengthLabel: { fontSize: 12, fontWeight: '700' },
  strengthBar: { height: 6, borderRadius: 999, overflow: 'hidden' },
  strengthFill: { height: 6, borderRadius: 999 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 10, marginTop: -8, marginBottom: 4 },
  matchText: { fontSize: 13, fontWeight: '700' },
  reqTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reqText: { fontSize: 13, fontWeight: '600' },
  footer: { padding: 16, borderTopWidth: 1 },
});
