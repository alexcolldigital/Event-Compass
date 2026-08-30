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

const PROMO_TYPES = ['banner', 'featured_service', 'discount_campaign', 'flash_sale'];
const TYPE_COLORS = { banner: '#6366f1', featured_service: '#10b981', discount_campaign: '#f59e0b', flash_sale: '#ef4444' };
const EMPTY_FORM = { title: '', description: '', type: 'banner', discountPercentage: '', startDate: '', endDate: '', priority: '0' };

export default function PromotionsManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

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

  const PromoCard = ({ item }) => {
    const color = TYPE_COLORS[item.type] || '#6b7280';
    return (
      <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={adminStyles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 6, fontFamily: appFont }}>{item.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={[adminStyles.badge, { backgroundColor: color + '20' }]}>
                <Text style={[adminStyles.badgeText, { color, textTransform: 'capitalize', fontFamily: appFont }]}>{item.type.replace(/_/g, ' ')}</Text>
              </View>
              {item.discountPercentage ? <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700', fontFamily: appFont }}>{item.discountPercentage}% off</Text> : null}
            </View>
            {item.description ? <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }} numberOfLines={1}>{item.description}</Text> : null}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: C.muted, fontSize: 11, fontFamily: appFont }}>{item.clickCount || 0} clicks</Text>
            <TouchableOpacity
              onPress={() => handleToggle(item)}
              style={[adminStyles.badge, { backgroundColor: item.isActive ? (isDark ? '#450a0a' : '#fee2e2') : (isDark ? '#14532d' : '#dcfce7') }]}
            >
              <Text style={[adminStyles.badgeText, { color: item.isActive ? '#b91c1c' : '#166534', fontFamily: appFont }]}>{item.isActive ? 'Disable' : 'Enable'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => goBackToAdminDashboard(navigation)}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Promotions</Text>
        <TouchableOpacity onPress={openCreate} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={promotions}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PromoCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="bullhorn-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No promotions yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <ScrollView style={[adminStyles.modalSheet, { backgroundColor: C.surface }]} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={[adminStyles.modalTitle, { color: C.text, fontFamily: appFont }]}>{editingId ? 'Edit Promotion' : 'New Promotion'}</Text>
            <Field label="Title *" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Promotion title" />
            <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" />

            <View style={adminStyles.formField}>
              <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PROMO_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 }, form.type === t ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder }]}
                    onPress={() => setForm((f) => ({ ...f, type: t }))}
                  >
                    <Text style={{ color: form.type === t ? '#fff' : C.text, fontSize: 12, fontWeight: '700', textTransform: 'capitalize', fontFamily: appFont }}>{t.replace(/_/g, ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Field label="Discount % (optional)" value={form.discountPercentage} onChange={(v) => setForm((f) => ({ ...f, discountPercentage: v }))} placeholder="e.g. 20" keyboardType="decimal-pad" />
            <Field label="Start Date * (YYYY-MM-DD)" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} placeholder="2025-01-01" />
            <Field label="End Date * (YYYY-MM-DD)" value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} placeholder="2025-12-31" />
            <Field label="Priority (higher = shown first)" value={form.priority} onChange={(v) => setForm((f) => ({ ...f, priority: v }))} placeholder="0" keyboardType="number-pad" />

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
