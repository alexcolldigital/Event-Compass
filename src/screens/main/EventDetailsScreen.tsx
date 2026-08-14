import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Alert, TextInput, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';

const EVENT_TYPES = [
  'Wedding', 'Birthday', 'Corporate', 'Burial/Funeral', 'Graduation',
  'Naming Ceremony', 'Engagement', 'Conference', 'Concert', 'Other',
];

const EventDetailsScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
    chip: isDark ? '#1e293b' : '#f1f5f9',
    chipActive: isDark ? '#064e3b' : '#d1fae5',
  };

  const onlyNumbers = (text: string) => text.replace(/[^0-9]/g, '');
  const onlyPhoneChars = (text: string) => text.replace(/[^0-9+\-() ]/g, '');

  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [lga, setLga] = useState('');
  const [town, setTown] = useState('');
  const [state, setState] = useState('Lagos');
  const [eventDate, setEventDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [eventTime, setEventTime] = useState('12:00 PM');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleContinue = () => {
    if (!clientName.trim()) return Alert.alert('Required', 'Please enter the client name.');
    if (!phoneNumber.trim()) return Alert.alert('Required', 'Please enter a phone number.');
    if (!eventType) return Alert.alert('Required', 'Please select an event type.');
    if (!eventAddress.trim()) return Alert.alert('Required', 'Please enter the event address.');
    if (!lga.trim()) return Alert.alert('Required', 'Please enter the Local Government Area.');
    if (!town.trim()) return Alert.alert('Required', 'Please enter the town/city.');
    if (!state.trim()) return Alert.alert('Required', 'Please enter the state.');
    if (!expectedGuests.trim() || isNaN(Number(expectedGuests)))
      return Alert.alert('Required', 'Please enter a valid number of expected guests.');

    navigation.navigate('Checkout', {
      eventDetails: {
        clientName: clientName.trim(),
        phoneNumber: phoneNumber.trim(),
        clientAddress: clientAddress.trim(),
        eventType,
        eventDescription: eventDescription.trim(),
        expectedGuests: Number(expectedGuests),
        eventDate: eventDate.toISOString(),
        eventTime: eventTime.trim(),
        location: {
          address: eventAddress.trim(),
          lga: lga.trim(),
          town: town.trim(),
          state: state.trim(),
          country: 'Nigeria',
        },
        additionalNotes: additionalNotes.trim(),
      },
    });
  };

  const Field = ({
    icon, placeholder, value, onChangeText, keyboardType = 'default', multiline = false,
  }: any) => (
    <View style={[styles.field, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      <TextInput
        style={[styles.input, { color: colors.text }, multiline && styles.multiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Event Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Info */}
        <SectionLabel label="Client Information" color={colors.muted} />
        <Field icon="account" placeholder="Client full name *" value={clientName} onChangeText={setClientName} />
        <Field icon="phone" placeholder="Phone number *" value={phoneNumber} onChangeText={(t) => setPhoneNumber(onlyPhoneChars(t))} keyboardType="phone-pad" />
        <Field icon="home-outline" placeholder="Client address" value={clientAddress} onChangeText={setClientAddress} />

        {/* Event Info */}
        <SectionLabel label="Event Information" color={colors.muted} />

        <Text style={[styles.label, { color: colors.muted }]}>Event Type *</Text>
        <View style={styles.chips}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setEventType(type)}
              style={[
                styles.chip,
                { backgroundColor: eventType === type ? colors.chipActive : colors.chip, borderColor: eventType === type ? colors.primary : 'transparent' },
              ]}
            >
              <Text style={[styles.chipText, { color: eventType === type ? colors.primary : colors.muted }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field icon="text" placeholder="Event description" value={eventDescription} onChangeText={setEventDescription} multiline />
        <Field icon="account-group" placeholder="Expected number of guests *" value={expectedGuests} onChangeText={(t) => setExpectedGuests(onlyNumbers(t))} keyboardType="numeric" />

        {/* Date & Time */}
        <SectionLabel label="Date & Time" color={colors.muted} />
        <TouchableOpacity
          style={[styles.field, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.input, { color: colors.text }]}>{eventDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setEventDate(date);
            }}
          />
        )}
        <Field icon="clock-outline" placeholder="Event time (e.g. 3:00 PM) *" value={eventTime} onChangeText={setEventTime} />

        {/* Location */}
        <SectionLabel label="Event Location" color={colors.muted} />
        <Field icon="map-marker" placeholder="Full event address *" value={eventAddress} onChangeText={setEventAddress} />
        <Field icon="city" placeholder="Local Government Area (LGA) *" value={lga} onChangeText={setLga} />
        <Field icon="home-city" placeholder="Town / City *" value={town} onChangeText={setTown} />
        <Field icon="map" placeholder="State *" value={state} onChangeText={setState} />

        {/* Additional */}
        <SectionLabel label="Additional Information" color={colors.muted} />
        <Field icon="note-text-outline" placeholder="Any special requirements or notes" value={additionalNotes} onChangeText={setAdditionalNotes} multiline />

        <Button title="Continue to Checkout" onPress={handleContinue} fullWidth variant="primary" />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionLabel = ({ label, color }: { label: string; color: string }) => (
  <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginLeft: 16 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 2 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14 },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
});

export default EventDetailsScreen;
