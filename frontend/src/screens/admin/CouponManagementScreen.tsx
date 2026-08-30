import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatDate } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';
import { goBackToAdminDashboard } from '../../utils/adminNavigation';
import Toast, { ToastType } from '../../components/Toast';

const EMPTY_FORM = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', usageLimit: '', startDate: '', endDate: '' };

export default function CouponManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({ visible: false, type: 'success', message: '' });
  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getCoupons({ limit: 50 });
      setCoupons(res.coupons || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalVisible(true); };
  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({ code: c.code, description: c.description || '', discountType: c.discountType, discountValue: String(c.discountValue), minOrderAmount: String(c.minOrderAmount || ''), usageLimit: String(c.usageLimit || ''), startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) { showToast('error', 'Fill required fields'); return; }
    setIsSaving(true);
    try {
      const data = { ...form, discountValue: parseFloat(form.discountValue), minOrderAmount: parseFloat(form.minOrderAmount) || 0, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null };
      if (editingId) {
        const res = await adminAPI.updateCoupon(editingId, data);
        setCoupons((c) => c.map((x) => x._id === editingId ? res.coupon : x));
      } else {
        const res = await adminAPI.createCoupon(data);
        setCoupons((c) => [res.coupon, ...c]);
      }
      setModalVisible(false);
      showToast('success', editingId ? 'Coupon updated' : 'Coupon created');
    } catch (e) { showToast('error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (coupon) => {
    try {
      const res = await adminAPI.toggleCoupon(coupon._id);
      setCoupons((c) => c.map((x) => x._id === coupon._id ? res.coupon : x));
    } catch (e) { showToast('error', e.message); }
  };

  const handleDelete = (coupon) => {
    Alert.alert('Delete Coupon', `Delete "${coupon.code}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteCoupon(coupon._id); setCoupons((c) => c.filter((x) => x._id !== coupon._id)); }
        catch (e) { showToast('error', e.message); }
      }},
    ]);
  };

  const CouponCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={adminStyles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, fontFamily: appFont }}>{item.code}</Text>
            <View style={[adminStyles.badge, { backgroundColor: item.isActive ? '#dcfce7' : C.surfaceAlt }]}>
              <Text style={[adminStyles.badgeText, { color: item.isActive ? '#166534' : C.muted, fontFamily: appFont }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13, fontFamily: appFont }}>
            {item.discountType === 'percentage' ? `${item.discountValue}% off` : `₦${item.discountValue} off`}
          </Text>
          {item.description ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }}>{item.description}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => openEdit(item)}>
            <MaterialCommunityIcons name="pencil" size={18} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: appFont }}>{formatDate(item.startDate)} – {formatDate(item.endDate)}</Text>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: appFont }}>Used: {item.usedCount}/{item.usageLimit || '∞'}</Text>
        <TouchableOpacity
          onPress={() => handleToggle(item)}
          style={[adminStyles.badge, { backgroundColor: item.isActive ? (isDark ? '#450a0a' : '#fee2e2') : (isDark ? '#14532d' : '#dcfce7') }]}
        >
          <Text style={[adminStyles.badgeText, { color: item.isActive ? '#b91c1c' : '#166534', fontFamily: appFont }]}>{item.isActive ? 'Disable' : 'Enable'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Field = ({ label, value, onChange, placeholder, keyboardType = 'default' }) => (
    <View style={adminStyles.formField}>
      <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{label}</Text>
      <TextInput
        style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <Toast visible={toast.visible} type={toast.type} message={toast.message} onHide={() => setToast(t => ({ ...t, visible: false }))} />
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Coupon Management</Text>
        <TouchableOpacity onPress={openCreate} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={coupons}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <CouponCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No coupons yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <ScrollView style={[adminStyles.modalSheet, { backgroundColor: C.surface }]} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[adminStyles.modalTitle, { color: C.text, fontFamily: appFont }]}>{editingId ? 'Edit Coupon' : 'New Coupon'}</Text>
            <Field label="Code *" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} placeholder="e.g. SAVE20" />
            <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" />

            <View style={adminStyles.formField}>
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Discount Type</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['percentage', 'fixed'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[{ flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' }, form.discountType === t ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder }]}
                    onPress={() => setForm((f) => ({ ...f, discountType: t }))}
                  >
                    <Text style={{ color: form.discountType === t ? '#fff' : C.text, fontWeight: '700', textTransform: 'capitalize', fontFamily: appFont }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="Discount Value *" value={form.discountValue} onChange={(v) => setForm((f) => ({ ...f, discountValue: v }))} placeholder={form.discountType === 'percentage' ? '10' : '500'} keyboardType="decimal-pad" />
            <Field label="Min Order Amount (₦)" value={form.minOrderAmount} onChange={(v) => setForm((f) => ({ ...f, minOrderAmount: v }))} placeholder="0" keyboardType="decimal-pad" />
            <Field label="Usage Limit (blank = unlimited)" value={form.usageLimit} onChange={(v) => setForm((f) => ({ ...f, usageLimit: v }))} placeholder="e.g. 100" keyboardType="number-pad" />
            <Field label="Start Date * (YYYY-MM-DD)" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="2025-01-01" />
            <Field label="End Date * (YYYY-MM-DD)" value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="2025-12-31" />

            <View style={adminStyles.modalActions}>
              <TouchableOpacity style={[adminStyles.modalBtn, { borderWidth: 1, borderColor: C.inputBorder }]} onPress={() => setModalVisible(false)}>
                <Text style={[adminStyles.modalBtnText, { color: C.text, fontFamily: appFont }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.modalBtn, { backgroundColor: C.primary }]} onPress={handleSave} disabled={isSaving}>
                <Text style={[adminStyles.modalBtnText, { color: '#fff', fontFamily: appFont }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
