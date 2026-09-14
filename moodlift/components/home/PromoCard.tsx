import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { getMood } from '../../data/moods';
import { MascotFor } from '../mascots';
import { Entrance } from '../ui/Entrance';

/**
 * The no-mood state: the sage card that asks what you want to train and sends
 * you to the picker. Matches `.design/comps/home-no-mood.png`.
 */
export function PromoCard({ onPress, index = 0 }: { onPress: () => void; index?: number }) {
  const energized = getMood('energized');
  const Mascot = MascotFor('energized');

  return (
    <Entrance index={index}>
      <View className="mb-7 overflow-hidden rounded-3xl bg-sage px-5 pb-5 pt-6">
      <View className="flex-row">
        <View className="flex-1 pr-2">
          <Text className="font-display text-[30px] leading-[38px] text-ink">
            Not sure <Text className="font-display-italic">what</Text> you want to{' '}
            <Text className="font-display-italic">train</Text> today?
          </Text>
        </View>

        {/* The mascot sits alongside the heading and bleeds off the top-right,
            as it does in the comp. */}
        <View className="-mt-3">
          <Mascot size={96} fill={energized.mascotFill} ink={energized.mascotInk} />
        </View>
      </View>

      <Text className="mt-3 font-body text-[14px] leading-[20px] text-ink/80">
        Tell us how you feel, we&apos;ll recommend workouts matching your energy &amp; mood.
      </Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Find my match"
        className="mt-6 items-center rounded-full bg-ink py-4 active:opacity-90"
      >
          <Text className="font-display text-[17px] text-page">Find my match</Text>
        </Pressable>
      </View>
    </Entrance>
  );
}
