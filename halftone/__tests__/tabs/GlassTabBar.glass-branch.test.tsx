import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

describe('GlassTabBar / TabPill surface (glass path — isLiquidGlassAvailable() === true)', () => {
  it('GlassTabBar renders through GlassContainer, not the BlurView fallback', async () => {
    await wrap(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    expect(screen.getByTestId('tab-bar-glass-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-bar-fallback-surface')).toBeNull();
  });

  it('the focused TabPill renders through GlassView, not the fallback chip', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused onPress={() => {}} />);
    expect(screen.getByTestId('tab-pill-glass-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-pill-fallback-surface')).toBeNull();
  });

  it('an unfocused TabPill takes neither surface branch (no chip at all)', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused={false} onPress={() => {}} />);
    expect(screen.queryByTestId('tab-pill-glass-surface')).toBeNull();
    expect(screen.queryByTestId('tab-pill-fallback-surface')).toBeNull();
  });
});
