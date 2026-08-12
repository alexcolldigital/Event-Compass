import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatCurrency } from '../../utils/helpers.js';

export default function CommissionManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [form, setForm] = useState({ commissionRate: '10', minCommission: '0', maxCommission: '' });

  useEffect(() => {
    Promise.all([adminAPI.getCommissionSettings(), adminAPI.getCommissionBreakdown()])
      .then(([s, b]) => {
        setBreakdown(b.breakdown);
        setForm({ commissionRate: String(s.commission?.commissionRate || '10'), minCommission: String(s.commission?.minCommission || '0'), maxCommission: String(s.commission?.maxCommission || '') });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminAPI.updateCommissionSettings({ commissionRate: parseFloat(form.commissionRate), minCommission: parseFloat(form.minCommission), maxCommission: form.maxCommission ? parseFloat(form.maxCommission) : undefined });
      Alert.alert('Success', 'Commission settings updated');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <Loading fullScreen />;

  const breakdownItems = breakdown ? [
    { label: 'Total Revenue', value: formatCurrency(breakdown.totalRevenue || 0), bg: '#eff6ff', color: '#2563eb' },
    { label: 'Platform Fees', value: formatCurrency(breakdown.totalPlatformFees || 0), bg: '#fffbeb', color: '#d97706' },
    { label: 'Provider Payouts', value: formatCurrency(breakdown.totalPayouts || 0), bg: '#f0fdf4', color: '#15803d' },
    { label: 'Transactions', value: breakdown.count || 0, bg: '#faf5ff', color: '#7c3aed' },
  ] : [];

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Commission Management</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {breakdown && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Revenue Breakdown</Text>
            <View style={[adminStyles.statsRow, { flexWrap: 'wrap' }]}>
              {breakdownItems.map(item => (
                <View key={item.label} style={[adminStyles.statCard, { width: '47%', backgroundColor: item.bg, borderColor: item.color + '30' }]}>
                  <Text style={[adminStyles.statLabel, { color: item.color, fontFamily: font }]}>{item.label}</Text>
                  <Text style={[adminStyles.statValue, { color: item.color, fontFamily: font, fontSize: 16 }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[adminStyles.sectionTitle, { color: c.text, fontFamily: font }]}>Commission Settings</Text>
          {[{ label: 'Commission Rate (%)', key: 'commissionRate', placeholder: 'e.g. 10', keyboard: 'decimal-pad' }, { label: 'Minimum Commission (₦)', key: 'minCommission', placeholder: 'e.g. 500', keyboard: 'decimal-pad' }, { label: 'Maximum Commission (₦, optional)', key: 'maxCommission', placeholder: 'Leave blank for no cap', keyboard: 'decimal-pad' }].map(f => (
            <View key={f.key}>
              <Text style={[adminStyles.formLabel, { color: c.text, fontFamily: font }]}>{f.label}</Text>
              <TextInput
                style={[adminStyles.formInput, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text, fontFamily: font }]}
                value={form[f.key]}
                onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                keyboardType={f.keyboard as any}
                placeholder={f.placeholder}
                placeholderTextColor={c.muted}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: c.primary }]} onPress={handleSave} disabled={isSaving}>
            <Text style={[s.saveBtnText, { fontFamily: font }]}>{isSaving ? 'Saving...' : 'Save Settings'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  saveBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
