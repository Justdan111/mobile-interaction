import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

/**
 * Gap between consecutive elements in a cascade. 45ms over ~22 elements
 * settles the screen in about 1.3s — slow enough to read as a sequence,
 * fast enough not to feel like waiting.
 */
export const STAGGER_STEP_MS = 45;
const DURATION_MS = 380;

export type EntranceProps = {
  /** Position in the cascade. Multiplied by the stagger step to get the delay. */
  index?: number;
  /** `right` slides in from the right edge; `down` is the text treatment. */
  from?: 'right' | 'down';
  /**
   * Layout style for the wrapper. The wrapper is an extra node in the tree, so
   * anything the child relied on from its parent's flex — `flex: 1`, a width —
   * has to be restated here or the row collapses.
   */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Staggered entrance for Home's first paint.
 *
 * Deliberately a transparent wrapper with no className: NativeWind maps
 * `className` through its own interop, and third-party components like
 * reanimated's `Animated.View` are not registered with it — styling here would
 * silently do nothing. Callers keep their styled `View` inside.
 */
export function Entrance({ index = 0, from = 'right', style, children }: EntranceProps) {
  const base = from === 'right' ? FadeInRight : FadeInDown;

  return (
    <Animated.View
      entering={base.delay(index * STAGGER_STEP_MS).duration(DURATION_MS)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
