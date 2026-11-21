import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { FEED_TOPICS } from '../../data/topics';
import { C, TINTS } from '../../theme/colors';
import { Icon } from '../ui/icons';
import { Media } from '../ui/Media';
import { Press } from '../ui/Press';

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
  useEffect(() => {
    y.value = open ? withSpring(0, { damping: 22, stiffness: 190 }) : withTiming(height, { duration: 260, easing: Easing.in(Easing.cubic) });
  }, [open, height, y]);

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    onUpdate: (e) => {
      'worklet';
      y.value = Math.max(0, e.translationY);
    },
    onDeactivate: (e) => {
      'worklet';
      if (e.translationY > height * 0.22 || e.velocityY > 900) scheduleOnRN(onClose);
      else y.value = withSpring(0, { damping: 22, stiffness: 190 });
    },
  });

  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
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
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 6 }}>
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
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: bottomInset + 20 }} showsVerticalScrollIndicator={false}>
            {FEED_TOPICS.map((t) => {
              const on = t.id === selected;
              return (
                <Press
                  key={t.id}
                  onPress={() => onSelect(t.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  pressedStyle={{ opacity: 0.6 }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 22 }}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: TINTS[t.tint], overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    <Media slug={t.art} contentFit="contain" style={{ width: 58, height: 58 }} />
                  </View>
                  <Text className="font-medium text-ink" style={{ fontSize: 17, flex: 1 }}>
                    {t.label}
                  </Text>
                  {on ? <Icon name="check" color={C.blue} size={24} strokeWidth={2.2} /> : null}
                </Press>
              );
            })}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
