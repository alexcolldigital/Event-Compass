import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import { useAuthStyles } from '../../styles/authStyles.js';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';

export default function ForgotPasswordScreen() {
  const authStyles = useAuthStyles();
  const navigation = useNavigation<AuthNavigationProp>();
  const [identifier, setIdentifier] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string }>({});
  const { forgotPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async () => {
    setErrors({});
    if (!identifier) {
      setErrors({ identifier: 'Email or phone number is required' });
      return;
    }

    try {
      const response = await forgotPassword(identifier.trim()) as { email?: string };
      navigation.navigate('Verify', { mode: 'forgot-password', email: response?.email || identifier.trim() });
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
              Enter your email or phone number and we will send a 6-digit code to your email.
            </Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.card}>
            <Input
              label="Email or Phone Number"
              placeholder="your@email.com or +234 800 000 0000"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) setErrors({});
              }}
              keyboardType="default"
              icon="account"
              error={errors.identifier}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
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
