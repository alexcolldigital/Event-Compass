import React, { useEffect, useRef, useState } from 'react';
import 'react-native-gesture-handler';
import './src/styles/globalStyles';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuthStore } from './src/context/authStore';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { parseStoredNavigationState } from './src/utils/navigationState';

const NAV_STATE_KEY = 'navigationState';

function AppShell() {
  const { theme } = useTheme();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const [initialState, setInitialState] = useState<object | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeAuth();
    AsyncStorage.getItem(NAV_STATE_KEY)
      .then((saved) => {
        const parsedState = parseStoredNavigationState(saved);
        if (parsedState) setInitialState(parsedState);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, [initializeAuth]);

  if (!isReady) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      initialState={initialState}
      onStateChange={(state) =>
        AsyncStorage.setItem(NAV_STATE_KEY, JSON.stringify(state))
      }
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
