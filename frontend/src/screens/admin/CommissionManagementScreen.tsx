import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatCurrency } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';
import Toast, { ToastType } from '../../components/Toast';

export default function CommissionManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [settings, setSettings] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ commissionRate: '', minCommission: '', maxCommission: '', serviceFeePercentage: '' });
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  useEffect(() => {
    Promise.all([adminAPI.getCommissionSettings(), adminAPI.getCommissionBreakdown()])
      .then(([s, b]) => {
        setSettings(s.commission);
        setBreakdown(b.breakdown);
        setForm({
          commissionRate: String(s.commission?.commissionRate || '10'),
          minCommission: String(s.commission?.minCommission || '0'),
          maxCommission: String(s.commission?.maxCommission || ''),
          serviceFeePercentage: String(s.commission?.serviceFeePercentage ?? '10'),
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await adminAPI.updateCommissionSettings({
        commissionRate: parseFloat(form.commissionRate),
        minCommission: parseFloat(form.minCommission),
        maxCommission: form.maxCommission ? parseFloat(form.maxCommission) : undefined,
        serviceFeePercentage: parseFloat(form.serviceFeePercentage),
      });
      setSettings(res.commission);
      showToast('success', 'Commission settings updated');
    } catch (e) {
      showToast('error', e.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  const BREAKDOWN_CARDS = breakdown ? [
    { label: 'Total Revenue', value: formatCurrency(breakdown.totalRevenue || 0), accent: '#2563eb', bg: isDark ? '#1e3a5f' : '#eff6ff', border: isDark ? '#1e40af' : '#bfdbfe' },
    { label: 'Platform Fees', value: formatCurrency(breakdown.totalPlatformFees || 0), accent: '#d97706', bg: isDark ? '#451a03' : '#fff7ed', border: isDark ? '#92400e' : '#fed7aa' },
    { label: 'Provider Payouts', value: formatCurrency(breakdown.totalPayouts || 0), accent: '#1f7a4d', bg: isDark ? '#14532d' : '#f0fdf4', border: isDark ? '#166534' : '#bbf7d0' },
    { label: 'Transactions', value: breakdown.count || 0, accent: '#7c3aed', bg: isDark ? '#2d1b69' : '#f5f3ff', border: isDark ? '#5b21b6' : '#ddd6fe' },
  ] : [];

  const FORM_FIELDS = [
    { label: 'Commission Rate (%)', key: 'commissionRate', placeholder: 'e.g. 10' },
    { label: 'Minimum Commission (₦)', key: 'minCommission', placeholder: 'e.g. 500' },
    { label: 'Maximum Commission (₦, optional)', key: 'maxCommission', placeholder: 'Leave blank for no cap' },
    { label: 'Service & Delivery Fee (%)', key: 'serviceFeePercentage', placeholder: 'e.g. 10' },
  ];

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <Toast visible={toast.visible} type={toast.type} message={toast.message} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Commission Management</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <View style={[adminStyles.hero, { backgroundColor: C.primary, marginTop: 12 }]}>
          <Text style={[adminStyles.heroEyebrow, { fontFamily: appFont }]}>ADMIN</Text>
          <Text style={[adminStyles.heroTitle, { fontFamily: appFont }]}>Commission Management</Text>
          <Text style={[adminStyles.heroSubtitle, { fontFamily: appFont }]}>
            Commission: {settings?.commissionRate || 10}% · Service Fee: {settings?.serviceFeePercentage ?? 10}%
          </Text>
        </View>

        {/* Breakdown */}
        {breakdown && (
          <>
            <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>Revenue Breakdown</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {BREAKDOWN_CARDS.map((s) => (
                <View key={s.label} style={[adminStyles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={[adminStyles.statLabel, { color: s.accent, fontFamily: appFont }]}>{s.label}</Text>
                  <Text style={[{ fontSize: 16, fontWeight: '800', marginTop: 6, fontFamily: appFont }, { color: s.accent }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Settings Form */}
        <Text style={[adminStyles.sectionTitle, { color: C.text, fontFamily: appFont, marginBottom: 12 }]}>Commission Settings</Text>
        <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          {FORM_FIELDS.map((f) => (
            <View key={f.key} style={adminStyles.formField}>
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{f.label}</Text>
              <TextInput
                style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]}
                value={form[f.key]}
                onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                keyboardType="decimal-pad"
                placeholder={f.placeholder}
                placeholderTextColor={C.muted}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[adminStyles.actionBtn, { backgroundColor: C.primary, marginTop: 4 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={[adminStyles.actionBtnText, { color: '#fff', fontSize: 14, fontFamily: appFont }]}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
