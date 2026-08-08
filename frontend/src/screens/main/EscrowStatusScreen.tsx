import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';
import { COLORS } from '../../utils/constants.js';

const EscrowStatusScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const booking = (route.params as any)?.booking || {};

  const escrow = booking.escrow || {};
  const payment = booking.payment || {};
  const totalAmount = booking.pricing?.totalAmount || 0;
  const commissionPct = 10;
  const commissionAmount = Math.round((totalAmount * commissionPct) / 100);
  const payoutAmount = Math.max(totalAmount - commissionAmount, 0);

  const statusTone = useMemo(() => {
    switch (escrow.releaseStatus || escrow.status || 'pending') {
      case 'released':
        return { label: 'Released', color: '#16a34a', bg: '#dcfce7' };
      case 'disputed':
        return { label: 'Disputed', color: '#d97706', bg: '#fef3c7' };
      case 'held':
      case 'active':
        return { label: 'On hold', color: '#2563eb', bg: '#dbeafe' };
      default:
        return { label: 'Pending', color: '#475569', bg: '#e2e8f0' };
    }
  }, [escrow]);

  const feeBreakdown = [
    { label: 'Customer paid', value: `₦${Number(totalAmount).toLocaleString()}` },
    { label: 'Platform commission', value: `₦${commissionAmount.toLocaleString()}` },
    { label: 'Vendor payout', value: `₦${payoutAmount.toLocaleString()}` },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button
          title="Back"
          variant="ghost"
          size="sm"
          leftIcon="arrow-left"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.title}>Escrow status</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: '#ffffff' }]}>
          <View style={[styles.badge, { backgroundColor: statusTone.bg }]}>
            <Text style={[styles.badgeText, { color: statusTone.color }]}>{statusTone.label}</Text>
          </View>
          <Text style={styles.bookingNumber}>#{booking.bookingNumber || 'EC-0000'}</Text>
          <Text style={styles.subtitle}>Funds are safely held until the booking is completed or a dispute is resolved.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#ffffff' }]}> 
          <Text style={styles.sectionTitle}>Escrow details</Text>
          <Row label="Escrow state" value={escrow.releaseStatus || escrow.status || 'pending'} />
          <Row label="Hold amount" value={`₦${Number(totalAmount).toLocaleString()}`} />
          <Row label="Release time" value={escrow.releaseTime || 'after_customer_confirmation'} />
          <Row label="Dispute policy" value={escrow.disputePolicy || 'standard'} />
          <Row label="Payment status" value={payment.status || 'pending'} />
        </View>

        <View style={[styles.card, { backgroundColor: '#ffffff' }]}> 
          <Text style={styles.sectionTitle}>Payout breakdown</Text>
          {feeBreakdown.map((item) => (
            <View key={item.label} style={styles.rowBetween}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: '#ffffff' }]}> 
          <Text style={styles.sectionTitle}>Trust rules</Text>
          <RuleItem icon="shield-check" text="Payment is held before the vendor confirms delivery." />
          <RuleItem icon="timer-sand" text="Vendor has 24 hours to accept. If not, the booking can cancel automatically." />
          <RuleItem icon="message-text-lock" text="Customer confirms completion before payout is released." />
          <RuleItem icon="gavel" text="Disputes remain on hold until support reviews evidence." />
        </View>

        <Button
          title="Open chat"
          variant="secondary"
          leftIcon="message-text"
          onPress={() => navigation.navigate('Chat' as never, { booking } as never)}
          fullWidth
          style={styles.actionButton}
        />
        <Button
          title="Submit dispute"
          variant="primary"
          leftIcon="alert-circle"
          onPress={() => navigation.navigate('DisputeEvidence' as never, { booking } as never)}
          fullWidth
          style={styles.actionButton}
        />
      </ScrollView>
    </View>
  );
};

const Row = ({ label, value }) => (
  <View style={styles.rowBetween}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{String(value)}</Text>
  </View>
);

const RuleItem = ({ icon, text }) => (
  <View style={styles.ruleRow}>
    <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
    <Text style={styles.ruleText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7f2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 },
  backButton: { marginRight: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  content: { padding: 18, paddingBottom: 28 },
  card: { borderRadius: 22, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  bookingNumber: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 12 },
  subtitle: { marginTop: 8, color: '#475569', fontSize: 14, lineHeight: 21 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  rowValue: { color: '#0f172a', fontWeight: '700', fontSize: 14, textTransform: 'capitalize' },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  ruleText: { flex: 1, color: '#334155', fontSize: 14, lineHeight: 20 },
  actionButton: { marginBottom: 12 },
});

export default EscrowStatusScreen;
