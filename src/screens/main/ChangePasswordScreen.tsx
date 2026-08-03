/**
 * Change Password Screen
 * Premium password change experience
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useTheme } from '../../context/ThemeContext';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { isLoading, error, changePassword } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#16a34a',
  };

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields and try again');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      Alert.alert('Success', 'Password changed successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPasswordStrength = (password) => {
    if (!password) return null;

    let strength = 'Weak';
    let strengthColor = '#ef4444';
    let strengthPercentage = 30;

    if (password.length >= 8) {
      strength = 'Medium';
      strengthColor = '#f59e0b';
      strengthPercentage = 66;
    }

    if (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      strength = 'Strong';
      strengthColor = '#10b981';
      strengthPercentage = 100;
    }

    return (
      <View style={styles.passwordStrength}> 
        <View style={styles.passwordStrengthRow}>
          <Text style={[styles.passwordStrengthLabel, { color: colors.muted }]}>Password Strength</Text>
          <Text style={[styles.passwordStrengthValue, { color: strengthColor }]}>{strength}</Text>
        </View>
        <View style={[styles.strengthTrack, { backgroundColor: isDark ? '#1f2937' : '#e2e8f0' }]}> 
          <View style={[styles.strengthFill, { width: `${strengthPercentage}%`, backgroundColor: strengthColor }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.header, { backgroundColor: colors.primary }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 24 }]}> 
        {error ? <ErrorMessage error={error} /> : null}

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}> 
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#2563eb' }]}> 
                <MaterialCommunityIcons name="lock-alert" size={22} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoTitle, { color: '#1d4ed8' }]}>Keep Your Account Secure</Text>
                <Text style={[styles.infoText, { color: '#1e40af' }]}>Use a strong password with uppercase, lowercase, numbers, and special characters</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Input
              label="Current Password"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, currentPassword: text });
                if (formErrors.currentPassword) setFormErrors({ ...formErrors, currentPassword: null });
              }}
              secureTextEntry
              icon="lock"
              error={formErrors.currentPassword}
            />

            <Input
              label="New Password"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, newPassword: text });
                if (formErrors.newPassword) setFormErrors({ ...formErrors, newPassword: null });
              }}
              secureTextEntry
              icon="lock-reset"
              error={formErrors.newPassword}
              helperText="Must be different from current password"
            />
            {renderPasswordStrength(formData.newPassword)}

            <Input
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: null });
              }}
              secureTextEntry
              icon="lock-check"
              error={formErrors.confirmPassword}
            />

            {formData.newPassword && formData.confirmPassword ? (
              <View style={[styles.matchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
                <MaterialCommunityIcons
                  name={formData.newPassword === formData.confirmPassword ? 'check-circle' : 'close-circle'}
                  size={20}
                  color={formData.newPassword === formData.confirmPassword ? '#10b981' : '#ef4444'}
                />
                <Text style={[styles.matchText, { color: formData.newPassword === formData.confirmPassword ? '#047857' : '#b91c1c' }]}> 
                  {formData.newPassword === formData.confirmPassword ? 'Passwords match perfectly' : 'Passwords do not match'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.tipsSection}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Password Requirements</Text>
            {[
              { icon: 'numeric-8-plus', text: 'At least 8 characters', check: formData.newPassword.length >= 8 },
              { icon: 'format-letter-case', text: 'Mix uppercase & lowercase', check: /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) },
              { icon: 'numeric', text: 'Include numbers (0-9)', check: /[0-9]/.test(formData.newPassword) },
              { icon: 'shield-check', text: 'Avoid personal info', check: true },
            ].map((item, index) => (
              <View key={index} style={[styles.tipRow, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <View style={[styles.tipBadge, { backgroundColor: item.check ? '#dcfce7' : '#e2e8f0' }]}> 
                  <MaterialCommunityIcons name={item.icon} size={18} color={item.check ? '#16a34a' : '#64748b'} />
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>{item.text}</Text>
                {item.check ? <MaterialCommunityIcons name="check" size={18} color="#10b981" /> : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}> 
        <Button
          title={isSaving ? 'Updating...' : 'Change Password'}
          onPress={handleChangePassword}
          isLoading={isSaving}
          variant="primary"
          fullWidth
          size="lg"
          style={styles.footerButton}
        />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 22, paddingTop: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14 },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '800', marginLeft: 16 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  section: { marginBottom: 18 },
  infoCard: { borderRadius: 28, padding: 22, borderWidth: 1, marginBottom: 18 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  infoText: { fontSize: 13, lineHeight: 20 },
  card: { borderRadius: 28, padding: 22, borderWidth: 1, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  passwordStrength: { marginTop: 10 },
  passwordStrengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  passwordStrengthLabel: { fontSize: 12, fontWeight: '700' },
  passwordStrengthValue: { fontSize: 12, fontWeight: '900' },
  strengthTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  strengthFill: { height: 6, borderRadius: 999 },
  matchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 22, padding: 14, marginTop: 14 },
  matchText: { fontSize: 14, fontWeight: '700' },
  tipsSection: { marginTop: 12, gap: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1 },
  tipBadge: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 14, fontWeight: '700' },
  footer: { paddingHorizontal: 16, paddingVertical: 20, borderTopWidth: 1, gap: 12 },
  footerButton: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
});

export default ChangePasswordScreen;
