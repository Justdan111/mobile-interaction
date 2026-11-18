import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { vars } from 'nativewind';
import { cssVars, DARK, LIGHT, type Palette, TONES } from './colors';

export type Appearance = 'system' | 'light' | 'dark';

type Theme = {
  colors: Palette & typeof TONES;
  scheme: 'light' | 'dark';
  appearance: Appearance;
  setAppearance: (a: Appearance) => void;
};

// Outside a provider (e.g. a component rendered alone in a test) the app
// reads as its original dark design.
const ThemeContext = createContext<Theme>({
  colors: { ...DARK, ...TONES },
  scheme: 'dark',
  appearance: 'dark',
  setAppearance: () => {},
});

/**
 * Follows the device setting unless Settings pins a mode. Also sets the CSS
 * variables behind the className tokens on a root View, so `bg-card` and
 * friends switch in the same render as `useColors()`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [appearance, setAppearance] = useState<Appearance>('system');
  const scheme = appearance === 'system' ? (system === 'light' ? 'light' : 'dark') : appearance;

  const value = useMemo<Theme>(() => {
    const palette = scheme === 'light' ? LIGHT : DARK;
    return { colors: { ...palette, ...TONES }, scheme, appearance, setAppearance };
  }, [scheme, appearance]);

  const rootVars = useMemo(() => vars(cssVars(value.colors)), [value.colors]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, rootVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;
