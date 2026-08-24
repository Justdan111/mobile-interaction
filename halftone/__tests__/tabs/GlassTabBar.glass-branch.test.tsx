import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { processColor } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../lib/theme';

// jest.setup.js mocks expo-glass-effect globally with isLiquidGlassAvailable
// hardcoded to false, so GlassTabBar.test.tsx (and every other suite) only
// ever exercises the BlurView fallback branch. That leaves the glass branch
// — the one that actually renders on an iOS 26+ device, i.e. wherever the
// Task 18 screenshots get taken — completely unverified unless a test
// specifically overrides the mock. This file does that: it re-mocks
// expo-glass-effect with isLiquidGlassAvailable() => true *before* requiring
// TabPill/GlassTabBar, so this test's copies of those modules resolve
// `glass` to true and take the GlassView/GlassContainer branch instead.
jest.doMock('expo-glass-effect', () => {
  const { View } = require('react-native');
  const GlassView = (props: any) => <View {...props} />;
  const GlassContainer = (props: any) => <View {...props} />;
  return {
    GlassView,
    GlassContainer,
    isLiquidGlassAvailable: () => true,
    isGlassEffectAPIAvailable: () => true,
  };
});

// Required with `require`, not a static `import`, so the mock above is in
// place before these modules (and the `lib/glass` guard they both import)
// evaluate `require('expo-glass-effect')` for the first time in this file.
const { TabPill } = require('../../components/tabs/TabPill');
const { GlassTabBar } = require('../../components/tabs/GlassTabBar');

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );


// The icon's colour reaches the screen as an SVG stroke, not as a prop on a
// queryable host element (RTL v14's `screen` has no UNSAFE_getByType), so read
// the stroke actually painted into the rendered tree. That is stronger
// evidence than a prop assertion anyway: it is the value that ends up on the
// pixels. react-native-svg stores it processed, so compare against
// `processColor` of the expected colour.
function focusedIconStroke(): unknown {
  const seen: unknown[] = [];
  const walk = (node: any): void => {
    if (!node || typeof node !== 'object') return;
    if (node.props?.stroke != null) seen.push(node.props.stroke.payload ?? node.props.stroke);
    (node.children ?? []).forEach(walk);
  };
  walk(screen.toJSON());
  expect(seen.length).toBeGreaterThan(0);
  return seen[0];
}

describe('GlassTabBar / TabPill surface (glass path — isLiquidGlassAvailable() === true)', () => {
  it('GlassTabBar renders through GlassContainer, not the BlurView fallback', async () => {
    await wrap(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    expect(screen.getByTestId('tab-bar-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-bar-fallback-surface')).toBeNull();
  });

  // Regression test for the bar rendering completely invisibly on a real
  // iOS 26 device. `GlassContainer` paints no surface of its own — natively
  // it is a UIVisualEffectView carrying a UIGlassContainerEffect, which only
  // governs how *child* glass surfaces merge. Wrapping plain views in it
  // produced a bar with no glass, no hairline and no background at all, while
  // every test still passed because they only asserted the container branch
  // was taken. The bar needs its own GlassView as the pill surface, so assert
  // on a prop that only a GlassView accepts rather than on a testID a plain
  // View could just as easily carry.
  it('paints the pill with a real GlassView surface, not a bare GlassContainer', async () => {
    await wrap(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    const surface = screen.getByTestId('tab-bar-glass-surface');
    expect(surface.props.glassEffectStyle).toBe('regular');
  });

  // The container's merge behaviour applies to glass surfaces that are
  // siblings within it (as in the SDK 57 docs' own example). If the bar's
  // GlassView were made an *ancestor* of the chip's GlassView instead, this
  // would fail — and the bar and chip would stack glass rather than merge.
  it('keeps the bar surface and the focused chip as sibling glass surfaces', async () => {
    await wrap(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    const barSurface = screen.getByTestId('tab-bar-glass-surface');
    const chipSurface = screen.getByTestId('tab-pill-glass-surface');
    const ancestorIds: unknown[] = [];
    for (let node = chipSurface.parent; node; node = node.parent) {
      ancestorIds.push(node.props?.testID);
    }
    expect(ancestorIds).toContain('tab-bar-surface');
    expect(ancestorIds).not.toContain('tab-bar-glass-surface');
    expect(barSurface.props.pointerEvents).toBe('none');
  });

  it('the focused TabPill renders through GlassView, not the fallback chip', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused onPress={() => {}} />);
    expect(screen.getByTestId('tab-pill-glass-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-pill-fallback-surface')).toBeNull();
  });

  // Regression test for the focused icon disappearing into its own chip on
  // the glass path. The chip's GlassView is tinted with `t.accent`; the icon
  // used to be painted in `t.accent` too, so on a real iOS 26 device it was
  // accent on accent and simply not visible — only the label read, because it
  // was already the near-black foreground. Assert the relationship, not the
  // literal hex: the icon must not be the chip's own tint, and it must match
  // the label so the two read as one unit.
  it('paints the focused icon in the label foreground, never the chip tint', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused onPress={() => {}} />);
    const chip = screen.getByTestId('tab-pill-glass-surface');
    const stroke = focusedIconStroke();
    expect(stroke).not.toBe(processColor(chip.props.tintColor));
    const labelColor = (screen.getByText('Search').props.style as { color: string }).color;
    expect(stroke).toBe(processColor(labelColor));
  });

  it('an unfocused TabPill takes neither surface branch (no chip at all)', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused={false} onPress={() => {}} />);
    expect(screen.queryByTestId('tab-pill-glass-surface')).toBeNull();
    expect(screen.queryByTestId('tab-pill-fallback-surface')).toBeNull();
  });
});
