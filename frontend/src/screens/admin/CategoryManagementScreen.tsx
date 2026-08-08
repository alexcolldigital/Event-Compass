import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';

const EMPTY_FORM = { name: '', description: '', icon: '', sortOrder: '0' };

export default function CategoryManagementScreen() {
  const navigation = useNavigation();
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
  const openEdit = (cat) => { setEditingId(cat._id); setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', sortOrder: String(cat.sortOrder || 0) }); setModalVisible(true); };

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
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center">
      <View className="w-10 h-10 bg-indigo-100 rounded-lg items-center justify-center mr-3">
        <MaterialCommunityIcons name={item.icon || 'shape'} size={22} color="#6366f1" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">{item.name}</Text>
        {item.description ? <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{item.description}</Text> : null}
        <Text className="text-gray-400 text-xs mt-0.5">{item.serviceCount || 0} services · Order: {item.sortOrder}</Text>
      </View>
      <View className={`px-2 py-1 rounded-full mr-2 ${item.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
        <Text className={`text-xs font-semibold ${item.isActive ? 'text-green-700' : 'text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</Text>
      </View>
      <TouchableOpacity onPress={() => openEdit(item)} className="mr-2">
        <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)}>
        <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Category Management</Text>
        <TouchableOpacity onPress={openCreate} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white font-semibold text-sm">+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={categories}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <CategoryCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="shape-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No categories yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="text-dark text-lg font-bold mb-4">{editingId ? 'Edit Category' : 'New Category'}</Text>
            <Text className="text-gray-600 text-sm mb-1">Name *</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Category name" />
            <Text className="text-gray-600 text-sm mb-1">Description</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description" />
            <Text className="text-gray-600 text-sm mb-1">Icon (MaterialCommunityIcons name)</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark" value={form.icon} onChangeText={(v) => setForm((f) => ({ ...f, icon: v }))} placeholder="e.g. music, camera, food" />
            <Text className="text-gray-600 text-sm mb-1">Sort Order</Text>
            <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-4 text-dark" value={form.sortOrder} onChangeText={(v) => setForm((f) => ({ ...f, sortOrder: v }))} keyboardType="number-pad" />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 border border-gray-300 py-3 rounded-lg" onPress={() => setModalVisible(false)}>
                <Text className="text-dark font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary py-3 rounded-lg" onPress={handleSave} disabled={isSaving}>
                <Text className="text-white font-semibold text-center">{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
