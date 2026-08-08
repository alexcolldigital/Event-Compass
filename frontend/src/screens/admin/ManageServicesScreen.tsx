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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { COLORS, USER_ROLES, SERVICE_PROVIDER_TYPES } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

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
    unit: string;
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
    unit: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    shortDescription: '',
    serviceType: '',
    category: '',
    subCategory: '',
    pricing: {
      basePrice: '',
      unit: 'fixed',
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
      Alert.alert('Error', error.message || 'Failed to update service');
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
      Alert.alert('Error', error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteService(service._id);
              const updatedServices = services.filter((s) => s._id !== service._id);
              setServices(updatedServices);
              Alert.alert('Success', 'Service deleted successfully');
            } catch (err) {
              const error = err as ApiError;
              Alert.alert('Error', error.message || 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      shortDescription: service.shortDescription || '',
      serviceType: service.serviceType || '',
      category: service.category || '',
      subCategory: service.subCategory || '',
      pricing: {
        basePrice: service.pricing?.basePrice?.toString() || '',
        unit: service.pricing?.unit || 'fixed',
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
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      serviceType: '',
      category: '',
      subCategory: '',
      pricing: {
        basePrice: '',
        unit: 'fixed',
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
    setSelectedService(null);
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Service type is required';
    if (!formData.pricing.basePrice || parseFloat(formData.pricing.basePrice) < 0) {
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
          unit: formData.pricing.unit,
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
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await adminAPI.createService(submitData);
        Alert.alert('Success', 'Service created successfully');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      loadServices();
    } catch (err) {
      const error = err as ApiError;
      Alert.alert('Error', error.message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ServiceCard = ({ service }: ServiceCardProps) => {
    const isActive = service.isActive !== false;
    const isFeatured = service.isFeatured || false;

    return (
      <TouchableOpacity
        onPress={() => setSelectedService(selectedService?._id === service._id ? null : service)}
        style={styles.serviceCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="briefcase" size={24} color="white" />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.nameRow}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.badgeContainer}>
                {isFeatured && (
                  <View style={styles.featuredBadge}>
                    <MaterialCommunityIcons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}
                <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
            {service.provider && (
              <Text style={styles.providerText}>
                Provider:{' '}
                {typeof service.provider === 'object'
                  ? service.provider.businessName || `${service.provider.firstName} ${service.provider.lastName}`
                  : service.provider}
              </Text>
            )}
            <Text style={styles.serviceType}>{service.serviceType}</Text>
            <Text style={styles.priceText}>
              ₦{service.pricing?.basePrice?.toLocaleString() || 0} / {service.pricing?.unit || 'fixed'}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={selectedService?._id === service._id ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#d1d5db"
          />
        </View>

        {selectedService?._id === service._id && (
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
                style={styles.editAction}
                onPress={() => handleOpenEditModal(service)}
              >
                <Text style={styles.editActionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteService(service)}
              >
                <Text style={styles.deleteActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
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

  if (isLoading) {
    return <Loading fullScreen message="Loading services..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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

      <View style={styles.filterContainer}>
        <View style={styles.searchInputContainer}>
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
                {renderFormField({ label: 'Service Type *', name: 'serviceType', type: 'text', placeholder: 'e.g., venue, catering, photography' })}
                {renderFormField({ label: 'Category', name: 'category', type: 'text', placeholder: 'e.g., venue, catering, photography' })}
                {renderFormField({ label: 'Sub-category', name: 'subCategory', type: 'text', placeholder: 'Optional sub-category' })}
                {renderFormField({ label: 'Short Description', name: 'shortDescription', type: 'text', placeholder: 'Brief description for listings', multiline: true })}
                {renderFormField({ label: 'Full Description *', name: 'description', type: 'text', placeholder: 'Detailed description', multiline: true })}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingRow}>
                  <View style={styles.pricingField}>
                    {renderNestedField({ label: 'Base Price (₦) *', parent: 'pricing', child: 'basePrice', type: 'numeric', placeholder: '0.00' })}
                  </View>
                  <View style={styles.pricingField}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Unit</Text>
                      <TextInput
                        value={formData.pricing.unit}
                        onChangeText={(value) =>
                          setFormData({ ...formData, pricing: { ...formData.pricing, unit: value } })
                        }
                        style={styles.textInput}
                        placeholder="fixed"
                      />
                    </View>
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
                {renderFormField({ label: 'Service Type *', name: 'serviceType', type: 'text', placeholder: 'e.g., venue, catering, photography' })}
                {renderFormField({ label: 'Category', name: 'category', type: 'text', placeholder: 'e.g., venue, catering, photography' })}
                {renderFormField({ label: 'Sub-category', name: 'subCategory', type: 'text', placeholder: 'Optional sub-category' })}
                {renderFormField({ label: 'Short Description', name: 'shortDescription', type: 'text', placeholder: 'Brief description for listings', multiline: true })}
                {renderFormField({ label: 'Full Description *', name: 'description', type: 'text', placeholder: 'Detailed description', multiline: true })}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingRow}>
                  <View style={styles.pricingField}>
                    {renderNestedField({ label: 'Base Price (₦) *', parent: 'pricing', child: 'basePrice', type: 'numeric', placeholder: '0.00' })}
                  </View>
                  <View style={styles.pricingField}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>Unit</Text>
                      <TextInput
                        value={formData.pricing.unit}
                        onChangeText={(value) =>
                          setFormData({ ...formData, pricing: { ...formData.pricing, unit: value } })
                        }
                        style={styles.textInput}
                        placeholder="fixed"
                      />
                    </View>
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
    padding: 12,
    margin: 12,
    borderRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    color: '#1f2937',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterLabel: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'center',
    marginRight: 8,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
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
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  statLabelActive: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  statLabelFeatured: {
    color: '#a16207',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#1e3a8a',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statValueActive: {
    color: '#14532d',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statValueFeatured: {
    color: '#854d0e',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listContent: {
    padding: 12,
    paddingTop: 12,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
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
    marginTop: 4,
  },
  serviceType: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  priceText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
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
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  deleteAction: {
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
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
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
});

export default ManageServicesScreen;