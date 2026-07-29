import { Image, type ImageContentFit } from 'expo-image';
import { useEffect } from 'react';
import type { ImageStyle, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming,
} from 'react-native-reanimated';

type Props = {
  source: ImageSourcePropType;
  imageStyle: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  delay?: number;
  duration?: number;
  onSettled?: () => void;
};

/**
 * A car that drives in from off the left edge and settles with a small
 * decelerating overshoot, as if braking to a stop.
 */
export function DriveInCar({
  source,
  imageStyle,
  containerStyle,
  contentFit = 'contain',
  delay = 0,
  duration = 950,
  onSettled,
}: Props) {
  const { width } = useWindowDimensions();
  const tx = useSharedValue(-width * 1.1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 180 }));
    tx.value = withDelay(
      delay,
      withSequence(
        withTiming(6, { duration, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 220, easing: Easing.inOut(Easing.quad) }, (finished) => {
          if (finished && onSettled) {
            runOnJS(onSettled)();
          }
        }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Image source={source} contentFit={contentFit} style={imageStyle} transition={0} />
    </Animated.View>
  );
}
