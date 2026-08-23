import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens, type Mode, type TokenName } from './tokens';

export const THEME_STORAGE_KEY = 'halftone.theme';

export type Preference = 'system' | 'light' | 'dark';

type ThemeValue = {
  mode: Mode;
  preference: Preference;
  setPreference: (p: Preference) => void;
  toggle: () => void;
  /** Raw token values for consumers that cannot use className: SVG, glass tints. */
  t: Record<TokenName, string>;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function isPreference(v: unknown): v is Preference {
  return v === 'system' || v === 'light' || v === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<Preference>('system');

  // Restore the stored preference once on mount.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (!cancelled && isPreference(stored)) setPreferenceState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const mode: Mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  // Push the resolved mode into NativeWind so `dark:` and the token vars apply.
  useEffect(() => {
    setColorScheme(preference === 'system' ? 'system' : preference);
  }, [preference, setColorScheme]);

  const value = useMemo<ThemeValue>(() => {
    const setPreference = (p: Preference) => {
      setPreferenceState(p);
      void AsyncStorage.setItem(THEME_STORAGE_KEY, p);
    };
    return {
      mode,
      preference,
      setPreference,
      toggle: () => setPreference(mode === 'dark' ? 'light' : 'dark'),
      t: tokens[mode],
    };
  }, [mode, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
}
