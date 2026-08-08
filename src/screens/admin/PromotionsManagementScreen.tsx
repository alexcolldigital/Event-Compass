import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

const PROMO_TYPES = ['banner', 'featured_service', 'discount_campaign', 'flash_sale'];
const EMPTY_FORM = { title: '', description: '', type: 'banner', discountPercentage: '', startDate: '', endDate: '', priority: '0' };

export default function PromotionsManagementScreen() {
  const navigation = useNavigation();
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadPromotions(); }, []);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getPromotions({ limit: 50 });
      setPromotions(res.promotions || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalVisible(true); };
  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({ title: p.title, description: p.description || '', type: p.type, discountPercentage: String(p.discountPercentage || ''), startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '', priority: String(p.priority || 0) });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) return Alert.alert('Error', 'Fill required fields');
    setIsSaving(true);
    try {
      const data = { ...form, discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage) : undefined, priority: parseInt(form.priority) || 0 };
      if (editingId) {
        const res = await adminAPI.updatePromotion(editingId, data);
        setPromotions((p) => p.map((x) => x._id === editingId ? res.promotion : x));
      } else {
        const res = await adminAPI.createPromotion(data);
        setPromotions((p) => [res.promotion, ...p]);
      }
      setModalVisible(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (promo) => {
    try {
      const res = await adminAPI.togglePromotion(promo._id);
      setPromotions((p) => p.map((x) => x._id === promo._id ? res.promotion : x));
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (promo) => {
    Alert.alert('Delete Promotion', `Delete "${promo.title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deletePromotion(promo._id); setPromotions((p) => p.filter((x) => x._id !== promo._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const typeColor = (t) => ({ banner: '#6366f1', featured_service: '#10b981', discount_campaign: '#f59e0b', flash_sale: '#ef4444' }[t] || '#6b7280');

  const PromoCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-800">{item.title}</Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: typeColor(item.type) + '20' }}>
              <Text className="text-xs font-semibold capitalize" style={{ color: typeColor(item.type) }}>{item.type.replace(/_/g, ' ')}</Text>
            </View>
            {item.discountPercentage ? <Text className="text-primary text-xs font-semibold">{item.discountPercentage}% off</Text> : null}
          </View>
          {item.description ? <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>{item.description}</Text> : null}
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
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-400 text-xs">{item.clickCount || 0} clicks</Text>
          <TouchableOpacity onPress={() => handleToggle(item)} className={`px-2 py-1 rounded ${item.isActive ? 'bg-red-50' : 'bg-green-50'}`}>
            <Text className={`text-xs font-semibold ${item.isActive ? 'text-red-600' : 'text-green-600'}`}>{item.isActive ? 'Disable' : 'Enable'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Promotions</Text>
        <TouchableOpacity onPress={openCreate} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white font-semibold text-sm">+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={promotions}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PromoCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="bullhorn-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No promotions yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="bg-white rounded-t-2xl" contentContainerStyle={{ padding: 24 }}>
            <Text className="text-dark text-lg font-bold mb-4">{editingId ? 'Edit Promotion' : 'New Promotion'}</Text>
            <Text className="text-gray-600 text-sm mb-1">Title *</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Promotion title" />
            <Text className="text-gray-600 text-sm mb-1">Description</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" />
            <Text className="text-gray-600 text-sm mb-1">Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {PROMO_TYPES.map((t) => (
                <TouchableOpacity key={t} className={`mr-2 px-3 py-2 rounded-lg border ${form.type === t ? 'bg-primary border-primary' : 'border-gray-300'}`} onPress={() => setForm((f) => ({ ...f, type: t }))}>
                  <Text className={`text-xs font-semibold capitalize ${form.type === t ? 'text-white' : 'text-dark'}`}>{t.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="text-gray-600 text-sm mb-1">Discount % (optional)</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.discountPercentage} onChangeText={(v) => setForm((f) => ({ ...f, discountPercentage: v }))} placeholder="e.g. 20" keyboardType="decimal-pad" />
            <Text className="text-gray-600 text-sm mb-1">Start Date * (YYYY-MM-DD)</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.startDate} onChangeText={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="2025-01-01" />
            <Text className="text-gray-600 text-sm mb-1">End Date * (YYYY-MM-DD)</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.endDate} onChangeText={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="2025-12-31" />
            <Text className="text-gray-600 text-sm mb-1">Priority (higher = shown first)</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-4 text-dark" value={form.priority} onChangeText={(v) => setForm((f) => ({ ...f, priority: v }))} keyboardType="number-pad" />
            <View className="flex-row gap-3 mb-6">
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
