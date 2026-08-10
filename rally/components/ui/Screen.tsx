import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The page ground plus top inset. Bottom inset is deliberately not applied —
 * the detail screen's price bar needs to own it so the bar's fill runs into
 * the home indicator rather than stopping short of it.
 */
export function Screen({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className={`flex-1 bg-ground ${className}`}
      style={{ paddingTop: insets.top }}
    >
      <StatusBar style="dark" />
      {children}
    </View>
  );
}
