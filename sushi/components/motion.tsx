import { useEffect, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A press target that dips under the finger. Everything tappable in the app
 * uses this so the whole surface responds with the same weight.
 */
export function PressableScale({
  children,
  onPress,
  to = 0.96,
  style,
  hitSlop,
  accessibilityLabel,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  to?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={() => {
        if (!reduced) scale.value = withTiming(to, { duration: 110 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** The edge a `Slide` travels in from. */
export type SlideFrom = 'left' | 'right' | 'top' | 'bottom';

const OFFSET: Record<SlideFrom, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

/**
 * Content that travels in from one edge on mount, fading as it goes. Screens
 * stagger their blocks with `delay` so the page assembles a piece at a time.
 */
export function Slide({
  children,
  from = 'bottom',
  distance = 18,
  delay = 0,
  duration = 520,
  style,
  pointerEvents,
}: {
  children: ReactNode;
  from?: SlideFrom;
  /** How far out it starts, in px. */
  distance?: number;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: ViewProps['pointerEvents'];
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  // Resolved to plain numbers out here so the worklet closes over primitives.
  const dx = OFFSET[from].x * distance;
  const dy = OFFSET[from].y * distance;

  useEffect(() => {
    if (reduced) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, duration, progress, reduced]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (1 - progress.value) * dx },
      { translateY: (1 - progress.value) * dy },
    ],
  }));

  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}

/**
 * The vertical case of `Slide`, kept as its own name because rising from below
 * is the app's default entrance and reads better at the call site.
 */
export function Rise({
  children,
  delay = 0,
  from = 18,
  duration = 520,
  style,
}: {
  children: ReactNode;
  from?: number;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Slide from="bottom" distance={from} delay={delay} duration={duration} style={style}>
      {children}
    </Slide>
  );
}
