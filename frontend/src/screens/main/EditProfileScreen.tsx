/**
 * Edit Profile Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import Input from '../../components/Input.jsx';
import PhoneCountryInput from '../../components/PhoneCountryInput.jsx';
import Button from '../../components/Button.jsx';
import { DEFAULT_COUNTRY } from '../../utils/countryPhoneOptions.js';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const isValidPhoneNumber = (phone: string) =>
  /^(\+234|0)[1-9]\d{9}$/.test(phone.replace(/[^\d+]/g, ''));

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile, uploadProfileImage } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessDescription: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      const userCountry = user.countryCode ?
        require('../../utils/countryPhoneOptions.js').COUNTRY_PHONE_OPTIONS.find((country) => country.code === user.countryCode) :
        DEFAULT_COUNTRY;

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber ? user.phoneNumber.replace(new RegExp(`^${(user.dialCode || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '').trim() : '',
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
      });
      setSelectedCountry(userCountry || DEFAULT_COUNTRY);
      setSelectedImage(user.profileImage?.url || null);
    }
  }, [user]);

  const handlePhoneChange = (text: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: text.replace(/\D/g, '') }));
    if (formErrors.phoneNumber) setFormErrors((e) => ({ ...e, phoneNumber: null }));
  };

  const handleCountryChange = (country: typeof DEFAULT_COUNTRY) => {
    setSelectedCountry(country);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    else if (!isValidPhoneNumber(`${selectedCountry.dialCode}${formData.phoneNumber}`)) errors.phoneNumber = 'Invalid phone number for the selected country';
    if (user?.role === 'service_provider') {
      if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
      if (!formData.businessDescription.trim()) errors.businessDescription = 'Business description is required';
      else if (formData.businessDescription.trim().length < 20) errors.businessDescription = 'Description must be at least 20 characters';
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
      const updateData: Record<string, string> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: `${selectedCountry.dialCode} ${formData.phoneNumber.trim()}`.trim(),
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        dialCode: selectedCountry.dialCode,
      };
      if (user?.role === 'service_provider') {
        updateData.businessName = formData.businessName.trim();
        updateData.businessDescription = formData.businessDescription.trim();
      }
      await updateProfile(updateData);
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickProfileImage = async () => {
    if (isUploadingImage) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    // Show preview immediately
    setSelectedImage(asset.uri);

    const uri = asset.uri;
    const fileName = uri.split('/').pop() || `profile-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    const imageForm = new FormData();
    imageForm.append('profileImage', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: fileName,
      type,
    } as any);

    setIsUploadingImage(true);
    try {
      const response = await uploadProfileImage(imageForm);
      // Use the Cloudinary URL returned from server
      if (response?.user?.profileImage?.url) {
        setSelectedImage(response.user.profileImage.url);
      }
      Alert.alert('Success', 'Profile photo updated!');
    } catch (uploadError: any) {
      // Revert to previous image on failure
      setSelectedImage(user?.profileImage?.url || null);
      Alert.alert('Upload Failed', uploadError.message || 'Unable to upload profile photo.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isServiceProvider = user?.role === 'service_provider';

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handlePickProfileImage}
            disabled={isUploadingImage}
            style={styles.avatarWrapper}
            activeOpacity={0.8}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={52} color="#fff" />
              </View>
            )}
            {/* Camera overlay */}
            <View style={styles.cameraOverlay}>
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="camera" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>
            {isUploadingImage ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(text: string) => {
                    setFormData((prev) => ({ ...prev, firstName: text }));
                    if (formErrors.firstName) setFormErrors((e) => ({ ...e, firstName: null }));
                  }}
                  icon="account"
                  error={formErrors.firstName}
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(text: string) => {
                    setFormData((prev) => ({ ...prev, lastName: text }));
                    if (formErrors.lastName) setFormErrors((e) => ({ ...e, lastName: null }));
                  }}
                  icon="account"
                  error={formErrors.lastName}
                />
              </View>
            </View>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text: string) => {
                setFormData((prev) => ({ ...prev, email: text }));
                if (formErrors.email) setFormErrors((e) => ({ ...e, email: null }));
              }}
              keyboardType="email-address"
              icon="email"
              error={formErrors.email}
            />
            <PhoneCountryInput
              label="Phone Number"
              placeholder="8012345678"
              value={formData.phoneNumber}
              onChangeText={handlePhoneChange}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              error={formErrors.phoneNumber}
            />
          </View>
        </View>

        {/* Business Information */}
        {isServiceProvider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            <View style={styles.card}>
              <Input
                label="Business Name"
                placeholder="Your business name"
                value={formData.businessName}
                onChangeText={(text: string) => {
                  setFormData((prev) => ({ ...prev, businessName: text }));
                  if (formErrors.businessName) setFormErrors((e) => ({ ...e, businessName: null }));
                }}
                icon="briefcase"
                error={formErrors.businessName}
              />
              <Text style={styles.fieldLabel}>Business Description</Text>
              <TextInput
                multiline
                numberOfLines={4}
                maxLength={500}
                placeholder="Describe your services in detail..."
                placeholderTextColor="#9ca3af"
                value={formData.businessDescription}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, businessDescription: text }));
                  if (formErrors.businessDescription) setFormErrors((e) => ({ ...e, businessDescription: null }));
                }}
                style={[
                  styles.textArea,
                  formErrors.businessDescription ? styles.textAreaError : null,
                ]}
              />
              <View style={styles.textAreaFooter}>
                <Text style={styles.charCount}>{formData.businessDescription.length}/500</Text>
                {formErrors.businessDescription ? (
                  <Text style={styles.fieldError}>{formErrors.businessDescription}</Text>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: '#3b82f6' }]}>
              <MaterialCommunityIcons name="account-tie" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.statusLabel}>Account Type</Text>
              <Text style={styles.statusValue}>
                {isServiceProvider ? '🏢 Service Provider' : '👤 Client'}
              </Text>
            </View>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusIcon, { backgroundColor: user?.isEmailVerified ? '#16a34a' : '#f59e0b' }]}>
              <MaterialCommunityIcons
                name={user?.isEmailVerified ? 'check-circle' : 'email-alert'}
                size={20}
                color="#fff"
              />
            </View>
            <View>
              <Text style={styles.statusLabel}>Email Verification</Text>
              <Text style={[styles.statusValue, { color: user?.isEmailVerified ? '#16a34a' : '#d97706' }]}>
                {user?.isEmailVerified ? '✓ Verified' : '⚠ Not Verified'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveProfile}
          isLoading={isSaving}
          variant="primary"
          fullWidth
          size="lg"
        />
        <View style={{ height: 10 }} />
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
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7f2' },
  header: {
    backgroundColor: '#1f7a4d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 6, marginRight: 10 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1f7a4d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f7a4d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  photoHint: { color: '#9ca3af', fontSize: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameField: { flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaError: { borderColor: '#dc2626' },
  textAreaFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  charCount: { color: '#9ca3af', fontSize: 12 },
  fieldError: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  statusIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  statusValue: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
});
