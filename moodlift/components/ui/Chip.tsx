import React from 'react';
import { Pressable, Text, View } from 'react-native';

/** A tag chip — the "Energizing / Medium–High / Solo" row under a workout. */
export function Tag({ label }: { label: string }) {
  return (
    <View className="mr-2 mt-2 rounded-full bg-chip px-3 py-1.5">
      <Text className="font-medium text-[12px] text-muted">{label}</Text>
    </View>
  );
}

/** A selectable filter chip — "All workout / Today / Low intensity". */
export function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`mr-2 rounded-full px-4 py-2.5 ${selected ? 'bg-chip' : 'border border-[#2A2A2C]'}`}
    >
      <Text
        className={`font-medium text-[13px] ${selected ? 'text-ink' : 'text-muted'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
