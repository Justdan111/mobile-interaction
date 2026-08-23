import React from 'react';
import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

export function PillButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={`items-center justify-center rounded-2xl py-4 active:opacity-80 ${
        primary ? 'bg-ink' : 'border border-hairline bg-transparent'
      }`}
    >
      <Text className={`text-[16px] font-semibold ${primary ? 'text-page' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
