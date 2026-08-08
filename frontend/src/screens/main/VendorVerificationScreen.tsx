import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';

const VendorVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const provider = (route.params as any)?.provider || {};

  const verificationOptions = [
    { key: 'Verified', value: provider.isVerified || provider.isBusinessVerified, icon: 'shield-check', desc: 'Business and account review complete' },
    { key: 'Email verified', value: provider.isEmailVerified, icon: 'email-check', desc: 'Email ownership confirmed' },
    { key: 'Phone verified', value: provider.isPhoneVerified, icon: 'phone-check', desc: 'Phone number confirmed' },
    { key: 'Bank account verified', value: provider.bankVerified || provider.isBusinessVerified, icon: 'bank', desc: 'Payout account verified' },
    { key: 'Documents approved', value: provider.verificationDocuments?.length > 0, icon: 'file-check', desc: 'Government or business identification approved' },
  ];

  const badges = [
    { label: 'Verified', color: '#dcfce7', text: '#166534' },
    { label: 'Top Rated', color: '#fef3c7', text: '#92400e' },
    { label: 'Trusted Vendor', color: '#dbeafe', text: '#1d4ed8' },
    { label: 'Fast Response', color: '#fce7f3', text: '#9d174d' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" leftIcon="arrow-left" onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.title}>Vendor verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.businessName}>{provider.businessName || 'Trusted vendor'}</Text>
          <Text style={styles.subtitle}>This vendor has passed the platform’s trust checks before becoming eligible for escrow payout.</Text>
          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <View key={badge.label} style={[styles.badge, { backgroundColor: badge.color }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Verification checklist</Text>
          {verificationOptions.map((item) => (
            <View key={item.key} style={styles.checkRow}>
              <MaterialCommunityIcons name={item.value ? 'check-circle' : 'close-circle'} size={22} color={item.value ? '#16a34a' : '#ef4444'} />
              <View style={styles.checkTextWrap}>
                <Text style={styles.checkLabel}>{item.key}</Text>
                <Text style={styles.checkDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trust model</Text>
          <Text style={styles.infoText}>The platform only releases escrow after confirmation, evidence review, and dispute resolution. Verified vendors can receive faster approvals and greater customer confidence.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7f2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 },
  backButton: { marginRight: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  content: { padding: 18, paddingBottom: 28 },
  card: { backgroundColor: '#ffffff', borderRadius: 22, padding: 18, marginBottom: 16 },
  businessName: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 8, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  checkTextWrap: { marginLeft: 10, flex: 1 },
  checkLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  checkDesc: { marginTop: 4, color: '#64748b', fontSize: 13 },
  infoText: { color: '#334155', fontSize: 14, lineHeight: 22 },
});

export default VendorVerificationScreen;
