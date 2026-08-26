import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { TOGGLE_KNOB_COLOR } from '../../lib/tokens';

export function Toggle({
  value,
  onChange,
  tint,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  tint?: string;
  /**
   * Names the switch itself. Wrapping a Toggle in a labelled View instead
   * splits the control in two for assistive tech — the wrapper announces the
   * name but carries neither the checked state nor the press handler.
   */
  accessibilityLabel?: string;
}) {
  const { t } = useTheme();
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? 22 : 2, { damping: 18, stiffness: 220 }) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
    >
      <View
        className="h-8 w-[52px] justify-center rounded-full"
        style={{ backgroundColor: value ? (tint ?? t.success) : t.chip }}
      >
        <Animated.View style={[{ width: 28, height: 28, borderRadius: 14, backgroundColor: TOGGLE_KNOB_COLOR }, knob]} />
      </View>
    </Pressable>
  );
}
