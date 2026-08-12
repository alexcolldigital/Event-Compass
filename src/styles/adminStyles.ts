import { StyleSheet, Platform } from 'react-native';

export const font = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const getColors = (isDark: boolean) => ({
  bg: isDark ? '#050816' : '#f5f7f2',
  surface: isDark ? '#111827' : '#ffffff',
  surfaceAlt: isDark ? '#172033' : '#f3f6ef',
  text: isDark ? '#f8fafc' : '#0f172a',
  muted: isDark ? '#cbd5e1' : '#64748b',
  border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
  primary: '#1f7a4d',
  danger: '#dc2626',
  inputBorder: isDark ? '#334155' : '#d1d5db',
  inputBg: isDark ? '#1e293b' : '#ffffff',
});

export const adminStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: '800' },
  headerAction: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  headerActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Hero
  hero: { borderRadius: 28, padding: 24, marginTop: 8, marginBottom: 16 },
  eyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 4 },

  // Cards
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Stat row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Filter chips
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },

  // Search bar
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 16, marginVertical: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, fontWeight: '600' },

  // List item / menu row
  listItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 10 },
  listIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },
  listSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Action buttons row
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  // Form
  formLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 4 },
  formInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontWeight: '600' },
  formError: { color: '#dc2626', fontSize: 12, marginTop: 4 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySubText: { fontSize: 13, marginTop: 4 },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },

  // Tab bar
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: '700' },
});
