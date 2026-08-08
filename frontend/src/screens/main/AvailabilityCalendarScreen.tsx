import React, { useState, useCallback } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBookingStore } from '../../context/bookingStore.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AvailabilityCalendarScreen({ route, navigation }: any) {
  const { serviceId, venueId, onSelectDate } = route.params || {};
  const { theme } = useTheme();
  const { checkAvailability } = useBookingStore();
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#050816' : '#f8fafc',
    surface: isDark ? '#111827' : '#ffffff',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
    primary: isDark ? '#34d399' : '#1f7a4d',
    unavailable: '#fee2e2',
    available: '#dcfce7',
  };

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayPress = useCallback(async (day: number) => {
    const date = new Date(year, month, day);
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(key);

    if (availability[key] === undefined) {
      setChecking(key);
      try {
        const res = await checkAvailability({ serviceId, venueId, date: key });
        setAvailability(prev => ({ ...prev, [key]: res.isAvailable }));
      } catch {
        setAvailability(prev => ({ ...prev, [key]: true }));
      } finally {
        setChecking(null);
      }
    }
  }, [year, month, availability, serviceId, venueId]);

  const handleConfirm = () => {
    if (!selectedDate) return Alert.alert('Select a date first');
    if (availability[selectedDate] === false) {
      return Alert.alert('Unavailable', 'This date is already booked. Please choose another.');
    }
    if (onSelectDate) onSelectDate(selectedDate);
    navigation.goBack();
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Check Availability</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.text }]}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {DAYS.map(d => (
            <Text key={d} style={[styles.dayLabel, { color: colors.muted }]}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`e-${i}`} style={styles.cell} />;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isSelected = selectedDate === key;
            const isChecking = checking === key;
            const avail = availability[key];

            let cellBg = 'transparent';
            if (isSelected) cellBg = colors.primary;
            else if (avail === false) cellBg = colors.unavailable;
            else if (avail === true) cellBg = colors.available;

            return (
              <TouchableOpacity
                key={key}
                style={[styles.cell, { backgroundColor: cellBg, opacity: isPast ? 0.3 : 1 }]}
                onPress={() => !isPast && handleDayPress(day)}
                disabled={isPast}
              >
                {isChecking ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.dayNum, { color: isSelected ? '#fff' : colors.text }]}>{day}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.available }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.unavailable }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>Selected</Text>
          </View>
        </View>
      </View>

      {selectedDate && (
        <View style={styles.footer}>
          <Text style={[styles.selectedLabel, { color: colors.muted }]}>Selected: <Text style={{ color: colors.primary, fontWeight: '700' }}>{selectedDate}</Text></Text>
          {availability[selectedDate] === false && (
            <Text style={styles.unavailableNote}>This date is unavailable</Text>
          )}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: availability[selectedDate] === false ? '#94a3b8' : colors.primary }]}
            onPress={handleConfirm}
            disabled={availability[selectedDate] === false}
          >
            <Text style={styles.confirmText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginLeft: 12 },
  card: { margin: 16, borderRadius: 20, borderWidth: 1, padding: 16 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { padding: 8 },
  monthLabel: { fontSize: 16, fontWeight: '800' },
  daysRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginBottom: 4 },
  dayNum: { fontSize: 13, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },
  footer: { margin: 16, gap: 10 },
  selectedLabel: { fontSize: 14 },
  unavailableNote: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  confirmBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
