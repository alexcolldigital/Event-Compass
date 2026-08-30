import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { useAuthStore } from '../../context/authStore.js';

export default function ResetPasswordScreen({ navigation, route }: { navigation: any; route: any }) {
  const { resetToken } = route.params;
  const { resetPasswordWithToken, isLoading } = useAuthStore() as any;

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'At least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await resetPasswordWithToken({ token: resetToken, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to reset password');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#16a34a" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="lock-reset" size={64} color="#16a34a" />
        </View>

        <Text style={styles.heading}>New Password</Text>
        <Text style={styles.subText}>Enter your new password below.</Text>

        <View style={styles.card}>
          <Input
            label="New Password"
            placeholder="Minimum 6 characters"
            value={form.newPassword}
            onChangeText={(v) => set('newPassword', v)}
            secureTextEntry
            icon="lock"
            error={errors.newPassword}
            returnKeyType="next"
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChangeText={(v) => set('confirmPassword', v)}
            secureTextEntry
            icon="lock-check"
            error={errors.confirmPassword}
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
          />
        </View>

        <Button
          title={isLoading ? 'Resetting...' : 'Reset Password'}
          onPress={handleSubmit}
          isLoading={isLoading}
          fullWidth
          variant="primary"
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7f2' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 24, padding: 4 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 999, backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  heading: { fontSize: 26, fontWeight: '900', color: '#172017', textAlign: 'center', marginBottom: 12 },
  subText: { fontSize: 15, color: '#667064', textAlign: 'center', lineHeight: 22, marginBottom: 28, fontWeight: '600' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(15,23,42,0.08)' },
});
