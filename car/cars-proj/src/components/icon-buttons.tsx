import { Pressable, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const DOT = 4.5;
const DOT_GAP = 4.5;

/** Blue circular button with a 3x3 grid of white dots (onboarding + details). */
export function DotGridButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Menu"
      className="h-14 w-14 items-center justify-center rounded-full bg-pulse active:opacity-80">
      <View
        className="flex-row flex-wrap"
        style={{ width: DOT * 3 + DOT_GAP * 2, gap: DOT_GAP }}>
        {Array.from({ length: 9 }, (_, i) => (
          <View
            key={i}
            className="rounded-[1.5px] bg-white"
            style={{ width: DOT, height: DOT }}
          />
        ))}
      </View>
    </Pressable>
  );
}

/** White circular button with a dark X (collection close). */
export function CloseButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close"
      className="h-14 w-14 items-center justify-center rounded-full bg-white active:opacity-80">
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Line x1={3} y1={3} x2={17} y2={17} stroke="#14171C" strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={17} y1={3} x2={3} y2={17} stroke="#14171C" strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}
