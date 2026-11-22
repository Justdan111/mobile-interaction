import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme/colors';
import { Icon, type IconName } from '../ui/icons';
import { Press } from '../ui/Press';

export type TabDef = { name: string; href: string; label: string; icon: IconName | 'avatar' };

export const TABS: readonly TabDef[] = [
  { name: 'feed', href: '/feed', label: 'Home', icon: 'home' },
  { name: 'search', href: '/search', label: 'Search', icon: 'search' },
  { name: 'chat', href: '/chat', label: 'Messages', icon: 'chat' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'avatar' },
] as const;

/** Height of the bar above the home indicator; screens pad by this. */
export const TAB_BAR_HEIGHT = 64;

/**
 * One tab. The bar in this design has no active pill or tint: the current tab
 * is marked only by its glyph going from hairline to a heavier stroke.
 */
export function TabItem({
  tab,
  isFocused,
  onPress,
  avatar,
}: {
  tab: TabDef;
  isFocused: boolean;
  onPress: () => void;
  avatar?: number;
}) {
  return (
    <Press
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
      style={{ flex: 1, height: TAB_BAR_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
    >
      {tab.icon === 'avatar' ? (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: C.card,
            borderWidth: isFocused ? 1.5 : 0,
            borderColor: C.ink,
          }}
        >
          {avatar ? <Image source={avatar} style={{ flex: 1 }} contentFit="cover" /> : null}
        </View>
      ) : (
        <Icon name={tab.icon} color={C.ink} size={27} strokeWidth={isFocused ? 2 : 1.6} />
      )}
    </Press>
  );
}

/** The centre action: a black disc with a white plus, not a tab. */
export function CreateButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Press
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Create a post"
        style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.black, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="plus" color={C.white} size={26} strokeWidth={2} />
      </Press>
    </View>
  );
}

export function MakkoTabBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row bg-page"
      style={{ paddingBottom: Math.max(insets.bottom - 4, 8), paddingHorizontal: 14 }}
    >
      {children}
    </View>
  );
}
