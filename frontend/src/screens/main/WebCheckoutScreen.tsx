import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, Linking, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Button.jsx';
import { useTheme } from '../../context/ThemeContext';

const WebCheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const params = (route.params || {}) as { checkoutUrl?: string; bookingId?: string; title?: string };
  const checkoutUrl = params.checkoutUrl || '';
  const bookingId = params.bookingId || 'unknown';
  const [isOpening, setIsOpening] = useState(false);

  const colors = useMemo(
    () => ({
      bg: theme === 'dark' ? '#050816' : '#f5f7f2',
      surface: theme === 'dark' ? '#111827' : '#ffffff',
      text: theme === 'dark' ? '#f8fafc' : '#0f172a',
      muted: theme === 'dark' ? '#cbd5e1' : '#64748b',
      primary: theme === 'dark' ? '#34d399' : '#1f7a4d',
      border: theme === 'dark' ? 'rgba(248,250,252,0.14)' : 'rgba(15,23,42,0.08)',
    }),
    [theme]
  );

  useEffect(() => {
    if (!checkoutUrl) {
      return;
    }

    const openCheckout = async () => {
      try {
        setIsOpening(true);
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        } else {
          Alert.alert('Unable to open payment page', 'The payment URL could not be opened from this device.');
        }
      } catch (error) {
        Alert.alert('Payment open failed', 'Please try again from your booking details page.');
      } finally {
        setIsOpening(false);
      }
    };

    openCheckout();
  }, [checkoutUrl]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <MaterialCommunityIcons name="credit-card-check-outline" size={64} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Secure payment</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}> 
          You are being redirected to complete payment for booking #{bookingId}.
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {checkoutUrl ? 'Opening the checkout page...' : 'No checkout URL was returned from the server.'}
        </Text>
        <Button
          title={isOpening ? 'Opening payment...' : 'Open payment page'}
          onPress={() => checkoutUrl && Linking.openURL(checkoutUrl)}
          variant="primary"
          fullWidth
          disabled={!checkoutUrl || isOpening}
          style={{ marginTop: 20 }}
        />
        <Button
          title="Back to bookings"
          onPress={() => navigation.navigate('Bookings' as never)}
          variant="outline"
          fullWidth
          style={{ marginTop: 12 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  subtitle: { marginTop: 10, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  meta: { marginTop: 14, fontSize: 12, textAlign: 'center' },
});

export default WebCheckoutScreen;
