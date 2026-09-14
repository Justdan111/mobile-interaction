import React, { useEffect } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { MOODS, type Mood, type MoodId } from '../../data/moods';
import { MascotFor } from '../mascots';
import { MoodWheel } from './MoodWheel';

const SURFACES = MOODS.map((m) => m.surface);
const BLURB_SURFACES = MOODS.map((m) => m.blurbSurface);
const MOOD_INPUT = MOODS.map((_, i) => i);

/**
 * The full-bleed mood card: heading, mascot, wheel and blurb, on a surface
 * that is the mood.
 *
 * The surface cross-fades between moods rather than cutting, which is the
 * whole feel of this screen. `interpolateColor` needs a numeric driver, so the
 * shared value tracks the mood's INDEX and the colour ramps are read from
 * MOODS in order.
 */
export function MoodCard({
  mood,
  name,
  onChange,
}: {
  mood: Mood;
  name: string;
  onChange: (id: MoodId) => void;
}) {
  const { width } = useWindowDimensions();
  const index = MOODS.findIndex((m) => m.id === mood.id);
  const progress = useSharedValue(index);

  useEffect(() => {
    progress.value = withTiming(index, { duration: 320 });
  }, [index, progress]);

  const surfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, MOOD_INPUT, SURFACES),
  }));

  const blurbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, MOOD_INPUT, BLURB_SURFACES),
  }));

  const Mascot = MascotFor(mood.id);
  const cardWidth = width - 32;

  return (
    <Animated.View className="flex-1 overflow-hidden rounded-[28px] px-5 pb-6 pt-8" style={surfaceStyle}>
      <Text
        className="text-center font-display text-[30px] leading-[38px]"
        style={{ color: mood.onSurface }}
      >
        {name}, how do you <Text className="font-display-italic">feel right</Text> now?
      </Text>

      <View className="flex-1 items-center justify-center">
        <Mascot size={232} fill={mood.mascotFill} ink={mood.mascotInk} />
      </View>

      {/* The wheel bleeds past the card's padding so neighbouring labels are
          cut off by the card edge, as they are in the comps. */}
      <View className="-mx-5">
        <MoodWheel
          value={mood.id}
          onChange={onChange}
          ink={mood.onSurface}
          mutedInk={mood.mutedOnSurface}
          trackWidth={cardWidth}
        />
      </View>

      <Animated.View className="mt-5 rounded-2xl px-5 py-4" style={blurbStyle}>
        <Text
          className="text-center font-medium text-[15px] leading-[22px]"
          style={{ color: mood.onSurface }}
        >
          {mood.blurb}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
