import { View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

const INACTIVE = '#3A3A3D';

/**
 * The home-indicator-style pager rail: three equal dashes, the live one lit
 * white. It tracks the scroll position continuously rather than snapping, so
 * the light slides with your thumb.
 */
export function PageIndicator({
  count,
  progress,
}: {
  count: number;
  progress: SharedValue<number>;
}) {
  return (
    <View className="flex-row items-center justify-center gap-[17px]">
      {Array.from({ length: count }, (_, i) => (
        <Dash key={i} index={i} progress={progress} />
      ))}
    </View>
  );
}

function Dash({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    return {
      backgroundColor: interpolateColor(
        Math.min(distance, 1),
        [0, 1],
        [colors.chalk, INACTIVE],
      ),
      opacity: interpolate(Math.min(distance, 1), [0, 1], [1, 0.9]),
    };
  });

  // Sized in plain styles: Animated.View sits outside NativeWind's interop, so
  // a className here would be dropped and the dash would collapse.
  return (
    <Animated.View
      style={[{ height: 4.5, width: 94, borderRadius: 999 }, style]}
    />
  );
}
