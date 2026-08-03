import React, { useRef } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';

// Simple parser for query string
const parseQuery = (url) => {
  try {
    const q = url.split('?')[1] || '';
    return Object.fromEntries(new URLSearchParams(q));
  } catch (e) {
    return {};
  }
};

const WebCheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { url } = (route.params as any) || {};
  const webRef = useRef(null);

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>No checkout URL provided.</Text>
      </View>
    );
  }

  const handleNavigationStateChange = (navState) => {
    const navUrl = navState.url || '';

    // Detect redirect back to our app using the configured payment-result path
    if (navUrl.includes('/payment-result')) {
      const params = parseQuery(navUrl);
      const bookingId = params.bookingId;
      const status = params.status;

      // Close the WebView and navigate to the PaymentResult screen
      navigation.navigate('PaymentResult', { bookingId, status });
    }
  };

  // For web, fall back to an iframe
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <iframe src={url} title="Checkout" style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: url }}
        ref={webRef}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: { flex: 1, height: '100vh' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default WebCheckoutScreen;
