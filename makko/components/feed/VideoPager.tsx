import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import type { VideoPost } from '../../data/posts';
import { LEAVE_MS, RevealFrame } from './Entrance';
import { MediaCard } from './MediaCard';

/**
 * How much of a page change the outgoing video gets to itself: the next one
 * stays hidden below the frame until the current one is this far gone.
 */
const APPEAR_AT = 0.58;
/**
 * A page change runs on a fixed timeline rather than the flick's momentum, so
 * it always reads the same: ~0.6s for the old video to leave, ~0.4s for the
 * new one to rise and open to the full frame.
 */
const PAGE_TURN = { duration: 1080, easing: Easing.inOut(Easing.quad) };
const ENTER = { duration: 480, easing: Easing.out(Easing.cubic) };

function Page({
  index,
  pageH,
  cardW,
  cardH,
  pos,
  enter,
  children,
}: {
  index: number;
  pageH: number;
  cardW: number;
  cardH: number;
  pos: SharedValue<number>;
  /** 0 → 1 as the tab itself arrives; only the settled page uses it. */
  enter: SharedValue<number>;
  children: React.ReactNode;
}) {
  // How open this page's window is: shut while it waits under the bottom
  // edge, opening as it rises into place.
  const open = useDerivedValue(() => {
    const below = index - pos.value;
    if (below < -0.5) return 1;
    if (below <= 0) return enter.value;
    const t = interpolate(below, [1 - APPEAR_AT, 0], [0, 1], 'clamp');
    return 1 - Math.pow(1 - t, 3);
  });
  const style = useAnimatedStyle(() => {
    const below = index - pos.value;
    // Pages above simply slide off the top.
    if (below < -0.5) return { transform: [{ translateY: below * pageH }] };
    if (below <= 0) return { transform: [{ translateY: below * pageH + (1 - enter.value) * 0.5 * cardH }] };
    return { transform: [{ translateY: pageH * (1 - open.value) }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: pageH, paddingHorizontal: 16, paddingTop: 16 }, style]}>
      <RevealFrame t={open} width={cardW} height={cardH}>
        {children}
      </RevealFrame>
    </Animated.View>
  );
}

/**
 * Videos, one per page. Drag to move the current clip; let go past a third
 * of the page (or flick) and it slides off while the next rises from the
 * bottom edge, its window opening until it fills the frame. Only the settled
 * page plays.
 */
export function VideoPager({
  posts,
  width,
  height,
  liked,
  onLike,
  jump,
  visible,
  play,
}: {
  posts: VideoPost[];
  width: number;
  height: number;
  liked: Set<string>;
  onLike: (id: string, force?: boolean) => void;
  /** Goes straight to a page; `n` changes on every request so repeats still fire. */
  jump?: { index: number; n: number };
  /** Only the visible tab's pager plays video. */
  visible: boolean;
  /** Replays the tab entrance on the settled page. */
  play: number;
}) {
  const [active, setActive] = useState(0);
  const pos = useSharedValue(0);
  const start = useSharedValue(0);
  const enter = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // The tab that is leaving must not replay its entrance while it fades.
    if (!visible) return;
    enter.value = 0;
    enter.value = withDelay(LEAVE_MS, withTiming(1, ENTER));
  }, [play]); // eslint-disable-line react-hooks/exhaustive-deps
  const last = posts.length - 1;

  useEffect(() => {
    if (jump && posts[jump.index]) {
      pos.value = jump.index;
      setActive(jump.index);
    }
  }, [jump?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const turnTo = (i: number) => {
    'worklet';
    pos.value = withTiming(i, PAGE_TURN, (done) => {
      if (done) scheduleOnRN(setActive, i);
    });
  };

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    failOffsetX: [-20, 20],
    onBegin: () => {
      'worklet';
      start.value = Math.round(pos.value);
    },
    onUpdate: (e) => {
      'worklet';
      // Follow the finger; past either end the pull is damped.
      const raw = start.value - e.translationY / height;
      pos.value = raw < 0 ? raw * 0.25 : raw > last ? last + (raw - last) * 0.25 : raw;
    },
    onDeactivate: (e) => {
      'worklet';
      const moved = start.value - pos.value;
      let target = start.value;
      if (moved < -0.33 || e.velocityY < -600) target = start.value + 1;
      else if (moved > 0.33 || e.velocityY > 600) target = start.value - 1;
      turnTo(Math.min(last, Math.max(0, target)));
    },
  });

  const cardH = height - 32;
  // Only the pages around the current one are mounted.
  const near = posts.map((p, i) => ({ p, i })).filter(({ i }) => Math.abs(i - active) <= 1);

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        {near.map(({ p, i }) => (
          <Page key={p.id} index={i} pageH={height} cardW={width - 32} cardH={cardH} pos={pos} enter={enter}>
              <MediaCard
                post={p}
                width={width - 32}
                height={cardH}
                active={visible && i === active}
                liked={liked.has(p.id)}
                onLike={(force) => onLike(p.id, force)}
              />
          </Page>
        ))}
      </View>
    </GestureDetector>
  );
}
