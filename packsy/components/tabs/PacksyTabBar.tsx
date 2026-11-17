import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme/colors';
import { Icon, type IconName } from '../ui/icons';

export type TabDef = { name: string; href: string; label: string; icon: IconName };

/** Order and labels from the bars in `.design/comps/` (home, packages, map). */
export const TABS: readonly TabDef[] = [
  { name: 'home', href: '/home', label: 'Home', icon: 'home' },
  { name: 'packages', href: '/packages', label: 'Packages', icon: 'box' },
  { name: 'map', href: '/map', label: 'Map', icon: 'route' },
  { name: 'settings', href: '/settings', label: 'Settings', icon: 'gear' },
] as const;

/** The focused tab takes this many shares of the bar's width; the rest take one. */
export const ACTIVE_GROW = 2.7;

const EASE = { duration: 340, easing: Easing.bezier(0.2, 0.9, 0.25, 1) };

export type TabItemProps = {
  icon: IconName;
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

/**
 * One tab. Focused: a pale pill with a dark glyph and the label beside it.
 * Idle: a white glyph on the bar. The pill grows out of the icon rather than
 * jumping, because the width is a shared value, not a layout switch.
 */
export function TabItem({ icon, label, isFocused, onPress }: TabItemProps) {
  const on = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    on.value = withTiming(isFocused ? 1 : 0, EASE);
  }, [isFocused, on]);

  const slot = useAnimatedStyle(() => ({ flexGrow: 1 + on.value * (ACTIVE_GROW - 1) }));
  const pill = useAnimatedStyle(() => ({ opacity: on.value, transform: [{ scaleX: 0.6 + on.value * 0.4 }] }));
  const text = useAnimatedStyle(() => ({ opacity: on.value, maxWidth: on.value * 110 }));

  return (
    <Animated.View style={[{ flexBasis: 0, height: 58 }, slot]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: isFocused }}
        className="flex-1 flex-row items-center justify-center"
      >
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 29, backgroundColor: C.pill }, pill]}
        />
        <Icon name={icon} color={isFocused ? C.night : C.ink} surface={isFocused ? C.pill : C.bar} size={24} />
        <Animated.View style={[{ overflow: 'hidden' }, text]}>
          <Text numberOfLines={1} className="font-medium" style={{ color: C.night, fontSize: 15.5, marginLeft: 10 }}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** The floating bar. It draws over screen content, so screens pad their own bottom. */
export function PacksyTabBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute inset-x-0 bottom-0"
      style={{ paddingBottom: Math.max(insets.bottom - 6, 10), paddingHorizontal: 14 }}
      pointerEvents="box-none"
    >
      <View className="flex-row items-center rounded-full bg-bar" style={{ padding: 6, gap: 4 }}>
        {children}
      </View>
    </View>
  );
}
