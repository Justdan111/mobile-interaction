import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { Workout } from '../../data/workouts';
import { photoFor } from '../../data/photos';
import { formatRelativeSlot, INTENSITY_LABEL } from '../../lib/format';
import { Icon } from '../ui/icons';
import { Tag } from '../ui/Chip';

/**
 * The large photo card in the mood rail — `.design/comps/home-mood-set.png`.
 * Width comes from the viewport so the next card peeks in at the right edge,
 * which is what tells you the rail scrolls.
 */
export function WorkoutCard({
  workout,
  saved,
  onPress,
  onToggleSave,
}: {
  workout: Workout;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32 - 44;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={workout.title}
      className="mr-3 overflow-hidden rounded-3xl bg-card"
      style={{ width: cardWidth }}
    >
      <View>
        <Image
          source={photoFor(workout.photo)}
          style={{ width: cardWidth, height: cardWidth * 0.78 }}
          contentFit="cover"
          transition={180}
          accessibilityIgnoresInvertColors
        />
        <Pressable
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${workout.title} from saved` : `Save ${workout.title}`}
          accessibilityState={{ selected: saved }}
          hitSlop={8}
          className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full bg-page/60"
        >
          <Icon name="heart" color="#FFFFFF" size={20} fill={saved ? '#E8724C' : 'none'} />
        </Pressable>
      </View>

      <View className="px-4 pb-4 pt-3.5">
        <Text className="font-semibold text-[17px] text-ink" numberOfLines={1}>
          {workout.title}
        </Text>

        <View className="mt-2.5 flex-row items-center">
          <Icon name="calendar" color="#8E8E93" size={15} />
          <Text className="ml-1.5 font-body text-[13px] text-muted">
            {formatRelativeSlot(workout.startsAt, workout.durationMin)}
          </Text>
          <Icon name="intensity" color="#8E8E93" size={15} />
          <Text className="ml-1.5 font-body text-[13px] text-muted">
            {INTENSITY_LABEL[workout.intensity]}
          </Text>
        </View>

        <View className="-mt-0.5 flex-row flex-wrap">
          {workout.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
