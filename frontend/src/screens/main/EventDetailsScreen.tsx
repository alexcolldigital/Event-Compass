import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Alert, TextInput, Platform,
} from 'react-native';

// Lazy-load native date picker only on iOS/Android to avoid web bundle errors
const NativeDateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : () => null;
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { useCartStore } from '../../context/cartStore';
import Button from '../../components/Button.jsx';

const EVENT_TYPES = [
  'Wedding', 'Birthday', 'Corporate', 'Burial/Funeral', 'Graduation',
  'Naming Ceremony', 'Engagement', 'Conference', 'Concert', 'Other',
];

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const VENUE_TYPES = ['Indoor', 'Outdoor', 'Hybrid', 'Virtual'];

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

const EventDetailsScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { items, removeItem, updateItemQuantity, getTotalAmount, eventDraft, setEventDraft } = useCartStore();

  const colors = {
    bg: isDark ? '#050816' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
    chip: isDark ? '#1e293b' : '#f1f5f9',
    chipActive: isDark ? '#064e3b' : '#d1fae5',
    error: '#ef4444',
  };

  const [clientName, setClientName] = useState(eventDraft.clientName || '');
  const [phoneNumber, setPhoneNumber] = useState(eventDraft.phoneNumber || '');
  const [clientAddress, setClientAddress] = useState(eventDraft.clientAddress || '');
  const [eventType, setEventType] = useState(eventDraft.eventType || '');
  const [venueType, setVenueType] = useState(eventDraft.venueType || '');
  const [eventDescription, setEventDescription] = useState(eventDraft.eventDescription || '');
  const [expectedGuests, setExpectedGuests] = useState(eventDraft.expectedGuests || '');
  const [eventAddress, setEventAddress] = useState(eventDraft.eventAddress || '');
  const [lga, setLga] = useState(eventDraft.lga || '');
  const [town, setTown] = useState(eventDraft.town || '');
  const [state, setState] = useState(eventDraft.state || '');
  const [showStateList, setShowStateList] = useState(false);
  const [eventDate, setEventDate] = useState<Date | null>(eventDraft.eventDate ? new Date(eventDraft.eventDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState(eventDraft.additionalNotes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const saveDraft = (patch: Record<string, any>) => setEventDraft(patch);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = 'Client name is required';
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (!eventType) e.eventType = 'Please select an event type';
    if (!eventAddress.trim()) e.eventAddress = 'Event address is required';
    if (!lga.trim()) e.lga = 'LGA is required';
    if (!town.trim()) e.town = 'Town / City is required';
    if (!state.trim()) e.state = 'State is required';
    if (!expectedGuests.trim() || isNaN(Number(expectedGuests)) || Number(expectedGuests) < 1)
      e.expectedGuests = 'Enter a valid number of guests';
    if (!eventDate) e.eventDate = 'Event date is required';
    else if (eventDate < new Date()) e.eventDate = 'Event date must be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      Alert.alert('Missing information', 'Please fill in all required fields.');
      return;
    }
    const eventDetails = {
      clientName: clientName.trim(),
      phoneNumber: phoneNumber.trim(),
      clientAddress: clientAddress.trim(),
      eventType,
      venueType,
      eventDescription: eventDescription.trim(),
      expectedGuests: Number(expectedGuests),
      eventDate: eventDate!.toISOString(),
      eventTime: '',
      location: {
        address: eventAddress.trim(),
        lga: lga.trim(),
        town: town.trim(),
        state: state.trim(),
        country: 'Nigeria',
      },
      additionalNotes: additionalNotes.trim(),
    };
    saveDraft({
      clientName: clientName.trim(),
      phoneNumber: phoneNumber.trim(),
      clientAddress: clientAddress.trim(),
      eventType,
      venueType,
      eventDescription: eventDescription.trim(),
      expectedGuests,
      eventAddress: eventAddress.trim(),
      lga: lga.trim(),
      town: town.trim(),
      state: state.trim(),
      eventDate: eventDate!.toISOString(),
      additionalNotes: additionalNotes.trim(),
    });
    navigation.navigate('Checkout', { eventDetails });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text, fontFamily: appFont }]}>Event Details</Text>
          <Text style={[styles.subtitle, { color: colors.muted, fontFamily: appFont }]}>Step 1 of 2 — Fill in your event info</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.chip }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '50%' }]} />
        </View>

        {/* Selected Items Summary */}
        {items.length > 0 && (
          <View style={[styles.cartCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.cartCardHeader}>
              <MaterialCommunityIcons name="cart-check" size={18} color={colors.primary} />
              <Text style={[styles.cartCardTitle, { color: colors.text, fontFamily: appFont }]}>
                Selected Items ({items.length})
              </Text>
            </View>
            {items.map((item: any) => (
              <View key={item.serviceId} style={[styles.cartRow, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cartItemName, { color: colors.text, fontFamily: appFont }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.cartItemPrice, { color: colors.muted, fontFamily: appFont }]}>
                    ₦{(item.price || 0).toLocaleString()} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.cartQtyRow}>
                  <TouchableOpacity
                    onPress={() => item.quantity <= 1 ? removeItem(item.serviceId) : updateItemQuantity(item.serviceId, item.quantity - 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name={item.quantity <= 1 ? 'trash-can-outline' : 'minus'} size={14} color={item.quantity <= 1 ? '#ef4444' : colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.text, fontFamily: appFont }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateItemQuantity(item.serviceId, item.quantity + 1)}
                    style={[styles.qtyBtn, { borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons name="plus" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cartItemSubtotal, { color: colors.primary, fontFamily: appFont }]}>
                  ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={[styles.cartTotal, { borderTopColor: colors.border }]}>
              <Text style={[styles.cartTotalLabel, { color: colors.muted, fontFamily: appFont }]}>Total</Text>
              <Text style={[styles.cartTotalValue, { color: colors.primary, fontFamily: appFont }]}>₦{getTotalAmount().toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Client Info */}
        <SectionLabel label="Client Information" color={colors.muted} />
        <Field icon="account" placeholder="Client full name *" value={clientName} onChangeText={setClientName} fieldKey="clientName" colors={colors} errors={errors} setErrors={setErrors} />
        <Field icon="phone" placeholder="Phone number *" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" fieldKey="phoneNumber" colors={colors} errors={errors} setErrors={setErrors} />
        <Field icon="home-outline" placeholder="Client home address" value={clientAddress} onChangeText={setClientAddress} fieldKey="clientAddress" colors={colors} errors={errors} setErrors={setErrors} />

        {/* Event Info */}
        <SectionLabel label="Event Information" color={colors.muted} />
        <Text style={[styles.label, { color: colors.muted, fontFamily: appFont }]}>Event Type *</Text>
        <ChipGroup options={EVENT_TYPES} selected={eventType} onSelect={setEventType} fieldKey="eventType" colors={colors} errors={errors} setErrors={setErrors} />

        <Text style={[styles.label, { color: colors.muted, fontFamily: appFont }]}>Venue Type</Text>
        <ChipGroup options={VENUE_TYPES} selected={venueType} onSelect={setVenueType} fieldKey="venueType" colors={colors} errors={errors} setErrors={setErrors} />

        <Field icon="text" placeholder="Event description (theme, style, etc.)" value={eventDescription} onChangeText={setEventDescription} multiline fieldKey="eventDescription" colors={colors} errors={errors} setErrors={setErrors} />
        <Field icon="account-group" placeholder="Expected number of guests *" value={expectedGuests} onChangeText={setExpectedGuests} keyboardType="numeric" fieldKey="expectedGuests" colors={colors} errors={errors} setErrors={setErrors} />

        {/* Date & Time */}
        <SectionLabel label="Date & Time" color={colors.muted} />

        <View style={{ marginBottom: 2 }}>
          <TouchableOpacity
            style={[styles.field, { borderColor: errors.eventDate ? colors.error : colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="calendar" size={18} color={errors.eventDate ? colors.error : colors.primary} />
            <Text style={[styles.input, { color: eventDate ? colors.text : colors.muted, fontFamily: appFont }]}>
              {eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Select event date *'}
            </Text>
          </TouchableOpacity>
          {errors.eventDate ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.eventDate}</Text> : null}
        </View>

        {showDatePicker && (
          Platform.OS === 'web' ? (
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={eventDate ? eventDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const d = e.target.value ? new Date(e.target.value) : null;
                setShowDatePicker(false);
                if (d) { setEventDate(d); setErrors((p) => ({ ...p, eventDate: '' })); }
              }}
              style={{ display: 'block', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 14 }}
            />
          ) : (
            <NativeDateTimePicker
              value={eventDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) { setEventDate(date); setErrors((p) => ({ ...p, eventDate: '' })); }
              }}
            />
          )
        )}

        {/* Location */}
        <SectionLabel label="Event Location" color={colors.muted} />
        <Field icon="map-marker" placeholder="Full event address / venue name *" value={eventAddress} onChangeText={setEventAddress} fieldKey="eventAddress" colors={colors} errors={errors} setErrors={setErrors} />
        <Field icon="city-variant-outline" placeholder="Local Government Area (LGA) *" value={lga} onChangeText={setLga} fieldKey="lga" colors={colors} errors={errors} setErrors={setErrors} />
        <Field icon="home-city" placeholder="Town / City *" value={town} onChangeText={setTown} fieldKey="town" colors={colors} errors={errors} setErrors={setErrors} />

        {/* State picker */}
        <View style={{ marginBottom: 2 }}>
          <TouchableOpacity
            style={[styles.field, { borderColor: errors.state ? colors.error : colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowStateList((v) => !v)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="map" size={18} color={errors.state ? colors.error : colors.primary} />
            <Text style={[styles.input, { color: state ? colors.text : colors.muted, fontFamily: appFont }]}>
              {state || 'Select State *'}
            </Text>
            <MaterialCommunityIcons name={showStateList ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
          </TouchableOpacity>
          {errors.state ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.state}</Text> : null}
          {showStateList && (
            <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                {NIGERIAN_STATES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => { setState(s); setShowStateList(false); if (errors.state) setErrors((p) => ({ ...p, state: '' })); }}
                  >
                    <Text style={[styles.dropdownText, { color: s === state ? colors.primary : colors.text, fontFamily: appFont }]}>{s}</Text>
                    {s === state && <MaterialCommunityIcons name="check" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Additional */}
        <SectionLabel label="Additional Information" color={colors.muted} />
        <Field icon="note-text-outline" placeholder="Special requirements, dietary needs, accessibility, etc." value={additionalNotes} onChangeText={setAdditionalNotes} multiline fieldKey="additionalNotes" colors={colors} errors={errors} setErrors={setErrors} />

        <Button title="Continue to Checkout →" onPress={handleContinue} fullWidth variant="primary" style={{ marginTop: 8 }} />
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionLabel = ({ label, color }: { label: string; color: string }) => (
  <Text style={[styles.sectionLabel, { color, fontFamily: appFont }]}>{label}</Text>
);

function Field({ icon, placeholder, value, onChangeText, keyboardType = 'default', multiline = false, fieldKey, colors, errors, setErrors }: any) {
  return (
    <View style={{ marginBottom: 2 }}>
      <View style={[styles.field, { borderColor: errors[fieldKey] ? colors.error : colors.border, backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name={icon} size={18} color={errors[fieldKey] ? colors.error : colors.primary} />
        <TextInput
          style={[styles.input, { color: colors.text, fontFamily: appFont }, multiline && styles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={(t) => { onChangeText(t); if (errors[fieldKey]) setErrors((p: any) => ({ ...p, [fieldKey]: '' })); }}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
      {errors[fieldKey] ? <Text style={[styles.errorText, { color: colors.error }]}>{errors[fieldKey]}</Text> : null}
    </View>
  );
}

function ChipGroup({ options, selected, onSelect, fieldKey, colors, errors, setErrors }: any) {
  return (
    <View style={{ marginBottom: 2 }}>
      <View style={styles.chips}>
        {options.map((opt: string) => (
          <TouchableOpacity
            key={opt}
            onPress={() => { onSelect(opt); if (errors[fieldKey]) setErrors((p: any) => ({ ...p, [fieldKey]: '' })); }}
            style={[styles.chip, { backgroundColor: selected === opt ? colors.chipActive : colors.chip, borderColor: selected === opt ? colors.primary : (errors[fieldKey] ? colors.error : 'transparent') }]}
          >
            <Text style={[styles.chipText, { color: selected === opt ? colors.primary : colors.muted, fontFamily: appFont }]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[fieldKey] ? <Text style={[styles.errorText, { color: colors.error }]}>{errors[fieldKey]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 99, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  content: { padding: 16, gap: 10, paddingBottom: 96 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 2 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14 },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  errorText: { fontSize: 11, marginTop: 3, marginLeft: 4 },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1 },
  dropdownText: { fontSize: 14 },
  cartCard: { borderWidth: 1.5, borderRadius: 16, padding: 14, marginBottom: 4 },
  cartCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cartCardTitle: { fontSize: 14, fontWeight: '800' },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1 },
  cartItemName: { fontSize: 13, fontWeight: '700' },
  cartItemPrice: { fontSize: 12, marginTop: 2 },
  cartQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '700', minWidth: 18, textAlign: 'center' },
  cartItemSubtotal: { fontSize: 13, fontWeight: '800', minWidth: 70, textAlign: 'right' },
  cartTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 10, marginTop: 4 },
  cartTotalLabel: { fontSize: 13, fontWeight: '700' },
  cartTotalValue: { fontSize: 16, fontWeight: '900' },
});

export default EventDetailsScreen;
