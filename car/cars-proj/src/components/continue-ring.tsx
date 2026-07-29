import { Pressable, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const SIZE = 116;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ContinueRing({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue"
      hitSlop={12}
      className="items-center justify-center active:opacity-70"
      style={{ width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * 0.42} ${CIRCUMFERENCE * 0.58}`}
          transform={`rotate(-60 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <Text className="absolute font-grotesk text-base text-bone">— Continue</Text>
    </Pressable>
  );
}
