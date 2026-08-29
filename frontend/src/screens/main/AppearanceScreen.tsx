import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const OPTIONS = [
  { key: 'light', label: 'Light', icon: 'white-balance-sunny', desc: 'Always use light mode' },
  { key: 'dark',  label: 'Dark',  icon: 'weather-night',       desc: 'Always use dark mode' },
  { key: 'system', label: 'System Default', icon: 'theme-light-dark', desc: 'Follow device setting' },
] as const;

export default function AppearanceScreen({ navigation }: { navigation: any }) {
  const { theme, preference, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    bg:      isDark ? '#0b120d' : '#f5f7f2',
    surface: isDark ? '#151c16' : '#ffffff',
    text:    isDark ? '#f4f8f1' : '#0f172a',
    muted:   isDark ? '#9fb1a3' : '#64748b',
    border:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    primary: '#1f7a4d',
  };

  const handlers = { light: setLightTheme, dark: setDarkTheme, system: setSystemTheme };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.muted }]}>Choose your preferred theme</Text>

      <View style={styles.list}>
        {OPTIONS.map(({ key, label, icon, desc }) => {
          const selected = preference === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={handlers[key]}
              style={[styles.option, { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border, borderWidth: selected ? 2 : 1 }]}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrap, { backgroundColor: selected ? `${colors.primary}20` : `${colors.muted}15` }]}>
                <MaterialCommunityIcons name={icon} size={26} color={selected ? colors.primary : colors.muted} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.optionDesc,  { color: colors.muted }]}>{desc}</Text>
              </View>
              {selected && <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  backBtn:     { marginRight: 12, padding: 4 },
  title:       { fontSize: 22, fontWeight: '800' },
  subtitle:    { fontSize: 13, marginHorizontal: 20, marginBottom: 20, marginTop: 4 },
  list:        { paddingHorizontal: 20, gap: 12 },
  option:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16 },
  iconWrap:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optionText:  { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '700' },
  optionDesc:  { fontSize: 12, marginTop: 2 },
});
