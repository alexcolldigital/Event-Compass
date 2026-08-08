import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Button from '../../components/Button.jsx';

const evidenceOptions = [
  'Photos',
  'Videos',
  'Chat history',
  'Delivery confirmation',
  'Signed receipt',
  'Other supporting docs',
];

const DisputeEvidenceScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const booking = (route.params as any)?.booking || {};
  const [issueType, setIssueType] = useState('Equipment not delivered');
  const [description, setDescription] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(['Photos']);

  const toggleEvidence = (item: string) => {
    setSelectedEvidence((prev) => prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]);
  };

  const submitDispute = () => {
    if (!description.trim()) {
      Alert.alert('Evidence required', 'Please describe the issue and add supporting details before submitting.');
      return;
    }

    Alert.alert('Dispute submitted', 'Your evidence has been sent to support. We will review it and update the booking status.');
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" leftIcon="arrow-left" onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.title}>Dispute evidence</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking</Text>
          <Text style={styles.bookingInfo}>#{booking.bookingNumber || 'EC-0000'} — {booking.status || 'pending'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issue type</Text>
          <TextInput
            value={issueType}
            onChangeText={setIssueType}
            placeholder="Describe the issue"
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Evidence checklist</Text>
          <View style={styles.tagsWrap}>
            {evidenceOptions.map((item) => {
              const active = selectedEvidence.includes(item);
              return (
                <Button
                  key={item}
                  title={item}
                  variant={active ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => toggleEvidence(item)}
                  style={styles.tagButton}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Evidence notes</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            placeholder="Add what happened, dates, photos, delivery details, and any conversation context."
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
          />
        </View>

        <Button title="Submit dispute" variant="primary" leftIcon="file-document-edit" onPress={submitDispute} fullWidth />
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
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  bookingInfo: { color: '#334155', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 14 },
  textArea: { minHeight: 140 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagButton: { marginRight: 8, marginBottom: 8 },
});

export default DisputeEvidenceScreen;
