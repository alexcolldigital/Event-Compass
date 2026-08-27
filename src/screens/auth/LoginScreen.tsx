import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';

type LoginScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

type FormErrors = {
  email?: string | null;
  password?: string | null;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const { login, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!email) nextErrors.email = 'Email is required';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      const response = await login(email, password);
      if (response?.requiresEmailVerification) {
        navigation.navigate('Verify', { mode: 'email', email: email.trim() });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err && typeof err === 'object' && 'requiresEmailVerification' in err) {
        navigation.navigate('Verify', { mode: 'email', email: email.trim() });
      }
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
            <Text style={authStyles.title}>Event Compass</Text>
            <Text style={authStyles.subtitle}>Book premium event services instantly</Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.card}>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              icon="email"
              error={errors.email}
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

          <View style={authStyles.buttonStack}>
            <Button
              title="Create Client Account"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              fullWidth
              size="md"
              leftIcon="account-plus-outline"
            />
            <Button
              title="Join as Service Provider"
              onPress={() => navigation.navigate('RegisterProvider')}
              variant="secondary"
              fullWidth
              size="md"
              leftIcon="briefcase-plus-outline"
            />
          </View>

          <Text style={authStyles.terms}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
