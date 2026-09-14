import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../ui/icons';

export type TabDef = {
  name: string;
  href: string;
  label: string;
  icon: IconName;
};

/** Tab order is taken from the bar in `.design/comps/home-no-mood.png`. */
export const TABS: readonly TabDef[] = [
  { name: 'index', href: '/', label: 'Home', icon: 'home' },
  { name: 'workouts', href: '/workouts', label: 'Workouts', icon: 'dumbbell' },
  { name: 'pass', href: '/pass', label: 'Gym pass', icon: 'qr' },
  { name: 'calendar', href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person' },
] as const;

const ACTIVE_CIRCLE = '#E8724C';
const ACTIVE_GLYPH = '#1B1B1D';
const IDLE_GLYPH = '#8E8E93';

export type TabItemProps = {
  icon: IconName;
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

/**
 * One tab. The focused state is a filled coral disc with a dark glyph; idle
 * tabs are a muted outline with no chrome, matching the comps.
 */
export const TabItem = React.forwardRef<View, TabItemProps>(
  ({ icon, label, isFocused, onPress }, ref) => (
    <Pressable
      ref={ref}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      className="h-14 w-14 items-center justify-center"
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={isFocused ? { backgroundColor: ACTIVE_CIRCLE } : undefined}
      >
        <Icon
          name={icon}
          color={isFocused ? ACTIVE_GLYPH : IDLE_GLYPH}
          size={24}
          strokeWidth={isFocused ? 1.9 : 1.6}
        />
      </View>
    </Pressable>
  )
);
TabItem.displayName = 'TabItem';

/**
 * The floating bar itself. It draws over the screen content rather than
 * reserving layout space, so screens add their own bottom padding.
 */
export function MoodTabBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 bottom-0 items-center"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      pointerEvents="box-none"
    >
      {/* Full-bleed minus a side gutter, with the five items spread evenly —
          the bar in the comps reaches nearly edge to edge. */}
      <View className="mx-4 flex-row items-center justify-around self-stretch rounded-full bg-card px-2 py-1.5">
        {children}
      </View>
    </View>
  );
}
