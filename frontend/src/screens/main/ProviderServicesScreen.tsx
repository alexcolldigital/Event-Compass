import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useServiceStore } from '../../context/serviceStore.js';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { MarketplaceCard } from '../../components/Card.jsx';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import Toast, { ToastType } from '../../components/Toast';
import { fetchLocations, getLgasForState, getTownsForLga } from '../../utils/nigeriaLocations.js';
import { serviceAPI } from '../../services/api.js';
import { SERVICE_CATEGORIES } from '../../utils/constants.js';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const serviceTypeOptions = ['Physical Item Rental', 'Professional Service', 'Package (Service + Items)'];
const pricingTypeOptions = ['Fixed Price', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Per Guest', 'Per Item', 'Negotiable'];
const currencyOptions = ['NGN', 'USD', 'EUR', 'GHS'];
const durationOptions = ['1 hour', '2 hours', '4 hours', 'Full day', 'Custom'];
const availabilityStatusOptions = ['Available', 'Busy', 'Temporarily unavailable'];
const weekdayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fallbackCategories = SERVICE_CATEGORIES;

const initialFormState = {
  name: '',
  description: '',
  category: '',
  subCategory: '',
  pricingType: 'Fixed Price',
  basePrice: '',
  currency: 'NGN',
  duration: '1 hour',
  availabilityStatus: 'Available',
  minBookingAmount: '',
  discount: '',
  securityDeposit: '',
  coverImage: '',
  galleryImages: [] as string[],
  videoLink: '',
  availableQuantity: '',
  enableInventory: false,
  availableStock: '',
  reservedStock: '',
  damagedStock: '',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  startTime: '',
  endTime: '',
  recurringAvailability: true,
  country: 'Nigeria',
  state: '',
  city: '',
  lga: '',
  address: '',
  radiusCovered: '',
  nationwide: true,
};

export default function ProviderServicesScreen({ navigation, route }: { navigation: any; route: any }) {
  const { myServices, getMyServices, createService, updateService, uploadServiceMedia, isLoading, error } = useServiceStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [editFullService, setEditFullService] = useState<any>(null);
  const [editFormState, setEditFormState] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [showLgaMenu, setShowLgaMenu] = useState(false);
  const [showTownMenu, setShowTownMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSubCategoryMenu, setShowSubCategoryMenu] = useState(false);
  const [showEditCategoryMenu, setShowEditCategoryMenu] = useState(false);
  const [showEditSubCategoryMenu, setShowEditSubCategoryMenu] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({ visible: false, type: 'success', message: '' });

  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  const lgaOptions = getLgasForState(locations, formState.state);
  const townOptions = getTownsForLga(locations, formState.state, formState.lga);

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
  };

  useEffect(() => {
    getMyServices().catch(() => {});
    fetchLocations().then(setLocations).catch(() => {});
    fetchAvailableCategories();

    if (route?.params?.showForm) {
      setShowForm(true);
    }
  }, [route?.params?.showForm]);

  const fetchAvailableCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await serviceAPI.getAvailableCategories();
      const categoryList = response?.categories?.length ? response.categories : fallbackCategories;
      setAvailableCategories(categoryList);
      setCategories(categoryList.map((cat: any) => cat.name).filter(Boolean));
    } catch (error) {
      console.log('Failed to fetch categories:', error);
      setAvailableCategories(fallbackCategories);
      setCategories(fallbackCategories.map((cat: any) => cat.name).filter(Boolean));
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedCategoryData = availableCategories.find((cat: any) => cat.name === formState.category) || null;
  const subcategoryOptions = selectedCategoryData?.subcategories?.map((sub: any) => typeof sub === 'string' ? sub : sub.name).filter(Boolean) || [];
  const selectedEditCategoryData = availableCategories.find((cat: any) => cat.name === editFormState?.category) || null;
  const editSubcategoryOptions = selectedEditCategoryData?.subcategories?.map((sub: any) => typeof sub === 'string' ? sub : sub.name).filter(Boolean) || [];

  const handleCategoryChange = (category: string) => {
    updateField('category', category);
    updateField('subCategory', '');
    setShowCategoryMenu(false);
  };

  const handleSubCategoryChange = (subcategory: string) => {
    updateField('subCategory', subcategory);
    setShowSubCategoryMenu(false);
  };

  const handleEditCategoryChange = (category: string) => {
    setEditFormState((prev: any) => ({ ...prev, category, subCategory: '' }));
    setShowEditCategoryMenu(false);
  };

  const handleEditSubCategoryChange = (subcategory: string) => {
    setEditFormState((prev: any) => ({ ...prev, subCategory: subcategory }));
    setShowEditSubCategoryMenu(false);
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleWorkingDay = (day: string) => {
    setFormState((prev: any) => {
      const currentDays = prev.workingDays || [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((item: string) => item !== day)
        : [...currentDays, day];
      return { ...prev, workingDays: nextDays };
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.name.trim()) nextErrors.name = 'Service name is required';
    if (!formState.description.trim()) nextErrors.description = 'Description is required';
    if (!formState.category.trim()) nextErrors.category = 'Category is required';
    if (formState.category.trim() && !categories.includes(formState.category.trim())) {
      nextErrors.category = 'Select a category from the available options';
    }
    if (formState.subCategory.trim() && !subcategoryOptions.includes(formState.subCategory.trim())) {
      nextErrors.subCategory = 'Select a valid subcategory for this category';
    }
    if (!formState.coverImage.trim()) nextErrors.coverImage = 'Cover image URL is required';
    if (!formState.basePrice.trim() || Number.isNaN(Number(formState.basePrice)) || Number(formState.basePrice) <= 0) {
      nextErrors.basePrice = 'Enter a valid price';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset: any) => asset.uri);
      setFormState((prev: any) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...uris],
      }));
    }
  };

  const uploadSelectedImages = async (serviceId: string) => {
    if (!formState.galleryImages.length) return;

    const formData = new FormData();
    formState.galleryImages.forEach((uri: string, index: number) => {
      const fileName = uri.split('/').pop() || `image-${index + 1}.jpg`;
      formData.append('images', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      } as any);
    });

    await uploadServiceMedia(serviceId, formData);
  };

  const handleCreateService = async () => {
    if (!validateForm()) return;

    try {
      const galleryImages = (formState.galleryImages || []).filter(Boolean);

      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim(),
        category: formState.category.trim(),
        subCategory: formState.subCategory.trim(),
        pricing: {
          type: formState.pricingType,
          basePrice: Number(formState.basePrice),
          unit: 'booking',
          currency: formState.currency,
          minBookingAmount: formState.minBookingAmount ? Number(formState.minBookingAmount) : undefined,
          discount: formState.discount ? Number(formState.discount) : undefined,
          securityDeposit: formState.securityDeposit ? Number(formState.securityDeposit) : undefined,
        },
        availability: {
          isAvailable: formState.availabilityStatus === 'Available',
          status: formState.availabilityStatus,
          duration: formState.duration,
          workingDays: formState.workingDays,
          startTime: formState.startTime.trim(),
          endTime: formState.endTime.trim(),
          recurringAvailability: formState.recurringAvailability,
        },
        inventory: {
          enabled: formState.enableInventory,
          availableStock: formState.availableStock ? Number(formState.availableStock) : undefined,
          reservedStock: formState.reservedStock ? Number(formState.reservedStock) : undefined,
          damagedStock: formState.damagedStock ? Number(formState.damagedStock) : undefined,
        },
        quantity: formState.availableQuantity ? Number(formState.availableQuantity) : undefined,
        media: {
          coverImage: formState.coverImage.trim(),
          galleryImages,
          videoLink: formState.videoLink.trim(),
        },
        images: [
          ...(formState.coverImage ? [{ url: formState.coverImage.trim(), isMain: true }] : []),
          ...galleryImages.map((url: string) => ({ url, isMain: false })),
        ],
        coverageArea: {
          country: formState.country.trim() || 'Nigeria',
          state: formState.state.trim(),
          city: formState.city.trim(),
          lga: formState.lga.trim(),
          address: formState.address.trim(),
          radiusCovered: formState.radiusCovered.trim(),
          nationwide: formState.nationwide,
        },
      };

      const response = await createService(payload);
      if (response?.service?._id) {
        await uploadSelectedImages(response.service._id);
      }

      setFormState(initialFormState);
      setShowForm(false);
      showToast('success', 'Service created successfully. Your new service is now visible to customers.');
      Alert.alert(
        '✓ Service Created',
        `Your service "${payload.name}" has been successfully added and is now visible to customers!`,
        [{ text: 'Great!', onPress: () => {} }]
      );
      getMyServices().catch(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      showToast('error', `Unable to create service: ${message}`);
      Alert.alert(
        '✗ Service Creation Failed',
        `Failed to add your service. ${message}. Please check all required fields and try again.`,
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  const handleSavePrice = async () => {
    const price = Number(priceDraft);
    if (!editingService || !Number.isFinite(price) || price <= 0) {
      Alert.alert('✗ Invalid Price', 'Please enter a price greater than zero.');
      return;
    }

    try {
      setIsSavingPrice(true);
      await updateService(editingService._id, {
        pricing: { ...editingService.pricing, basePrice: price },
      });
      setEditingService(null);
      showToast('success', `Price updated to ₦${price.toLocaleString()}`);
      Alert.alert('✓ Price Updated', `Your service price has been updated to ₦${price.toLocaleString()}.`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Please try again.';
      showToast('error', `Update failed: ${errMsg}`);
      Alert.alert('✗ Unable to Update Price', errMsg);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const openEditFull = (service: any) => {
    setEditFullService(service);
    setEditFormState({
      name: service.name || '',
      shortDescription: service.shortDescription || '',
      description: service.description || '',
      category: service.category || '',
      subCategory: service.subCategory || '',
      serviceType: service.serviceType || '',
      basePrice: String(service.pricing?.basePrice || ''),
      currency: service.pricing?.currency || 'NGN',
      availabilityStatus: service.availability?.isAvailable !== false ? 'Available' : 'Unavailable',
    });
  };

  const handleUpdateService = async () => {
    if (!editFullService) return;
    const price = Number(editFormState.basePrice);
    if (!editFormState.name.trim()) { Alert.alert('Validation', 'Service name is required.'); return; }
    if (!editFormState.description.trim()) { Alert.alert('Validation', 'Description is required.'); return; }
    if (!editFormState.category.trim() || !categories.includes(editFormState.category.trim())) { Alert.alert('Validation', 'Select a category from the available options.'); return; }
    if (editFormState.subCategory.trim() && !editSubcategoryOptions.includes(editFormState.subCategory.trim())) { Alert.alert('Validation', 'Select a valid subcategory for this category.'); return; }
    if (!Number.isFinite(price) || price <= 0) { Alert.alert('Validation', 'Enter a valid price.'); return; }

    try {
      setIsUpdating(true);
      await updateService(editFullService._id, {
        name: editFormState.name.trim(),
        description: editFormState.description.trim(),
        category: editFormState.category.trim(),
        subCategory: editFormState.subCategory.trim(),
        pricing: {
          ...editFullService.pricing,
          basePrice: price,
          unit: editFullService.pricing?.unit || 'booking',
          currency: editFormState.currency,
        },
        availability: {
          ...editFullService.availability,
          isAvailable: editFormState.availabilityStatus === 'Available',
        },
      });
      setEditFullService(null);
      showToast('success', 'Service updated successfully.');
      Alert.alert(
        '✓ Service Updated',
        `Your service has been successfully updated and changes are now live!`,
        [{ text: 'Excellent!', onPress: () => {} }]
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Please try again.';
      showToast('error', `Update failed: ${errMsg}`);
      Alert.alert('✗ Update Failed', errMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteService = (service: any) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteService: del } = useServiceStore.getState();
              await del(service._id);
              showToast('success', 'Service deleted successfully.');
              Alert.alert(
                '✓ Service Deleted',
                `"${service.name}" has been removed from your services.`,
                [{ text: 'OK', onPress: () => {} }]
              );
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : 'Please try again.';
              showToast('error', `Delete failed: ${errMsg}`);
              Alert.alert('✗ Delete Failed', errMsg);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBackButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Your services</Text>
              <Text style={styles.heroSubtitle}>Manage what you provide and add new offerings.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowForm((value) => !value)} style={[styles.actionButton, styles.actionButtonPrimary]}>
              <MaterialCommunityIcons name={showForm ? 'close' : 'plus'} size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{showForm ? 'Close' : 'Add Service'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showForm ? (
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add a new service</Text>
            {submissionStatus ? (
              <View style={[styles.notificationBar, submissionStatus.type === 'success' ? styles.notificationSuccess : styles.notificationError, { backgroundColor: submissionStatus.type === 'success' ? '#ecfdf5' : '#fef2f2', borderColor: submissionStatus.type === 'success' ? '#a7f3d0' : '#fecaca' }]}> 
                <Text style={[styles.notificationText, { color: submissionStatus.type === 'success' ? '#115e59' : '#991b1b' }]}>{submissionStatus.message}</Text>
              </View>
            ) : null}
            {error ? <Text style={[styles.formError, { color: '#dc2626' }]}>{error}</Text> : null}

            <Text style={[styles.sectionLabel, { color: colors.text }]}>1. Basic information</Text>
            <Input
              label="Service Name"
              placeholder="Wedding photography, luxury chair rental"
              value={formState.name}
              onChangeText={(text) => updateField('name', text)}
              icon="briefcase-outline"
              error={formErrors.name}
            />
            <Input
              label="Description"
              placeholder="Describe your service, experience, deliverables, and what clients should expect"
              value={formState.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={5}
              icon="text-box-outline"
              error={formErrors.description}
            />
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Category *</Text>
              {loadingCategories ? (
                <Text style={styles.mutedText}>Loading categories...</Text>
              ) : categories.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setShowCategoryMenu(true)}
                  style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.dropdownValue, { color: formState.category ? colors.text : colors.muted }]}>
                    {formState.category || 'Select a category'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text} />
                </TouchableOpacity>
              ) : (
                <Text style={styles.errorText}>No categories available. Please contact support.</Text>
              )}
              {formErrors.category ? <Text style={styles.errorText}>{formErrors.category}</Text> : null}
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Subcategory (Optional)</Text>
              <TouchableOpacity
                onPress={() => formState.category && subcategoryOptions.length > 0 && setShowSubCategoryMenu(true)}
                style={[
                  styles.dropdownTrigger,
                  { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                  (!formState.category || subcategoryOptions.length === 0) && styles.disabledDropdownTrigger,
                ]}
                activeOpacity={formState.category && subcategoryOptions.length > 0 ? 0.9 : 1}
              >
                <Text style={[styles.dropdownValue, { color: formState.subCategory ? colors.text : colors.muted }]}>
                  {formState.subCategory || (formState.category ? 'Select a subcategory' : 'Select category first')}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text} />
              </TouchableOpacity>
              {formState.category && subcategoryOptions.length === 0 ? (
                <Text style={styles.mutedText}>No subcategories available for this category.</Text>
              ) : null}
              {formErrors.subCategory ? <Text style={styles.errorText}>{formErrors.subCategory}</Text> : null}
            </View>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>2. Media and portfolio</Text>
            <Input
              label="Cover Image URL"
              placeholder="https://images.example.com/cover.jpg"
              value={formState.coverImage}
              onChangeText={(text) => updateField('coverImage', text)}
              icon="image-outline"
              error={formErrors.coverImage}
            />
            <TouchableOpacity onPress={pickImages} style={styles.uploadButton}>
              <MaterialCommunityIcons name="image-multiple" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload gallery images</Text>
            </TouchableOpacity>
            {formState.galleryImages.length > 0 ? (
              <View style={styles.imagePreviewRow}>
                {formState.galleryImages.slice(0, 4).map((uri: string, index: number) => (
                  <View key={`${uri}-${index}`} style={styles.imagePreviewChip}>
                    <Text style={styles.imagePreviewText}>{`Image ${index + 1}`}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Input
              label="Video Link"
              placeholder="Optional demo or portfolio video link"
              value={formState.videoLink}
              onChangeText={(text) => updateField('videoLink', text)}
              icon="video-outline"
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>3. Pricing</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Pricing Type</Text>
              {renderChoicePills(pricingTypeOptions, formState.pricingType, (value) => updateField('pricingType', value), colors)}
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                <Input
                  label="Base Price"
                  placeholder="150000"
                  value={formState.basePrice}
                  onChangeText={(text) => updateField('basePrice', text)}
                  keyboardType="numeric"
                  icon="cash"
                  error={formErrors.basePrice}
                />
              </View>
              <View style={styles.gridColumn}>
                <Input
                  label="Currency"
                  placeholder="NGN"
                  value={formState.currency}
                  editable={false}
                  icon="currency-ngn"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsCurrencyMenuOpen(true)}
                  style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                >
                  <Text style={[styles.dropdownValue, { color: colors.text }]}>{formState.currency}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                <Input
                  label="Duration"
                  placeholder="1 hour"
                  value={formState.duration}
                  editable={false}
                  icon="clock-outline"
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsDurationMenuOpen(true)}
                  style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                >
                  <Text style={[styles.dropdownValue, { color: colors.text }]}>{formState.duration}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                <Input
                  label="Minimum Booking"
                  placeholder="50000"
                  value={formState.minBookingAmount}
                  onChangeText={(text) => updateField('minBookingAmount', text)}
                  keyboardType="numeric"
                  icon="cash-minus"
                />
              </View>
              <View style={styles.gridColumn}>
                <Input
                  label="Discount"
                  placeholder="10000"
                  value={formState.discount}
                  onChangeText={(text) => updateField('discount', text)}
                  keyboardType="numeric"
                  icon="sale"
                />
              </View>
            </View>
            <Input
              label="Security Deposit"
              placeholder="50000"
              value={formState.securityDeposit}
              onChangeText={(text) => updateField('securityDeposit', text)}
              keyboardType="numeric"
              icon="shield-check-outline"
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>4. Rental and inventory</Text>
            <Input
              label="Available Quantity"
              placeholder="200"
              value={formState.availableQuantity}
              onChangeText={(text) => updateField('availableQuantity', text)}
              keyboardType="numeric"
              icon="counter"
            />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Inventory Tracking</Text>
              <TouchableOpacity
                onPress={() => updateField('enableInventory', !formState.enableInventory)}
                style={[styles.toggle, { backgroundColor: formState.enableInventory ? colors.primary : colors.surfaceAlt }]}
              >
                <Text style={[styles.toggleText, { color: formState.enableInventory ? '#fff' : colors.text }]}> {formState.enableInventory ? 'Yes' : 'No'} </Text>
              </TouchableOpacity>
            </View>
            {formState.enableInventory ? (
              <View style={styles.gridRow}>
                <View style={styles.gridColumn}>
                  <Input label="Available Stock" placeholder="150" value={formState.availableStock} onChangeText={(text) => updateField('availableStock', text)} keyboardType="numeric" icon="package-variant" />
                </View>
                <View style={styles.gridColumn}>
                  <Input label="Reserved Stock" placeholder="20" value={formState.reservedStock} onChangeText={(text) => updateField('reservedStock', text)} keyboardType="numeric" icon="lock-outline" />
                </View>
              </View>
            ) : null}
            {formState.enableInventory ? (
              <Input label="Damaged Stock" placeholder="5" value={formState.damagedStock} onChangeText={(text) => updateField('damagedStock', text)} keyboardType="numeric" icon="alert-circle-outline" />
            ) : null}

            <Text style={[styles.sectionLabel, { color: colors.text }]}>5. Availability</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Working Days</Text>
              <View style={styles.pillRow}>
                {weekdayOptions.map((day) => {
                  const active = formState.workingDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleWorkingDay(day)}
                      style={[
                        styles.pill,
                        active && styles.pillActive,
                        { borderColor: colors.border, backgroundColor: active ? colors.primary : colors.surfaceAlt },
                      ]}
                    >
                      <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                <Input label="Start Time" placeholder="09:00" value={formState.startTime} onChangeText={(text) => updateField('startTime', text)} icon="clock-start" />
              </View>
              <View style={styles.gridColumn}>
                <Input label="End Time" placeholder="18:00" value={formState.endTime} onChangeText={(text) => updateField('endTime', text)} icon="clock-end" />
              </View>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Availability Status</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsStatusMenuOpen(true)}
                style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={[styles.dropdownValue, { color: colors.text }]}>{formState.availabilityStatus}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Recurring Availability</Text>
              <TouchableOpacity
                onPress={() => updateField('recurringAvailability', !formState.recurringAvailability)}
                style={[styles.toggle, { backgroundColor: formState.recurringAvailability ? colors.primary : colors.surfaceAlt }]}
              >
                <Text style={[styles.toggleText, { color: formState.recurringAvailability ? '#fff' : colors.text }]}> {formState.recurringAvailability ? 'Yes' : 'No'} </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text }]}>6. Service area</Text>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Covers all of Nigeria</Text>
              <TouchableOpacity
                onPress={() => updateField('nationwide', !formState.nationwide)}
                style={[styles.toggle, { backgroundColor: formState.nationwide ? colors.primary : colors.surfaceAlt }]}
              >
                <Text style={[styles.toggleText, { color: formState.nationwide ? '#fff' : colors.text }]}> {formState.nationwide ? 'Yes' : 'No'} </Text>
              </TouchableOpacity>
            </View>
            <Input label="Country" placeholder="Nigeria" value="Nigeria" editable={false} icon="earth" />

            {/* State dropdown */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>State</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowStateMenu(true)}
                style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              >
                <Text style={[styles.dropdownValue, { color: formState.state ? colors.text : colors.muted }]}>{formState.state || 'Select state'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* LGA dropdown */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Local Government</Text>
              <TouchableOpacity
                activeOpacity={formState.state ? 0.85 : 1}
                onPress={() => formState.state && setShowLgaMenu(true)}
                style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, opacity: formState.state ? 1 : 0.5 }]}
              >
                <Text style={[styles.dropdownValue, { color: formState.lga ? colors.text : colors.muted }]}>{formState.lga || (formState.state ? 'Select LGA' : 'Select state first')}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Town/City dropdown */}
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Town / City</Text>
              <TouchableOpacity
                activeOpacity={formState.lga ? 0.85 : 1}
                onPress={() => formState.lga && setShowTownMenu(true)}
                style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, opacity: formState.lga ? 1 : 0.5 }]}
              >
                <Text style={[styles.dropdownValue, { color: formState.city ? colors.text : colors.muted }]}>{formState.city || (formState.lga ? 'Select town' : 'Select LGA first')}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Input label="Address" placeholder="12, Adeola Odeku Street" value={formState.address} onChangeText={(text) => updateField('address', text)} icon="home-map-marker" />
            <Input label="Radius Covered" placeholder="Within 50 km" value={formState.radiusCovered} onChangeText={(text) => updateField('radiusCovered', text)} icon="radius" />

            <Button
              title={isLoading ? 'Saving service...' : 'Create service'}
              onPress={handleCreateService}
              isLoading={isLoading}
              fullWidth
              variant="primary"
              size="lg"
            />
          </View>
        ) : null}

        <View style={styles.section}>
          {renderDropdownModal(isCurrencyMenuOpen, () => setIsCurrencyMenuOpen(false), 'Select currency', currencyOptions, formState.currency, (value) => updateField('currency', value), colors)}
          {renderDropdownModal(isDurationMenuOpen, () => setIsDurationMenuOpen(false), 'Select duration', durationOptions, formState.duration, (value) => updateField('duration', value), colors)}
          {renderDropdownModal(isStatusMenuOpen, () => setIsStatusMenuOpen(false), 'Select availability status', availabilityStatusOptions, formState.availabilityStatus, (value) => updateField('availabilityStatus', value), colors)}
          {renderDropdownModal(showStateMenu, () => setShowStateMenu(false), 'Select state', locations.map((l: any) => l.state), formState.state, (v) => { updateField('state', v); updateField('lga', ''); updateField('city', ''); }, colors)}
          {renderDropdownModal(showLgaMenu, () => setShowLgaMenu(false), 'Select LGA', lgaOptions.map((l: any) => l.lga), formState.lga, (v) => { updateField('lga', v); updateField('city', ''); }, colors)}
          {renderDropdownModal(showTownMenu, () => setShowTownMenu(false), 'Select town', townOptions, formState.city, (v) => updateField('city', v), colors)}
          {renderDropdownModal(showCategoryMenu, () => setShowCategoryMenu(false), 'Select category', categories, formState.category, handleCategoryChange, colors)}
          {renderDropdownModal(showSubCategoryMenu, () => setShowSubCategoryMenu(false), 'Select subcategory', subcategoryOptions, formState.subCategory, handleSubCategoryChange, colors)}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My services</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{myServices.length} items</Text>
          </View>

          {isLoading && myServices.length === 0 ? (
            <Loading />
          ) : myServices.length > 0 ? (
            <View style={styles.itemsGrid}>
              {myServices.map((service: any) => (
                <View key={service._id}>
                  <MarketplaceCard
                    image={service.images?.[0]?.url}
                    title={service.name}
                    subtitle={service.category || service.subCategory}
                    price={service.pricing?.basePrice || 0}
                    unit={service.pricing?.unit || 'booking'}
                    category={service.category || service.subCategory}
                    badge={service.availability?.isAvailable === false ? 'Unavailable' : 'Available'}
                    onPress={() => navigation.navigate('ServiceDetail', { serviceId: service._id })}
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  />
                  <View style={styles.serviceActionRow}>
                    <TouchableOpacity
                      onPress={() => openEditFull(service)}
                      style={[styles.serviceActionBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
                      <Text style={[styles.serviceActionBtnText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteService(service)}
                      style={[styles.serviceActionBtn, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color="#dc2626" />
                      <Text style={[styles.serviceActionBtnText, { color: '#dc2626' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}> 
              <MaterialCommunityIcons name="briefcase-outline" size={56} color="#94a3b8" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No services yet</Text>
              <Text style={[styles.emptyCopy, { color: colors.muted }]}>Create your first service to start receiving bookings.</Text>
              <TouchableOpacity onPress={() => setShowForm(true)} style={styles.emptyActionButton}>
                <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                <Text style={styles.emptyActionText}>Add your first service</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Edit Service Modal */}
      <Modal visible={!!editFullService} animationType="slide" transparent={false} onRequestClose={() => !isUpdating && setEditFullService(null)}>
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
          <View style={[styles.editModalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => !isUpdating && setEditFullService(null)}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Service</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {editFormState && (
              <>
                <Input label="Service Name *" value={editFormState.name} onChangeText={(v) => setEditFormState((p: any) => ({ ...p, name: v }))} icon="briefcase-outline" />
                <Input label="Description *" value={editFormState.description} onChangeText={(v) => setEditFormState((p: any) => ({ ...p, description: v }))} icon="text-box-outline" multiline numberOfLines={4} />
                <View style={styles.fieldBlock}>
                  <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
                  {categories.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => setShowEditCategoryMenu(true)}
                      style={[styles.dropdownTrigger, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                      activeOpacity={0.9}
                    >
                      <Text style={[styles.dropdownValue, { color: editFormState.category ? colors.text : colors.muted }]}>
                        {editFormState.category || 'Select a category'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text} />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.errorText}>No categories available. Please contact support.</Text>
                  )}
                </View>
                  <View style={styles.fieldBlock}>
                    <Text style={[styles.label, { color: colors.text }]}>Subcategory</Text>
                    <TouchableOpacity
                      onPress={() => editFormState.category && editSubcategoryOptions.length > 0 && setShowEditSubCategoryMenu(true)}
                      style={[
                        styles.dropdownTrigger,
                        { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
                        (!editFormState.category || editSubcategoryOptions.length === 0) && styles.disabledDropdownTrigger,
                      ]}
                      activeOpacity={editFormState.category && editSubcategoryOptions.length > 0 ? 0.9 : 1}
                    >
                      <Text style={[styles.dropdownValue, { color: editFormState.subCategory ? colors.text : colors.muted }]}>
                        {editFormState.subCategory || (editFormState.category ? 'Select a subcategory' : 'Select category first')}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text} />
                    </TouchableOpacity>
                    {editFormState.category && editSubcategoryOptions.length === 0 ? (
                      <Text style={styles.mutedText}>No subcategories available for this category.</Text>
                    ) : null}
                  </View>
                <Input label="Base Price (₦) *" value={editFormState.basePrice} onChangeText={(v) => setEditFormState((p: any) => ({ ...p, basePrice: v }))} keyboardType="numeric" icon="cash" />
                <View style={[styles.toggleRow, { marginTop: 8 }]}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>Available for Booking</Text>
                  <TouchableOpacity
                    onPress={() => setEditFormState((p: any) => ({ ...p, availabilityStatus: p.availabilityStatus === 'Available' ? 'Unavailable' : 'Available' }))}
                    style={[styles.toggle, { backgroundColor: editFormState.availabilityStatus === 'Available' ? colors.primary : '#9ca3af' }]}
                  >
                    <Text style={[styles.toggleText, { color: '#fff' }]}>{editFormState.availabilityStatus}</Text>
                  </TouchableOpacity>
                </View>
                <Button
                  title={isUpdating ? 'Saving...' : 'Save Changes'}
                  onPress={handleUpdateService}
                  disabled={isUpdating}
                  fullWidth
                  variant="primary"
                  size="lg"
                />
              </>
            )}
          </ScrollView>
          {renderDropdownModal(showEditCategoryMenu, () => setShowEditCategoryMenu(false), 'Select category', categories, editFormState?.category || '', handleEditCategoryChange, colors)}
          {renderDropdownModal(showEditSubCategoryMenu, () => setShowEditSubCategoryMenu(false), 'Select subcategory', editSubcategoryOptions, editFormState?.subCategory || '', handleEditSubCategoryChange, colors)}
        </SafeAreaView>
      </Modal>

      <Modal visible={!!editingService} transparent animationType="fade" onRequestClose={() => !isSavingPrice && setEditingService(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !isSavingPrice && setEditingService(null)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit service price</Text>
              <TouchableOpacity onPress={() => !isSavingPrice && setEditingService(null)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalServiceName, { color: colors.muted }]}>{editingService?.name}</Text>
            <TextInput
              value={priceDraft}
              onChangeText={setPriceDraft}
              keyboardType="numeric"
              placeholder="Enter base price"
              placeholderTextColor={colors.muted}
              style={[styles.priceInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
            />
            <Button title={isSavingPrice ? 'Saving...' : 'Save price'} onPress={handleSavePrice} disabled={isSavingPrice} fullWidth />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function renderChoicePills(options: string[], selected: string, onSelect: (value: string) => void, colors: any) {
  return (
    <View style={styles.pillRow}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.pill, active && styles.pillActive, { borderColor: colors.border, backgroundColor: active ? colors.primary : colors.surfaceAlt }]}
          >
            <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function renderDropdownModal(visible: boolean, onClose: () => void, title: string, options: string[], selected: string, onSelect: (v: string) => void, colors: any) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const active = selected === option;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.85}
                  onPress={() => { onSelect(option); onClose(); }}
                  style={[styles.modalOption, active && { backgroundColor: colors.primary }, { borderColor: colors.border }]}
                >
                  <Text style={[styles.modalOptionText, active && { color: '#fff' }]}>{option}</Text>
                  {active ? <MaterialCommunityIcons name="check" size={18} color="#fff" /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  hero: { borderRadius: 28, padding: 20, marginTop: 8, marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heroBackButton: { padding: 4 },
  heroCopy: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', fontFamily: appFont },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6, fontFamily: appFont },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 10 },
  actionButtonPrimary: { backgroundColor: 'rgba(255,255,255,0.24)' },
  actionButtonText: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: appFont },
  formCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 18 },
  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: appFont },
  sectionSubtitle: { fontSize: 12, fontWeight: '700', fontFamily: appFont },
  itemsGrid: { gap: 12 },
  emptyState: { borderRadius: 22, borderWidth: 1, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, fontFamily: appFont },
  emptyCopy: { fontSize: 13, marginTop: 6, textAlign: 'center', fontFamily: appFont },
  emptyActionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1f7a4d', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
  emptyActionText: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: appFont },
  formError: { marginBottom: 12, fontSize: 13, fontWeight: '700' },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridColumn: { flex: 1 },
  fieldBlock: { marginBottom: 12 },
  sectionLabel: { fontSize: 15, fontWeight: '800', marginTop: 10, marginBottom: 10 },
  label: { marginBottom: 8, marginLeft: 2, color: '#172017', fontSize: 14, fontWeight: '800' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  pillActive: { borderColor: '#16a34a' },
  pillText: { fontSize: 12, fontWeight: '700' },
  errorText: { marginTop: 6, color: '#dc2626', fontSize: 12, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  toggleLabel: { fontSize: 14, fontWeight: '700' },
  toggle: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  toggleText: { fontSize: 13, fontWeight: '800' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1f7a4d', borderRadius: 16, paddingVertical: 12, marginBottom: 12 },
  uploadButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  imagePreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  imagePreviewChip: { backgroundColor: '#ecfdf3', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  imagePreviewText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  serviceActionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  serviceActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingVertical: 10 },
  serviceActionBtnText: { fontSize: 13, fontWeight: '800' },
  editModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  editModalTitle: { fontSize: 18, fontWeight: '800', fontFamily: appFont },
  notificationBar: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginTop: 14,
    marginBottom: 12,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  disabledDropdownTrigger: {
    opacity: 0.55,
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalServiceName: { fontSize: 13, marginBottom: 12 },
  priceInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 14 },
  modalList: {
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  mutedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
});
