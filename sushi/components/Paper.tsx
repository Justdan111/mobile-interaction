import { type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

const grain = require('../assets/img/paper-grain.png');

/**
 * The washi surface the light screens sit on: a flat cream fill with a tiled
 * speckle over it. The tile repeats rather than stretches — scaling a 600px
 * noise field up to screen width turns the speckle into blotches.
 */
export function Paper({
  children,
  tone = colors.paper,
}: {
  children?: ReactNode;
  tone?: string;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { backgroundColor: tone }]}
    >
      <Image
        source={grain}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
      />
      {children}
    </View>
  );
}
