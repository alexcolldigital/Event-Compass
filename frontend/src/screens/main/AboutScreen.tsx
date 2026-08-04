import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-3xl font-black text-gray-900 mb-4">About Event Compass</Text>
        <Text className="text-gray-700 text-base leading-7 mb-4">
          Event Compass is a marketplace built to connect event planners and clients with trusted service providers.
        </Text>
        <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">Version</Text>
          <Text className="text-gray-600">1.0.0</Text>
        </View>
        <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5 mt-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">Mission</Text>
          <Text className="text-gray-600">
            To simplify event planning with trusted providers, secure booking workflows, and real-time account management.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
