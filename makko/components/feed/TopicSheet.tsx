import React, { useEffect, useLayoutEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { FEED_TOPICS, type FeedTopic } from '../../data/topics';
import { C, TINTS } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Media } from '../ui/Media';
import { Press } from '../ui/Press';
import { SETTLE } from './Entrance';

/** Quartic ease-out over 650ms: half risen at 0.1s, 96% at 0.45s, as measured. */
const OPEN = { duration: 650, easing: Easing.out(Easing.poly(4)) };

/** Extra distance, per line, each line of the sheet trails behind the one above. */
const SPREAD = 75;

/**
 * While the sheet rises its text arrives stretched out — the header ~40pt
 * low, every row below trailing further — and fades in from about halfway,
 * closing up into place as the sheet settles. `line` 0 is the header.
 */
function useArrival(line: number, y: SharedValue<number>, height: number) {
  return useAnimatedStyle(() => {
    const p = height ? 1 - y.value / height : 1;
    return {
      opacity: interpolate(p, [0.6 + line * 0.03, 0.97], [0, 1], 'clamp'),
      transform: [{ translateY: (1 - p) * (line + 0.55) * SPREAD }],
    };
  });
}

/** One topic row. */
function Row({ topic, index, y, height, on, onPress }: { topic: FeedTopic; index: number; y: SharedValue<number>; height: number; on: boolean; onPress: () => void }) {
  const style = useArrival(index + 1, y, height);
  return (
    <Animated.View style={style}>
      <Press
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        pressedStyle={{ opacity: 0.6 }}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 22 }}
      >
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: TINTS[topic.tint], overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <Media slug={topic.art} contentFit="contain" style={{ width: 58, height: 58 }} />
        </View>
        <Text className="font-medium text-ink" style={{ fontSize: 17, flex: 1 }}>
          {topic.label}
        </Text>
        {on ? <Icon name="check" color={C.blue} size={24} strokeWidth={2.2} /> : null}
      </Press>
    </Animated.View>
  );
}

/**
 * "Choose topic": a sheet that rises over the feed below the header. Drag it
 * down or tap the dimmed page to close; picking a topic filters the feed.
 */
export function TopicSheet({
  open,
  top,
  height,
  bottomInset,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  top: number;
  height: number;
  bottomInset: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  const y = useSharedValue(height);
  // If the height changes while closed, re-park before paint so the sheet is
  // never seen sliding down across the feed.
  useLayoutEffect(() => {
    if (!open) y.value = height;
  }, [height]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    y.value = open ? withTiming(0, OPEN) : withTiming(height, { duration: 260, easing: Easing.in(Easing.quad) });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    onUpdate: (e) => {
      'worklet';
      y.value = Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > height * 0.22 || e.velocityY > 900) scheduleOnRN(onClose);
      else y.value = withTiming(0, { duration: 260, easing: SETTLE });
    },
  });

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const header = useArrival(0, y, height);
  const scrim = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, height], [1, 0]) }));

  return (
    <View pointerEvents={open ? 'auto' : 'none'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' }, scrim]}>
        <Press onPress={onClose} accessibilityLabel="Close topics" style={{ flex: 1 }} pressedStyle={{}} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ position: 'absolute', left: 0, right: 0, top, height, backgroundColor: C.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 }, sheet]}
        >
          <Animated.View className="flex-row items-center justify-between" style={[{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 6 }, header]}>
            <Text className="font-medium text-muted" style={{ fontSize: 13.5, letterSpacing: 0.6 }}>
              CHOOSE TOPIC
            </Text>
            {selected ? (
              <Press onPress={() => onSelect(null)} accessibilityRole="button" hitSlop={8}>
                <Text className="font-semibold text-blue" style={{ fontSize: 14 }}>
                  Show all
                </Text>
              </Press>
            ) : null}
          </Animated.View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomInset + 20 }} showsVerticalScrollIndicator={false}>
            {FEED_TOPICS.map((t, i) => (
              <Row key={t.id} topic={t} index={i} y={y} height={height} on={t.id === selected} onPress={() => onSelect(t.id)} />
            ))}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
