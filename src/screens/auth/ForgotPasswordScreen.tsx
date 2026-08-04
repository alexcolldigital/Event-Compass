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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const { forgotPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async () => {
    setErrors({});
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={authStyles.screen}>
        <ScrollView style={authStyles.scroll} contentContainerStyle={authStyles.scrollContent}>
          <View style={authStyles.shell}>
            <View style={authStyles.header}>
              <View style={authStyles.brandBadge}>
                <MaterialCommunityIcons name="check-circle" size={58} color="white" />
              </View>
              <Text style={authStyles.title}>Reset Link Sent</Text>
              <Text style={authStyles.subtitle}>
                We sent a password reset link to your email address.
              </Text>
            </View>

            <View style={authStyles.successBox}>
              <Text style={authStyles.smallLabel}>Email Sent To</Text>
              <Text style={authStyles.strongText}>{email}</Text>
            </View>

            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              fullWidth
              size="lg"
            />
            <Text style={authStyles.terms}>
              Did not receive the email? Check your spam folder or contact support.
            </Text>
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
              <MaterialCommunityIcons name="lock-reset" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Reset Password</Text>
            <Text style={authStyles.subtitle}>
              Enter your email and we will send you a link to reset your password.
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
            title={isLoading ? 'Sending...' : 'Send Reset Link'}
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
