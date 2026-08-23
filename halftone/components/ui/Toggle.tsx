import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

export function Toggle({
  value,
  onChange,
  tint,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  tint?: string;
}) {
  const { t } = useTheme();
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? 22 : 2, { damping: 18, stiffness: 220 }) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
    >
      <View
        className="h-8 w-[52px] justify-center rounded-full"
        style={{ backgroundColor: value ? (tint ?? t.success) : t.chip }}
      >
        <Animated.View style={[{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF' }, knob]} />
      </View>
    </Pressable>
  );
}
