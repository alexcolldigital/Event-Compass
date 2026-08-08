/**
 * Card Components
 * Lightweight, native React Native cards for the updated marketplace UI.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/** @typedef {import('react-native').StyleProp<import('react-native').ViewStyle>} StyleProp */

const baseText = { fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }) };

const getSurfaceColors = (styleProp) => {
  const flattened = StyleSheet.flatten(styleProp || {});
  const backgroundColor = flattened?.backgroundColor;

  if (typeof backgroundColor === 'string' && backgroundColor.includes('#')) {
    const hex = backgroundColor.replace('#', '');
    if (hex.length === 3) {
      const expanded = hex.split('').map((part) => part + part).join('');
      return { isDark: parseInt(expanded.slice(0, 2), 16) < 120 };
    }
    if (hex.length === 6) {
      return { isDark: parseInt(hex.slice(0, 2), 16) < 120 };
    }
  }

  return { isDark: false };
};

const formatPrice = (value) => {
  if (!value || Number(value) === 0) return 'Not a static price';
  return `₦${Number(value).toLocaleString()}`;
};

const variantStyles = {
  default: { backgroundColor: '#ffffff', borderColor: 'rgba(15, 23, 42, 0.08)' },
  elevated: { backgroundColor: '#ffffff', borderColor: 'rgba(15, 23, 42, 0.08)', shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  outlined: { backgroundColor: '#ffffff', borderColor: 'rgba(31, 122, 77, 0.16)' },
  filled: { backgroundColor: '#f7f9f4', borderColor: 'rgba(31, 122, 77, 0.12)' },
};

const elevationStyles = {
  none: {},
  sm: { shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  md: { shadowOpacity: 0.1, shadowRadius: 14, elevation: 3 },
  lg: { shadowOpacity: 0.12, shadowRadius: 18, elevation: 4 },
  xl: { shadowOpacity: 0.15, shadowRadius: 24, elevation: 5 },
  '2xl': { shadowOpacity: 0.18, shadowRadius: 30, elevation: 6 },
};

/**
 * @param {{
 *   children?: React.ReactNode;
 *   variant?: 'default' | 'elevated' | 'outlined' | 'filled';
 *   elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
 *   interactive?: boolean;
 *   onPress?: () => void;
 *   style?: StyleProp;
 *   contentContainerStyle?: StyleProp;
 *   [key: string]: any;
 * }} props
 */
export const Card = ({
  children,
  variant = 'default',
  elevation = 'md',
  interactive = false,
  onPress = undefined,
  style = undefined,
  contentContainerStyle = undefined,
  ...props
}) => {
  const Component = interactive ? TouchableOpacity : View;
  const resolvedStyle = [styles.card, variantStyles[variant], elevationStyles[elevation], style];

  return (
    <Component onPress={onPress} activeOpacity={0.9} style={resolvedStyle} {...props}>
      <View style={[styles.inner, contentContainerStyle]}>{children}</View>
    </Component>
  );
};

export const MarketplaceCard = ({ image, title, subtitle, rating, reviewCount, price, unit = 'booking', category, badge, onPress, onAddToCart, style }) => {
  const surface = getSurfaceColors(style);
  const titleColor = surface.isDark ? '#f8fafc' : '#111827';
  const subtitleColor = surface.isDark ? '#cbd5e1' : '#64748b';

  return (
    <Card variant="elevated" interactive onPress={onPress} style={[styles.marketplaceCard, style]}>
      <View style={styles.imageWrap}>
        {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <View style={styles.imagePlaceholder}><MaterialCommunityIcons name="image-outline" size={44} color="#cbd5e1" /></View>}
        {category ? <View style={styles.badgeTopLeft}><Text style={styles.badgeText}>{category}</Text></View> : null}
        {badge ? <View style={styles.badgeTopRight}><Text style={styles.badgeTextWhite}>{badge}</Text></View> : null}
        <View style={styles.favoriteButton}><MaterialCommunityIcons name="heart-outline" size={18} color="#64748b" /></View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.title, { color: titleColor }, baseText]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: subtitleColor }, baseText]}>{subtitle}</Text> : null}
          </View>
          {rating ? (
            <View style={styles.ratingPill}>
              <MaterialCommunityIcons name="star" size={13} color="#f59e0b" />
              <Text style={styles.ratingText}>{rating}</Text>
              {reviewCount ? <Text style={styles.reviewText}>({reviewCount})</Text> : null}
            </View>
          ) : null}
        </View>
        <View style={styles.priceRow}>
          <View>
            {(!price || Number(price) === 0) ? null : (
              <Text style={[styles.priceLabel, { color: subtitleColor }, baseText]}>Starting from</Text>
            )}
            <Text style={[styles.price, { color: surface.isDark ? '#4ade80' : '#1f7a4d' }, baseText]}>{formatPrice(price)}</Text>
          </View>
          {(!price || Number(price) === 0) ? null : (
            <Text style={styles.unitText}>per {unit}</Text>
          )}
        </View>
        {onAddToCart ? (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={(event) => {
              event.stopPropagation?.();
              onAddToCart();
            }}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="cart-plus" size={16} color="#ffffff" />
            <Text style={styles.primaryActionText}>Add to cart</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );
};

export const FeatureCard = ({ icon, title, description, count, onPress, style, variant = 'default' }) => {
  const variantBg = { default: '#ffffff', primary: '#f3fbf6', secondary: '#f7f5ff', accent: '#fffaf2', gradient: '#f8faf7' }[variant];
  const surface = getSurfaceColors(style);
  const titleColor = surface.isDark ? '#f8fafc' : '#111827';
  const descColor = surface.isDark ? '#cbd5e1' : '#64748b';
  return (
    <Card variant="outlined" interactive={!!onPress} onPress={onPress} style={[styles.featureCard, { backgroundColor: variantBg }, style]}>
      <View style={styles.featureIconWrap}>{typeof icon === 'string' ? <Text style={{ fontSize: 24 }}>{icon}</Text> : icon}</View>
      <Text style={[styles.featureTitle, { color: titleColor }, baseText]}>{title}</Text>
      {description ? <Text style={[styles.featureDesc, { color: descColor }, baseText]}>{description}</Text> : null}
      {count ? <Text style={[styles.featureCount, { color: surface.isDark ? '#4ade80' : '#1f7a4d' }, baseText]}>{count} services</Text> : null}
    </Card>
  );
};

export const StatCard = ({ value, label, icon, trend, trendUp = true, onPress = undefined, style = undefined }) => {
  const surface = getSurfaceColors(style);
  const titleColor = surface.isDark ? '#f8fafc' : '#111827';
  const labelColor = surface.isDark ? '#cbd5e1' : '#64748b';
  return (
    <Card variant="elevated" interactive={!!onPress} onPress={onPress} style={[styles.statCard, style]}>
      <View style={styles.statIconWrap}>{typeof icon === 'string' ? <Text style={{ fontSize: 22 }}>{icon}</Text> : icon}</View>
      <Text style={[styles.statValue, { color: titleColor }, baseText]}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }, baseText]}>{label}</Text>
      {trend ? (
        <View style={styles.trendRow}>
          <MaterialCommunityIcons name={trendUp ? 'trending-up' : 'trending-down'} size={15} color={trendUp ? '#16a34a' : '#dc2626'} />
          <Text style={[styles.trendText, { color: trendUp ? '#16a34a' : '#dc2626' }]}>{trend}</Text>
        </View>
      ) : null}
    </Card>
  );
};

export const HorizontalCard = ({ image, title, subtitle, rating, reviewCount, price, unit = 'booking', category, onPress, style }) => {
  const surface = getSurfaceColors(style);
  const titleColor = surface.isDark ? '#f8fafc' : '#111827';
  const subtitleColor = surface.isDark ? '#cbd5e1' : '#64748b';
  return (
    <Card variant="elevated" interactive onPress={onPress} style={[styles.horizontalCard, style]}>
      <View style={styles.horizontalImageWrap}>{image ? <Image source={{ uri: image }} style={styles.horizontalImage} resizeMode="cover" /> : <View style={styles.imagePlaceholder} />}</View>
      <View style={styles.horizontalBody}>
        <Text style={[styles.title, { color: titleColor }, baseText]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: subtitleColor }, baseText]}>{subtitle}</Text> : null}
        {rating ? (
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}>{rating}</Text>
            {reviewCount ? <Text style={styles.reviewText}>({reviewCount})</Text> : null}
          </View>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: surface.isDark ? '#4ade80' : '#1f7a4d' }, baseText]}>{formatPrice(price)}</Text>
          {(!price || Number(price) === 0) ? null : (
            <Text style={[styles.unitText, { color: subtitleColor }, baseText]}>per {unit}</Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  inner: { flex: 1 },
  marketplaceCard: { overflow: 'hidden' },
  imageWrap: { height: 176, backgroundColor: '#eef2eb' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2eb' },
  badgeTopLeft: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeTopRight: { position: 'absolute', top: 12, right: 12, backgroundColor: '#1f7a4d', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  badgeTextWhite: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  favoriteButton: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8e7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: '#f59e0b' },
  reviewText: { marginLeft: 4, fontSize: 11, fontWeight: '600', color: '#64748b' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  priceLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  price: { fontSize: 20, fontWeight: '800', color: '#1f7a4d' },
  unitText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#1f7a4d',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  featureCard: { padding: 16, minHeight: 168, borderRadius: 20 },
  featureIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 10 },
  featureCount: { fontSize: 12, fontWeight: '700', color: '#1f7a4d' },
  statCard: { padding: 16, alignItems: 'center', borderRadius: 20 },
  statIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#ecfdf3', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 2 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  trendText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  horizontalCard: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  horizontalImageWrap: { width: 92, height: 92, borderRadius: 18, overflow: 'hidden' },
  horizontalImage: { width: '100%', height: '100%' },
  horizontalBody: { flex: 1, marginLeft: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});

export default Card;