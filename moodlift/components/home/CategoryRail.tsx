import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Icon, type IconName } from '../ui/icons';
import type { Category } from '../../data/workouts';

const CATEGORIES: { id: Category; label: string; icon: IconName }[] = [
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'yoga', label: 'Yoga', icon: 'yoga' },
  { id: 'fitness', label: 'Fitness', icon: 'hiker' },
  { id: 'run', label: 'Run', icon: 'runner' },
  { id: 'swim', label: 'Swim', icon: 'swimmer' },
  { id: 'cycle', label: 'Cycle', icon: 'bike' },
];

/** The horizontal category tiles from `.design/comps/home-no-mood.png`. */
export function CategoryRail({ onSelect }: { onSelect: (id: Category) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {CATEGORIES.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onSelect(c.id)}
          accessibilityRole="button"
          accessibilityLabel={c.label}
          className="mr-3 h-[104px] w-[96px] items-center justify-center rounded-3xl border border-[#232325] bg-card"
        >
          <Icon name={c.icon} color="#FFFFFF" size={26} strokeWidth={1.5} />
          <Text className="mt-3 font-body text-[13px] text-muted">{c.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
