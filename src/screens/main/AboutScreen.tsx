import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}> 
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>About Event Compass</Text>
          <Text style={styles.subtitle}>Learn more about our mission, values, and platform.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Our mission</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>Event Compass connects event hosts with trusted providers, making booking fast, simple, and reliable.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>What we do</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>We help providers grow their business while giving customers a polished discovery experience for local event services.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Why choose us?</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>Modern tools for bookings, reviews, and provider management all in one app.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { borderRadius: 28, padding: 22, marginBottom: 18 },
  backButton: { width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  cardBody: { fontSize: 14, lineHeight: 22 },
});
