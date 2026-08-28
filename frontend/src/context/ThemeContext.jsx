/**
 * Theme Context
 * Manages light/dark/system mode with device preference as default.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'theme_preference';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreference(saved);
      }
      setMounted(true);
    });
  }, []);

  const savePreference = useCallback(async (pref) => {
    setPreference(pref);
    await AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const theme = preference === 'system' ? (systemScheme ?? 'light') : preference;

  const toggleTheme = useCallback(() => {
    savePreference(theme === 'light' ? 'dark' : 'light');
  }, [theme, savePreference]);

  const setLightTheme = useCallback(() => savePreference('light'), [savePreference]);
  const setDarkTheme = useCallback(() => savePreference('dark'), [savePreference]);
  const setSystemTheme = useCallback(() => savePreference('system'), [savePreference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

export default ThemeContext;