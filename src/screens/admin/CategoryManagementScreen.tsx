import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, TextInput, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';

const EMPTY = { name: '', description: '', icon: '', sortOrder: '0' };

export default function CategoryManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try { const r = await adminAPI.getCategories(); setCategories(r.categories || []); }
    catch (_) {} finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (cat) => { setEditingId(cat._id); setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', sortOrder: String(cat.sortOrder || 0) }); setModalVisible(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    setIsSaving(true);
    try {
      const data = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingId) { const r = await adminAPI.updateCategory(editingId, data); setCategories(prev => prev.map(x => x._id === editingId ? r.category : x)); }
      else { const r = await adminAPI.createCategory(data); setCategories(prev => [...prev, r.category]); }
      setModalVisible(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = (cat) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteCategory(cat._id); setCategories(prev => prev.filter(x => x._id !== cat._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const CategoryCard = ({ item }) => (
    <View style={[adminStyles.listItem, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[adminStyles.listIcon, { backgroundColor: `${c.primary}18` }]}>
        <MaterialCommunityIcons name={(item.icon || 'shape') as any} size={22} color={c.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[adminStyles.listLabel, { color: c.text, fontFamily: font, marginLeft: 0 }]}>{item.name}</Text>
        {item.description ? <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]} numberOfLines={1}>{item.description}</Text> : null}
        <Text style={[adminStyles.listSub, { color: c.muted, fontFamily: font }]}>{item.serviceCount || 0} services · Order: {item.sortOrder}</Text>
      </View>
      <View style={[adminStyles.badge, { backgroundColor: item.isActive ? '#dcfce7' : '#f3f4f6', marginRight: 8 }]}>
        <Text style={[adminStyles.badgeText, { color: item.isActive ? '#15803d' : '#6b7280', fontFamily: font }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
      <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 10 }}>
        <MaterialCommunityIcons name="pencil" size={18} color={c.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <MaterialCommunityIcons name="delete-outline" size={18} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Category Management</Text>
        <TouchableOpacity style={[adminStyles.headerAction, { backgroundColor: c.primary }]} onPress={openCreate}>
          <Text style={[adminStyles.headerActionText, { fontFamily: font }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={categories}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <CategoryCard item={item} />}
          ListEmptyComponent={
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="shape-outline" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No categories yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <View style={[adminStyles.modalSheet, { backgroundColor: c.surface }]}>
            <Text style={[adminStyles.modalTitle, { color: c.text, fontFamily: font }]}>{editingId ? 'Edit Category' : 'New Category'}</Text>
            {[{ label: 'Name *', key: 'name', placeholder: 'Category name' }, { label: 'Description', key: 'description', placeholder: 'Optional description' }, { label: 'Icon (MaterialCommunityIcons)', key: 'icon', placeholder: 'e.g. music, camera' }, { label: 'Sort Order', key: 'sortOrder', placeholder: '0', keyboard: 'number-pad' }].map(f => (
              <View key={f.key}>
                <Text style={[adminStyles.formLabel, { color: c.text, fontFamily: font }]}>{f.label}</Text>
                <TextInput style={[adminStyles.formInput, { backgroundColor: c.inputBg, borderColor: c.inputBorder, color: c.text, fontFamily: font, marginBottom: 12 }]} value={form[f.key]} onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))} placeholder={f.placeholder} placeholderTextColor={c.muted} keyboardType={(f.keyboard || 'default') as any} />
              </View>
            ))}
            <View style={adminStyles.actionRow}>
              <TouchableOpacity style={[adminStyles.actionBtn, { borderWidth: 1, borderColor: c.inputBorder }]} onPress={() => setModalVisible(false)}>
                <Text style={[adminStyles.actionBtnText, { color: c.text, fontFamily: font }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: c.primary }]} onPress={handleSave} disabled={isSaving}>
                <Text style={[adminStyles.actionBtnText, { color: '#fff', fontFamily: font }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
