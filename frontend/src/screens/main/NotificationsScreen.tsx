import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import Button from '../../components/Button.jsx';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-3xl font-black text-gray-900 mb-4">Notifications</Text>
        <Text className="text-gray-700 text-base leading-7 mb-6">
          Keep up with your account activity, booking alerts, and service updates.
          Notification settings are connected to your Event Compass account.
        </Text>
        <View className="space-y-4">
          <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            <Text className="text-lg font-bold text-gray-900 mb-2">Booking Alerts</Text>
            <Text className="text-gray-600">Receive updates when a booking is confirmed, cancelled, or completed.</Text>
          </View>
          <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            <Text className="text-lg font-bold text-gray-900 mb-2">Promotions</Text>
            <Text className="text-gray-600">Get notified about new marketplace offers and featured events.</Text>
          </View>
        </View>
        <View className="mt-8">
          <Button title="Manage Notification Preferences" onPress={() => {}} fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
