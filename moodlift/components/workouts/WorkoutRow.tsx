import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { Workout } from '../../data/workouts';
import { photoFor } from '../../data/photos';
import { formatRelativeSlot, INTENSITY_LABEL } from '../../lib/format';
import { Icon } from '../ui/icons';
import { Tag } from '../ui/Chip';

/** A list row — `.design/comps/workouts-browse.png`. */
export function WorkoutRow({
  workout,
  onPress,
}: {
  workout: Workout;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={workout.title}
      className="mb-3 flex-row rounded-3xl bg-card p-3.5 active:opacity-90"
    >
      <View className="flex-1 pr-3">
        <Text className="font-semibold text-[16px] text-ink" numberOfLines={1}>
          {workout.title}
        </Text>

        <View className="mt-2 flex-row items-center">
          <Icon name="calendar" color="#8E8E93" size={14} />
          <Text className="ml-1.5 font-body text-[12.5px] text-muted" numberOfLines={1}>
            {formatRelativeSlot(workout.startsAt, workout.durationMin)}
          </Text>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <Icon name="intensity" color="#8E8E93" size={14} />
          <Text className="ml-1.5 font-body text-[12.5px] text-muted">
            {INTENSITY_LABEL[workout.intensity]}
          </Text>
          <Text className="mx-2 font-body text-[12.5px] text-muted">|</Text>
          <Icon name="person" color="#8E8E93" size={14} />
          <Text className="ml-1.5 font-body text-[12.5px] text-muted" numberOfLines={1}>
            {workout.coach}
          </Text>
        </View>

        <View className="-mt-0.5 flex-row flex-wrap">
          {workout.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>

      <Image
        source={photoFor(workout.photo)}
        style={{ width: 92, height: 108, borderRadius: 18 }}
        contentFit="cover"
        transition={180}
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
}
