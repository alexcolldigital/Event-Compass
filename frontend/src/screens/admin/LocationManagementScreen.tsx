/**
 * Admin — Location Management Screen
 * Add/edit/delete states, LGAs, and towns.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';
import { clearLocationCache } from '../../utils/nigeriaLocations.js';

export default function LocationManagementScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    surfaceAlt: isDark ? '#172033' : '#f3f6ef',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
    danger: '#ef4444',
  };

  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedState, setExpandedState] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<{
    type: 'addState' | 'addLga' | 'addTown' | null;
    locationId?: string;
    lgaName?: string;
  }>({ type: null });
  const [inputValue, setInputValue] = useState('');

  const load = async () => {
    setIsLoading(true);
    try {
      const res: any = await adminAPI.getLocations();
      setLocations(res?.locations || []);
    } catch {
      Alert.alert('Error', 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddState = async () => {
    const state = inputValue.trim();
    if (!state) return;
    try {
      await adminAPI.createLocation({ state, lgas: [] });
      clearLocationCache();
      setModal({ type: null });
      setInputValue('');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add state');
    }
  };

  const handleAddLga = async () => {
    const lgaName = inputValue.trim();
    if (!lgaName || !modal.locationId) return;
    const loc = locations.find((l) => l._id === modal.locationId);
    if (!loc) return;
    const updatedLgas = [...(loc.lgas || []), { lga: lgaName, towns: [] }];
    try {
      await adminAPI.updateLocation(modal.locationId, { lgas: updatedLgas });
      clearLocationCache();
      setModal({ type: null });
      setInputValue('');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add LGA');
    }
  };

  const handleAddTown = async () => {
    const town = inputValue.trim();
    if (!town || !modal.locationId || !modal.lgaName) return;
    const loc = locations.find((l) => l._id === modal.locationId);
    if (!loc) return;
    const updatedLgas = loc.lgas.map((l: any) =>
      l.lga === modal.lgaName
        ? { ...l, towns: [...(l.towns || []), town] }
        : l
    );
    try {
      await adminAPI.updateLocation(modal.locationId, { lgas: updatedLgas });
      clearLocationCache();
      setModal({ type: null });
      setInputValue('');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to add town');
    }
  };

  const handleDeleteState = (id: string, state: string) => {
    Alert.alert('Delete State', `Remove "${state}" and all its LGAs/towns?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminAPI.deleteLocation(id);
            clearLocationCache();
            load();
          } catch {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleDeleteLga = async (locationId: string, lgaName: string) => {
    const loc = locations.find((l) => l._id === locationId);
    if (!loc) return;
    Alert.alert('Delete LGA', `Remove "${lgaName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updatedLgas = loc.lgas.filter((l: any) => l.lga !== lgaName);
          try {
            await adminAPI.updateLocation(locationId, { lgas: updatedLgas });
            clearLocationCache();
            load();
          } catch {
            Alert.alert('Error', 'Failed to delete LGA');
          }
        },
      },
    ]);
  };

  const handleDeleteTown = async (locationId: string, lgaName: string, town: string) => {
    const loc = locations.find((l) => l._id === locationId);
    if (!loc) return;
    const updatedLgas = loc.lgas.map((l: any) =>
      l.lga === lgaName ? { ...l, towns: l.towns.filter((t: string) => t !== town) } : l
    );
    try {
      await adminAPI.updateLocation(locationId, { lgas: updatedLgas });
      clearLocationCache();
      load();
    } catch {
      Alert.alert('Error', 'Failed to delete town');
    }
  };

  const modalTitle = modal.type === 'addState' ? 'Add State'
    : modal.type === 'addLga' ? 'Add LGA'
    : 'Add Town';

  const modalPlaceholder = modal.type === 'addState' ? 'e.g. Lagos'
    : modal.type === 'addLga' ? 'e.g. Ikeja'
    : 'e.g. Oshodi';

  const handleModalSubmit = () => {
    if (modal.type === 'addState') handleAddState();
    else if (modal.type === 'addLga') handleAddLga();
    else if (modal.type === 'addTown') handleAddTown();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Management</Text>
        <TouchableOpacity
          onPress={() => { setInputValue(''); setModal({ type: 'addState' }); }}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && locations.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.muted }]}>Loading...</Text>
        ) : locations.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No custom locations yet.</Text>
            <Text style={[styles.emptySubText, { color: colors.muted }]}>The 5 SE states are built-in. Add more states here.</Text>
          </View>
        ) : (
          locations.map((loc) => (
            <View key={loc._id} style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.stateRow}
                onPress={() => setExpandedState(expandedState === loc._id ? null : loc._id)}
              >
                <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                <Text style={[styles.stateName, { color: colors.text }]}>{loc.state}</Text>
                <Text style={[styles.lgaCount, { color: colors.muted }]}>{loc.lgas?.length || 0} LGAs</Text>
                <MaterialCommunityIcons
                  name={expandedState === loc._id ? 'chevron-up' : 'chevron-down'}
                  size={18} color={colors.muted}
                />
                <TouchableOpacity onPress={() => handleDeleteState(loc._id, loc.state)} style={styles.deleteBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>

              {expandedState === loc._id && (
                <View style={styles.lgaList}>
                  <TouchableOpacity
                    onPress={() => { setInputValue(''); setModal({ type: 'addLga', locationId: loc._id }); }}
                    style={[styles.addRowBtn, { borderColor: colors.primary }]}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
                    <Text style={[styles.addRowText, { color: colors.primary }]}>Add LGA</Text>
                  </TouchableOpacity>

                  {(loc.lgas || []).map((lgaObj: any) => (
                    <View key={lgaObj.lga} style={[styles.lgaCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <View style={styles.lgaRow}>
                        <MaterialCommunityIcons name="office-building" size={14} color={colors.primary} />
                        <Text style={[styles.lgaName, { color: colors.text }]}>{lgaObj.lga}</Text>
                        <TouchableOpacity
                          onPress={() => { setInputValue(''); setModal({ type: 'addTown', locationId: loc._id, lgaName: lgaObj.lga }); }}
                          style={styles.smallAddBtn}
                        >
                          <MaterialCommunityIcons name="plus-circle-outline" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteLga(loc._id, lgaObj.lga)} style={styles.smallDeleteBtn}>
                          <MaterialCommunityIcons name="close-circle-outline" size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.townRow}>
                        {(lgaObj.towns || []).map((town: string) => (
                          <TouchableOpacity
                            key={town}
                            onPress={() => handleDeleteTown(loc._id, lgaObj.lga, town)}
                            style={[styles.townChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          >
                            <Text style={[styles.townText, { color: colors.text }]}>{town}</Text>
                            <MaterialCommunityIcons name="close" size={12} color={colors.muted} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add modal */}
      <Modal visible={modal.type !== null} transparent animationType="fade" onRequestClose={() => setModal({ type: null })}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModal({ type: null })}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{modalTitle}</Text>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={modalPlaceholder}
              placeholderTextColor={colors.muted}
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModal({ type: null })} variant="outline" style={{ flex: 1 }} />
              <Button title="Add" onPress={handleModalSubmit} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '800' },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 80 },
  stateCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  stateRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  stateName: { flex: 1, fontSize: 15, fontWeight: '800' },
  lgaCount: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  lgaList: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  addRowBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 4 },
  addRowText: { fontSize: 13, fontWeight: '700' },
  lgaCard: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 },
  lgaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lgaName: { flex: 1, fontSize: 13, fontWeight: '700' },
  smallAddBtn: { padding: 2 },
  smallDeleteBtn: { padding: 2 },
  townRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  townChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  townText: { fontSize: 12, fontWeight: '600' },
  emptyCard: { borderWidth: 1, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '700' },
  emptySubText: { fontSize: 13, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12 },
});
