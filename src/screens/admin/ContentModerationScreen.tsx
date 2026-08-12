import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { useTheme } from '../../context/ThemeContext';
import { getColors, adminStyles, font } from '../../styles/adminStyles';
import { formatDate } from '../../utils/helpers.js';

const TABS = ['reviews', 'services'];

export default function ContentModerationScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = getColors(isDark);

  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setIsLoading(true);
    try {
      if (tab === 'reviews') { const r = await adminAPI.getFlaggedReviews({ limit: 50 }); setReviews(r.reviews || []); }
      else { const r = await adminAPI.getFlaggedServices({ limit: 50 }); setServices(r.services || []); }
    } catch (_) {} finally { setIsLoading(false); }
  };

  const moderateReview = (item, action) => {
    Alert.alert(action === 'remove' ? 'Remove Review' : 'Approve Review', action === 'remove' ? 'Remove this review?' : 'Approve this review?', [
      { text: 'Cancel' },
      { text: 'Confirm', onPress: async () => {
        try { await adminAPI.moderateReview(item._id, { action }); setReviews(r => r.filter(x => x._id !== item._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const moderateService = (item, action) => {
    Alert.alert(action === 'suspend' ? 'Suspend Service' : 'Approve Service', action === 'suspend' ? 'Deactivate this service?' : 'Approve this service?', [
      { text: 'Cancel' },
      { text: 'Confirm', onPress: async () => {
        try { await adminAPI.moderateService(item._id, { action }); setServices(s => s.filter(x => x._id !== item._id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const ReviewCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={adminStyles.cardRow}>
        <Text style={[s.name, { color: c.text, fontFamily: font }]}>{item.reviewer?.firstName} {item.reviewer?.lastName}</Text>
        <View style={{ flexDirection: 'row' }}>
          {[1,2,3,4,5].map(n => <MaterialCommunityIcons key={n} name={n <= item.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />)}
        </View>
      </View>
      <Text style={[s.comment, { color: c.muted, fontFamily: font }]}>{item.comment}</Text>
      <Text style={[s.meta, { color: c.muted, fontFamily: font }]}>Service: {item.service?.name} · {formatDate(item.createdAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#f0fdf4' }]} onPress={() => moderateReview(item, 'approve')}>
          <Text style={[adminStyles.actionBtnText, { color: '#15803d', fontFamily: font }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fff1f2' }]} onPress={() => moderateReview(item, 'remove')}>
          <Text style={[adminStyles.actionBtnText, { color: '#dc2626', fontFamily: font }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ServiceCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[s.name, { color: c.text, fontFamily: font }]}>{item.name}</Text>
      <Text style={[s.meta, { color: c.muted, fontFamily: font }]}>{item.provider?.businessName || `${item.provider?.firstName} ${item.provider?.lastName}`}</Text>
      <Text style={[s.meta, { color: c.muted, fontFamily: font }]}>{item.serviceType} · {formatDate(item.createdAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#f0fdf4' }]} onPress={() => moderateService(item, 'approve')}>
          <Text style={[adminStyles.actionBtnText, { color: '#15803d', fontFamily: font }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: '#fff1f2' }]} onPress={() => moderateService(item, 'suspend')}>
          <Text style={[adminStyles.actionBtnText, { color: '#dc2626', fontFamily: font }]}>Suspend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const data = tab === 'reviews' ? reviews : services;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: c.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: c.text, fontFamily: font }]}>Content Moderation</Text>
      </View>

      <View style={[adminStyles.tabBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[adminStyles.tab, { borderBottomColor: tab === t ? c.primary : 'transparent' }]} onPress={() => setTab(t)}>
            <Text style={[adminStyles.tabText, { color: tab === t ? c.primary : c.muted, fontFamily: font, textTransform: 'capitalize' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={data}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => tab === 'reviews' ? <ReviewCard item={item} /> : <ServiceCard item={item} />}
          ListEmptyComponent={
            <View style={adminStyles.empty}>
              <MaterialCommunityIcons name="flag-checkered" size={48} color={c.muted} />
              <Text style={[adminStyles.emptyText, { color: c.muted, fontFamily: font }]}>No flagged {tab}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  name: { fontSize: 14, fontWeight: '800' },
  comment: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  meta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
