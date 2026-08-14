import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const APP_VERSION = '1.0.0';

const FEATURES = [
  { icon: 'calendar-check', text: 'Book event services & venues' },
  { icon: 'shield-check', text: 'Verified service providers' },
  { icon: 'lock', text: 'Secure escrow payments' },
  { icon: 'star', text: 'Ratings & reviews system' },
  { icon: 'bell', text: 'Real-time booking notifications' },
];

const LINKS = [
  { label: 'Privacy Policy', url: 'https://eventcompass.com/privacy' },
  { label: 'Terms of Service', url: 'https://eventcompass.com/terms' },
  { label: 'Cookie Policy', url: 'https://eventcompass.com/cookies' },
];

export default function AboutScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f5f7f2',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#cbd5e1' : '#64748b',
    border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand hero */}
        <View style={[styles.brandCard, { backgroundColor: colors.primary }]}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="compass" size={48} color="#1f7a4d" />
          </View>
          <Text style={styles.brandName}>Event Compass</Text>
          <Text style={styles.brandTagline}>Your all-in-one event marketplace</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bullseye-arrow" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Our Mission</Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            To simplify event planning by connecting clients with trusted, verified service providers through a secure, transparent, and seamless marketplace.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="star-circle" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>What We Offer</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <MaterialCommunityIcons name={f.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.muted }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* App info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>App Info</Text>
          </View>
          {[
            { label: 'Version', value: APP_VERSION },
            { label: 'Platform', value: 'iOS · Android · Web' },
            { label: 'Built with', value: 'React Native & Expo' },
            { label: 'Backend', value: 'Node.js / MongoDB' },
            { label: 'Released', value: 'February 2026' },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Legal links */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Legal</Text>
          </View>
          {LINKS.map((l) => (
            <TouchableOpacity key={l.label} onPress={() => Linking.openURL(l.url)} style={styles.linkRow}>
              <Text style={[styles.linkText, { color: colors.primary }]}>{l.label}</Text>
              <MaterialCommunityIcons name="open-in-new" size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Contact</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@eventcompass.com')} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.primary }]}>support@eventcompass.com</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:developer@eventcompass.com')} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.primary }]}>developer@eventcompass.com</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: colors.muted }]}>© 2026 Event Compass. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginLeft: 14 },
  content: { padding: 16, gap: 14, paddingBottom: 96 },
  brandCard: { borderRadius: 24, padding: 28, alignItems: 'center' },
  logoWrap: { width: 80, height: 80, borderRadius: 999, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  brandName: { color: '#fff', fontSize: 26, fontWeight: '900' },
  brandTagline: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 6, fontWeight: '600' },
  versionBadge: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  versionText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardBody: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText: { fontSize: 13, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  linkText: { fontSize: 14, fontWeight: '700' },
  copyright: { textAlign: 'center', fontSize: 12, fontWeight: '500', marginTop: 4 },
});
