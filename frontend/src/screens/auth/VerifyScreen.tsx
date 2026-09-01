import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/authStore.js';
import { authAPI } from '../../services/api.js';
import { useAuthStyles } from '../../styles/authStyles.js';
import { useTheme } from '../../context/ThemeContext.jsx';

type Mode = 'email' | 'forgot-password' | 'change-password';

type Props = {
  navigation: any;
  route: { params?: { mode?: Mode; email?: string; phoneNumber?: string; userId?: string } };
};

const MODE_CONFIG: Record<Mode, { icon: string; title: string; subtitle: (target: string) => string }> = {
  email: {
    icon: 'email-check-outline',
    title: 'Verify Your Email',
    subtitle: (email) => `Your email must be verified before you can log in.\nWe sent a 6-digit code to ${email}`,
  },
  'forgot-password': {
    icon: 'lock-reset',
    title: 'Reset Password',
    subtitle: (email) => `Enter the 6-digit code sent to\n${email}`,
  },
  'change-password': {
    icon: 'shield-lock',
    title: 'Confirm It\'s You',
    subtitle: (email) => `Enter the 6-digit code sent to\n${email}`,
  },
};

export default function VerifyScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const authStyles = useAuthStyles();
  const mode: Mode = (route.params?.mode ?? 'email') as Mode;
  const paramEmail = route.params?.email ?? '';
  const paramUserId = route.params?.userId ?? '';

  const { verifyEmail, verifyOtp, user, isLoading, clearError } = useAuthStore() as any;

  const target = paramEmail || user?.email || '';
  const resendTarget = target || paramUserId;
  const config = MODE_CONFIG[mode];

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<TextInput>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setOtpError('');
    setStatusMessage('');
    clearError();
    try {
      if (mode === 'email' || mode === 'change-password') {
        await verifyEmail(otp);
        if (mode === 'change-password') {
          navigation.navigate('ChangePassword', { otpVerified: true });
        } else {
          setStatusMessage('Email verified successfully. Opening your account...');
        }
      } else if (mode === 'forgot-password') {
        const res = await verifyOtp(target, otp) as { resetToken?: string };
        if (!res.resetToken) {
          setOtpError('Could not verify code. Please request a new one.');
          return;
        }
        navigation.navigate('ResetPassword', { resetToken: res.resetToken });
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid or expired code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      clearError();
      setOtpError('');
      setStatusMessage('');
      if (mode === 'forgot-password') {
        await authAPI.forgotPassword(target);
      } else if (mode === 'change-password') {
        await authAPI.sendChangePasswordOtp();
      } else {
        await authAPI.resendVerification(resendTarget);
      }
      startCooldown();
      setStatusMessage(`A new code has been sent to ${target || 'your email'}.`);
    } catch (err: any) {
      if (err?.message === 'Email already verified') {
        navigation.navigate('Login');
        return;
      }
      setOtpError(err?.message || 'Failed to resend. Please try again.');
    }
  };

  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#16a34a" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={config.icon as any} size={64} color="#16a34a" />
        </View>

        <Text style={styles.heading}>{config.title}</Text>
        <Text style={styles.subText}>{config.subtitle(target)}</Text>
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        {/* OTP boxes */}
        <TouchableOpacity style={styles.otpRow} onPress={() => otpInputRef.current?.focus()} activeOpacity={1}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.otpBox,
                otp.length === i && styles.otpBoxActive,
                otpError && styles.otpBoxError,
                otp[i] && styles.otpBoxFilled,
              ]}
            >
              <Text style={styles.otpChar}>{otp[i] || ''}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* Hidden input that captures all digits */}
        <TextInput
          ref={otpInputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={(t) => { setOtp(t.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
          keyboardType="number-pad"
          maxLength={6}
          onSubmitEditing={handleVerify}
          returnKeyType="go"
          blurOnSubmit
          autoFocus
          caretHidden
          accessibilityLabel="Email verification code"
        />

        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, (isLoading || otp.length !== 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Verify Code</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ghostBtn, (resendCooldown > 0 || isLoading) && styles.btnDisabled]}
          onPress={handleResend}
          disabled={resendCooldown > 0 || isLoading}
        >
          <Text style={styles.ghostBtnText}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend"}
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
      width: 110, height: 110, borderRadius: 999,
      backgroundColor: dark ? '#14532d' : '#dcfce7',
      alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    heading: { fontSize: 26, fontWeight: '900', color: dark ? '#e8f5e9' : '#172017', textAlign: 'center', marginBottom: 12 },
    subText: {
      fontSize: 15, color: dark ? '#9ab89a' : '#667064', textAlign: 'center',
      lineHeight: 22, marginBottom: 28, fontWeight: '600',
    },
    otpRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    otpBox: {
      width: 46, height: 56, borderRadius: 12, borderWidth: 2,
      borderColor: dark ? '#2d4a2d' : '#d1fae5',
      backgroundColor: dark ? '#1a2e1a' : '#fff',
      alignItems: 'center', justifyContent: 'center',
    },
    otpBoxActive: { borderColor: '#16a34a', backgroundColor: dark ? '#14532d' : '#f0fdf4' },
    otpBoxFilled: { borderColor: '#16a34a' },
    otpBoxError: { borderColor: '#dc2626' },
    otpChar: { fontSize: 24, fontWeight: '900', color: dark ? '#e8f5e9' : '#172017' },
    hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
    errorText: { color: '#dc2626', fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 8 },
    statusText: { color: '#15803d', fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 8, textAlign: 'center' },
    primaryBtn: {
      width: '100%', backgroundColor: '#16a34a', borderRadius: 16,
      paddingVertical: 16, alignItems: 'center', marginTop: 20,
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    ghostBtn: { width: '100%', paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    ghostBtnText: { color: '#16a34a', fontSize: 14, fontWeight: '800' },
    btnDisabled: { opacity: 0.5 },
  });
