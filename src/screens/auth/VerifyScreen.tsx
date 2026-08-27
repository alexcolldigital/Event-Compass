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
  route: RouteProp<{ Verify: { mode?: 'email'; email?: string } }, 'Verify'>;
};

export default function VerifyScreen({ navigation, route }: Props) {
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [actionError, setActionError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { verifyEmail, isLoading, error, user, clearError } = useAuthStore();
  const email = route.params?.email || user?.email || '';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setActionError('Enter the 6-digit verification code');
      return;
    }
    try {
      clearError();
      setActionError('');
      setStatusMessage('');
      await verifyEmail(otp);
      setStatusMessage('Email verified successfully. Opening your account...');
    } catch (verificationError: any) {
      setActionError(verificationError?.message || 'Invalid or expired code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      clearError();
      setActionError('');
      setStatusMessage('');
      await authAPI.resendVerification(email);
      setResendCooldown(60);
      setStatusMessage(`A new code has been sent to ${email || 'your email'}.`);
    } catch (resendError: any) {
      setActionError(resendError?.message || 'Failed to resend the verification code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView
        style={authStyles.scroll}
        contentContainerStyle={authStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={authStyles.shell}>
          <View style={authStyles.header}>
            <View style={authStyles.brandBadge}>
              <MaterialCommunityIcons
                name="email-check"
                size={54}
                color="white"
              />
            </View>
            <Text style={authStyles.title}>
              Verify Your Email
            </Text>
            <Text style={authStyles.subtitle}>
              Enter the 6-digit code sent to
{email || 'your email'}
            </Text>
          </View>

          {error || actionError ? <ErrorMessage error={error || actionError} /> : null}
          {statusMessage ? <Text style={{ color: '#15803d', textAlign: 'center', marginBottom: 12 }}>{statusMessage}</Text> : null}

          <View style={authStyles.card}>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text: string) => {
                clearError();
                setActionError('');
                setOtp(text.replace(/\D/g, '').slice(0, 6));
              }}
              keyboardType="number-pad"
              icon="numeric"
              maxLength={6}
            />

            <Button
              title={isLoading ? 'Verifying...' : 'Verify Email'}
              onPress={handleVerify}
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

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={authStyles.mutedText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
