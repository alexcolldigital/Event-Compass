import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const { forgotPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async () => {
    setErrors({});
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      const response = await forgotPassword(email.trim()) as { email?: string };
      navigation.navigate('ResetPassword', { email: response?.email || email.trim() });
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView style={authStyles.scroll} contentContainerStyle={authStyles.scrollContent}>
        <View style={authStyles.shell}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={authStyles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#16a34a" />
          </TouchableOpacity>

          <View style={authStyles.header}>
            <View style={authStyles.brandBadge}>
              <MaterialCommunityIcons name="lock-reset" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Reset Password</Text>
            <Text style={authStyles.subtitle}>
              Enter your email and we will send you a 6-digit code to reset your password.
            </Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.card}>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({});
              }}
              keyboardType="email-address"
              icon="email"
              error={errors.email}
            />
          </View>

          <Button
            title={isLoading ? 'Sending...' : 'Send Reset Code'}
            onPress={handleSubmit}
            isLoading={isLoading}
            fullWidth
            variant="primary"
            size="lg"
          />

          <View style={authStyles.inlineRow}>
            <Text style={authStyles.mutedText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={authStyles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
