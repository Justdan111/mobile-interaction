import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from './icons';

/** A section title with an optional action on the right — "Categories / See all". */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="flex-1 font-display text-[22px] text-ink" numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          className="ml-3 shrink-0 flex-row items-center"
        >
          <Text className="mr-1 font-display text-[14px] text-ink">{actionLabel}</Text>
          <Icon name="chevron-right" color="#FFFFFF" size={16} strokeWidth={1.8} />
        </Pressable>
      )}
    </View>
  );
}
