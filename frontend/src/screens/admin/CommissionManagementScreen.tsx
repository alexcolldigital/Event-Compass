import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminAPI } from '../../services/api.js';
import Loading from '../../components/Loading.jsx';
import { COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/helpers.js';

export default function CommissionManagementScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ commissionRate: '', minCommission: '', maxCommission: '' });

  useEffect(() => {
    Promise.all([adminAPI.getCommissionSettings(), adminAPI.getCommissionBreakdown()])
      .then(([s, b]) => {
        setSettings(s.commission);
        setBreakdown(b.breakdown);
        setForm({
          commissionRate: String(s.commission?.commissionRate || '10'),
          minCommission: String(s.commission?.minCommission || '0'),
          maxCommission: String(s.commission?.maxCommission || ''),
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await adminAPI.updateCommissionSettings({
        commissionRate: parseFloat(form.commissionRate),
        minCommission: parseFloat(form.minCommission),
        maxCommission: form.maxCommission ? parseFloat(form.maxCommission) : undefined,
      });
      setSettings(res.commission);
      Alert.alert('Success', 'Commission settings updated');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View className="flex-1 bg-light">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text className="text-dark text-lg font-bold flex-1 ml-4">Commission Management</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Breakdown Summary */}
        {breakdown && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="font-bold text-gray-800 mb-3">Revenue Breakdown (All Time)</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-blue-50 p-3 rounded-lg">
                <Text className="text-xs text-blue-700">Total Revenue</Text>
                <Text className="font-bold text-blue-900 mt-1">{formatCurrency(breakdown.totalRevenue || 0)}</Text>
              </View>
              <View className="flex-1 bg-orange-50 p-3 rounded-lg">
                <Text className="text-xs text-orange-700">Platform Fees</Text>
                <Text className="font-bold text-orange-900 mt-1">{formatCurrency(breakdown.totalPlatformFees || 0)}</Text>
              </View>
            </View>
            <View className="flex-row gap-3 mt-3">
              <View className="flex-1 bg-green-50 p-3 rounded-lg">
                <Text className="text-xs text-green-700">Provider Payouts</Text>
                <Text className="font-bold text-green-900 mt-1">{formatCurrency(breakdown.totalPayouts || 0)}</Text>
              </View>
              <View className="flex-1 bg-purple-50 p-3 rounded-lg">
                <Text className="text-xs text-purple-700">Transactions</Text>
                <Text className="font-bold text-purple-900 mt-1">{breakdown.count || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings Form */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <Text className="font-bold text-gray-800 mb-4">Commission Settings</Text>

          <Text className="text-gray-600 text-sm mb-1">Commission Rate (%)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4 text-dark"
            value={form.commissionRate}
            onChangeText={(v) => setForm((f) => ({ ...f, commissionRate: v }))}
            keyboardType="decimal-pad"
            placeholder="e.g. 10"
          />

          <Text className="text-gray-600 text-sm mb-1">Minimum Commission (₦)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4 text-dark"
            value={form.minCommission}
            onChangeText={(v) => setForm((f) => ({ ...f, minCommission: v }))}
            keyboardType="decimal-pad"
            placeholder="e.g. 500"
          />

          <Text className="text-gray-600 text-sm mb-1">Maximum Commission (₦, optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4 text-dark"
            value={form.maxCommission}
            onChangeText={(v) => setForm((f) => ({ ...f, maxCommission: v }))}
            keyboardType="decimal-pad"
            placeholder="Leave blank for no cap"
          />

          <TouchableOpacity
            className="bg-primary rounded-lg py-3 items-center"
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text className="text-white font-bold">{isSaving ? 'Saving...' : 'Save Settings'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
