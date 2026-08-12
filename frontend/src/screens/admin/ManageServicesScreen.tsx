import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, TextInput, KeyboardTypeOptions,
  Modal, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Image, ActivityIndicator, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { adminAPI } from '../../services/api.js';
import { formatDate } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const SERVICE_TYPES = [
  'Canopy & Tent Rental', 'Chair Rental', 'Table Rental',
  'Event Planning', 'Event Management', 'Event Facilitation', 'Event Hosting',
  'Venue', 'Decor', 'Make-up', 'Ushering', 'Security / Bouncing',
  'Equipment Rental', 'Ice Chilling', 'Refrigerated Van', 'Catering',
  'Drinks Supply', 'DJ / Live Music', 'MC / Compere', 'Comedy / Entertainment',
];

const CATEGORIES_WITH_SUBS: Record<string, string[]> = {
  'Canopies and Tent': ['12 by 12 Canopy', '12 by 24 Canopy', '20 by 40 Tent', '30 by 60 Tent', '40 by 80 Tent'],
  'Chairs': ['Plastic Chair', 'Chivalry Chair', 'Bridal Chair'],
  'Tables': ['Plastic Table', 'Banquet Table'],
  'Event Planners and Managers': [],
  'Events Services Providers and Vendors': [],
  'Events Facilitators and Agents': [],
  'Special Events Hosts and Organizers': [],
  'Events Venues': [],
  'Event Decorators': [],
  'Make-up Artists': [],
  'Ushers': [],
  'Bouncers': [],
  'Events Facilities Rental and Hiring Companies': [],
  'Ice Chilling Services': [],
  'Refrigerated Vans/Cooling Vans Providers': [],
  'Food Caterers': [],
  'Drinks Suppliers': [],
  'Music (D-J and Live Performances)': [],
  'MCs and Compares': [],
  'Comedians and Entertainers': [],
};

const PRICING_UNITS = [
  { label: 'Fixed Price', value: 'fixed' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Per Person', value: 'per_person' },
  { label: 'Per Item', value: 'per_item' },
  { label: 'Negotiable', value: 'negotiable' },
  { label: 'Per Booking', value: 'booking' },
];

const DEFAULT_FORM = {
  name: '', description: '', shortDescription: '', serviceType: '', category: '',
  subCategory: '', pricing: { basePrice: '', unit: 'fixed' },
  availability: { isAvailable: true }, coverageArea: {}, packages: [], images: [],
  media: {}, inventory: {}, quantity: 1, fullDescription: '', provider: '',
  providerType: 'events_service_provider', isActive: true, isFeatured: false,
  tags: [], specifications: [], cancellationPolicy: 'moderate', cancellationDetails: '',
};

const ManageServicesScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Each picked image: { uri, uploading, uploaded, cloudUrl }
  const [pickedImages, setPickedImages] = useState<{ uri: string; uploading: boolean; cloudUrl: string }[]>([]);

  useEffect(() => { loadServices(); }, []);
  useEffect(() => { filterServices(); }, [searchText, filterCategory, filterStatus, services]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAllServices({ limit: 100 });
      setServices(response.data?.services || response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;
    if (searchText.trim()) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.description.toLowerCase().includes(searchText.toLowerCase()) ||
        s.serviceType.toLowerCase().includes(searchText.toLowerCase()) ||
        (s.provider && typeof s.provider === 'object' && s.provider.businessName?.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    if (filterCategory !== 'all') filtered = filtered.filter((s) => s.category === filterCategory);
    if (filterStatus !== 'all') filtered = filtered.filter((s) => (s.isActive ? 'active' : 'inactive') === filterStatus);
    setFilteredServices(filtered);
  };

  const handleToggleFeatured = async (service: any) => {
    try {
      const response = await adminAPI.toggleFeatured(service._id);
      setServices(services.map((s) => s._id === service._id ? (response.data?.service ?? response.data) : s));
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed to update service'); }
  };

  const handleToggleActive = async (service: any) => {
    try {
      const response = await adminAPI.toggleActive(service._id);
      setServices(services.map((s) => s._id === service._id ? (response.data?.service ?? response.data) : s));
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed to update service'); }
  };

  const handleDeleteService = (service: any) => {
    Alert.alert('Delete Service', `Delete "${service.name}"? This cannot be undone.`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.deleteService(service._id);
            setServices(services.filter((s) => s._id !== service._id));
          } catch (err: any) { Alert.alert('Error', err.message || 'Failed to delete service'); }
        },
      },
    ]);
  };

  const resetForm = () => { setFormData(DEFAULT_FORM); setFormErrors({}); setSelectedService(null); setPickedImages([]); };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.serviceType.trim()) errors.serviceType = 'Service type is required';
    if (!formData.pricing.basePrice || parseFloat(formData.pricing.basePrice) < 0) errors.pricing = 'Valid base price is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const pickImages = async () => {
    if (pickedImages.length >= 12) {
      Alert.alert('Limit reached', 'Maximum 12 images per service.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const remaining = 12 - pickedImages.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((a) => ({ uri: a.uri, uploading: false, cloudUrl: '' }));
      setPickedImages((prev) => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removePickedImage = (index: number) => {
    setPickedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPickedImages = async (serviceId: string) => {
    const toUpload = pickedImages.filter((img) => !img.cloudUrl);
    if (toUpload.length === 0) return;
    const formDataUpload = new FormData() as any;
    toUpload.forEach((img, i) => {
      const ext = img.uri.split('.').pop() || 'jpg';
      formDataUpload.append('images', { uri: img.uri, name: `image_${i}.${ext}`, type: `image/${ext}` } as any);
    });
    await adminAPI.uploadServiceMedia(serviceId, formDataUpload);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Keep existing cloud images (from edit) + newly picked ones that already have cloudUrl
      const existingImages = pickedImages
        .filter((img) => img.cloudUrl)
        .map((img, i) => ({ url: img.cloudUrl, isMain: i === 0 }));

      const submitData = {
        ...formData,
        pricing: { basePrice: parseFloat(formData.pricing.basePrice), unit: formData.pricing.unit, currency: 'NGN' },
        images: existingImages,
        media: { ...formData.media, coverImage: existingImages[0]?.url || '', galleryImages: existingImages.slice(1).map((i) => i.url) },
      };

      let serviceId: string;
      if (showEditModal && selectedService) {
        const res = await adminAPI.updateService(selectedService._id, submitData);
        serviceId = selectedService._id;
      } else {
        const res: any = await adminAPI.createService(submitData);
        serviceId = res.service?._id;
      }

      // Upload any newly picked local images
      const hasNewLocalImages = pickedImages.some((img) => !img.cloudUrl);
      if (serviceId && hasNewLocalImages) {
        await uploadPickedImages(serviceId);
      }

      Alert.alert('Success', showEditModal ? 'Service updated successfully' : 'Service created successfully');
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      loadServices();
    } catch (err: any) {
      Alert.alert('Error', (err as any).message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, name, keyboardType, multiline, nested }: { label: string; name: string; keyboardType?: KeyboardTypeOptions; multiline?: boolean; nested?: { parent: string; child: string } }) => {
    const kbType: KeyboardTypeOptions = keyboardType ?? 'default';
    const isMultiline = multiline ?? false;
    const value = nested ? (formData[nested.parent]?.[nested.child] || '') : (formData[name] || '');
    const onChange = nested
      ? (v: string) => setFormData({ ...formData, [nested.parent]: { ...formData[nested.parent], [nested.child]: v } })
      : (v: string) => setFormData({ ...formData, [name]: v });
    const errorMsg = formErrors[name] || (nested ? formErrors[nested.parent] : undefined);
    return (
      <View style={adminStyles.formField}>
        <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={kbType}
          multiline={isMultiline}
          numberOfLines={isMultiline ? 4 : 1}
          style={[isMultiline ? adminStyles.formInputMultiline : adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]}
          placeholderTextColor={C.muted}
        />
        {errorMsg && <Text style={adminStyles.formError}>{errorMsg}</Text>}
      </View>
    );
  };

  const Toggle = ({ label, value, onToggle, color = C.primary }: { label: string; value: boolean; onToggle: () => void; color?: string }) => (
    <View style={[adminStyles.toggleRow, { backgroundColor: C.surfaceAlt }]}>
      <Text style={[adminStyles.toggleLabel, { color: C.text, fontFamily: appFont }]}>{label}</Text>
      <TouchableOpacity onPress={onToggle} style={[adminStyles.toggleSwitch, { backgroundColor: value ? color : C.border }]}>
        <View style={[adminStyles.toggleThumb, { marginLeft: value ? 24 : 4 }]} />
      </TouchableOpacity>
    </View>
  );

  const SelectField = ({ label, value, options, onSelect, error }: { label: string; value: string; options: { label: string; value: string }[]; onSelect: (v: string) => void; error?: string }) => (
    <View style={adminStyles.formField}>
      <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
                value === opt.value
                  ? { backgroundColor: C.primary, borderColor: C.primary }
                  : { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder }]}
            >
              <Text style={{ color: value === opt.value ? '#fff' : C.text, fontSize: 12, fontFamily: appFont, fontWeight: '600' }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {error && <Text style={adminStyles.formError}>{error}</Text>}
    </View>
  );

  const subCategoryOptions = formData.category
    ? (CATEGORIES_WITH_SUBS[formData.category] || []).map((s) => ({ label: s, value: s }))
    : [];

  const ImageSection = () => (
    <View style={adminStyles.formSection}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={[adminStyles.formSectionTitle, { color: C.text, fontFamily: appFont }]}>Images ({pickedImages.length}/12)</Text>
        {pickedImages.length < 12 && (
          <TouchableOpacity
            onPress={pickImages}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
          >
            <MaterialCommunityIcons name="image-plus" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: appFont }}>Add Photos</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={{ color: C.muted, fontSize: 12, marginBottom: 12, fontFamily: appFont }}>Pick up to 12 photos from your device. First photo is the cover.</Text>

      {pickedImages.length === 0 ? (
        <TouchableOpacity
          onPress={pickImages}
          style={{ borderWidth: 2, borderColor: C.inputBorder, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 32, alignItems: 'center', gap: 8 }}
        >
          <MaterialCommunityIcons name="image-multiple-outline" size={40} color={C.muted} />
          <Text style={{ color: C.muted, fontSize: 13, fontWeight: '600', fontFamily: appFont }}>Tap to pick photos</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 4 }}>
            {pickedImages.map((img, index) => (
              <View key={index} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: img.cloudUrl || img.uri }}
                  style={{ width: 90, height: 90, borderRadius: 14, backgroundColor: C.surfaceAlt }}
                />
                {index === 0 && (
                  <View style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: C.primary, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>COVER</Text>
                  </View>
                )}
                {img.uploading && (
                  <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color="#fff" size="small" />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removePickedImage(index)}
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', borderRadius: 999, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}
                >
                  <MaterialCommunityIcons name="close" size={13} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {pickedImages.length < 12 && (
              <TouchableOpacity
                onPress={pickImages}
                style={{ width: 90, height: 90, borderRadius: 14, borderWidth: 2, borderColor: C.inputBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                <MaterialCommunityIcons name="plus" size={24} color={C.muted} />
                <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', fontFamily: appFont }}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const ServiceForm = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={adminStyles.formSection}>
        <Text style={[adminStyles.formSectionTitle, { color: C.text, fontFamily: appFont }]}>Basic Information</Text>
        <FormField label="Service Name *" name="name" />
        <SelectField
          label="Service Type *"
          value={formData.serviceType}
          options={SERVICE_TYPES.map((t) => ({ label: t, value: t }))}
          onSelect={(v) => setFormData({ ...formData, serviceType: v })}
          error={formErrors.serviceType}
        />
        <SelectField
          label="Category"
          value={formData.category}
          options={Object.keys(CATEGORIES_WITH_SUBS).map((c) => ({ label: c, value: c }))}
          onSelect={(v) => setFormData({ ...formData, category: v, subCategory: '' })}
        />
        {subCategoryOptions.length > 0 && (
          <SelectField
            label="Sub-category"
            value={formData.subCategory}
            options={subCategoryOptions}
            onSelect={(v) => setFormData({ ...formData, subCategory: v })}
          />
        )}
        <FormField label="Short Description" name="shortDescription" multiline />
        <FormField label="Full Description *" name="description" multiline />
      </View>

      <View style={adminStyles.formSection}>
        <Text style={[adminStyles.formSectionTitle, { color: C.text, fontFamily: appFont }]}>Pricing</Text>
        <FormField label="Base Price (₦) *" name="pricing" nested={{ parent: 'pricing', child: 'basePrice' }} keyboardType="numeric" />
        <SelectField
          label="Pricing Type"
          value={formData.pricing.unit}
          options={PRICING_UNITS}
          onSelect={(v) => setFormData({ ...formData, pricing: { ...formData.pricing, unit: v } })}
        />
      </View>

      <View style={adminStyles.formSection}>
        <Text style={[adminStyles.formSectionTitle, { color: C.text, fontFamily: appFont }]}>Status</Text>
        <Toggle label="Active" value={formData.isActive} onToggle={() => setFormData({ ...formData, isActive: !formData.isActive })} />
        <Toggle label="Featured" value={formData.isFeatured} onToggle={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })} color="#f59e0b" />
        <Toggle label="Available for Booking" value={formData.availability.isAvailable} onToggle={() => setFormData({ ...formData, availability: { isAvailable: !formData.availability.isAvailable } })} color="#10b981" />
      </View>

      <View style={adminStyles.formSection}>
        <Text style={[adminStyles.formSectionTitle, { color: C.text, fontFamily: appFont }]}>Cancellation Policy</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {['flexible', 'moderate', 'strict'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[{ flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: 'center' }, formData.cancellationPolicy === p ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.surface, borderColor: C.inputBorder }]}
              onPress={() => setFormData({ ...formData, cancellationPolicy: p })}
            >
              <Text style={{ color: formData.cancellationPolicy === p ? '#fff' : C.text, fontSize: 12, fontWeight: '700', fontFamily: appFont, textTransform: 'capitalize' }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FormField label="Cancellation Details" name="cancellationDetails" multiline />
      </View>

      <ImageSection />

      <View style={adminStyles.modalActions}>
        <TouchableOpacity style={[adminStyles.modalBtn, { borderWidth: 1, borderColor: C.inputBorder }]} onPress={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <Text style={[adminStyles.modalBtnText, { color: C.text, fontFamily: appFont }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.modalBtn, { backgroundColor: C.primary }]} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={[adminStyles.modalBtnText, { color: '#fff', fontFamily: appFont }]}>{isSubmitting ? 'Saving...' : showEditModal ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const ServiceCard = ({ service }: { service: any }) => {
    const isActive = service.isActive !== false;
    const isFeatured = service.isFeatured || false;
    const expanded = selectedService?._id === service._id;
    const providerName = typeof service.provider === 'object'
      ? service.provider.businessName || `${service.provider.firstName} ${service.provider.lastName}`
      : service.provider;

    return (
      <TouchableOpacity
        onPress={() => setSelectedService(expanded ? null : service)}
        style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}
        activeOpacity={0.85}
      >
        <View style={adminStyles.cardRow}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialCommunityIcons name="briefcase" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8, fontFamily: appFont }}>{service.name}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {isFeatured && (
                  <View style={[adminStyles.badge, { backgroundColor: '#fef3c7', flexDirection: 'row', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name="star" size={10} color="#f59e0b" />
                    <Text style={[adminStyles.badgeText, { color: '#b45309', marginLeft: 2 }]}>Featured</Text>
                  </View>
                )}
                <View style={[adminStyles.badge, { backgroundColor: isActive ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[adminStyles.badgeText, { color: isActive ? '#166534' : '#b91c1c' }]}>{isActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
            </View>
            {providerName && <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>Provider: {providerName}</Text>}
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 1, fontFamily: appFont }}>{service.serviceType}</Text>
            <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13, marginTop: 2, fontFamily: appFont }}>₦{service.pricing?.basePrice?.toLocaleString() || 0} / {service.pricing?.unit || 'fixed'}</Text>
          </View>
          <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
        </View>

        {expanded && (
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border }}>
            {[
              { label: 'Category', value: service.category || 'N/A' },
              { label: 'Sub-category', value: service.subCategory || 'N/A' },
              { label: 'Created', value: formatDate(service.createdAt) },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{row.label}</Text>
                <Text style={{ color: C.text, fontSize: 12, fontWeight: '700', fontFamily: appFont }}>{row.value}</Text>
              </View>
            ))}
            {service.description && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 4, fontFamily: appFont }}>Description</Text>
                <Text style={{ color: C.text, fontSize: 12, fontFamily: appFont }}>{service.description}</Text>
              </View>
            )}
            {service.images && service.images.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, fontFamily: appFont }}>Images ({service.images.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {service.images.map((img: any, i: number) => {
                      const uri = typeof img === 'string' ? img : img?.url;
                      return uri ? (
                        <View key={i} style={{ position: 'relative' }}>
                          <Image source={{ uri }} style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: C.surfaceAlt }} />
                          {i === 0 && (
                            <View style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: C.primary, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 }}>
                              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>COVER</Text>
                            </View>
                          )}
                        </View>
                      ) : null;
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
            <View style={adminStyles.actionRow}>
              <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isFeatured ? '#fef3c7' : C.surfaceAlt }]} onPress={() => handleToggleFeatured(service)}>
                <Text style={[adminStyles.actionBtnText, { color: isFeatured ? '#b45309' : C.text }]}>{isFeatured ? 'Unfeature' : 'Feature'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isActive ? (isDark ? '#450a0a' : '#fee2e2') : (isDark ? '#14532d' : '#dcfce7') }]} onPress={() => handleToggleActive(service)}>
                <Text style={[adminStyles.actionBtnText, { color: isActive ? '#b91c1c' : '#166534' }]}>{isActive ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.actionBtn, { borderWidth: 1, borderColor: C.primary }]} onPress={() => {
                setSelectedService(service);
                // Pre-populate existing cloud images so they show in the picker grid
                const existing = (service.images || []).map((img: any) => ({
                  uri: typeof img === 'string' ? img : img?.url || '',
                  uploading: false,
                  cloudUrl: typeof img === 'string' ? img : img?.url || '',
                })).filter((img: any) => img.uri);
                setPickedImages(existing);
                setFormData({ name: service.name || '', description: service.description || '', shortDescription: service.shortDescription || '', serviceType: service.serviceType || '', category: service.category || '', subCategory: service.subCategory || '', pricing: { basePrice: service.pricing?.basePrice?.toString() || '', unit: service.pricing?.unit || 'fixed' }, availability: { isAvailable: service.availability?.isAvailable !== false }, coverageArea: service.coverageArea || {}, packages: service.packages || [], images: service.images || [], media: service.media || {}, inventory: service.inventory || {}, quantity: service.quantity || 1, fullDescription: service.fullDescription || '', provider: typeof service.provider === 'object' ? service.provider._id : service.provider || '', providerType: service.providerType || 'events_service_provider', isActive: service.isActive !== false, isFeatured: service.isFeatured || false, tags: service.tags || [], specifications: service.specifications || [], cancellationPolicy: service.cancellationPolicy || 'moderate', cancellationDetails: service.cancellationDetails || '' });
                setShowEditModal(true);
              }}>
                <Text style={[adminStyles.actionBtnText, { color: C.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleDeleteService(service)}>
                <Text style={[adminStyles.actionBtnText, { color: '#b91c1c' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const CATEGORY_FILTERS = [
    { label: 'All', value: 'all' }, { label: 'Venue', value: 'venue' }, { label: 'Catering', value: 'catering' },
    { label: 'Photo', value: 'photography' }, { label: 'Entertainment', value: 'entertainment' },
    { label: 'Decor', value: 'decoration' }, { label: 'Other', value: 'other' },
  ];

  const STAT_CARDS = [
    { label: 'Total', value: services.length, accent: '#2563eb', bg: isDark ? '#1e3a5f' : '#eff6ff', border: isDark ? '#1e40af' : '#bfdbfe' },
    { label: 'Active', value: services.filter((s: any) => s.isActive !== false).length, accent: '#1f7a4d', bg: isDark ? '#14532d' : '#f0fdf4', border: isDark ? '#166534' : '#bbf7d0' },
    { label: 'Featured', value: services.filter((s: any) => s.isFeatured).length, accent: '#d97706', bg: isDark ? '#451a03' : '#fffbeb', border: isDark ? '#92400e' : '#fde68a' },
  ];

  if (isLoading) return <Loading fullScreen message="Loading services..." />;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Manage Services</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(true); }}>
          <MaterialCommunityIcons name="plus-circle" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ServiceCard service={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={[adminStyles.hero, { backgroundColor: C.primary, marginTop: 12 }]}>
              <Text style={[adminStyles.heroEyebrow, { fontFamily: appFont }]}>ADMIN</Text>
              <Text style={[adminStyles.heroTitle, { fontFamily: appFont }]}>Manage Services</Text>
              <Text style={[adminStyles.heroSubtitle, { fontFamily: appFont }]}>{services.length} services</Text>
            </View>

            {error && <View style={{ marginBottom: 12 }}><ErrorMessage error={error} /></View>}

            <View style={[adminStyles.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={C.muted} />
              <TextInput
                placeholder="Search by name, type, provider..."
                value={searchText}
                onChangeText={setSearchText}
                style={[adminStyles.searchInput, { color: C.text, fontFamily: appFont }]}
                placeholderTextColor={C.muted}
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {CATEGORY_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[adminStyles.filterChip, { marginRight: 8, backgroundColor: filterCategory === f.value ? C.primary : C.surface, borderColor: filterCategory === f.value ? C.primary : C.inputBorder }]}
                  onPress={() => setFilterCategory(f.value)}
                >
                  <Text style={[adminStyles.filterChipText, { color: filterCategory === f.value ? '#fff' : C.text, fontFamily: appFont }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[adminStyles.filterRow, { marginBottom: 12 }]}>
              {[{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }].map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[adminStyles.filterChip, { flex: 1, alignItems: 'center', backgroundColor: filterStatus === f.value ? C.primary : C.surface, borderColor: filterStatus === f.value ? C.primary : C.inputBorder }]}
                  onPress={() => setFilterStatus(f.value)}
                >
                  <Text style={[adminStyles.filterChipText, { color: filterStatus === f.value ? '#fff' : C.text, fontFamily: appFont }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={adminStyles.statsGrid}>
              {STAT_CARDS.map((s) => (
                <View key={s.label} style={[adminStyles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={[adminStyles.statLabel, { color: s.accent, fontFamily: appFont }]}>{s.label}</Text>
                  <Text style={[adminStyles.statValue, { color: s.accent, fontFamily: appFont }]}>{s.value}</Text>
                </View>
              ))}
            </View>

            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>Services</Text>
          </>
        }
        ListEmptyComponent={
          <View style={adminStyles.emptyState}>
            <MaterialCommunityIcons name="briefcase-off" size={48} color={C.muted} />
            <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No services found</Text>
            <Text style={[adminStyles.emptySubtext, { color: C.muted, fontFamily: appFont }]}>Try adjusting your filters</Text>
          </View>
        }
      />

      {[{ visible: showAddModal, title: 'Add New Service', onClose: () => setShowAddModal(false) },
        { visible: showEditModal, title: 'Edit Service', onClose: () => setShowEditModal(false) }].map(({ visible, title, onClose }) => (
        <Modal key={title} visible={visible} animationType="slide" transparent={false}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <SafeAreaView style={[{ flex: 1 }, { backgroundColor: C.bg }]}>
              <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color={C.text} />
                </TouchableOpacity>
                <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont, textAlign: 'center' }]}>{title}</Text>
                <View style={{ width: 24 }} />
              </View>
              <ServiceForm />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      ))}
    </SafeAreaView>
  );
};

export default ManageServicesScreen;
