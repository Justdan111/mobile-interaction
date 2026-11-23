import React, { useEffect } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { FEED_TABS, type FeedTab } from '../../data/posts';
import { C } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Press } from '../ui/Press';

const INACTIVE = '#A3A3A3';

function Label({ label, index, pos, onPress, onPressIn, onPressOut, onLayout }: {
  label: string;
  index: number;
  pos: SharedValue<number>;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const color = useAnimatedStyle(() => ({
    color: interpolateColor(Math.min(1, Math.abs(pos.value - index)), [0, 1], [C.ink, INACTIVE]),
  }));
  return (
    <Press onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} accessibilityRole="tab" accessibilityLabel={label} onLayout={onLayout} hitSlop={8} pressedStyle={{}}>
      <Animated.Text className="font-medium" style={[{ fontSize: 17, paddingVertical: 6 }, color]}>
        {label}
      </Animated.Text>
    </Press>
  );
}

/**
 * The All / Photos / Videos / Posts row. The underline glides to the selected
 * label and takes its width. Press-in on another tab is reported so the feed
 * can dim while the finger is down.
 */
export function FeedTabs({
  index,
  onSelect,
  onPressTab,
  onFilter,
  filtered,
}: {
  index: number;
  onSelect: (t: FeedTab, i: number) => void;
  onPressTab: (i: number | null) => void;
  onFilter: () => void;
  filtered: boolean;
}) {
  const pos = useSharedValue(index);
  useEffect(() => {
    pos.value = withTiming(index, { duration: 300, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  }, [index, pos]);

  const xs = useSharedValue<number[]>(FEED_TABS.map(() => 0));
  const ws = useSharedValue<number[]>(FEED_TABS.map(() => 0));
  const underline = useAnimatedStyle(() => {
    const idx = FEED_TABS.map((_, i) => i);
    return {
      left: interpolate(pos.value, idx, xs.value, 'clamp'),
      width: interpolate(pos.value, idx, ws.value, 'clamp'),
    };
  });

  return (
    <View className="flex-row items-center" style={{ paddingHorizontal: 20, height: 52 }}>
      <View className="flex-row" style={{ gap: 26, flex: 1 }}>
        {FEED_TABS.map((t, i) => (
          <Label
            key={t.key}
            label={t.label}
            index={i}
            pos={pos}
            onPress={() => onSelect(t.key, i)}
            onPressIn={() => onPressTab(i)}
            onPressOut={() => onPressTab(null)}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              xs.value = xs.value.map((v, j) => (j === i ? x : v));
              ws.value = ws.value.map((v, j) => (j === i ? width : v));
            }}
          />
        ))}
        <Animated.View style={[{ position: 'absolute', bottom: -4, height: 2, borderRadius: 1, backgroundColor: C.ink }, underline]} />
      </View>
      <Press onPress={onFilter} accessibilityRole="button" accessibilityLabel="Choose topic" hitSlop={10}>
        <Icon name="filter" color={C.ink} size={28} strokeWidth={1.6} />
        {filtered ? <View style={{ position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand }} /> : null}
      </Press>
    </View>
  );
}
