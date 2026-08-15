import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COUNTRY_PHONE_OPTIONS } from '../utils/countryPhoneOptions.js';

const PhoneCountryInput = ({
  label,
  value,
  onChangeText,
  selectedCountry,
  onCountryChange,
  placeholder,
  error,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const countryOptions = useMemo(() => COUNTRY_PHONE_OPTIONS, []);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsPickerOpen(true)}
          style={styles.countryButton}
        >
          <Text style={styles.flagText}>{selectedCountry?.flag || '🇳🇬'}</Text>
          <Text style={styles.countryCodeText}>{selectedCountry?.dialCode || '+234'}</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#16a34a" />
        </TouchableOpacity>

        <TextInput
          value={value || ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={isPickerOpen} transparent animationType="fade" onRequestClose={() => setIsPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsPickerOpen(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select country</Text>
              <TouchableOpacity onPress={() => setIsPickerOpen(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={countryOptions}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onCountryChange(item);
                    setIsPickerOpen(false);
                  }}
                  style={[
                    styles.option,
                    selectedCountry?.code === item.code && styles.optionSelected,
                  ]}
                >
                  <Text style={styles.optionFlag}>{item.flag}</Text>
                  <Text style={styles.optionName}>{item.name}</Text>
                  <Text style={styles.optionDial}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginLeft: 2,
    color: '#172017',
    fontSize: 14,
    fontWeight: '800',
  },
  inputWrap: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#dfe7df',
    backgroundColor: '#f8fbf7',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dfe7df',
    paddingRight: 10,
    marginRight: 10,
    paddingVertical: 10,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    color: '#172017',
    fontWeight: '800',
    fontSize: 14,
    marginRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: '#172017',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    marginTop: 7,
    marginLeft: 4,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2e7',
  },
  modalTitle: {
    color: '#172017',
    fontWeight: '800',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxHeight: 420,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f7fbf4',
  },
  optionSelected: {
    backgroundColor: '#dcfce7',
  },
  optionFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  optionName: {
    color: '#172017',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  optionDial: {
    color: '#16a34a',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default PhoneCountryInput;
