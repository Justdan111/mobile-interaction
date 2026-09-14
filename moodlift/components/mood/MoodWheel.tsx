import React, { useEffect, useRef } from 'react';
import { ScrollView, Text, View, Pressable, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MOODS, type MoodId } from '../../data/moods';
import { HandDrawnEllipse } from './HandDrawnEllipse';

/**
 * Every item is the same width so the wheel can snap on a single interval and
 * the centre of the track is always a whole number of items from the start.
 * Sizing each label to its own text would make the snap offsets uneven and the
 * selected index ambiguous mid-scroll.
 */
const ITEM_WIDTH = 150;
const RING_WIDTH = 138;
const RING_HEIGHT = 46;

export type MoodWheelProps = {
  value: MoodId;
  onChange: (id: MoodId) => void;
  /** Colour of the selected label and its ring. */
  ink: string;
  /** Colour of the labels either side. */
  mutedInk: string;
  /** Total width available, needed to centre the first and last items. */
  trackWidth: number;
  fontSize?: number;
};

export function MoodWheel({
  value,
  onChange,
  ink,
  mutedInk,
  trackWidth,
  fontSize = 21,
}: MoodWheelProps) {
  const ref = useRef<ScrollView>(null);
  const index = MOODS.findIndex((m) => m.id === value);
  const sidePad = Math.max((trackWidth - ITEM_WIDTH) / 2, 0);

  // Follow the value when it changes from outside the wheel — a mood restored
  // from context, or a label tapped rather than scrolled to.
  useEffect(() => {
    ref.current?.scrollTo({ x: index * ITEM_WIDTH, animated: true });
  }, [index]);

  const handleSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
    const clamped = Math.min(Math.max(next, 0), MOODS.length - 1);
    const mood = MOODS[clamped];
    if (mood && mood.id !== value) {
      Haptics.selectionAsync();
      onChange(mood.id);
    }
  };

  return (
    <View style={{ height: RING_HEIGHT + 14 }}>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePad, alignItems: 'center' }}
        onMomentumScrollEnd={handleSettle}
        // A slow drag that never gains momentum fires no momentum event, and
        // the wheel would silently keep the old selection.
        onScrollEndDrag={handleSettle}
      >
        {MOODS.map((m) => {
          const selected = m.id === value;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                if (!selected) {
                  Haptics.selectionAsync();
                  onChange(m.id);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              accessibilityState={{ selected }}
              style={{ width: ITEM_WIDTH, height: RING_HEIGHT + 14 }}
              className="items-center justify-center"
            >
              {selected && (
                <View className="absolute items-center justify-center">
                  <HandDrawnEllipse
                    width={RING_WIDTH}
                    height={RING_HEIGHT}
                    color={ink}
                    strokeWidth={2}
                  />
                </View>
              )}
              <Text
                numberOfLines={1}
                className={selected ? 'font-display-italic' : 'font-display'}
                style={{ fontSize, color: selected ? ink : mutedInk }}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
