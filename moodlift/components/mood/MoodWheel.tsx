import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MOODS, type MoodId } from '../../data/moods';
import { HandDrawnEllipse } from './HandDrawnEllipse';

/**
 * Every item is the same width so the track can be centred by index alone.
 */
const ITEM_WIDTH = 150;
const RING_WIDTH = 138;
const RING_HEIGHT = 46;

export type MoodWheelProps = {
  /** The mood currently under the centre — changes as you swipe. */
  preview: MoodId;
  /** The mood the user has committed to, or null while still browsing. */
  selected: MoodId | null;
  /** Tapping the centred label selects it. */
  onSelect: (id: MoodId) => void;
  /** Colour of the centred label and its ring. */
  ink: string;
  /** Colour of the labels either side. */
  mutedInk: string;
  /** Total width available, needed to centre the track. */
  trackWidth: number;
  fontSize?: number;
};

/**
 * The label track.
 *
 * Not a ScrollView any more: the card owns a pan gesture, and a ScrollView
 * underneath it would compete for the same horizontal drag. This is a pure
 * indicator that slides to centre `preview`.
 *
 * The ring draws only around `selected`. While you are swiping, nothing is
 * ringed and the CTA stays inactive — the ring means "this is your choice",
 * not "this is what you happen to be looking at".
 */
export function MoodWheel({
  preview,
  selected,
  onSelect,
  ink,
  mutedInk,
  trackWidth,
  fontSize = 21,
}: MoodWheelProps) {
  const index = MOODS.findIndex((m) => m.id === preview);
  const offset = useSharedValue(index);

  React.useEffect(() => {
    offset.value = withSpring(index, { damping: 18, stiffness: 140 });
  }, [index, offset]);

  const trackStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: trackWidth / 2 - ITEM_WIDTH / 2 - offset.value * ITEM_WIDTH },
    ],
  }));

  return (
    <View style={{ height: RING_HEIGHT + 14, overflow: 'hidden' }}>
      <Animated.View style={[{ flexDirection: 'row' }, trackStyle]}>
        {MOODS.map((m) => {
          const isPreview = m.id === preview;
          const isSelected = m.id === selected;
          return (
            <Pressable
              key={m.id}
              // Only the centred label is selectable: tapping a neighbour you
              // can barely see would be an accident, not a choice.
              disabled={!isPreview}
              onPress={() => onSelect(m.id)}
              accessibilityRole="button"
              accessibilityLabel={m.label}
              accessibilityState={{ selected: isSelected, disabled: !isPreview }}
              style={{ width: ITEM_WIDTH, height: RING_HEIGHT + 14 }}
              className="items-center justify-center"
            >
              {isSelected && (
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
                className={isPreview ? 'font-display-italic' : 'font-display'}
                style={{ fontSize, color: isPreview ? ink : mutedInk }}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}
