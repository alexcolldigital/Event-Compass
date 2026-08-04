import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Button.jsx';

export default function HelpSupportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-3xl font-black text-gray-900 mb-4">Help & Support</Text>
        <Text className="text-gray-700 text-base leading-7 mb-6">
          Need assistance? Our support team is here to help with bookings, service issues, and account questions.
        </Text>
        <View className="space-y-4">
          <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            <Text className="text-lg font-bold text-gray-900 mb-2">Frequently Asked Questions</Text>
            <Text className="text-gray-600">Find answers to common questions about payments, providers, and bookings.</Text>
          </View>
          <View className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
            <Text className="text-lg font-bold text-gray-900 mb-2">Contact Support</Text>
            <Text className="text-gray-600">Email our team for urgent assistance or account support.</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:support@eventcompass.com')} className="mt-3 rounded-2xl bg-green-600 px-4 py-3">
              <Text className="text-white font-bold">support@eventcompass.com</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-8">
          <Button title="Send Support Request" onPress={() => {}} fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
