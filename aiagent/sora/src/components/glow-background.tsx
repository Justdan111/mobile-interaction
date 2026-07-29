import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';

const noise = require('../../assets/images/noise.png');

/**
 * Dark backdrop for the voice and chat screens: near-black base with a
 * warm orange glow bleeding in from the top, a faint ember rising from
 * the bottom, and film grain. `bright` widens and lightens the top glow
 * (voice screen).
 */
export function GlowBackground({ bright = false }: { bright?: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#060302' }]} pointerEvents="none">
      <LinearGradient
        colors={
          bright
            ? ['#D46A1B', 'rgba(178, 74, 14, 0.7)', 'rgba(6, 3, 2, 0)']
            : ['#B04A0F', 'rgba(96, 38, 8, 0.55)', 'rgba(6, 3, 2, 0)']
        }
        locations={bright ? [0, 0.17, 0.48] : [0, 0.14, 0.4]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(6, 3, 2, 0)', 'rgba(88, 22, 4, 0.3)']}
        locations={[0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={noise}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.05 }]}
      />
    </View>
  );
}
