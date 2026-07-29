import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// The three white speed lines to the left of the box, each fading out
// toward the left like motion blur.
const LINES = [24, 17, 11];

export function MotionLines({ width = 28 }: { width?: number }) {
  return (
    <View style={{ width, alignItems: 'flex-end', justifyContent: 'center' }}>
      {LINES.map((w, i) => (
        <LinearGradient
          key={i}
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: w, height: 3.5, borderRadius: 2, marginVertical: 2.5 }}
        />
      ))}
    </View>
  );
}
