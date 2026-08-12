import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { formatDate } from '../../utils/helpers.js';
import { useTheme } from '../../context/ThemeContext';
import adminStyles, { getColors, appFont } from '../../styles/adminStyles.js';

const TABS = ['reviews', 'services'];

export default function ContentModerationScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const C = getColors(isDark);

  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (tab === 'reviews') {
        const res = await adminAPI.getFlaggedReviews({ limit: 50 });
        setReviews(res.reviews || []);
      } else {
        const res = await adminAPI.getFlaggedServices({ limit: 50 });
        setServices(res.services || []);
      }
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const handleModerateReview = (item, action) => {
    Alert.alert(
      action === 'remove' ? 'Remove Review' : 'Approve Review',
      action === 'remove' ? 'Remove this review from the platform?' : 'Clear flag and approve this review?',
      [
        { text: 'Cancel' },
        {
          text: 'Confirm', onPress: async () => {
            try {
              await adminAPI.moderateReview(item._id, { action });
              setReviews((r) => r.filter((x) => x._id !== item._id));
            } catch (e) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  const handleModerateService = (item, action) => {
    Alert.alert(
      action === 'suspend' ? 'Suspend Service' : 'Approve Service',
      action === 'suspend' ? 'Deactivate this service?' : 'Clear flag and activate this service?',
      [
        { text: 'Cancel' },
        {
          text: 'Confirm', onPress: async () => {
            try {
              await adminAPI.moderateService(item._id, { action });
              setServices((s) => s.filter((x) => x._id !== item._id));
            } catch (e) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  const ReviewCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, fontFamily: appFont }}>{item.reviewer?.firstName} {item.reviewer?.lastName}</Text>
        <View style={{ flexDirection: 'row' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <MaterialCommunityIcons key={s} name={s <= item.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
          ))}
        </View>
      </View>
      <Text style={{ color: C.muted, fontSize: 13, marginBottom: 6, fontFamily: appFont }}>{item.comment}</Text>
      <Text style={{ color: C.muted, fontSize: 11, fontFamily: appFont }}>Service: {item.service?.name} · {formatDate(item.createdAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#14532d' : '#dcfce7' }]} onPress={() => handleModerateReview(item, 'approve')}>
          <Text style={[adminStyles.actionBtnText, { color: '#166534', fontFamily: appFont }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleModerateReview(item, 'remove')}>
          <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ServiceCard = ({ item }) => (
    <View style={[adminStyles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 4, fontFamily: appFont }}>{item.name}</Text>
      <Text style={{ color: C.muted, fontSize: 12, fontFamily: appFont }}>{item.provider?.businessName || `${item.provider?.firstName} ${item.provider?.lastName}`}</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2, fontFamily: appFont }}>{item.serviceType} · {formatDate(item.createdAt)}</Text>
      <View style={adminStyles.actionRow}>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#14532d' : '#dcfce7' }]} onPress={() => handleModerateService(item, 'approve')}>
          <Text style={[adminStyles.actionBtnText, { color: '#166534', fontFamily: appFont }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[adminStyles.actionBtn, { backgroundColor: isDark ? '#450a0a' : '#fee2e2' }]} onPress={() => handleModerateService(item, 'suspend')}>
          <Text style={[adminStyles.actionBtnText, { color: '#b91c1c', fontFamily: appFont }]}>Suspend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const data = tab === 'reviews' ? reviews : services;

  return (
    <SafeAreaView style={[adminStyles.screen, { backgroundColor: C.bg }]}>
      <View style={[adminStyles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[adminStyles.headerTitle, { color: C.text, fontFamily: appFont }]}>Content Moderation</Text>
      </View>

      {/* Tabs */}
      <View style={[adminStyles.tabBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[adminStyles.tab, { borderBottomColor: tab === t ? C.primary : 'transparent' }]}
            onPress={() => setTab(t)}
          >
            <Text style={[adminStyles.tabText, { color: tab === t ? C.primary : C.muted, fontFamily: appFont }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={data}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => tab === 'reviews' ? <ReviewCard item={item} /> : <ServiceCard item={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={adminStyles.emptyState}>
              <MaterialCommunityIcons name="flag-checkered" size={48} color={C.muted} />
              <Text style={[adminStyles.emptyText, { color: C.muted, fontFamily: appFont }]}>No flagged {tab}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
