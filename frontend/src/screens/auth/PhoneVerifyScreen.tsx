import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';

type Props = { navigation: NavigationProp<ParamListBase> };

export default function PhoneVerifyScreen({ navigation }: Props) {
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const { verifyPhone, sendPhoneOtp, isLoading, error, user, clearError } = useAuthStore();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) return;
    try {
      await verifyPhone(otp);
      // isAuthenticated is now true — RootNavigator will redirect automatically
    } catch (_) {}
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      clearError();
      await sendPhoneOtp();
      setResendCooldown(60);
    } catch (_) {}
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
              <MaterialCommunityIcons name="cellphone-check" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Verify Your Phone</Text>
            <Text style={authStyles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: 'bold' }}>{user?.phoneNumber}</Text>
            </Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.card}>
            <Input
              label="OTP Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text) => {
                clearError();
                setOtp(text.replace(/\D/g, '').slice(0, 6));
              }}
              keyboardType="number-pad"
              icon="numeric"
              maxLength={6}
            />

            <Button
              title={isLoading ? 'Verifying...' : 'Verify Phone'}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
