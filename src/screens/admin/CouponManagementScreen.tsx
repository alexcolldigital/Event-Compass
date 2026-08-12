import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatDate } from '../../utils/helpers.js';

const EMPTY = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', usageLimit: '', startDate: '', endDate: '' };

export default function CouponManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getCoupons({ limit: 50 }); setCoupons(r.coupons || []); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({ code: item.code, description: item.description || '', discountType: item.discountType, discountValue: String(item.discountValue), minOrderAmount: String(item.minOrderAmount || ''), usageLimit: String(item.usageLimit || ''), startDate: item.startDate?.slice(0, 10) || '', endDate: item.endDate?.slice(0, 10) || '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) return Alert.alert('Error', 'Fill required fields');
    setIsSaving(true);
    try {
      const data = { ...form, discountValue: parseFloat(form.discountValue), minOrderAmount: parseFloat(form.minOrderAmount) || 0, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null };
      if (editingId) { const r = await adminAPI.updateCoupon(editingId, data); setCoupons(prev => prev.map(x => x._id === editingId ? r.coupon : x)); }
      else { const r = await adminAPI.createCoupon(data); setCoupons(prev => [r.coupon, ...prev]); }
      setModalVisible(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (item) => {
    try { const r = await adminAPI.toggleCoupon(item._id); setCoupons(prev => prev.map(x => x._id === item._id ? r.coupon : x)); }
    catch (e) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Coupon', `Delete "${item.code}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteCoupon(item._id); setCoupons(prev => prev.filter(x => x._id !== item._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const CouponCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={adminStyles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[s.code, { color: c.text, fontFamily: font }]}>{item.code}</Text>
            <View style={[adminStyles.badge, { backgroundColor: item.isActive ? '#dcfce7' : '#f3f4f6' }]}>
              <Text style={[adminStyles.badgeText, { color: item.isActive ? '#15803d' : '#6b7280', fontFamily: font }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          <Text style={[s.discount, { color: c.primary, fontFamily: font }]}>{item.discountType === 'percentage' ? `${item.discountValue}% off` : `₦${item.discountValue} off`}</Text>
          {item.description ? <Text style={[s.desc, { color: c.muted, fontFamily: font }]}>{item.description}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => openEdit(item)}><MaterialCommunityIcons name="pencil" size={18} color={c.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}><MaterialCommunityIcons name="delete-outline" size={18} color="#dc2626" /></TouchableOpacity>
        </View>
      </View>
      <View style={[adminStyles.cardRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: c.border }]}>
        <Text style={[s.meta, { color: c.muted, fontFamily: font }]}>{formatDate(item.startDate)} – {formatDate(item.endDate)}</Text>
        <Text style={[s.meta, { color: c.muted, fontFamily: font }]}>Used: {item.usedCount}/{item.usageLimit || '∞'}</Text>
        <TouchableOpacity style={[adminStyles.badge, { backgroundColor: item.isActive ? '#fff1f2' : '#f0fdf4' }]} onPress={() => handleToggle(item)}>
          <Text style={[adminStyles.badgeText, { color: item.isActive ? '#dc2626' : '#15803d', fontFamily: font }]}>{item.isActive ? 'Disable' : 'Enable'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Field = ({ label, fkey, placeholder, keyboard = 'default' }) => (
    <View>
      <Text style={[adminStyles.formLabel, { color: c.text, fontFamily: font }]}>{label}</Text>
      <TextInput style={[adminStyles.formInput, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text, fontFamily: font, marginBottom: 12 }]} value={form[fkey]} onChangeText={v => setForm(prev => ({ ...prev, [fkey]: v }))} placeholder={placeholder} placeholderTextColor={c.muted} keyboardType={keyboard as any} />
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Coupon Management</Text>
        <TouchableOpacity style={[adminStyles.headerAction, { backgroundColor: c.primary }]} onPress={openCreate}>
          <Text style={[adminStyles.headerActionText, { fontFamily: font }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={coupons}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <CouponCard item={item} />}
          ListEmptyComponent={
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No coupons yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <ScrollView style={[adminStyles.modalSheet, { backgroundColor: c.surface }]} contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={[adminStyles.modalTitle, { color: c.text, fontFamily: font }]}>{editingId ? 'Edit Coupon' : 'New Coupon'}</Text>
            <Field label="Code *" fkey="code" placeholder="e.g. SAVE20" />
            <Field label="Description" fkey="description" placeholder="Optional" />
            <Text style={[adminStyles.formLabel, { color: c.text, fontFamily: font }]}>Discount Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['percentage', 'fixed'].map(t => (
                <TouchableOpacity key={t} style={[adminStyles.chip, { flex: 1, justifyContent: 'center', backgroundColor: form.discountType === t ? c.primary : 'transparent', borderColor: form.discountType === t ? c.primary : c.inputBorder }]} onPress={() => setForm(prev => ({ ...prev, discountType: t }))}>
                  <Text style={[adminStyles.chipText, { color: form.discountType === t ? '#fff' : c.muted, fontFamily: font, textTransform: 'capitalize', textAlign: 'center' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field label="Discount Value *" fkey="discountValue" placeholder={form.discountType === 'percentage' ? '10' : '500'} keyboard="decimal-pad" />
            <Field label="Min Order Amount (₦)" fkey="minOrderAmount" placeholder="0" keyboard="decimal-pad" />
            <Field label="Usage Limit (blank = unlimited)" fkey="usageLimit" placeholder="e.g. 100" keyboard="number-pad" />
            <Field label="Start Date * (YYYY-MM-DD)" fkey="startDate" placeholder="2025-01-01" />
            <Field label="End Date * (YYYY-MM-DD)" fkey="endDate" placeholder="2025-12-31" />
            <View style={adminStyles.actionRow}>
              <TouchableOpacity style={[adminStyles.actionBtn, { borderWidth: 1, borderColor: c.inputBorder }]} onPress={() => setModalVisible(false)}>
                <Text style={[adminStyles.actionBtnText, { color: c.text, fontFamily: font }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: c.primary }]} onPress={handleSave} disabled={isSaving}>
                <Text style={[adminStyles.actionBtnText, { color: '#fff', fontFamily: font }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  code: { fontSize: 15, fontWeight: '800' },
  discount: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  desc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  meta: { fontSize: 11, fontWeight: '500' },
});
