import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

const EMPTY_FORM = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', usageLimit: '', startDate: '', endDate: '' };

export default function CouponManagementScreen() {
  const navigation = useNavigation();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!form.code || !form.discountValue || !form.startDate || !form.endDate) return Alert.alert('Error', 'Fill required fields');
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
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (coupon) => {
    try {
      const res = await adminAPI.toggleCoupon(coupon._id);
      setCoupons((c) => c.map((x) => x._id === coupon._id ? res.coupon : x));
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (coupon) => {
    Alert.alert('Delete Coupon', `Delete "${coupon.code}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteCoupon(coupon._id); setCoupons((c) => c.filter((x) => x._id !== coupon._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const CouponCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-800 text-base">{item.code}</Text>
            <View className={`px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${item.isActive ? 'text-green-700' : 'text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          <Text className="text-primary font-semibold mt-1">
            {item.discountType === 'percentage' ? `${item.discountValue}% off` : `₦${item.discountValue} off`}
          </Text>
          {item.description ? <Text className="text-gray-500 text-xs mt-0.5">{item.description}</Text> : null}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => openEdit(item)}>
            <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <Text className="text-gray-400 text-xs">{formatDate(item.startDate)} – {formatDate(item.endDate)}</Text>
        <Text className="text-gray-400 text-xs">Used: {item.usedCount}/{item.usageLimit || '∞'}</Text>
        <TouchableOpacity onPress={() => handleToggle(item)} className={`px-2 py-1 rounded ${item.isActive ? 'bg-red-50' : 'bg-green-50'}`}>
          <Text className={`text-xs font-semibold ${item.isActive ? 'text-red-600' : 'text-green-600'}`}>{item.isActive ? 'Disable' : 'Enable'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Field = ({ label, value, onChange, placeholder, keyboardType = 'default' }) => (
    <>
      <Text className="text-gray-600 text-sm mb-1">{label}</Text>
      <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={value} onChangeText={onChange} placeholder={placeholder} keyboardType={keyboardType} />
    </>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Coupon Management</Text>
        <TouchableOpacity onPress={openCreate} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white font-semibold text-sm">+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={coupons}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <CouponCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="ticket-percent-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No coupons yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="bg-white rounded-t-2xl" contentContainerStyle={{ padding: 24 }}>
            <Text className="text-dark text-lg font-bold mb-4">{editingId ? 'Edit Coupon' : 'New Coupon'}</Text>
            <Field label="Code *" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} placeholder="e.g. SAVE20" />
            <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" />
            <Text className="text-gray-600 text-sm mb-1">Discount Type</Text>
            <View className="flex-row gap-2 mb-3">
              {['percentage', 'fixed'].map((t) => (
                <TouchableOpacity key={t} className={`flex-1 py-2 rounded-lg border ${form.discountType === t ? 'bg-primary border-primary' : 'border-gray-300'}`} onPress={() => setForm((f) => ({ ...f, discountType: t }))}>
                  <Text className={`text-center text-sm font-semibold capitalize ${form.discountType === t ? 'text-white' : 'text-dark'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field label="Discount Value *" value={form.discountValue} onChange={(v) => setForm((f) => ({ ...f, discountValue: v }))} placeholder={form.discountType === 'percentage' ? '10' : '500'} keyboardType="decimal-pad" />
            <Field label="Min Order Amount (₦)" value={form.minOrderAmount} onChange={(v) => setForm((f) => ({ ...f, minOrderAmount: v }))} placeholder="0" keyboardType="decimal-pad" />
            <Field label="Usage Limit (blank = unlimited)" value={form.usageLimit} onChange={(v) => setForm((f) => ({ ...f, usageLimit: v }))} placeholder="e.g. 100" keyboardType="number-pad" />
            <Field label="Start Date * (YYYY-MM-DD)" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="2025-01-01" />
            <Field label="End Date * (YYYY-MM-DD)" value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="2025-12-31" />
            <View className="flex-row gap-3 mt-2 mb-6">
              <TouchableOpacity className="flex-1 border border-gray-300 py-3 rounded-lg" onPress={() => setModalVisible(false)}>
                <Text className="text-dark font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary py-3 rounded-lg" onPress={handleSave} disabled={isSaving}>
                <Text className="text-white font-semibold text-center">{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
