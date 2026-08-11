import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export function DrawerItem({
  icon,
  label,
  active = false,
  badge,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-5 py-3.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {icon}
      <Text
        className="font-nunito-semibold text-[20px]"
        style={{ color: active ? colors.surface : colors.drawerIdle }}
      >
        {label}
      </Text>
      {badge ? (
        <View className="h-6 min-w-6 items-center justify-center rounded-full bg-ember px-1.5">
          <Text className="font-nunito-bold text-[12px] text-surface">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
