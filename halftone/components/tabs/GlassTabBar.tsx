import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GlassContainer, isLiquidGlassAvailable } from '../../lib/glass';
import type { IconName } from '../ui/icons';

export const TABS: Array<{ name: string; href: string; icon: IconName; label: string }> = [
  { name: 'index', href: '/', icon: 'search', label: 'Search' },
  { name: 'proposals', href: '/proposals', icon: 'mail', label: 'Inbox' },
  { name: 'chats', href: '/chats', icon: 'chat', label: 'Chats' },
  { name: 'projects', href: '/projects', icon: 'target', label: 'My projects' },
  { name: 'profile', href: '/profile', icon: 'smiley', label: 'Profile' },
];

const BAR_RADIUS = 34;

export function GlassTabBar({ children }: { children?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const glass = isLiquidGlassAvailable();

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
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12),
      }}
    >
      {glass ? (
        // GlassContainer lets the bar and the focused TabPill read as one
        // glass system, so the chip merges into the bar as it moves.
        <GlassContainer
          testID="tab-bar-surface"
          spacing={18}
          style={{ borderRadius: BAR_RADIUS, overflow: 'hidden' }}
        >
          <View testID="tab-bar-glass-surface">{row}</View>
        </GlassContainer>
      ) : (
        // The comps' own bar is an opaque pill; the fallback must remain a
        // valid, good-looking rendering on its own — not a degraded one. A
        // hairline border plus a translucent token-adjacent background over
        // BlurView keeps the pill legible even where BlurView itself has no
        // effect (e.g. Android, or when the OS blur pipeline is unavailable).
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
    </View>
  );
}
