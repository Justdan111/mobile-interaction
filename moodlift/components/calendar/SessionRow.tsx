import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Workout, Category } from '../../data/workouts';
import { formatTimeRange } from '../../lib/format';
import { Icon, type IconName } from '../ui/icons';

const CATEGORY_ICON: Record<Category, IconName> = {
  gym: 'dumbbell',
  yoga: 'yoga',
  fitness: 'hiker',
  run: 'runner',
  swim: 'swimmer',
  cycle: 'bike',
  dance: 'dance',
  tennis: 'tennis',
};

/** An agenda row — sage icon tile, time, title, coach, Join. */
export function SessionRow({
  workout,
  joined,
  onPress,
  onJoin,
}: {
  workout: Workout;
  joined: boolean;
  onPress: () => void;
  onJoin: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={workout.title}
      className="mb-2.5 flex-row items-center rounded-3xl bg-card p-3 active:opacity-90"
    >
      <View className="h-[58px] w-[52px] items-center justify-center rounded-2xl bg-sage">
        <Icon name={CATEGORY_ICON[workout.category]} color="#FFFFFF" size={24} strokeWidth={1.5} />
      </View>

      <View className="ml-3 flex-1">
        <Text className="font-body text-[12.5px] text-muted">
          {formatTimeRange(workout.startsAt, workout.durationMin)}
        </Text>
        <Text className="mt-0.5 font-semibold text-[15.5px] text-ink" numberOfLines={1}>
          {workout.title}
        </Text>
        <Text className="mt-0.5 font-body text-[12.5px] text-muted" numberOfLines={1}>
          {workout.coach}
        </Text>
      </View>

      <Pressable
        onPress={onJoin}
        accessibilityRole="button"
        accessibilityLabel={joined ? `Leave ${workout.title}` : `Join ${workout.title}`}
        accessibilityState={{ selected: joined }}
        hitSlop={6}
        className="ml-2 rounded-full px-4 py-2"
        style={{ backgroundColor: joined ? '#E8724C' : '#2A2A2C' }}
      >
        <Text
          className="font-display text-[14px]"
          style={{ color: joined ? '#1B1B1D' : '#FFFFFF' }}
        >
          {joined ? 'Joined' : 'Join'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
