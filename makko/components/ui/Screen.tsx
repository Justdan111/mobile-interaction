import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const GUTTER = 16;

/** A white page with the safe-area top inset applied. */
export function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-page" style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
}
