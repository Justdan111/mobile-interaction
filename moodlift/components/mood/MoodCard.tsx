import React, { useEffect, useRef } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SlideInLeft,
  SlideInRight,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MOODS, type Mood, type MoodId } from '../../data/moods';
import { MascotFor } from '../mascots';
import { MoodWheel } from './MoodWheel';

const SURFACES = MOODS.map((m) => m.surface);
const BLURB_SURFACES = MOODS.map((m) => m.blurbSurface);
const MOOD_INPUT = MOODS.map((_, i) => i);

/** How far a drag has to travel before it counts as a swipe. */
const SWIPE_THRESHOLD = 45;

/**
 * The full-bleed mood card: heading, mascot, wheel and blurb, on a surface
 * that is the mood.
 *
 * Swiping left or right moves through the moods. That only changes what you
 * are LOOKING at — committing to one is a separate tap on its label, which is
 * what draws the ring and activates the CTA.
 *
 * The surface cross-fades rather than cutting, which is the feel of this
 * screen. `interpolateColor` needs a numeric driver, so the shared value
 * tracks the mood's INDEX and the colour ramps are read from MOODS in order.
 */
export function MoodCard({
  preview,
  selected,
  name,
  onPreviewChange,
  onSelect,
}: {
  preview: Mood;
  selected: MoodId | null;
  name: string;
  onPreviewChange: (id: MoodId) => void;
  onSelect: (id: MoodId) => void;
}) {
  const { width } = useWindowDimensions();
  const index = MOODS.findIndex((m) => m.id === preview.id);
  const progress = useSharedValue(index);

  // Which way the last swipe went, so the incoming mascot enters from the side
  // you swiped from rather than always from the right.
  const direction = useRef<1 | -1>(1);

  useEffect(() => {
    progress.value = withTiming(index, { duration: 320 });
  }, [index, progress]);

  const surfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, MOOD_INPUT, SURFACES),
  }));

  const blurbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, MOOD_INPUT, BLURB_SURFACES),
  }));

  const step = (delta: 1 | -1) => {
    const next = MOODS[index + delta];
    if (!next) return;
    direction.current = delta;
    Haptics.selectionAsync();
    onPreviewChange(next.id);
  };

  const pan = Gesture.Pan()
    // Named so a test can fire a real swipe rather than calling the handler.
    .withTestId('mood-swipe')
    // Claim the gesture only once it is clearly horizontal, so a vertical
    // drag still belongs to whatever wants to scroll.
    .activeOffsetX([-18, 18])
    .failOffsetY([-24, 24])
    .onEnd((event) => {
      if (event.translationX <= -SWIPE_THRESHOLD) runOnJS(step)(1);
      else if (event.translationX >= SWIPE_THRESHOLD) runOnJS(step)(-1);
    });

  const Mascot = MascotFor(preview.id);
  const cardWidth = width - 32;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="flex-1 overflow-hidden rounded-[28px] px-5 pb-6 pt-8"
        style={surfaceStyle}
        accessibilityHint="Swipe left or right to browse moods, then tap a mood to choose it"
      >
        <Text
          className="text-center font-display text-[30px] leading-[38px]"
          style={{ color: preview.onSurface }}
        >
          {name}, how do you <Text className="font-display-italic">feel right</Text> now?
        </Text>

        {/* Keyed on the mood so each change remounts the mascot and its
            entering animation fires — that is what makes it slide in. */}
        <View className="flex-1 items-center justify-center">
          <Animated.View
            key={preview.id}
            entering={(direction.current === 1 ? SlideInRight : SlideInLeft).duration(360)}
          >
            <Mascot size={232} fill={preview.mascotFill} ink={preview.mascotInk} />
          </Animated.View>
        </View>

        {/* The track bleeds past the card's padding so neighbouring labels are
            cut off by the card edge, as they are in the comps. */}
        <View className="-mx-5">
          <MoodWheel
            preview={preview.id}
            selected={selected}
            onSelect={onSelect}
            ink={preview.onSurface}
            mutedInk={preview.mutedOnSurface}
            trackWidth={cardWidth}
          />
        </View>

        <Animated.View className="mt-5 rounded-2xl px-5 py-4" style={blurbStyle}>
          <Text
            className="text-center font-medium text-[15px] leading-[22px]"
            style={{ color: preview.onSurface }}
          >
            {preview.blurb}
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
