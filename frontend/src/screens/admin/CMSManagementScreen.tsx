import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatDate } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const PAGE_TYPES = ['page', 'faq', 'policy', 'blog'];
const STATUSES = ['draft', 'published', 'archived'];
const EMPTY_FORM = { title: '', content: '', excerpt: '', type: 'page', status: 'draft', metaTitle: '', metaDescription: '' };

const STATUS_COLORS = { published: '#10b981', draft: '#f59e0b', archived: '#6b7280' };
const TYPE_COLORS = { page: '#6366f1', faq: '#3b82f6', policy: '#f59e0b', blog: '#10b981' };

export default function CMSManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [editingPage, setEditingPage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = editingPage !== null || form.title !== '' || form.content !== '';

  useEffect(() => { if (!isEditing) loadPages(); }, [filterType, isEditing]);

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

  const ChipRow = ({ options, value, onChange }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o}
          style={[{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 }, value === o ? { backgroundColor: C.primary, borderColor: C.primary } : { backgroundColor: C.surfaceAlt, borderColor: C.inputBorder }]}
          onPress={() => onChange(o)}
        >
          <Text style={{ color: value === o ? '#fff' : C.text, fontSize: 12, fontWeight: '700', textTransform: 'capitalize', fontFamily: appFont }}>{o}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Editor view
  if (isEditing) {
    return (
      <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
        <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={() => { setEditingPage(null); setForm(EMPTY_FORM); }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>{editingPage ? 'Edit Page' : 'New Page'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>{isSaving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Title *</Text>
            <TextInput style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surface, fontFamily: appFont }]} value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Page title" placeholderTextColor={C.muted} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Type</Text>
            <ChipRow options={PAGE_TYPES} value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Status</Text>
            <ChipRow options={STATUSES} value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Excerpt</Text>
            <TextInput style={[adminStyles.formInputMultiline, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surface, fontFamily: appFont, minHeight: 60 }]} value={form.excerpt} onChangeText={(v) => setForm((f) => ({ ...f, excerpt: v }))} placeholder="Short summary" placeholderTextColor={C.muted} multiline numberOfLines={2} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Content *</Text>
            <TextInput style={[adminStyles.formInputMultiline, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surface, fontFamily: appFont, minHeight: 200 }]} value={form.content} onChangeText={(v) => setForm((f) => ({ ...f, content: v }))} placeholder="Page content (HTML or plain text)" placeholderTextColor={C.muted} multiline numberOfLines={10} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Meta Title (SEO)</Text>
            <TextInput style={[adminStyles.formInput, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surface, fontFamily: appFont }]} value={form.metaTitle} onChangeText={(v) => setForm((f) => ({ ...f, metaTitle: v }))} placeholder="SEO title" placeholderTextColor={C.muted} />
          </View>
          <View style={adminStyles.formField}>
            <Text style={[adminStyles.formLabel, { color: C.text, fontFamily: appFont }]}>Meta Description (SEO)</Text>
            <TextInput style={[adminStyles.formInputMultiline, { color: C.text, borderColor: C.inputBorder, backgroundColor: C.surface, fontFamily: appFont, minHeight: 60 }]} value={form.metaDescription} onChangeText={(v) => setForm((f) => ({ ...f, metaDescription: v }))} placeholder="SEO description" placeholderTextColor={C.muted} multiline numberOfLines={2} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const PageCard = ({ item }) => {
    const typeColor = TYPE_COLORS[item.type] || '#6b7280';
    const statusColor = STATUS_COLORS[item.status] || '#6b7280';
    return (
      <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8, fontFamily: appFont }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <View style={[adminStyles.badge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[adminStyles.badgeText, { color: typeColor, textTransform: 'capitalize', fontFamily: appFont }]}>{item.type}</Text>
            </View>
            <View style={[adminStyles.badge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[adminStyles.badgeText, { color: statusColor, textTransform: 'capitalize', fontFamily: appFont }]}>{item.status}</Text>
            </View>
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>/{item.slug} · {formatDate(item.updatedAt)}</Text>
        <View style={adminStyles.actionRow}>
          <TouchableOpacity style={[adminStyles.actionBtn, { borderWidth: 1, borderColor: C.primary }]} onPress={() => openEdit(item)}>
            <Text style={[adminStyles.actionBtnText, { color: C.primary, fontFamily: appFont }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleDelete(item)}>
            <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>CMS Pages</Text>
        <TouchableOpacity onPress={openCreate} style={[adminStyles.badge, { backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6 }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: appFont }}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter */}
      <View style={[{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          {['all', ...PAGE_TYPES].map((t) => (
            <TouchableOpacity
              key={t}
              style={[adminStyles.filterChip, { backgroundColor: filterType === t ? C.primary : C.surface, borderColor: filterType === t ? C.primary : C.inputBorder }]}
              onPress={() => setFilterType(t)}
            >
              <Text style={[adminStyles.filterChipText, { color: filterType === t ? '#fff' : C.text, textTransform: 'capitalize', fontFamily: appFont }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={pages}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <PageCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No pages yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
