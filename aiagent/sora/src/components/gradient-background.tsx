import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

const noise = require('../../assets/images/noise.png');

/**
 * The layered ember backdrop: a vertical burn from bright orange into
 * near-black, a soft radial glow in the upper half, a bottom vignette,
 * and a film-grain overlay.
 */
export function GradientBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#D97A1E', '#EE9231', '#D46311', '#7A300A', '#301205', '#170B05']}
        locations={[0, 0.24, 0.42, 0.60, 0.80, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFC46B" stopOpacity="0.5" />
            <Stop offset="55%" stopColor="#FFA53D" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#FFA53D" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="42" cy="34" rx="58" ry="30" fill="url(#glow)" />
      </Svg>
      <LinearGradient
        colors={['rgba(23, 11, 5, 0)', 'rgba(18, 8, 3, 0.55)', 'rgba(13, 6, 2, 0.9)']}
        locations={[0.45, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(70, 28, 6, 0.30)', 'rgba(70, 28, 6, 0)']}
        locations={[0, 0.22]}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={noise}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0.06 }]}
      />
    </View>
  );
}
