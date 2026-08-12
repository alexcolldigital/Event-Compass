import { StyleSheet, Platform } from 'react-native';

export const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const getColors = (isDark) => ({
  bg: isDark ? '#050816' : '#f5f7f2',
  surface: isDark ? '#111827' : '#ffffff',
  surfaceAlt: isDark ? '#172033' : '#f3f6ef',
  text: isDark ? '#f8fafc' : '#0f172a',
  muted: isDark ? '#cbd5e1' : '#64748b',
  border: isDark ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
  inputBorder: isDark ? 'rgba(248,250,252,0.2)' : '#e2e8f0',
  primary: '#1f7a4d',
  danger: '#dc2626',
  warning: '#d97706',
  info: '#0ea5e9',
  success: '#10b981',
});

export const adminStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, marginLeft: 14, fontSize: 18, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Hero banner (like dashboard)
  hero: { borderRadius: 24, padding: 20, marginTop: 8, marginBottom: 16 },
  heroEyebrow: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },

  // Cards
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },

  // Stat grid
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 14 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },

  // List item / menu row
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '700' },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  // Filter chips row
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '700' },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Action buttons row
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  // Form
  formSection: { marginBottom: 20 },
  formSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  formField: { marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  formInputMultiline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formError: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  // Toggle switch
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleSwitch: { width: 48, height: 28, borderRadius: 14, flexDirection: 'row', alignItems: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, fontWeight: '700', marginTop: 12 },
  emptySubtext: { fontSize: 13, marginTop: 4 },

  // Pagination row
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 12 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  pageBtnText: { fontSize: 13, fontWeight: '700' },
});

export default adminStyles;
