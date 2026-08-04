/**
 * Edit Profile Screen
 * Premium profile management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isValidPhoneNumber = (phone) => /^(\+234|0)[1-9]\d{9}$/.test(phone.replace(/[^\d+]/g, ''));

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, isLoading, error, updateProfile, uploadProfileImage } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessDescription: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
      });
      setSelectedImage(user.profileImage?.url || null);
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid Nigerian phone number';
    }

    if (user?.role === 'service_provider') {
      if (!formData.businessName.trim()) {
        errors.businessName = 'Business name is required';
      }

      if (!formData.businessDescription.trim()) {
        errors.businessDescription = 'Business description is required';
      } else if (formData.businessDescription.trim().length < 20) {
        errors.businessDescription = 'Description must be at least 20 characters';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields and try again');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };

      if (user?.role === 'service_provider') {
        updateData.businessName = formData.businessName.trim();
        updateData.businessDescription = formData.businessDescription.trim();
      }

      await updateProfile(updateData);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setSelectedImage(asset.uri);

    const uri = asset.uri;
    const fileName = uri.split('/').pop() || `profile-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('profileImage', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: fileName,
      type,
    });

    try {
      await uploadProfileImage(formData);
      Alert.alert('Success', 'Profile photo uploaded successfully!');
    } catch (uploadError) {
      Alert.alert('Upload Failed', uploadError.message || 'Unable to upload profile photo.');
    }
  };

  const isServiceProvider = user?.role === 'service_provider';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-6 pb-8 rounded-b-4xl shadow-2xl">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-3 active:bg-white/20 rounded-full"
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-black ml-4">Edit Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Error Message */}
        {error && <ErrorMessage error={error} />}

        <View className="px-6 py-8">
          {/* Profile Picture Section */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 mb-8 items-center border-2 border-green-100">
            <View className="bg-white rounded-full p-1 mb-4">
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: 110, height: 110, borderRadius: 999 }}
                />
              ) : (
                <View className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-6 mb-2 shadow-lg">
                  <MaterialCommunityIcons name="account" size={48} color="white" />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handlePickProfileImage}
              className="bg-gradient-to-r from-green-600 to-green-500 rounded-full px-6 py-3 shadow-lg mb-3"
            >
              <Text className="text-white font-black">Change Photo</Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs font-medium">JPG, PNG up to 5MB</Text>
          </View>

          {/* Personal Information */}
          <View className="mb-8">
            <Text className="text-lg font-black text-gray-900 mb-4">Personal Information</Text>

            <View className="bg-gray-50 rounded-3xl p-7 shadow-lg">
              {/* Name Row */}
              <View className="flex-row gap-4 mb-2">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChangeText={(text) => {
                      setFormData({ ...formData, firstName: text });
                      if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: null });
                    }}
                    icon="account"
                    error={formErrors.firstName}
                    containerStyle="mb-0"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChangeText={(text) => {
                      setFormData({ ...formData, lastName: text });
                      if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: null });
                    }}
                    icon="account"
                    error={formErrors.lastName}
                    containerStyle="mb-0"
                  />
                </View>
              </View>

              {/* Email */}
              <Input
                label="Email Address"
                placeholder="your@email.com"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                }}
                keyboardType="email-address"
                icon="email"
                error={formErrors.email}
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                placeholder="+234 801 234 5678"
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  setFormData({ ...formData, phoneNumber: text });
                  if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: null });
                }}
                keyboardType="phone-pad"
                icon="phone"
                error={formErrors.phoneNumber}
              />
            </View>
          </View>

          {/* Business Information */}
          {isServiceProvider && (
            <View className="mb-8">
              <Text className="text-lg font-black text-gray-900 mb-4">Business Information</Text>

              <View className="bg-gray-50 rounded-3xl p-7 shadow-lg">
                <Input
                  label="Business Name"
                  placeholder="Your business name"
                  value={formData.businessName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, businessName: text });
                    if (formErrors.businessName) setFormErrors({ ...formErrors, businessName: null });
                  }}
                  icon="briefcase"
                  error={formErrors.businessName}
                />

                <View className="mt-0">
                  <Text className="text-gray-700 font-semibold text-sm mb-3">Business Description</Text>
                  <View className="bg-white rounded-2xl border-2 border-gray-200 px-5 py-4 focus:border-green-500">
                    <Text className="text-gray-700 text-base min-h-24">
                      {formData.businessDescription || 'Describe your services in detail...'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-500 text-xs font-medium">
                      {formData.businessDescription.length}/500 characters
                    </Text>
                    {formErrors.businessDescription && (
                      <Text className="text-red-600 text-xs font-semibold">
                        {formErrors.businessDescription}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Account Status */}
          <View className="mb-8">
            <Text className="text-lg font-black text-gray-900 mb-4">Account Status</Text>

            <View className="gap-3">
              {/* Account Type */}
              <View className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 flex-row items-center justify-between border-l-4 border-blue-500">
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-500 rounded-full p-3 mr-4">
                    <MaterialCommunityIcons name="account-tie" size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-xs font-medium">Account Type</Text>
                    <Text className="text-gray-900 font-bold text-base capitalize mt-1">
                      {user?.role === 'service_provider' ? '🏢 Service Provider' : '👤 Client'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Email Verified */}
              <View className={`rounded-2xl p-5 flex-row items-center justify-between border-l-4 ${
                user?.emailVerified
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500'
              }`}>
                <View className="flex-row items-center flex-1">
                  <View className={`rounded-full p-3 mr-4 ${
                    user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    <MaterialCommunityIcons
                      name={user?.emailVerified ? 'check-circle' : 'email-alert'}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-xs font-medium">Email Verification</Text>
                    <Text className={`font-bold text-base mt-1 ${
                      user?.emailVerified ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {user?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Phone Verified */}
              <View className={`rounded-2xl p-5 flex-row items-center justify-between border-l-4 ${
                user?.phoneVerified
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500'
              }`}>
                <View className="flex-row items-center flex-1">
                  <View className={`rounded-full p-3 mr-4 ${
                    user?.phoneVerified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    <MaterialCommunityIcons
                      name={user?.phoneVerified ? 'check-circle' : 'phone-alert'}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-xs font-medium">Phone Verification</Text>
                    <Text className={`font-bold text-base mt-1 ${
                      user?.phoneVerified ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {user?.phoneVerified ? '✓ Verified' : '⚠ Not Verified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 py-6 gap-3 border-t border-gray-100">
        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveProfile}
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

export default EditProfileScreen;
