import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

const TABS = ['reviews', 'services'];

export default function ContentModerationScreen() {
  const navigation = useNavigation();
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
    Alert.alert(action === 'remove' ? 'Remove Review' : 'Approve Review',
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
    Alert.alert(action === 'suspend' ? 'Suspend Service' : 'Approve Service',
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
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between mb-1">
        <Text className="font-semibold text-gray-800">{item.reviewer?.firstName} {item.reviewer?.lastName}</Text>
        <View className="flex-row">
          {[1,2,3,4,5].map((s) => (
            <MaterialCommunityIcons key={s} name={s <= item.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
          ))}
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-1">{item.comment}</Text>
      <Text className="text-gray-400 text-xs">Service: {item.service?.name} · {formatDate(item.createdAt)}</Text>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity className="flex-1 bg-green-100 py-2 rounded-lg" onPress={() => handleModerateReview(item, 'approve')}>
          <Text className="text-green-700 font-semibold text-center text-sm">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-100 py-2 rounded-lg" onPress={() => handleModerateReview(item, 'remove')}>
          <Text className="text-red-700 font-semibold text-center text-sm">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ServiceCard = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <Text className="font-semibold text-gray-800">{item.name}</Text>
      <Text className="text-gray-500 text-xs mt-1">{item.provider?.businessName || `${item.provider?.firstName} ${item.provider?.lastName}`}</Text>
      <Text className="text-gray-400 text-xs mt-1">{item.serviceType} · {formatDate(item.createdAt)}</Text>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity className="flex-1 bg-green-100 py-2 rounded-lg" onPress={() => handleModerateService(item, 'approve')}>
          <Text className="text-green-700 font-semibold text-center text-sm">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-red-100 py-2 rounded-lg" onPress={() => handleModerateService(item, 'suspend')}>
          <Text className="text-red-700 font-semibold text-center text-sm">Suspend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const data = tab === 'reviews' ? reviews : services;

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Content Moderation</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-3 border-b-2 ${tab === t ? 'border-primary' : 'border-transparent'}`}
            onPress={() => setTab(t)}
          >
            <Text className={`text-center font-semibold capitalize text-sm ${tab === t ? 'text-primary' : 'text-gray-500'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <Loading /> : (
        <FlatList
          data={data}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => tab === 'reviews' ? <ReviewCard item={item} /> : <ServiceCard item={item} />}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <MaterialCommunityIcons name="flag-checkered" size={48} color={COLORS.gray[300]} />
              <Text className="text-gray-500 mt-3">No flagged {tab}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
