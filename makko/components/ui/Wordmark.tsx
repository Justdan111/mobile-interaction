import React from 'react';
import { Text } from 'react-native';

/** The "makko" logotype, set in Playwrite US Modern. */
export function Wordmark({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel="makko"
      className="font-script"
      // Playwrite's ascenders sit far above its x-height; a fixed line height
      // keeps the mark from pushing the header row down.
      style={{ color, fontSize: size, lineHeight: size * 1.55, includeFontPadding: false }}
    >
      makko
    </Text>
  );
}
