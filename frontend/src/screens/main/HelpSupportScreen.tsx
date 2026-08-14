import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button.jsx';
import apiClient from '../../services/api.js';

const FAQS = [
  { q: 'How do I book a service?', a: 'Browse services, add them to your cart, fill in event details, and proceed to checkout. Payment is processed securely via Paystack.' },
  { q: 'Can I cancel a booking?', a: 'Yes. Go to Bookings, open the booking, and tap Cancel. Cancellation policies vary by provider.' },
  { q: 'How do I become a service provider?', a: 'Register using the "Register as Provider" option on the sign-up screen and complete your profile.' },
  { q: 'When will I receive my payment as a provider?', a: 'Payments are held in escrow and released after the client confirms service completion.' },
  { q: 'How do I reset my password?', a: 'On the login screen, tap "Forgot Password" and follow the instructions sent to your email.' },
];

export default function HelpSupportScreen({ navigation }: { navigation: any }) {
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

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in both subject and message.');
      return;
    }
    setSending(true);
    try {
      await apiClient.post('/support/contact', { subject, message });
      Alert.alert('Sent!', 'Your message has been received. We\'ll respond within 24 hours.');
      setSubject('');
      setMessage('');
    } catch {
      // Fallback: open email client
      const body = encodeURIComponent(`Subject: ${subject}\n\n${message}`);
      Linking.openURL(`mailto:support@eventcompass.com?subject=${encodeURIComponent(subject)}&body=${body}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick contact chips */}
        <View style={styles.contactRow}>
          {[
            { icon: 'email-outline', label: 'Email Us', action: () => Linking.openURL('mailto:support@eventcompass.com') },
            { icon: 'whatsapp', label: 'WhatsApp', action: () => Linking.openURL('https://wa.me/2348000000000') },
            { icon: 'web', label: 'Website', action: () => Linking.openURL('https://eventcompass.com') },
          ].map((c) => (
            <TouchableOpacity key={c.label} onPress={c.action} style={[styles.contactChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialCommunityIcons name={c.icon as any} size={22} color={colors.primary} />
              <Text style={[styles.contactChipLabel, { color: colors.text }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}
            style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQ, { color: colors.text, flex: 1 }]}>{faq.q}</Text>
              <MaterialCommunityIcons
                name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.muted}
              />
            </View>
            {openFaq === i && (
              <Text style={[styles.faqA, { color: colors.muted }]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact form */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Send a Message</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Issue with my booking"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1a2535' : '#f8fbf7' }]}
          />
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
            style={[styles.input, styles.textarea, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#1a2535' : '#f8fbf7' }]}
          />
          <Button
            title={sending ? 'Sending...' : 'Send Message'}
            onPress={handleSend}
            isLoading={sending}
            fullWidth
            variant="primary"
            size="lg"
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Support hours */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.hoursRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
            <Text style={[styles.hoursTitle, { color: colors.text }]}>Support Hours</Text>
          </View>
          <Text style={[styles.hoursText, { color: colors.muted }]}>Monday – Friday: 8am – 6pm WAT</Text>
          <Text style={[styles.hoursText, { color: colors.muted }]}>Saturday: 9am – 3pm WAT</Text>
          <Text style={[styles.hoursText, { color: colors.muted }]}>Sunday: Closed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginLeft: 14 },
  content: { padding: 16, gap: 12, paddingBottom: 96 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactChip: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6 },
  contactChipLabel: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  faqItem: { borderWidth: 1, borderRadius: 18, padding: 16 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faqQ: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  faqA: { fontSize: 13, lineHeight: 20, marginTop: 10, fontWeight: '500' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600' },
  textarea: { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  hoursTitle: { fontSize: 15, fontWeight: '800' },
  hoursText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
});
