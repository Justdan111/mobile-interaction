import React, { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Halftone } from './Halftone';
import type { FieldName } from './fields';

/** Slow enough that the dots creep rather than spin. */
export const ORBIT_DURATION_MS = 24000;

/**
 * Wraps a `Halftone` in a continuous rotation.
 *
 * The field itself stays exactly as seeded — the same dots in the same places,
 * so nothing about the generated art changes. Only the container turns.
 */
export function OrbitingHalftone({
  variant,
  size,
  seed,
  density,
  dotColor,
}: {
  variant: FieldName;
  size: number;
  seed: string;
  density: number;
  dotColor: string;
}) {
  const angle = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduceMotion(enabled);
      })
      .catch(() => {
        // Unavailable on this platform; treat motion as allowed.
      });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(angle);
      angle.value = 0;
      return;
    }
    angle.value = 0;
    angle.value = withRepeat(
      withTiming(360, { duration: ORBIT_DURATION_MS, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(angle);
  }, [angle, reduceMotion, seed]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  return (
    <Animated.View style={style} accessibilityLabel={`${variant} halftone, orbiting`}>
      <Halftone variant={variant} size={size} seed={seed} density={density} dotColor={dotColor} />
    </Animated.View>
  );
}
