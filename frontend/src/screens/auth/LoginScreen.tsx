import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';

interface LoginErrors {
  identifier?: string | null;
  password?: string | null;
}

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const {
    loginUnified,
    sendPhoneOtp,
    isLoading,
    error,
    requiresPhoneVerification,
    pendingPhoneNumber,
    clearError,
  } = useAuthStore();

  const validateForm = () => {
    const nextErrors: LoginErrors = {};
    if (!identifier) nextErrors.identifier = 'Email or phone number is required';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    clearError();
    try {
      await loginUnified(identifier, password);
    } catch (err) {
      // error shown via store
    }
  };

  const handleVerifyPhone = async () => {
    try {
      // Send OTP to the phone number they tried to log in with
      await sendPhoneOtp(pendingPhoneNumber || identifier);
      navigation.navigate('Verify', {
        mode: 'phone',
        phoneNumber: pendingPhoneNumber || identifier,
      });
    } catch (err: any) {
      // error shown via store
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
              <MaterialCommunityIcons name="calendar-check" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Event Compass by Checcas</Text>
            <Text style={authStyles.subtitle}>Book premium event services instantly</Text>
          </View>

          {/* Unverified phone banner */}
          {requiresPhoneVerification ? (
            <View style={styles.warningBanner}>
              <MaterialCommunityIcons name="phone-alert" size={22} color="#92400e" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Phone number not verified</Text>
                <Text style={styles.warningText}>
                  <Text style={{ fontWeight: '800' }}>{pendingPhoneNumber || identifier}</Text> hasn't been verified yet.
                  Verify it to log in with your phone number.
                </Text>
                <TouchableOpacity
                  style={styles.verifyNowBtn}
                  onPress={handleVerifyPhone}
                  disabled={isLoading}
                >
                  <Text style={styles.verifyNowText}>
                    {isLoading ? 'Sending OTP…' : 'Verify Now →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : error ? (
            <ErrorMessage error={error} />
          ) : null}

          <View style={authStyles.card}>
            <Input
              label="Email or Phone Number"
              placeholder="your@email.com or +234 800 000 0000"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) setErrors({ ...errors, identifier: null });
              }}
              keyboardType="default"
              icon="account"
              error={errors.identifier}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry
              icon="lock"
              error={errors.password}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={authStyles.forgotLink}
            >
              <Text style={authStyles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <Button
              title={isLoading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              variant="primary"
              size="lg"
            />
          </View>

          <View style={authStyles.divider}>
            <View style={authStyles.dividerLine} />
            <Text style={authStyles.dividerText}>New User?</Text>
            <View style={authStyles.dividerLine} />
          </View>

          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            fullWidth
            size="md"
            leftIcon="account-plus-outline"
          />

          <Text style={authStyles.terms}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 19,
    fontWeight: '600',
  },
  verifyNowBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  verifyNowText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});
