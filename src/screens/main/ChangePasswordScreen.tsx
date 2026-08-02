/**
 * Change Password Screen
 * Premium password change experience
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { isLoading, error, changePassword } = useAuthStore();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields and try again');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      Alert.alert('Success', 'Password changed successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPasswordStrength = (password) => {
    if (!password) return null;

    let strength = 'Weak';
    let strengthColor = '#ef4444';
    let strengthPercentage = 33;

    if (password.length >= 8) {
      strength = 'Medium';
      strengthColor = '#f59e0b';
      strengthPercentage = 66;
    }

    if (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      strength = 'Strong';
      strengthColor = '#10b981';
      strengthPercentage = 100;
    }

    return (
      <View className="mt-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-600 text-xs font-semibold">Password Strength</Text>
          <Text className="font-bold text-xs" style={{ color: strengthColor }}>
            {strength}
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-2 rounded-full transition-all"
            style={{
              backgroundColor: strengthColor,
              width: `${strengthPercentage}%`,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-6 pb-8 rounded-b-4xl shadow-2xl">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-3 active:bg-white/20 rounded-full"
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-black ml-4">Change Password</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-8">
          {/* Error Message */}
          {error && <ErrorMessage error={error} />}

          {/* Security Info Banner */}
          <View className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 mb-8 border-l-4 border-blue-500">
            <View className="flex-row items-start">
              <View className="bg-blue-500 rounded-full p-3 mr-4 mt-1">
                <MaterialCommunityIcons name="lock-alert" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-black text-base mb-2">Keep Your Account Secure</Text>
                <Text className="text-blue-700 text-sm leading-5 font-medium">
                  Use a strong password with uppercase, lowercase, numbers, and special characters
                </Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View className="bg-gray-50 rounded-3xl p-7 shadow-lg mb-8">
            {/* Current Password */}
            <Input
              label="Current Password"
              placeholder="Enter your current password"
              value={formData.currentPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, currentPassword: text });
                if (formErrors.currentPassword) setFormErrors({ ...formErrors, currentPassword: null });
              }}
              secureTextEntry
              icon="lock"
              error={formErrors.currentPassword}
            />

            {/* New Password */}
            <View className="mt-0">
              <Input
                label="New Password"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, newPassword: text });
                  if (formErrors.newPassword) setFormErrors({ ...formErrors, newPassword: null });
                }}
                secureTextEntry
                icon="lock-reset"
                error={formErrors.newPassword}
                helperText="Must be different from current password"
              />
              {renderPasswordStrength(formData.newPassword)}
            </View>

            {/* Confirm Password */}
            <View className="mt-4">
              <Input
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: null });
                }}
                secureTextEntry
                icon="lock-check"
                error={formErrors.confirmPassword}
              />

              {/* Match Indicator */}
              {formData.newPassword && formData.confirmPassword && (
                <View className="mt-3 flex-row items-center p-3 rounded-2xl bg-white">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                      <Text className="text-green-600 text-sm font-bold ml-3">Passwords match perfectly</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
                      <Text className="text-red-600 text-sm font-bold ml-3">Passwords do not match</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Password Tips */}
          <View className="mb-8">
            <Text className="text-lg font-black text-gray-900 mb-4">Password Requirements</Text>
            
            <View className="gap-3">
              {[
                { icon: 'numeric-8-plus', text: 'At least 8 characters', check: formData.newPassword.length >= 8 },
                { icon: 'format-letter-case', text: 'Mix uppercase & lowercase', check: /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) },
                { icon: 'numeric', text: 'Include numbers (0-9)', check: /[0-9]/.test(formData.newPassword) },
                { icon: 'numeric', text: 'Don\'t use personal info', check: true },
              ].map((item, index) => (
                <View key={index} className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm">
                  <View className={`rounded-full p-3 mr-4 ${item.check ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={20}
                      color={item.check ? '#10b981' : '#9ca3af'}
                    />
                  </View>
                  <Text className={`flex-1 font-medium ${item.check ? 'text-green-700' : 'text-gray-600'}`}>
                    {item.text}
                  </Text>
                  {item.check && (
                    <MaterialCommunityIcons name="check" size={20} color="#10b981" />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 py-6 gap-3 border-t border-gray-100">
        <Button
          title={isSaving ? 'Updating...' : 'Change Password'}
          onPress={handleChangePassword}
          isLoading={isSaving}
          variant="primary"
          fullWidth
          size="lg"
        />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
