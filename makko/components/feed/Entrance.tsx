import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';

/** Long ease-out: fast start, slow settle. */
export const SETTLE = Easing.bezier(0.16, 1, 0.3, 1);

/** The outgoing tab fades for this long before the incoming one starts. */
export const LEAVE_MS = 200;
const RISE = { duration: 480, easing: Easing.out(Easing.cubic) };

/** How much narrower than the card the window starts, per side. */
const SIDE_INSET = 0.2;
/** How far below the card's top edge the window's top starts. */
const TOP_INSET = 0.1;
export const CARD_RADIUS = 34;

/**
 * A card seen through a window that opens as `t` goes 0 → 1. The window starts
 * narrower than the card and a little short at the top, and widens to the full
 * frame; the content behind it stays at full size the whole time, so the
 * picture is cropped rather than scaled and edge controls are uncovered as
 * the window reaches them.
 */
export function RevealFrame({ t, width, height, children }: { t: SharedValue<number>; width: number; height: number; children: React.ReactNode }) {
  const windowStyle = useAnimatedStyle(() => {
    const side = (1 - t.value) * SIDE_INSET * width;
    return { left: side, right: side, top: (1 - t.value) * TOP_INSET * height, opacity: interpolate(t.value, [0, 0.3], [0.25, 1], 'clamp') };
  });
  const contentStyle = useAnimatedStyle(() => ({
    left: -(1 - t.value) * SIDE_INSET * width,
    top: -(1 - t.value) * TOP_INSET * height,
  }));
  return (
    <View style={{ width, height }}>
      <Animated.View style={[{ position: 'absolute', bottom: 0, borderRadius: CARD_RADIUS, overflow: 'hidden' }, windowStyle]}>
        <Animated.View style={[{ position: 'absolute', width, height }, contentStyle]}>{children}</Animated.View>
      </Animated.View>
    </View>
  );
}

/**
 * Plays the reveal on a timer: the card rises from `from` of its own height
 * below its place while its window opens. Replays whenever `play` changes.
 */
export function Reveal({ play, active = true, width, height, from = 0.5, children }: { play: number; active?: boolean; width: number; height: number; from?: number; children: React.ReactNode }) {
  const t = useSharedValue(1);
  useEffect(() => {
    // A tab that is leaving must not replay its entrance while it fades.
    if (!active) return;
    t.value = 0;
    t.value = withDelay(LEAVE_MS, withTiming(1, RISE));
  }, [play]); // eslint-disable-line react-hooks/exhaustive-deps
  const rise = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * from * height }] }));
  return (
    <Animated.View style={rise}>
      <RevealFrame t={t} width={width} height={height}>
        {children}
      </RevealFrame>
    </Animated.View>
  );
}

/** A follower: slides up and fades in a beat after the lead card. */
export function Rise({ play, active = true, order = 1, children }: { play: number; active?: boolean; order?: number; children: React.ReactNode }) {
  const t = useSharedValue(1);
  useEffect(() => {
    if (!active) return;
    t.value = 0;
    t.value = withDelay(LEAVE_MS + 160 + Math.min(order, 5) * 70, withTiming(1, RISE));
  }, [play]); // eslint-disable-line react-hooks/exhaustive-deps
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: (1 - t.value) * 70 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * One tab's content, kept mounted so a switch never waits on a render. Leaving,
 * it fades out over LEAVE_MS; arriving, it appears once the old tab has gone
 * (the cards inside play their own reveal). `dim` is applied while a finger
 * rests on another tab.
 */
export function TabLayer({
  active,
  play,
  dim,
  leaveFrom,
  children,
}: {
  active: boolean;
  play: number;
  dim: SharedValue<number>;
  /** Opacity the layer had when it was left, so its fade starts there. */
  leaveFrom: number;
  children: React.ReactNode;
}) {
  const shown = useSharedValue(active ? 1 : 0);
  const first = React.useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) {
      shown.value = 0;
      shown.value = withDelay(LEAVE_MS, withTiming(1, { duration: 120 }));
    } else {
      shown.value = Math.min(shown.value, leaveFrom);
      shown.value = withTiming(0, { duration: LEAVE_MS });
    }
  }, [active, play]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ opacity: shown.value * (active ? dim.value : 1) }));

  return (
    <Animated.View pointerEvents={active ? 'auto' : 'none'} style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: active ? 1 : 0 }, style]}>
      {children}
    </Animated.View>
  );
}
