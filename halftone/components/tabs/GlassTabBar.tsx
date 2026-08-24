import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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

// The comps float the pill clear of the home indicator rather than sitting it
// directly on the safe-area edge: measured off .design/comps, the bar's bottom
// edge is ~45pt above the screen edge on a device whose bottom inset is 34pt.
const BAR_GAP = 10;
const BAR_SIDE_INSET = 16;

// Glass elements inside a GlassContainer start merging at this distance, so
// the focused chip visibly fuses into the bar as it slides between tabs.
const GLASS_MERGE_SPACING = 18;

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
        left: BAR_SIDE_INSET,
        right: BAR_SIDE_INSET,
        bottom: Math.max(insets.bottom, 12) + BAR_GAP,
      }}
    >
      {glass ? (
        // `GlassContainer` paints nothing itself. Its native implementation
        // (node_modules/expo-glass-effect/ios/GlassContainer.swift) is a
        // UIVisualEffectView carrying a `UIGlassContainerEffect`, whose only
        // job is to govern how the *child* glass surfaces blend and merge —
        // the SDK 57 docs describe it as combining "multiple glass views into
        // a combined effect", and its whole prop surface is `spacing` plus
        // ViewProps. A GlassContainer wrapped straight around plain views
        // therefore renders an invisible bar: no surface, no hairline, icons
        // floating on the page background. The surface has to be a GlassView.
        //
        // This one is a sibling of the focused TabPill's own GlassView rather
        // than its ancestor, matching the docs' example (sibling GlassViews
        // inside one GlassContainer) — that sibling relationship is what makes
        // the container's merge behaviour apply, so the bar and the active
        // chip read as one glass system instead of glass stacked on glass.
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
