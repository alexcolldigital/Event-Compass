import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const EMPTY_FORM = { name: '', description: '', icon: '', sortOrder: '0' };

export default function CategoryManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.categories || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalVisible(true); };
  const openEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', sortOrder: String(cat.sortOrder || 0) });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    setIsSaving(true);
    try {
      const data = { ...form, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editingId) {
        const res = await adminAPI.updateCategory(editingId, data);
        setCategories((c) => c.map((x) => x._id === editingId ? res.category : x));
      } else {
        const res = await adminAPI.createCategory(data);
        setCategories((c) => [...c, res.category]);
      }
      setModalVisible(false);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = (cat) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.deleteCategory(cat._id);
            setCategories((c) => c.filter((x) => x._id !== cat._id));
          } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const CategoryCard = ({ item }) => (
    <View style={[adminStyles.listItem, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[adminStyles.listItemIcon, { backgroundColor: '#6366f118' }]}>
        <MaterialCommunityIcons name={(item.icon || 'shape') as any} size={22} color="#6366f1" />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{item.name}</Text>
        {item.description ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontFamily: appFont }} numberOfLines={1}>{item.description}</Text> : null}
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 2, fontFamily: appFont }}>{item.serviceCount || 0} services · Order: {item.sortOrder}</Text>
      </View>
      <View style={[adminStyles.badge, { backgroundColor: item.isActive ? '#dcfce7' : C.surfaceAlt, marginRight: 8 }]}>
        <Text style={[adminStyles.badgeText, { color: item.isActive ? '#166534' : C.muted, fontFamily: appFont }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
      <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 10 }}>
        <MaterialCommunityIcons name="pencil" size={18} color={C.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <MaterialCommunityIcons name="delete-outline" size={18} color={C.danger} />
      </TouchableOpacity>
    </View>
  );

  const FORM_FIELDS = [
    { label: 'Name *', key: 'name', placeholder: 'Category name' },
    { label: 'Description', key: 'description', placeholder: 'Optional description' },
    { label: 'Icon (MaterialCommunityIcons name)', key: 'icon', placeholder: 'e.g. music, camera, food' },
    { label: 'Sort Order', key: 'sortOrder', placeholder: '0', keyboardType: 'number-pad' },
  ];

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Category Management</Text>
        <TouchableOpacity onPress={openCreate} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={categories}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <CategoryCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="shape-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No categories yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={adminStyles.modalOverlay}>
          <View style={[adminStyles.modalSheet, { backgroundColor: C.surface }]}>
            <Text style={[adminStyles.modalTitle, { color: C.text, fontFamily: appFont }]}>{editingId ? 'Edit Category' : 'New Category'}</Text>
            {FORM_FIELDS.map((f) => (
              <View key={f.key} style={adminStyles.formField}>
                <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>{f.label}</Text>
                <TextInput
                  style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surfaceAlt, fontFamily: appFont }]}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={C.muted}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}
            <View style={adminStyles.modalActions}>
              <TouchableOpacity style={[adminStyles.modalBtn, { borderWidth: 1, borderColor: C.inputBorder }]} onPress={() => setModalVisible(false)}>
                <Text style={[adminStyles.modalBtnText, { color: C.text, fontFamily: appFont }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[adminStyles.modalBtn, { backgroundColor: C.primary }]} onPress={handleSave} disabled={isSaving}>
                <Text style={[adminStyles.modalBtnText, { color: '#fff', fontFamily: appFont }]}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
