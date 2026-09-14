import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../ui/icons';

const ACCENT = '#E8724C';

/**
 * The avatar. A photo would be one more third-party face to ship; the initials
 * disc reads the same at this size and carries the accent colour.
 */
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: ACCENT }}
    >
      <Text className="font-display text-[18px] text-page">{initials}</Text>
    </View>
  );
}

export function Header({
  name,
  streak,
  onNotifications,
}: {
  name: string;
  streak: number;
  onNotifications?: () => void;
}) {
  return (
    <View className="mb-6 flex-row items-center">
      <Avatar name={name} />

      <View className="ml-3 flex-1">
        <Text className="font-body text-[13px] text-muted">Welcome back</Text>
        <Text className="font-display text-[19px] text-ink" numberOfLines={1}>
          {name}
        </Text>
      </View>

      <Pressable
        onPress={onNotifications}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        hitSlop={8}
        className="mr-2 h-10 w-10 items-center justify-center"
      >
        <Icon name="bell" color="#FFFFFF" size={22} />
      </Pressable>

      <View
        className="flex-row items-center rounded-2xl bg-card px-3 py-2"
        accessibilityLabel={`${streak} day streak`}
      >
        <Icon name="crown" color={ACCENT} size={18} />
        <Text className="ml-1.5 font-semibold text-[15px] text-ink">{streak}</Text>
      </View>
    </View>
  );
}
