import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTabBarCollapseValue } from './TabBarChrome';
import { GlassContainer, GlassView, isLiquidGlassAvailable } from '../../lib/glass';
import type { IconName } from '../ui/icons';

export const TABS: Array<{ name: string; href: string; icon: IconName; label: string }> = [
  { name: 'index', href: '/', icon: 'search', label: 'Search' },
  { name: 'proposals', href: '/proposals', icon: 'mail', label: 'Inbox' },
  { name: 'chats', href: '/chats', icon: 'chat', label: 'Chats' },
  { name: 'projects', href: '/projects', icon: 'target', label: 'My projects' },
  { name: 'profile', href: '/profile', icon: 'smiley', label: 'Profile' },
];

const BAR_RADIUS = 34;

// The pill floats clear of the home indicator rather than sitting on the edge.
const BAR_GAP = 10;
const BAR_SIDE_INSET = 16;

/**
 * How far each side draws in when the bar collapses. The pill narrows as the
 * focused tab sheds its label, so the two movements read as one gesture.
 */
const BAR_COLLAPSED_EXTRA_INSET = 44;

// Glass elements inside a GlassContainer merge at this distance, so the
// focused chip fuses into the bar as it slides between tabs.
const GLASS_MERGE_SPACING = 18;

export function GlassTabBar({ children }: { children?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const glass = isLiquidGlassAvailable();
  const collapse = useTabBarCollapseValue();

  const shell = useAnimatedStyle(() => {
    const inset = interpolate(collapse.value, [0, 1], [0, BAR_COLLAPSED_EXTRA_INSET]);
    return { marginLeft: inset, marginRight: inset };
  });

  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      {children}
    </View>
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: BAR_SIDE_INSET,
          right: BAR_SIDE_INSET,
          bottom: Math.max(insets.bottom, 12) + BAR_GAP,
        },
        shell,
      ]}
    >
      {glass ? (
        // GlassContainer paints nothing itself — it only governs how its
        // child glass surfaces blend, so the surface has to be a GlassView.
        // This one is a sibling of the focused pill's own GlassView, not its
        // ancestor: that is what makes the container's merge behaviour apply.
        <GlassContainer
          testID="tab-bar-surface"
          spacing={GLASS_MERGE_SPACING}
          style={{ borderRadius: BAR_RADIUS }}
        >
          <GlassView
            testID="tab-bar-glass-surface"
            glassEffectStyle="regular"
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { borderRadius: BAR_RADIUS, overflow: 'hidden' }]}
          />
          {row}
        </GlassContainer>
      ) : (
        // The fallback has to look deliberate, not degraded: a hairline and a
        // translucent fill keep the pill legible even where BlurView is inert.
        <View
          testID="tab-bar-surface"
          style={{
            borderRadius: BAR_RADIUS,
            overflow: 'hidden',
            borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
            borderColor: 'rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.86)',
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
          }}
        >
          <BlurView testID="tab-bar-fallback-surface" intensity={40} tint="light" style={{ borderRadius: BAR_RADIUS }}>
            {row}
          </BlurView>
        </View>
      )}
    </Animated.View>
  );
}
