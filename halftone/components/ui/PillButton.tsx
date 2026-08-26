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
        // `hairline` is tuned to separate rows on `card`; against the `chip`
        // surface this button actually sits on it is the same colour and the
        // outline vanishes. A muted border reads on both.
        primary ? 'bg-ink' : 'border border-muted/40 bg-transparent'
      }`}
    >
      <Text className={`text-[16px] font-semibold ${primary ? 'text-page' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
