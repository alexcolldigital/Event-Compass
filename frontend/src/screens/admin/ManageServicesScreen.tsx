/**
 * Manage Services Screen
 * Admin screen for managing services
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
  StyleSheet,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import Toast, { ToastType } from '../../components/Toast';
import { adminAPI } from '../../services/api.js';
import { COLORS, USER_ROLES, SERVICE_PROVIDER_TYPES, SERVICE_CATEGORIES } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';
import { goBackToAdminDashboard } from '../../utils/adminNavigation';

// Same category order as HomeScreen featureCategories
const APP_CATEGORY_ORDER = [
  'Canopies and Tent',
  'Chairs',
  'Tables',
  'Event Planners and Managers',
  'Events Services Providers and Vendors',
  'Events Facilitators and Agents',
  'Special Events Hosts and Organizers',
  'Events Venues',
  'Event Decorators',
  'Make-up Artists',
  'Ushers',
  'Bouncers',
  'Events Facilities Rental and Hiring Companies',
  'Ice Chilling Services',
  'Refrigerated Vans/Cooling Vans Providers',
  'Food Caterers',
  'Drinks Suppliers',
  'Music (D-J and Live Performances)',
  'MCs and Compares',
  'Comedians and Entertainers',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Canopies and Tent': 'tent',
  'Chairs': 'seat',
  'Tables': 'table-furniture',
  'Event Planners and Managers': 'clipboard-list',
  'Events Services Providers and Vendors': 'store',
  'Events Facilitators and Agents': 'handshake',
  'Special Events Hosts and Organizers': 'account-star',
  'Events Venues': 'home-city',
  'Event Decorators': 'palette',
  'Make-up Artists': 'face-woman-shimmer',
  'Ushers': 'account-tie',
  'Bouncers': 'shield-account',
  'Events Facilities Rental and Hiring Companies': 'warehouse',
  'Ice Chilling Services': 'snowflake',
  'Refrigerated Vans/Cooling Vans Providers': 'truck-snowflake',
  'Food Caterers': 'silverware-fork-knife',
  'Drinks Suppliers': 'bottle-wine',
  'Music (D-J and Live Performances)': 'music',
  'MCs and Compares': 'microphone',
  'Comedians and Entertainers': 'emoticon-happy',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Canopies and Tent': '#2f855a',
  'Chairs': '#4c51bf',
  'Tables': '#d97706',
  'Event Planners and Managers': '#db2777',
  'Events Services Providers and Vendors': '#0f766e',
  'Events Facilitators and Agents': '#2563eb',
  'Special Events Hosts and Organizers': '#b45309',
  'Events Venues': '#7c3aed',
  'Event Decorators': '#db2777',
  'Make-up Artists': '#ec4899',
  'Ushers': '#0f766e',
  'Bouncers': '#374151',
  'Events Facilities Rental and Hiring Companies': '#b45309',
  'Ice Chilling Services': '#2563eb',
  'Refrigerated Vans/Cooling Vans Providers': '#0f766e',
  'Food Caterers': '#4c51bf',
  'Drinks Suppliers': '#7c3aed',
  'Music (D-J and Live Performances)': '#d97706',
  'MCs and Compares': '#db2777',
  'Comedians and Entertainers': '#b45309',
};

const getSubcategoryOptions = (category: string) =>
  (SERVICE_CATEGORIES.find((item) => item.name === category)?.subcategories || []) as string[];

// Type definitions
interface Service {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  serviceType: string;
  category: string;
  subCategory?: string;
  pricing: {
    basePrice: number;
    unit?: string;
    currency?: string;
  };
  availability: {
    isAvailable: boolean;
  };
  coverageArea?: Record<string, unknown>;
  packages?: unknown[];
  images?: unknown[];
  media?: Record<string, unknown>;
  inventory?: Record<string, unknown>;
  quantity?: number;
  fullDescription?: string;
  provider?: string | { _id: string; businessName?: string; firstName?: string; lastName?: string };
  providerType?: string;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  specifications?: unknown[];
  cancellationPolicy?: string;
  cancellationDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesResponse {
  services: Service[];
  [key: string]: unknown;
}

interface ServiceResponse {
  service: Service;
  [key: string]: unknown;
}

interface FormData {
  name: string;
  description: string;
  shortDescription: string;
  serviceType: string;
  category: string;
  subCategory: string;
  pricing: {
    basePrice: string;
  };
  availability: {
    isAvailable: boolean;
  };
  coverageArea: Record<string, unknown>;
  packages: unknown[];
  images: unknown[];
  media: Record<string, unknown>;
  inventory: Record<string, unknown>;
  quantity: number;
  fullDescription: string;
  provider: string;
  providerType: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: unknown[];
  cancellationPolicy: string;
  cancellationDetails: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  serviceType?: string;
  pricing?: string;
  [key: string]: string | undefined;
}

interface ApiError {
  message?: string;
  error?: string | unknown;
  [key: string]: unknown;
}

interface ServiceCardProps {
  service: Service;
}

type InputKeyboardType = KeyboardTypeOptions | 'text';

interface RenderFormFieldProps {
  label: string;
  name: keyof FormData;
  type?: InputKeyboardType;
  placeholder?: string;
  multiline?: boolean;
}

interface RenderNestedFieldProps {
  label: string;
  parent: keyof FormData;
  child: string;
  type?: InputKeyboardType;
  placeholder?: string;
}

// Style type helpers
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
type AlignSelf = 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify';

const ManageServicesScreen = () => {
  const navigation = useNavigation();

  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    shortDescription: '',
    serviceType: '',
    category: '',
    subCategory: '',
    pricing: {
      basePrice: '',
    },
    availability: {
      isAvailable: true,
    },
    coverageArea: {},
    packages: [],
    images: [],
    media: {},
    inventory: {},
    quantity: 1,
    fullDescription: '',
    provider: '',
    providerType: 'events_service_provider',
    isActive: true,
    isFeatured: false,
    tags: [],
    specifications: [],
    cancellationPolicy: 'moderate',
    cancellationDetails: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({ visible: false, type: 'success', message: '' });

  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchText, filterCategory, filterStatus, services]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = (await adminAPI.getAllServices({ limit: 100 })) as unknown as ServicesResponse;
      setServices(response.services || []);
      setError(null);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchText.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchText.toLowerCase()) ||
          service.description.toLowerCase().includes(searchText.toLowerCase()) ||
          service.serviceType.toLowerCase().includes(searchText.toLowerCase()) ||
          (service.provider &&
            typeof service.provider === 'object' &&
            service.provider.businessName &&
            service.provider.businessName.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((service) => service.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((service) => (service.isActive ? 'active' : 'inactive') === filterStatus);
    }

    // Sort by app category order
    filtered = [...filtered].sort((a, b) => {
      const ai = APP_CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (a.serviceType || a.category || '').toLowerCase());
      const bi = APP_CATEGORY_ORDER.findIndex(c => c.toLowerCase() === (b.serviceType || b.category || '').toLowerCase());
      const aIdx = ai === -1 ? 999 : ai;
      const bIdx = bi === -1 ? 999 : bi;
      return aIdx - bIdx;
    });

    setFilteredServices(filtered);
  };

  const handleToggleFeatured = async (service: Service) => {
    try {
      const response = (await adminAPI.toggleFeatured(service._id)) as unknown as ServiceResponse;
      const updatedServices = services.map((s) =>
        s._id === service._id ? response.service : s
      );
      setServices(updatedServices);
      Alert.alert('Success', `Service ${response.service.isFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (err) {
      const error = err as ApiError;
      showToast('error', error.message || 'Failed to update service');
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const response = (await adminAPI.toggleActive(service._id)) as unknown as ServiceResponse;
      const updatedServices = services.map((s) =>
        s._id === service._id ? response.service : s
      );
      setServices(updatedServices);
      Alert.alert('Success', `Service ${response.service.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const error = err as ApiError;
      showToast('error', error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteService(service._id);
              setServices((prev) => prev.filter((s) => s._id !== service._id));
              setExpandedServiceId(null);
              showToast('success', 'Service deleted successfully');
              Alert.alert(
                '✓ Service Deleted',
                `"${service.name}" has been removed from the platform.`,
                [{ text: 'OK', onPress: () => {} }]
              );
            } catch (err) {
              const error = err as ApiError;
              const errorMsg = error.message || 'Failed to delete service';
              showToast('error', errorMsg);
              Alert.alert('✗ Delete Failed', errorMsg);
            }
          },
        },
      ]
    );
  };

  const handleOpenDeleteModal = (service: Service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await adminAPI.deleteService(serviceToDelete._id);
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete._id));
      setExpandedServiceId((current) => (current === serviceToDelete._id ? null : current));
      setShowDeleteModal(false);
      setServiceToDelete(null);
      showToast('success', response?.message || 'Service deleted successfully');
    } catch (err) {
      const error = err as ApiError;
      const errorMsg = error.message || 'Failed to delete service';
      showToast('error', errorMsg);
      Alert.alert('Delete Failed', errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('error', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || `image_${Date.now()}.jpg`,
        type: (a.mimeType as string) || 'image/jpeg',
      }));
      setPendingImages((prev) => [...prev, ...picked].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (serviceId: string) => {
    if (pendingImages.length === 0) return;
    const fd = new FormData();
    if (Platform.OS === 'web') {
      for (const img of pendingImages) {
        const response = await fetch(img.uri);
        const blob = await response.blob();
        fd.append('images', blob, img.name);
      }
    } else {
      pendingImages.forEach((img) => {
        fd.append('images', { uri: img.uri, name: img.name, type: img.type } as any);
      });
    }
    await adminAPI.uploadServiceMedia(serviceId, fd);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setPendingImages([]);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setSelectedService(service);
    setExpandedServiceId(null);
    setPendingImages([]);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      shortDescription: service.shortDescription || '',
      serviceType: service.serviceType || '',
      category: service.category || '',
      subCategory: service.subCategory || '',
      pricing: {
        basePrice: service.pricing?.basePrice?.toString() || '',
      },
      availability: {
        isAvailable: service.availability?.isAvailable !== false,
      },
      coverageArea: service.coverageArea || {},
      packages: service.packages || [],
      images: service.images || [],
      media: service.media || {},
      inventory: service.inventory || {},
      quantity: service.quantity || 1,
      fullDescription: service.fullDescription || '',
      provider: typeof service.provider === 'object' ? service.provider._id : service.provider || '',
      providerType: service.providerType || 'events_service_provider',
      isActive: service.isActive !== false,
      isFeatured: service.isFeatured || false,
      tags: service.tags || [],
      specifications: service.specifications || [],
      cancellationPolicy: service.cancellationPolicy || 'moderate',
      cancellationDetails: service.cancellationDetails || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setExpandedServiceId(null);
    setSelectedService(null);
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      serviceType: '',
      category: '',
      subCategory: '',
      pricing: {
        basePrice: '',
      },
      availability: {
        isAvailable: true,
      },
      coverageArea: {},
      packages: [],
      images: [],
      media: {},
      inventory: {},
      quantity: 1,
      fullDescription: '',
      provider: '',
      providerType: 'events_service_provider',
      isActive: true,
      isFeatured: false,
      tags: [],
      specifications: [],
      cancellationPolicy: 'moderate',
      cancellationDetails: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    } else if (!APP_CATEGORY_ORDER.includes(formData.category.trim())) {
      errors.category = 'Select a category from the available options';
    }
    const subcategoryOptions = getSubcategoryOptions(formData.category);
    if (formData.subCategory.trim() && !subcategoryOptions.includes(formData.subCategory.trim())) {
      errors.subCategory = 'Select a valid sub-category for this category';
    }
    const price = parseFloat(formData.pricing.basePrice);
    if (!formData.pricing.basePrice || isNaN(price) || price < 0) {
      errors.pricing = 'Valid base price is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice),
          unit: selectedService?.pricing?.unit || 'fixed',
          currency: 'NGN',
        },
        availability: {
          isAvailable: formData.availability.isAvailable,
        },
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        tags: formData.tags,
        specifications: formData.specifications,
        cancellationPolicy: formData.cancellationPolicy,
        cancellationDetails: formData.cancellationDetails,
      };

      if (showEditModal && selectedService) {
        await adminAPI.updateService(selectedService._id, submitData);
        await uploadImages(selectedService._id);
        setShowEditModal(false);
        resetForm();
        setPendingImages([]);
        await loadServices();
        showToast('success', 'Service updated successfully');
        Alert.alert(
          '✓ Service Updated',
          `The service has been successfully updated and is live.`,
          [{ text: 'OK', onPress: () => {} }]
        );
        setExpandedServiceId(null);
      } else {
        const res = (await adminAPI.createService(submitData)) as any;
        const newId = res?.service?._id;
        if (newId) await uploadImages(newId);
        setShowAddModal(false);
        resetForm();
        setPendingImages([]);
        await loadServices();
        showToast('success', 'Service created successfully');
        Alert.alert(
          '✓ Service Created',
          `"${submitData.name}" has been successfully added to the platform.`,
          [{ text: 'Great!', onPress: () => {} }]
        );
      }
    } catch (err) {
      const error = err as ApiError;
      const errorMsg = error.message || (error.error as string) || 'Failed to save service. Check all required fields.';
      showToast('error', errorMsg);
      Alert.alert(
        '✗ Operation Failed',
        errorMsg,
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ServiceCard = ({ service }: ServiceCardProps) => {
    const isActive = service.isActive !== false;
    const isFeatured = service.isFeatured || false;
    const isAvailable = service.availability?.isAvailable !== false;
    const imageUrl = (service.images as any)?.[0]?.url || (service.images as any)?.[0];
    const categoryKey = service.serviceType || service.category || '';
    const iconName = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS[Object.keys(CATEGORY_ICONS).find(k => k.toLowerCase() === categoryKey.toLowerCase()) || ''] || 'briefcase';
    const iconColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS[Object.keys(CATEGORY_COLORS).find(k => k.toLowerCase() === categoryKey.toLowerCase()) || ''] || '#16a34a';

    return (
      <View style={styles.serviceCard}>
        {/* Image / Icon header — matches app MarketplaceCard */}
        <TouchableOpacity
          onPress={() => setExpandedServiceId(expandedServiceId === service._id ? null : service._id)}
          style={styles.cardImageContainer}
          activeOpacity={0.85}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: iconColor + '22' }]}>
              <MaterialCommunityIcons name={iconName as any} size={36} color={iconColor} />
            </View>
          )}
          {/* Availability badge — top-left */}
          <View style={[styles.availabilityBadge, isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.availabilityText}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
          </View>
          {isFeatured && (
            <View style={styles.featuredBadgeOverlay}>
              <MaterialCommunityIcons name="star" size={12} color="#f59e0b" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <TouchableOpacity
            onPress={() => setExpandedServiceId(expandedServiceId === service._id ? null : service._id)}
            style={styles.cardHeader}
            activeOpacity={0.85}
          >
            <View style={styles.cardContent}>
              <View style={styles.nameRow}>
                <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
                <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <Text style={styles.serviceType} numberOfLines={1}>{service.category || service.subCategory || 'General'}</Text>
              {service.provider && (
                <Text style={styles.providerText} numberOfLines={1}>
                  {typeof service.provider === 'object'
                    ? service.provider.businessName || `${service.provider.firstName} ${service.provider.lastName}`
                    : service.provider}
                </Text>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>₦{service.pricing?.basePrice?.toLocaleString() || 0}</Text>
                <Text style={styles.priceUnit}>/ {service.pricing?.unit || 'booking'}</Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={expandedServiceId === service._id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#d1d5db"
              style={{ alignSelf: 'flex-start', marginTop: 2 }}
            />
          </TouchableOpacity>

        {expandedServiceId === service._id && (
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{service.category || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sub-category</Text>
              <Text style={styles.infoValue}>{service.subCategory || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(service.createdAt)}</Text>
            </View>

            {service.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{service.description}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, isFeatured ? styles.featuredAction : styles.defaultAction]}
                onPress={() => handleToggleFeatured(service)}
              >
                <Text
                  style={[styles.actionButtonText, isFeatured ? styles.featuredActionText : styles.defaultActionText]}
                >
                  {isFeatured ? 'Unfeature' : 'Feature'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isActive ? styles.deactivateAction : styles.activateAction]}
                onPress={() => handleToggleActive(service)}
              >
                <Text
                  style={[styles.actionButtonText, isActive ? styles.deactivateActionText : styles.activateActionText]}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.editAction]}
                onPress={() => handleOpenEditModal(service)}
              >
                <Text style={styles.editActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteAction]}
                onPress={() => handleOpenDeleteModal(service)}
              >
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>
      </View>
    );
  };

  const renderCategorySelectors = () => {
    const subcategoryOptions = getSubcategoryOptions(formData.category);

    const selectCategory = (category: string) => {
      setFormData({
        ...formData,
        category,
        subCategory: '',
        serviceType: category,
      });
      setFormErrors((prev) => ({ ...prev, category: undefined, subCategory: undefined }));
    };

    const selectSubCategory = (subCategory: string) => {
      setFormData({ ...formData, subCategory });
      setFormErrors((prev) => ({ ...prev, subCategory: undefined }));
    };

    return (
      <>
        <View style={styles.formField}>
          <Text style={styles.formLabel}>Category *</Text>
          <View style={styles.categoryOptions}>
            {APP_CATEGORY_ORDER.map((category) => {
              const active = formData.category === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => selectCategory(category)}
                  style={[styles.categoryOption, active ? styles.activeCategoryOption : styles.inactiveCategoryOption]}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons
                    name={(CATEGORY_ICONS[category] || 'shape-outline') as any}
                    size={15}
                    color={active ? '#ffffff' : '#16a34a'}
                  />
                  <Text style={[styles.categoryOptionText, active ? styles.activeCategoryText : styles.inactiveCategoryText]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {formErrors.category ? <Text style={styles.errorText}>{formErrors.category}</Text> : null}
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Sub-category</Text>
          {formData.category && subcategoryOptions.length > 0 ? (
            <View style={styles.categoryOptions}>
              {subcategoryOptions.map((subCategory) => {
                const active = formData.subCategory === subCategory;
                return (
                  <TouchableOpacity
                    key={subCategory}
                    onPress={() => selectSubCategory(subCategory)}
                    style={[styles.categoryOption, active ? styles.activeCategoryOption : styles.inactiveCategoryOption]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.categoryOptionText, active ? styles.activeCategoryText : styles.inactiveCategoryText]}>
                      {subCategory}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.helperText}>
              {formData.category ? 'No sub-categories available for this category.' : 'Select a category first.'}
            </Text>
          )}
          {formErrors.subCategory ? <Text style={styles.errorText}>{formErrors.subCategory}</Text> : null}
        </View>
      </>
    );
  };

  const renderFormField = ({
    label,
    name,
    type = 'text',
    placeholder = '',
    multiline = false,
  }: RenderFormFieldProps) => {
    const keyboardType: KeyboardTypeOptions = type === 'text' ? 'default' : type;
    return (
      <View style={styles.formField} key={name}>
        <Text style={styles.formLabel}>{label}</Text>
        {multiline ? (
          <TextInput
            placeholder={placeholder}
            value={formData[name] as string}
            onChangeText={(value) => setFormData({ ...formData, [name]: value })}
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.gray[400]}
          />
        ) : (
          <TextInput
            placeholder={placeholder}
            value={formData[name] as string}
            onChangeText={(value) => setFormData({ ...formData, [name]: value })}
            style={styles.textInput}
            keyboardType={keyboardType}
            placeholderTextColor={COLORS.gray[400]}
          />
        )}
        {formErrors[name] && <Text style={styles.errorText}>{formErrors[name]}</Text>}
      </View>
    );
  };

  const renderNestedField = ({
    label,
    parent,
    child,
    type = 'text',
    placeholder = '',
  }: RenderNestedFieldProps) => {
    const keyboardType: KeyboardTypeOptions = type === 'text' ? 'default' : type;
    const parentData = (formData[parent] as unknown as Record<string, unknown>) || {};
    return (
      <View style={styles.formField} key={`${parent}.${child}`}>
        <Text style={styles.formLabel}>{label}</Text>
        <TextInput
          placeholder={placeholder}
          value={(parentData?.[child] as string) || ''}
          onChangeText={(value) =>
            setFormData({
              ...formData,
              [parent]: { ...parentData, [child]: value },
            })
          }
          style={styles.textInput}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.gray[400]}
        />
        {formErrors[parent] && <Text style={styles.errorText}>{formErrors[parent]}</Text>}
      </View>
    );
  };

  const renderImagePicker = () => (
    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>Images</Text>
      <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
        <MaterialCommunityIcons name="image-plus" size={22} color="#16a34a" />
        <Text style={styles.imagePickerBtnText}>Add Images (images only)</Text>
      </TouchableOpacity>
      {pendingImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {pendingImages.map((img, i) => (
            <View key={i} style={styles.imageThumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => removeImage(i)}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (isLoading) {
    return <Loading fullScreen message="Loading services..." />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addButton}>
          <MaterialCommunityIcons name="plus-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage error={error} />
        </View>
      )}

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={handleCloseDeleteModal}>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteModalIcon}>
              <MaterialCommunityIcons name="trash-can-outline" size={30} color="#b91c1c" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Service</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{serviceToDelete?.name || 'this service'}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteCancelButton, isDeleting && styles.disabledAction]}
                onPress={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteConfirmButton, isDeleting && styles.disabledAction]}
                onPress={handleConfirmDeleteService}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterHeaderTitle}>Filters & Search</Text>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <MaterialCommunityIcons 
              name={showFilters ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <>
            <TouchableOpacity
              style={[styles.groupToggle, groupByCategory && styles.groupToggleActive]}
              onPress={() => setGroupByCategory(!groupByCategory)}
            >
              <MaterialCommunityIcons name="format-list-group" size={16} color={groupByCategory ? 'white' : '#374151'} />
              <Text style={[styles.groupToggleText, groupByCategory && styles.groupToggleTextActive]}>Group by Category</Text>
            </TouchableOpacity>
            <View style={[styles.searchInputContainer, { marginTop: 10 }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray[400]} />
              <TextInput
                placeholder="Search by name, type, provider..."
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
                placeholderTextColor={COLORS.gray[400]}
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray[400]} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Category:</Text>
              {[
                { label: 'All', value: 'all' },
                { label: 'Venue', value: 'venue' },
                { label: 'Catering', value: 'catering' },
                { label: 'Photography', value: 'photography' },
                { label: 'Entertainment', value: 'entertainment' },
                { label: 'Decoration', value: 'decoration' },
                { label: 'Other', value: 'other' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    filterCategory === filter.value ? styles.activeFilterChip : styles.inactiveFilterChip,
                  ]}
                  onPress={() => setFilterCategory(filter.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterCategory === filter.value ? styles.activeFilterChipText : styles.inactiveFilterChipText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              {[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    filterStatus === filter.value ? styles.activeFilterChip : styles.inactiveFilterChip,
                  ]}
                  onPress={() => setFilterStatus(filter.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === filter.value ? styles.activeFilterChipText : styles.inactiveFilterChipText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Services</Text>
          <Text style={styles.statValue}>{services.length}</Text>
        </View>
        <View style={styles.statCardActive}>
          <Text style={styles.statLabelActive}>Active</Text>
          <Text style={styles.statValueActive}>
            {services.filter((s) => s.isActive !== false).length}
          </Text>
        </View>
        <View style={styles.statCardFeatured}>
          <Text style={styles.statLabelFeatured}>Featured</Text>
          <Text style={styles.statValueFeatured}>
            {services.filter((s) => s.isFeatured).length}
          </Text>
        </View>
      </View>

      {groupByCategory ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {APP_CATEGORY_ORDER.map((cat) => {
            const catServices = filteredServices.filter(s =>
              (s.serviceType || s.category || '').toLowerCase() === cat.toLowerCase()
            );
            if (catServices.length === 0) return null;
            return (
              <View key={cat} style={styles.categoryGroup}>
                <View style={styles.categoryGroupHeader}>
                  <MaterialCommunityIcons
                    name={(CATEGORY_ICONS[cat] || 'briefcase') as any}
                    size={18}
                    color={CATEGORY_COLORS[cat] || '#16a34a'}
                  />
                  <Text style={styles.categoryGroupTitle}>{cat}</Text>
                  <Text style={styles.categoryGroupCount}>{catServices.length}</Text>
                </View>
                {catServices.map(s => <ServiceCard key={s._id} service={s} />)}
              </View>
            );
          })}
          {/* Uncategorised */}
          {(() => {
            const others = filteredServices.filter(s => {
              const key = (s.serviceType || s.category || '').toLowerCase();
              return !APP_CATEGORY_ORDER.some(c => c.toLowerCase() === key);
            });
            if (others.length === 0) return null;
            return (
              <View style={styles.categoryGroup}>
                <View style={styles.categoryGroupHeader}>
                  <MaterialCommunityIcons name="briefcase" size={18} color="#6b7280" />
                  <Text style={styles.categoryGroupTitle}>Other</Text>
                  <Text style={styles.categoryGroupCount}>{others.length}</Text>
                </View>
                {others.map(s => <ServiceCard key={s._id} service={s} />)}
              </View>
            );
          })()}
          {filteredServices.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="briefcase-off" size={48} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ServiceCard service={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="briefcase-off" size={48} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
          scrollEnabled={true}
        />
      )}

      <Modal visible={showAddModal} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add New Service</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                {renderFormField({ label: 'Service Name *', name: 'name', type: 'text', placeholder: 'Enter service name' })}
                {renderCategorySelectors()}
                {renderFormField({ label: 'Description *', name: 'description', type: 'text', placeholder: 'Describe the service in detail', multiline: true })}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingRow}>
                  <View style={styles.pricingField}>
                    {renderNestedField({ label: 'Base Price (₦) *', parent: 'pricing', child: 'basePrice', type: 'numeric', placeholder: '0.00' })}
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Availability & Status</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Active</Text>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    style={[
                      styles.toggleSwitch,
                      formData.isActive ? styles.activeToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.isActive ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Featured</Text>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    style={[
                      styles.toggleSwitch,
                      formData.isFeatured ? styles.featuredToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.isFeatured ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Available for Booking</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFormData({
                        ...formData,
                        availability: { ...formData.availability, isAvailable: !formData.availability.isAvailable },
                      })
                    }
                    style={[
                      styles.toggleSwitch,
                      formData.availability.isAvailable ? styles.availableToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.availability.isAvailable ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                <View style={styles.policyOptions}>
                  {['flexible', 'moderate', 'strict'].map((policy) => (
                    <TouchableOpacity
                      key={policy}
                      style={[
                        styles.policyOption,
                        formData.cancellationPolicy === policy ? styles.activePolicyOption : styles.inactivePolicyOption,
                      ]}
                      onPress={() => setFormData({ ...formData, cancellationPolicy: policy })}
                    >
                      <Text
                        style={[
                          styles.policyOptionText,
                          formData.cancellationPolicy === policy ? styles.activePolicyText : styles.inactivePolicyText,
                        ]}
                      >
                        {policy.charAt(0).toUpperCase() + policy.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {renderFormField({ label: 'Cancellation Details', name: 'cancellationDetails', type: 'text', placeholder: 'Additional cancellation terms', multiline: true })}
              </View>

              {renderImagePicker()}

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={isSubmitting ? 'Saving...' : 'Save Service'}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Service</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                {renderFormField({ label: 'Service Name *', name: 'name', type: 'text', placeholder: 'Enter service name' })}
                {renderCategorySelectors()}
                {renderFormField({ label: 'Description *', name: 'description', type: 'text', placeholder: 'Describe the service in detail', multiline: true })}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingRow}>
                  <View style={styles.pricingField}>
                    {renderNestedField({ label: 'Base Price (₦) *', parent: 'pricing', child: 'basePrice', type: 'numeric', placeholder: '0.00' })}
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Availability & Status</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Active</Text>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    style={[
                      styles.toggleSwitch,
                      formData.isActive ? styles.activeToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.isActive ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Featured</Text>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    style={[
                      styles.toggleSwitch,
                      formData.isFeatured ? styles.featuredToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.isFeatured ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Available for Booking</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFormData({
                        ...formData,
                        availability: { ...formData.availability, isAvailable: !formData.availability.isAvailable },
                      })
                    }
                    style={[
                      styles.toggleSwitch,
                      formData.availability.isAvailable ? styles.availableToggle : styles.inactiveToggle,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        formData.availability.isAvailable ? styles.activeThumb : styles.inactiveThumb,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                <View style={styles.policyOptions}>
                  {['flexible', 'moderate', 'strict'].map((policy) => (
                    <TouchableOpacity
                      key={policy}
                      style={[
                        styles.policyOption,
                        formData.cancellationPolicy === policy ? styles.activePolicyOption : styles.inactivePolicyOption,
                      ]}
                      onPress={() => setFormData({ ...formData, cancellationPolicy: policy })}
                    >
                      <Text
                        style={[
                          styles.policyOptionText,
                          formData.cancellationPolicy === policy ? styles.activePolicyText : styles.inactivePolicyText,
                        ]}
                      >
                        {policy.charAt(0).toUpperCase() + policy.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {renderFormField({ label: 'Cancellation Details', name: 'cancellationDetails', type: 'text', placeholder: 'Additional cancellation terms', multiline: true })}
              </View>

              {renderImagePicker()}

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowEditModal(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={isSubmitting ? 'Saving...' : 'Update Service'}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 16,
  },
  addButton: {
    marginRight: 16,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  filterHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  filterToggle: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    marginLeft: 8,
    color: '#1f2937',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  filterLabel: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'center',
    marginRight: 8,
  },
  filterChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  inactiveFilterChip: {
    backgroundColor: 'white',
    borderColor: '#d1d5db',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: 'white',
  },
  inactiveFilterChipText: {
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statCardActive: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statCardFeatured: {
    flex: 1,
    backgroundColor: '#fefce8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  statLabel: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '500',
  },
  statLabelActive: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '500',
  },
  statLabelFeatured: {
    color: '#a16207',
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    color: '#1e3a8a',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statValueActive: {
    color: '#14532d',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statValueFeatured: {
    color: '#854d0e',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  listContent: {
    padding: 8,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 4,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  availableBadge: {
    backgroundColor: 'rgba(22,163,74,0.85)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(185,28,28,0.85)',
  },
  availabilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredBadgeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(254,243,199,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  cardBody: {
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  serviceName: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#b91c1c',
  },
  providerText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  serviceType: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  priceText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 15,
  },
  priceUnit: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 4,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    gap: 6,
  },
  groupToggleActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  groupToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  groupToggleTextActive: {
    color: 'white',
  },
  categoryGroup: {
    marginBottom: 16,
  },
  categoryGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  categoryGroupTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  categoryGroupCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  additionalInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  infoValue: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  descriptionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#374151',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  featuredAction: {
    backgroundColor: '#fef3c7',
  },
  defaultAction: {
    backgroundColor: '#f3f4f6',
  },
  deactivateAction: {
    backgroundColor: '#fee2e2',
  },
  activateAction: {
    backgroundColor: '#dcfce7',
  },
  editAction: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  deleteAction: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredActionText: {
    color: '#b45309',
  },
  defaultActionText: {
    color: '#374151',
  },
  deactivateActionText: {
    color: '#b91c1c',
  },
  activateActionText: {
    color: '#166534',
  },
  editActionText: {
    color: '#16a34a',
  },
  deleteActionText: {
    color: '#b91c1c',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  deleteModalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  deleteModalMessage: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  deleteConfirmButton: {
    backgroundColor: '#dc2626',
  },
  deleteCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteConfirmText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledAction: {
    opacity: 0.6,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  activeCategoryOption: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  inactiveCategoryOption: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  inactiveCategoryText: {
    color: '#1f2937',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#1f2937',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingField: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  toggleLabel: {
    color: '#1f2937',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#16a34a',
  },
  featuredToggle: {
    backgroundColor: '#f59e0b',
  },
  availableToggle: {
    backgroundColor: '#10b981',
  },
  inactiveToggle: {
    backgroundColor: '#d1d5db',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    marginLeft: 4,
  },
  activeThumb: {
    marginLeft: 24,
  },
  inactiveThumb: {
    marginLeft: 4,
  },
  policyOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  policyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  activePolicyOption: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  inactivePolicyOption: {
    backgroundColor: 'white',
    borderColor: '#d1d5db',
  },
  policyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activePolicyText: {
    color: 'white',
  },
  inactivePolicyText: {
    color: '#1f2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0fdf4',
  },
  imagePickerBtnText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 14,
  },
  imageThumbWrap: {
    marginRight: 10,
    position: 'relative',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 999,
  },
});

export default ManageServicesScreen;
