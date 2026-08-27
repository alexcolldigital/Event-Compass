import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input.jsx';
import PhoneCountryInput from '../../components/PhoneCountryInput.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useAuthStore } from '../../context/authStore.js';
import authStyles from '../../styles/authStyles.js';
import { SERVICE_PROVIDER_TYPE_OPTIONS } from '../../utils/constants.js';
import { DEFAULT_COUNTRY } from '../../utils/countryPhoneOptions.js';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
};

type RegisterProviderScreenProps = {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function RegisterProviderScreen({ navigation }: RegisterProviderScreenProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
    businessName: '',
    businessType: 'event_planner',
    businessDescription: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string | null>>>({});
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const { registerProvider, isLoading, error } = useAuthStore();

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
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
    if (!formData.businessName) nextErrors.businessName = 'Business name is required';
    if (!formData.businessType) nextErrors.businessType = 'Please select a business category';
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
      const response = await registerProvider({
        ...formData,
        phoneNumber: `${selectedCountry.dialCode} ${formData.phoneNumber.trim()}`.trim(),
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        dialCode: selectedCountry.dialCode,
        verificationMethod: 'email',
      });
      if (response?.requiresEmailVerification) {
        navigation.navigate('Verify', { mode: 'email', email: formData.email.trim() });
      } else if (response?.requiresPhoneVerification) {
        navigation.navigate('Verify', { mode: 'phone' });
      }
    } catch (err) {
      console.error('Provider registration error:', err);
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
              <MaterialCommunityIcons name="store-plus" size={54} color="white" />
            </View>
            <Text style={authStyles.title}>Grow Your Business</Text>
            <Text style={authStyles.subtitle}>
              Register as a service provider and reach thousands of customers
            </Text>
          </View>

          {error ? <ErrorMessage error={error} /> : null}

          <View style={authStyles.sectionCard}>
            <View style={authStyles.sectionTitleRow}>
              <MaterialCommunityIcons name="account-multiple" size={24} color="#16a34a" />
              <Text style={authStyles.sectionTitle}>Personal Details</Text>
            </View>
            <View style={authStyles.row}>
              <View style={authStyles.flex}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(text: string) => updateField('firstName', text)}
                  icon="account"
                  error={errors.firstName}
                />
              </View>
              <View style={authStyles.flex}>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(text: string) => updateField('lastName', text)}
                  icon="account"
                  error={errors.lastName}
                />
              </View>
            </View>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text: string) => updateField('email', text)}
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
          </View>

          <View style={authStyles.sectionCard}>
            <View style={authStyles.sectionTitleRow}>
              <MaterialCommunityIcons name="briefcase" size={24} color="#16a34a" />
              <Text style={authStyles.sectionTitle}>Business Details</Text>
            </View>
            <Input
              label="Business Name"
              placeholder="Your awesome business"
              value={formData.businessName}
              onChangeText={(text: string) => updateField('businessName', text)}
              icon="store"
              error={errors.businessName}
            />
            <View style={styles.categorySection}>
              <Text style={authStyles.smallLabel}>Business Category</Text>
              <Text style={styles.helperText}>Choose the category that best describes your services.</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsCategoryMenuOpen(true)}
                style={styles.dropdownTrigger}
              >
                <Text style={styles.dropdownValue}>
                  {SERVICE_PROVIDER_TYPE_OPTIONS.find((option) => option.value === formData.businessType)?.label || 'Select a category'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#16a34a" />
              </TouchableOpacity>
              {errors.businessType ? <Text style={styles.errorText}>{errors.businessType}</Text> : null}
            </View>

            <Modal
              visible={isCategoryMenuOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setIsCategoryMenuOpen(false)}
            >
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsCategoryMenuOpen(false)}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select category</Text>
                    <TouchableOpacity onPress={() => setIsCategoryMenuOpen(false)}>
                      <MaterialCommunityIcons name="close" size={20} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                    {SERVICE_PROVIDER_TYPE_OPTIONS.map((option) => {
                      const isSelected = formData.businessType === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          activeOpacity={0.85}
                          onPress={() => {
                            updateField('businessType', option.value);
                            setIsCategoryMenuOpen(false);
                          }}
                          style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                        >
                          <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                            {option.label}
                          </Text>
                          {isSelected ? <MaterialCommunityIcons name="check" size={18} color="#ffffff" /> : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
            <Input
              label="Tell us about your services"
              placeholder="Describe your services, specialties, and what makes you unique..."
              value={formData.businessDescription}
              onChangeText={(text: string) => updateField('businessDescription', text)}
              icon="text-box-outline"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={authStyles.sectionCard}>
            <View style={authStyles.sectionTitleRow}>
              <MaterialCommunityIcons name="lock" size={24} color="#16a34a" />
              <Text style={authStyles.sectionTitle}>Security</Text>
            </View>
            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChangeText={(text: string) => updateField('password', text)}
              secureTextEntry
              icon="lock"
              error={errors.password}
              helperText="Use uppercase, lowercase and numbers for security"
            />
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={formData.passwordConfirm}
              onChangeText={(text: string) => updateField('passwordConfirm', text)}
              secureTextEntry
              icon="lock-check"
              error={errors.passwordConfirm}
            />
          </View>

          <Button
            title={isLoading ? 'Creating Account...' : 'Register Business'}
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            variant="primary"
            size="lg"
          />

          <Text style={authStyles.terms}>
            By registering, you agree to our Terms of Service and Privacy Policy
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

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: 14,
  },
  helperText: {
    color: '#667064',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#dfe7df',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f7fbf4',
  },
  dropdownValue: {
    color: '#172017',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2e7',
  },
  modalTitle: {
    color: '#172017',
    fontWeight: '800',
    fontSize: 16,
  },
  modalList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f7fbf4',
  },
  modalOptionSelected: {
    backgroundColor: '#16a34a',
  },
  modalOptionText: {
    color: '#172017',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#ffffff',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
});
