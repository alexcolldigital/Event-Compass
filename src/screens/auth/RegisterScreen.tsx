import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import PhoneCountryInput from '../../components/PhoneCountryInput.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';
import { DEFAULT_COUNTRY } from '../../utils/countryPhoneOptions.js';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
};

type RegisterScreenProps = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string | null>>>({});
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const { register, isLoading, error } = useAuthStore();

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handlePhoneChange = (text: string) => {
    updateField('phoneNumber', text.replace(/\D/g, ''));
  };

  const handleCountryChange = (country: typeof DEFAULT_COUNTRY) => {
    setSelectedCountry(country);
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof FormData, string | null>> = {};
    if (!formData.firstName) nextErrors.firstName = 'First name is required';
    if (!formData.lastName) nextErrors.lastName = 'Last name is required';
    if (!formData.email) nextErrors.email = 'Email is required';
    if (!formData.phoneNumber) nextErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) nextErrors.password = 'Password is required';
    if (formData.password !== formData.passwordConfirm) {
      nextErrors.passwordConfirm = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      await register({
        ...formData,
        phoneNumber: `${selectedCountry.dialCode} ${formData.phoneNumber.trim()}`.trim(),
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        dialCode: selectedCountry.dialCode,
      });
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <SafeAreaView style={authStyles.screen}>
      <ScrollView style={authStyles.scroll} contentContainerStyle={authStyles.scrollContent}>
        <View style={authStyles.shellLarge}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={authStyles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#16a34a" />
          </TouchableOpacity>

          <View style={authStyles.header}>
            <View style={authStyles.brandBadge}>
              <MaterialCommunityIcons name="account-plus" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Join Event Compass</Text>
            <Text style={authStyles.subtitle}>Discover premium event services in just a few steps</Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.card}>
            <View style={authStyles.row}>
              <View style={authStyles.flex}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  icon="account"
                  error={errors.firstName}
                />
              </View>
              <View style={authStyles.flex}>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  icon="account"
                  error={errors.lastName}
                />
              </View>
            </View>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              icon="email"
              error={errors.email}
            />
            <PhoneCountryInput
              label="Phone Number"
              placeholder="8012345678"
              value={formData.phoneNumber}
              onChangeText={handlePhoneChange}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              error={errors.phoneNumber}
            />
            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              secureTextEntry
              icon="lock"
              error={errors.password}
              helperText="Use uppercase, lowercase and numbers for security"
            />
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.passwordConfirm}
              onChangeText={(text) => updateField('passwordConfirm', text)}
              secureTextEntry
              icon="lock-check"
              error={errors.passwordConfirm}
            />
          </View>

          <Button
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            variant="primary"
            size="lg"
          />

          <Button
            title="Register as Service Provider"
            onPress={() => navigation.navigate('RegisterProvider')}
            fullWidth
            variant="secondary"
            size="md"
            leftIcon="briefcase-plus-outline"
            style={{ marginTop: 12 }}
          />

          <Text style={authStyles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
          <View style={authStyles.inlineRow}>
            <Text style={authStyles.mutedText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={authStyles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
