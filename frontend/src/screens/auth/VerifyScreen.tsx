/**
 * VerifyScreen
 * Handles both email verification (token from params/deep-link)
 * and phone OTP verification (6-digit code entry).
 *
 * Params:
 *   mode: 'email' | 'phone'
 *   token?: string        — email verification token (from deep-link URL)
 *   phoneNumber?: string  — display only
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import { authAPI } from '../../services/api.js';
import authStyles from '../../styles/authStyles.js';

type VerifyScreenProps = {
  navigation: any;
  route: {
    params?: {
      mode?: 'email' | 'phone';
      token?: string;
      phoneNumber?: string;
    };
  };
};

export default function VerifyScreen({ navigation, route }: VerifyScreenProps) {
  const mode = route.params?.mode ?? 'email';
  const emailToken = route.params?.token ?? '';
  const phoneNumber = route.params?.phoneNumber ?? '';

  const { verifyEmail, verifyPhone, sendPhoneOtp, isLoading, clearError } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoVerify = useRef(false);

  const startCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleEmailVerify = useCallback(async (token: string) => {
    try {
      clearError();
      await verifyEmail(token);
      setStatus('success');
      setStatusMsg('Your email has been verified successfully! You can now log in.');
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err?.message || 'Invalid or expired verification link. Please request a new one.');
    }
  }, [clearError, verifyEmail]);

  // Auto-verify email if token already in params (deep-link)
  useEffect(() => {
    if (mode === 'email' && emailToken && !didAutoVerify.current) {
      didAutoVerify.current = true;
      handleEmailVerify(emailToken);
    }
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [mode, emailToken, handleEmailVerify]);

  const handlePhoneVerify = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    try {
      clearError();
      setOtpError('');
      await verifyPhone(otp);
      setStatus('success');
      setStatusMsg('Phone number verified! You can now log in with your phone number.');
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleResendPhoneOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      clearError();
      await sendPhoneOtp(phoneNumber || undefined);
      startCooldown();
      Alert.alert('Sent', 'A new OTP has been sent to your phone number.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    try {
      clearError();
      await authAPI.resendVerification();
      startCooldown();
      Alert.alert('Sent', 'A new verification email has been sent. Check your inbox.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend email. Please try again.');
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <SafeAreaView style={authStyles.screen}>
        <ScrollView contentContainerStyle={styles.center}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#16a34a" />
          </View>
          <Text style={styles.heading}>Verified!</Text>
          <Text style={styles.subText}>{statusMsg}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Email token invalid ────────────────────────────────────────────────────
  if (status === 'error' && mode === 'email') {
    return (
      <SafeAreaView style={authStyles.screen}>
        <ScrollView contentContainerStyle={styles.center}>
          <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
            <MaterialCommunityIcons name="close-circle" size={64} color="#dc2626" />
          </View>
          <Text style={styles.heading}>Verification Failed</Text>
          <Text style={styles.subText}>{statusMsg}</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, resendCooldown > 0 && styles.btnDisabled]}
            onPress={handleResendEmail}
            disabled={resendCooldown > 0 || isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
                </Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.ghostBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Email: waiting for user to click link ──────────────────────────────────
  if (mode === 'email') {
    return (
      <SafeAreaView style={authStyles.screen}>
        <ScrollView contentContainerStyle={styles.center}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-check-outline" size={64} color="#16a34a" />
          </View>
          <Text style={styles.heading}>Check Your Email</Text>
          <Text style={styles.subText}>
            We sent a verification link to your email address. Open it to activate your account.
          </Text>
          {isLoading && <ActivityIndicator color="#16a34a" style={{ marginVertical: 16 }} />}
          <TouchableOpacity
            style={[styles.primaryBtn, (resendCooldown > 0 || isLoading) && styles.btnDisabled]}
            onPress={handleResendEmail}
            disabled={resendCooldown > 0 || isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.ghostBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Phone OTP entry ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView contentContainerStyle={styles.center}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#16a34a" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="phone-check" size={64} color="#16a34a" />
        </View>
        <Text style={styles.heading}>Verify Phone Number</Text>
        <Text style={styles.subText}>
          Enter the 6-digit code sent to{' '}
          <Text style={{ fontWeight: '800', color: '#172017' }}>{phoneNumber || 'your phone'}</Text>
        </Text>

        <TextInput
          style={[styles.otpInput, otpError ? styles.otpInputError : null]}
          value={otp}
          onChangeText={(t) => { setOtp(t.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#9ca3af"
          autoFocus
        />
        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, (isLoading || otp.length !== 6) && styles.btnDisabled]}
          onPress={handlePhoneVerify}
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Verify</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ghostBtn, (resendCooldown > 0 || isLoading) && styles.btnDisabled]}
          onPress={handleResendPhoneOtp}
          disabled={resendCooldown > 0 || isLoading}
        >
          <Text style={styles.ghostBtnText}>
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive it? Resend"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingVertical: 40,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 24, padding: 4 },
  iconCircle: {
    width: 110, height: 110, borderRadius: 999, backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  heading: { fontSize: 26, fontWeight: '900', color: '#172017', textAlign: 'center', marginBottom: 12 },
  subText: {
    fontSize: 15, color: '#667064', textAlign: 'center',
    lineHeight: 22, marginBottom: 28, fontWeight: '600',
  },
  otpInput: {
    width: '100%', borderWidth: 2, borderColor: '#d1fae5', borderRadius: 16,
    fontSize: 32, fontWeight: '900', letterSpacing: 14, textAlign: 'center',
    paddingVertical: 16, backgroundColor: '#fff', marginBottom: 8, color: '#172017',
  },
  otpInputError: { borderColor: '#dc2626' },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  primaryBtn: {
    width: '100%', backgroundColor: '#16a34a', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ghostBtn: { width: '100%', paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  ghostBtnText: { color: '#16a34a', fontSize: 14, fontWeight: '800' },
  btnDisabled: { opacity: 0.5 },
});
