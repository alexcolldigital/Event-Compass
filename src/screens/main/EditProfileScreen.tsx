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
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../context/authStore.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useTheme } from '../../context/ThemeContext';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isValidPhoneNumber = (phone) => /^\+?234\d{10}|0\d{10}$/.test(phone.replace(/[^\d+]/g, ''));

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, isLoading, error, updateProfile } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#161e2c' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    primary: '#16a34a',
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessDescription: '',
  });

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

  const isServiceProvider = user?.role === 'service_provider';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.header, { backgroundColor: colors.primary }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 24 }]}> 
        {error ? <ErrorMessage error={error} /> : null}

        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }]}> 
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}> 
              <MaterialCommunityIcons name="account" size={44} color="white" />
            </View>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
              <Text style={styles.photoButtonText}>Change Photo</Text>
            </TouchableOpacity>
            <Text style={[styles.photoHint, { color: colors.muted }]}>JPG, PNG up to 5MB</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.row}>
              <View style={styles.halfWidth}>
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
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <View style={styles.halfWidth}>
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
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>

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

            <Input
              label="Phone Number"
              placeholder="+234 (0) 123 4567"
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

          {isServiceProvider && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Business Information</Text>
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
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

                <Input
                  label="Business Description"
                  placeholder="Describe your services in detail..."
                  value={formData.businessDescription}
                  onChangeText={(text) => {
                    setFormData({ ...formData, businessDescription: text });
                    if (formErrors.businessDescription) setFormErrors({ ...formErrors, businessDescription: null });
                  }}
                  multiline
                  numberOfLines={4}
                  icon="text-box-outline"
                  error={formErrors.businessDescription}
                />
              </View>
            </>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Account Status</Text>
          <View style={{ gap: 12 }}>
            <View style={[styles.statusCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}> 
              <View style={styles.statusLeft}> 
                <View style={[styles.statusIcon, { backgroundColor: '#2563eb' }]}> 
                  <MaterialCommunityIcons name="account-tie" size={20} color="white" />
                </View>
                <View>
                  <Text style={[styles.statusLabel, { color: colors.muted }]}>Account Type</Text>
                  <Text style={[styles.statusValue, { color: colors.text }]}> 
                    {user?.role === 'service_provider' ? 'Service Provider' : 'Client'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.statusCard, { backgroundColor: user?.isEmailVerified ? '#ecfdf5' : '#fef3c7', borderColor: user?.isEmailVerified ? '#bbf7d0' : '#fde68a' }]}> 
              <View style={styles.statusLeft}> 
                <View style={[styles.statusIcon, { backgroundColor: user?.isEmailVerified ? '#16a34a' : '#d97706' }]}> 
                  <MaterialCommunityIcons name={user?.isEmailVerified ? 'check-circle' : 'email-alert'} size={20} color="white" />
                </View>
                <View>
                  <Text style={[styles.statusLabel, { color: colors.muted }]}>Email Verification</Text>
                  <Text style={[styles.statusValue, { color: user?.isEmailVerified ? '#166534' : '#92400e' }]}> 
                    {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.statusCard, { backgroundColor: user?.isPhoneVerified ? '#ecfdf5' : '#fef3c7', borderColor: user?.isPhoneVerified ? '#bbf7d0' : '#fde68a' }]}> 
              <View style={styles.statusLeft}> 
                <View style={[styles.statusIcon, { backgroundColor: user?.isPhoneVerified ? '#16a34a' : '#d97706' }]}> 
                  <MaterialCommunityIcons name={user?.isPhoneVerified ? 'check-circle' : 'phone-alert'} size={20} color="white" />
                </View>
                <View>
                  <Text style={[styles.statusLabel, { color: colors.muted }]}>Phone Verification</Text>
                  <Text style={[styles.statusValue, { color: user?.isPhoneVerified ? '#166534' : '#92400e' }]}> 
                    {user?.isPhoneVerified ? 'Verified' : 'Not Verified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}> 
        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveProfile}
          isLoading={isSaving}
          variant="primary"
          fullWidth
          size="lg"
          style={styles.footerButton}
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 22, paddingTop: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14 },
  headerTitle: { color: 'white', fontSize: 28, fontWeight: '800', marginLeft: 16 },
  content: { paddingHorizontal: 18, paddingTop: 20 },
  section: { gap: 18 },
  profileCard: { borderRadius: 30, padding: 24, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  avatarCircle: { width: 96, height: 96, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  photoButton: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  photoButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  photoHint: { fontSize: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 28, padding: 22, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  halfWidth: { flex: 1 },
  statusCard: { borderRadius: 24, padding: 18, borderWidth: 1 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statusValue: { fontSize: 15, fontWeight: '800' },
  footer: { paddingHorizontal: 18, paddingVertical: 18, borderTopWidth: 1, backgroundColor: 'transparent', gap: 12 },
  footerButton: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
});

export default EditProfileScreen;
