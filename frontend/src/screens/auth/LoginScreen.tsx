import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';
import logo from '../../assets/logo';

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
    isLoading,
    error,
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
      const response = await loginUnified(identifier, password);
      if (response?.requiresEmailVerification || response?.requiresDeviceVerification) {
        navigation.navigate('Verify', {
          mode: 'email',
          email: response.email || (identifier.includes('@') ? identifier.trim() : undefined),
          userId: response.userId,
        });
      } else if (response?.requiresPhoneVerification) {
        navigation.navigate('Verify', { mode: 'phone' });
      }
    } catch (err) {
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
            <Image source={logo} style={authStyles.brandLogo} resizeMode="contain" />
            <Text style={authStyles.subtitle}>Book premium event services instantly</Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

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
