import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { processColor } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../lib/theme';

// jest.setup.js mocks expo-glass-effect with glass unavailable, so every other
// suite only exercises the BlurView fallback. This file re-mocks it as
// available before requiring TabPill/GlassTabBar, to cover the glass branch.
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

// `require`, not `import`, so the mock above is in place before these modules
// evaluate `expo-glass-effect`.
const { TabPill } = require('../../components/tabs/TabPill');
const { GlassTabBar } = require('../../components/tabs/GlassTabBar');

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );


// The icon's colour reaches the tree as a processed SVG stroke, so compare
// against `processColor` of the expected colour.
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

  // GlassContainer paints no surface of its own; it only merges child glass.
  // The bar needs its own GlassView, so assert a prop only GlassView accepts.
  it('paints the pill with a real GlassView surface, not a bare GlassContainer', async () => {
    await wrap(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    const surface = screen.getByTestId('tab-bar-glass-surface');
    expect(surface.props.glassEffectStyle).toBe('regular');
  });

  // Merging applies to sibling glass surfaces in the container; if the bar's
  // GlassView were the chip's ancestor they would stack instead.
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

  // The chip is tinted `t.accent`, so an accent icon vanishes into it. The icon
  // must differ from the tint and match the label.
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
