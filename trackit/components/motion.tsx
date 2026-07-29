import { useEffect, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useIsFocused } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Shared deceleration curve for every entrance in the app. */
export const SMOOTH = Easing.bezier(0.16, 1, 0.3, 1);

const TRAVEL = 700; // how long a piece takes to settle
const FADE = 450;

export type SlideFrom = 'right' | 'left' | 'bottom' | 'top';

/**
 * Drives one entrance. Tab screens stay mounted, so the animation is keyed to
 * focus rather than mount: leaving the screen parks the piece back at its start
 * position so the choreography replays in full on every visit.
 */
function useEntrance(delay: number, distance: number) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const shift = useSharedValue(reduceMotion ? 0 : distance);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      shift.value = 0;
      opacity.value = 1;
      return;
    }
    if (!focused) {
      // Park off-stage while hidden — no animation, nobody is watching.
      shift.value = distance;
      opacity.value = 0;
      return;
    }
    shift.value = distance;
    opacity.value = 0;
    shift.value = withDelay(delay, withTiming(0, { duration: TRAVEL, easing: SMOOTH }));
    opacity.value = withDelay(delay, withTiming(1, { duration: FADE, easing: Easing.out(Easing.quad) }));
  }, [focused, delay, distance, reduceMotion, shift, opacity]);

  return { shift, opacity };
}

/**
 * True only while this screen is on stage and motion is allowed. Looping
 * animations — drifting art, marching dashes, pulsing pins — gate on this so
 * nothing keeps burning frames behind a tab the user has already left.
 */
export function useAmbient() {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  return focused && !reduceMotion;
}

/**
 * Fades a piece into place from `from`, after `delay` ms. The home screen
 * stacks these so the header and quick actions arrive from the right while
 * everything below rises from underneath.
 */
export function SlideIn({
  from = 'bottom',
  delay = 0,
  distance,
  style,
  children,
}: {
  from?: SlideFrom;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const travel = distance ?? (from === 'right' || from === 'left' ? 68 : 26);
  const signed = from === 'left' || from === 'top' ? -travel : travel;
  const horizontal = from === 'right' || from === 'left';
  const { shift, opacity } = useEntrance(delay, signed);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: horizontal ? [{ translateX: shift.value }] : [{ translateY: shift.value }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Rises from below — the default entrance for stacked content. */
export function Rise({
  delay = 0,
  distance = 22,
  style,
  children,
}: {
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <SlideIn from="bottom" delay={delay} distance={distance} style={style}>
      {children}
    </SlideIn>
  );
}

/**
 * Fades up without travelling. For layers that are already where they belong
 * and would look wrong sliding — the Live tracking chart, for one.
 */
export function FadeIn({
  delay = 0,
  duration = 520,
  style,
  children,
}: {
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      return;
    }
    if (!focused) {
      opacity.value = 0;
      return;
    }
    opacity.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
  }, [focused, delay, duration, reduceMotion, opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/**
 * Springs up from nothing, overshooting a touch. Map pins and badges should
 * *land* on the chart rather than drift into it the way SlideIn decelerates.
 *
 * The scale pivots on the element's own centre, so give this the positioning
 * style rather than wrapping something that positions itself — otherwise the
 * offset scales too and the piece flies in from the corner.
 */
export function PopIn({
  delay = 0,
  from = 0.5,
  style,
  children,
}: {
  delay?: number;
  from?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const scale = useSharedValue(reduceMotion ? 1 : from);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    if (!focused) {
      scale.value = from;
      opacity.value = 0;
      return;
    }
    scale.value = from;
    opacity.value = 0;
    scale.value = withDelay(delay, withSpring(1, { damping: 11, stiffness: 190 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) }));
  }, [focused, delay, from, reduceMotion, scale, opacity]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A pressable that springs down slightly while held. */
export function PressableScale({
  onPress,
  to = 0.97,
  style,
  children,
}: {
  onPress?: () => void;
  to?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (!reduceMotion) scale.value = withSpring(to, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        if (!reduceMotion) scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
