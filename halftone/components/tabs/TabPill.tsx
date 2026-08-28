import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassView, isLiquidGlassAvailable } from '../../lib/glass';
import { useTabBarCollapsed } from './TabBarChrome';
import { Icon, type IconName } from '../ui/icons';
import { useTheme } from '../../lib/theme';

// The bar's surface is light in both themes, so these are fixed rather than
// token-driven — the one deliberate exception to the no-raw-hex rule.
const ICON_INACTIVE = '#6B6B72';
// Not `t.accent`: the chip is itself accent-tinted, so an accent icon vanishes
// into it. This one value contrasts against both the glass and fallback chips.
const CHIP_FOREGROUND = '#0F0F12';
const FALLBACK_CHIP_COLOR = '#CFCCF7';

export function TabPill({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: IconName;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const { t } = useTheme();
  const glass = isLiquidGlassAvailable();
  const collapsed = useTabBarCollapsed();

  const body = (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(200)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: isFocused ? 16 : 12,
        paddingVertical: 10,
        borderRadius: 22,
      }}
    >
      <Icon name={icon} size={22} color={isFocused ? CHIP_FOREGROUND : ICON_INACTIVE} strokeWidth={1.9} />
      {/* The label is what makes the bar wide, so dropping it is the whole
          shrink — LinearTransition above already springs the width change. */}
      {isFocused && !collapsed ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(90)}>
          <Text numberOfLines={1} style={{ color: CHIP_FOREGROUND, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>
            {label}
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
    >
      {isFocused ? (
        glass ? (
          <GlassView
            testID="tab-pill-glass-surface"
            glassEffectStyle="regular"
            tintColor={t.accent}
            isInteractive
            style={{ borderRadius: 22, overflow: 'hidden' }}
          >
            {body}
          </GlassView>
        ) : (
          <View
            testID="tab-pill-fallback-surface"
            style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: FALLBACK_CHIP_COLOR }}
          >
            {body}
          </View>
        )
      ) : (
        body
      )}
    </Pressable>
  );
}
