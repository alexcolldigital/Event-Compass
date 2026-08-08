import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

const PAGE_TYPES = ['page', 'faq', 'policy', 'blog'];
const STATUSES = ['draft', 'published', 'archived'];
const EMPTY_FORM = { title: '', content: '', excerpt: '', type: 'page', status: 'draft', metaTitle: '', metaDescription: '' };

export default function CMSManagementScreen() {
  const navigation = useNavigation();
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [editingPage, setEditingPage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadPages(); }, [filterType]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const query = filterType !== 'all' ? { type: filterType } : {};
      const res = await adminAPI.getCMSPages(query);
      setPages(res.pages || []);
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const openCreate = () => { setEditingPage(null); setForm(EMPTY_FORM); };
  const openEdit = async (page) => {
    try {
      const res = await adminAPI.getCMSPage(page._id);
      const p = res.page;
      setForm({ title: p.title, content: p.content, excerpt: p.excerpt || '', type: p.type, status: p.status, metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '' });
      setEditingPage(p);
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return Alert.alert('Error', 'Title and content are required');
    setIsSaving(true);
    try {
      if (editingPage) {
        const res = await adminAPI.updateCMSPage(editingPage._id, form);
        setPages((p) => p.map((x) => x._id === editingPage._id ? res.page : x));
      } else {
        const res = await adminAPI.createCMSPage(form);
        setPages((p) => [res.page, ...p]);
      }
      setEditingPage(null);
      setForm(EMPTY_FORM);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setIsSaving(false); }
  };

  const handleDelete = (page) => {
    Alert.alert('Delete Page', `Delete "${page.title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminAPI.deleteCMSPage(page._id); setPages((p) => p.filter((x) => x._id !== page._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const statusColor = (s) => ({ published: '#10b981', draft: '#f59e0b', archived: '#6b7280' }[s] || '#6b7280');
  const typeColor = (t) => ({ page: '#6366f1', faq: '#3b82f6', policy: '#f59e0b', blog: '#10b981' }[t] || '#6b7280');

  // Show editor if creating/editing
  if (editingPage !== null || form.title !== '' || form.content !== '') {
    return (
      <View className="flex-1 bg-light">
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => { setEditingPage(null); setForm(EMPTY_FORM); }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text className="text-dark text-lg font-bold flex-1 ml-4">{editingPage ? 'Edit Page' : 'New Page'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving} className="bg-primary px-3 py-1.5 rounded-lg">
            <Text className="text-white font-semibold text-sm">{isSaving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 p-4">
          <Text className="text-gray-600 text-sm mb-1">Title *</Text>
          <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark bg-white" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Page title" />
          <Text className="text-gray-600 text-sm mb-1">Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {PAGE_TYPES.map((t) => (
              <TouchableOpacity key={t} className={`mr-2 px-3 py-2 rounded-lg border ${form.type === t ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onPress={() => setForm((f) => ({ ...f, type: t }))}>
                <Text className={`text-xs font-semibold capitalize ${form.type === t ? 'text-white' : 'text-dark'}`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text className="text-gray-600 text-sm mb-1">Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {STATUSES.map((s) => (
              <TouchableOpacity key={s} className={`mr-2 px-3 py-2 rounded-lg border ${form.status === s ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onPress={() => setForm((f) => ({ ...f, status: s }))}>
                <Text className={`text-xs font-semibold capitalize ${form.status === s ? 'text-white' : 'text-dark'}`}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text className="text-gray-600 text-sm mb-1">Excerpt</Text>
          <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark bg-white" value={form.excerpt} onChangeText={(v) => setForm((f) => ({ ...f, excerpt: v }))} placeholder="Short summary" multiline numberOfLines={2} />
          <Text className="text-gray-600 text-sm mb-1">Content *</Text>
          <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark bg-white" value={form.content} onChangeText={(v) => setForm((f) => ({ ...f, content: v }))} placeholder="Page content (HTML or plain text)" multiline numberOfLines={10} style={{ minHeight: 200, textAlignVertical: 'top' }} />
          <Text className="text-gray-600 text-sm mb-1">Meta Title (SEO)</Text>
          <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-dark bg-white" value={form.metaTitle} onChangeText={(v) => setForm((f) => ({ ...f, metaTitle: v }))} placeholder="SEO title" />
          <Text className="text-gray-600 text-sm mb-1">Meta Description (SEO)</Text>
          <TextInput className="border border-gray-300 rounded-lg px-3 py-2 mb-6 text-dark bg-white" value={form.metaDescription} onChangeText={(v) => setForm((f) => ({ ...f, metaDescription: v }))} placeholder="SEO description" multiline numberOfLines={2} />
        </ScrollView>
      </View>
    );
  }

  const PageCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-bold text-gray-800 flex-1 mr-2">{item.title}</Text>
        <View className="flex-row gap-1">
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: typeColor(item.type) + '20' }}>
            <Text className="text-xs font-semibold capitalize" style={{ color: typeColor(item.type) }}>{item.type}</Text>
          </View>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor(item.status) + '20' }}>
            <Text className="text-xs font-semibold capitalize" style={{ color: statusColor(item.status) }}>{item.status}</Text>
          </View>
        </View>
      </View>
      <Text className="text-gray-500 text-xs">/{item.slug} · {formatDate(item.updatedAt)}</Text>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity className="flex-1 border border-primary py-2 rounded-lg" onPress={() => openEdit(item)}>
          <Text className="text-primary font-semibold text-center text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-50 py-2 rounded-lg" onPress={() => handleDelete(item)}>
          <Text className="text-red-600 font-semibold text-center text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">CMS Pages</Text>
        <TouchableOpacity onPress={openCreate} className="bg-primary px-3 py-1.5 rounded-lg">
          <Text className="text-white font-semibold text-sm">+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100 px-3 py-2">
        {['all', ...PAGE_TYPES].map((t) => (
          <TouchableOpacity key={t} className={`mr-2 px-3 py-1 rounded-full border ${filterType === t ? 'bg-primary border-primary' : 'border-gray-300'}`} onPress={() => setFilterType(t)}>
            <Text className={`text-xs font-semibold capitalize ${filterType === t ? 'text-white' : 'text-dark'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? <Loading /> : (
        <FlatList
          data={pages}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PageCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="file-document-outline" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No pages yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
