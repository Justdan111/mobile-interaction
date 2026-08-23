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
  /** True once the persisted preference has been read (or the read has failed/found nothing). */
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function isPreference(v: unknown): v is Preference {
  return v === 'system' || v === 'light' || v === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<Preference>('system');
  const [hydrated, setHydrated] = useState(false);

  // Restore the stored preference once on mount. Every exit from this read —
  // a valid value, nothing stored, a corrupt value `isPreference` rejects, or
  // the read itself failing — must still flip `hydrated`, or the splash
  // screen (which waits on it in app/_layout.tsx) hangs forever.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isPreference(stored)) setPreferenceState(stored);
      })
      .catch(() => {
        // Read failed (e.g. storage unavailable) — fall back to the default
        // preference rather than leaving the app stuck unhydrated.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
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
      hydrated,
    };
  }, [mode, preference, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
}
