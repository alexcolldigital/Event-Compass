import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import { authAPI } from '../../services/api.js';
import authStyles from '../../styles/authStyles.js';

type Props = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<{ ResetPassword: { email: string } }, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const email = route.params?.email ?? '';
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [localError, setLocalError] = useState('');
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyOtp = async () => {
    setLocalError('');
    if (!otp || otp.length !== 6) {
      setLocalError('Enter the 6-digit code');
      return;
    }
    try {
      const res = await authAPI.verifyOtp(email, otp) as { resetToken?: string };
      if (!res.resetToken) {
        setLocalError('Could not verify code. Please request a new one.');
        return;
      }
      setResetToken(res.resetToken);
      setStep('password');
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid or expired code');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setLocalError('');
      clearError();
      await authAPI.forgotPassword(email); // forgotPassword accepts identifier string
      setResendCooldown(60);
    } catch (_) {}
  };

  const handleResetPassword = async () => {
    setLocalError('');
    if (!newPassword || newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    try {
      await resetPassword({ token: resetToken, newPassword, confirmPassword });
      navigation.navigate('Login');
    } catch (_) {}
  };

  const displayError = localError || error;

  if (step === 'password') {
    return (
      <SafeAreaView style={authStyles.screen}>
        <ScrollView style={authStyles.scroll} contentContainerStyle={authStyles.scrollContent}>
          <View style={authStyles.shell}>
            <View style={authStyles.header}>
              <View style={authStyles.brandBadge}>
                <MaterialCommunityIcons name="lock-reset" size={54} color="white" />
              </View>
              <Text style={authStyles.title}>New Password</Text>
              <Text style={authStyles.subtitle}>Enter your new password below</Text>
            </View>

            {displayError ? <ErrorMessage error={displayError} /> : null}

            <View style={authStyles.card}>
              <Input
                label="New Password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChangeText={(text: string) => { setLocalError(''); setNewPassword(text); }}
                secureTextEntry
                icon="lock"
              />
              <Input
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(text: string) => { setLocalError(''); setConfirmPassword(text); }}
                secureTextEntry
                icon="lock-check"
              />
              <Button
                title={isLoading ? 'Saving...' : 'Reset Password'}
                onPress={handleResetPassword}
                isLoading={isLoading}
                fullWidth
                variant="primary"
                size="lg"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView style={authStyles.scroll} contentContainerStyle={authStyles.scrollContent}>
        <View style={authStyles.shell}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={authStyles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#16a34a" />
          </TouchableOpacity>

          <View style={authStyles.header}>
            <View style={authStyles.brandBadge}>
              <MaterialCommunityIcons name="email-check" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Check Your Email</Text>
            <Text style={authStyles.subtitle}>
              {`Enter the 6-digit code sent to\n${email}`}
            </Text>
          </View>

          {displayError ? <ErrorMessage error={displayError} /> : null}

          <View style={authStyles.card}>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text: string) => {
                setLocalError('');
                clearError();
                setOtp(text.replace(/\D/g, '').slice(0, 6));
              }}
              keyboardType="number-pad"
              icon="numeric"
              maxLength={6}
            />

            <Button
              title="Verify Code"
              onPress={handleVerifyOtp}
              isLoading={isLoading}
              fullWidth
              variant="primary"
              size="lg"
            />

            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown > 0}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={[authStyles.linkText, resendCooldown > 0 && { opacity: 0.4 }]}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
