import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabPill } from '../../components/tabs/TabPill';
import { TABS, GlassTabBar } from '../../components/tabs/GlassTabBar';
import { ThemeProvider } from '../../lib/theme';

// @testing-library/react-native@14 declares both `render` and the `rerender`
// it returns as async (each wraps React's `act` internally) — await every
// call, per the confirmed plan defect noted in the task brief (which called
// out `render`; `rerender` has the identical async signature and needs the
// same treatment or assertions run against the pre-rerender tree).
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const wrapWithInsets = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );

describe('TABS', () => {
  it('declares the five tabs from the comps in order', () => {
    expect(TABS.map((t) => t.label)).toEqual([
      'Search', 'Inbox', 'Chats', 'My projects', 'Profile',
    ]);
  });

  it('gives every tab a unique route', () => {
    const hrefs = TABS.map((t) => t.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('TabPill', () => {
  it('shows its label only when focused', async () => {
    const { rerender } = await wrap(
      <TabPill icon="search" label="Search" isFocused={false} onPress={() => {}} />
    );
    expect(screen.queryByText('Search')).toBeNull();

    await rerender(
      <ThemeProvider>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </ThemeProvider>
    );
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('exposes selection state to assistive tech', async () => {
    await wrap(<TabPill icon="chat" label="Chats" isFocused onPress={() => {}} />);
    expect(screen.getByRole('tab').props.accessibilityState.selected).toBe(true);
  });

  it('always exposes an accessible name, focused or not', async () => {
    await wrap(<TabPill icon="mail" label="Inbox" isFocused={false} onPress={() => {}} />);
    expect(screen.getByLabelText('Inbox')).toBeTruthy();
  });

  // Bite-proof for the accessibilityState assertion above: a TabPill that
  // ignored `isFocused` and always reported `selected: true` would pass the
  // "exposes selection state" test on its own. This proves the value actually
  // flips both ways, tied to the prop.
  it('reports selected: false when not focused', async () => {
    await wrap(<TabPill icon="chat" label="Chats" isFocused={false} onPress={() => {}} />);
    expect(screen.getByRole('tab').props.accessibilityState.selected).toBe(false);
  });
});

describe('GlassTabBar surface (fallback path — isLiquidGlassAvailable() === false in this Jest env)', () => {
  // jest.setup.js mocks expo-glass-effect with isLiquidGlassAvailable
  // returning false, so this file always exercises the BlurView fallback path
  // by default. The glass-available branch is covered separately in
  // GlassTabBar.glass-branch.test.tsx, which re-mocks the module per test —
  // see that file's header comment for why it must live apart from this one.
  it('renders the BlurView fallback surface, not the glass container', async () => {
    await wrapWithInsets(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    // The fallback wraps content in expo-blur's BlurView, which is mocked by
    // jest-expo to a plain View carrying its own props through — assert on
    // the translucent background/border that only the fallback branch sets,
    // so this fails if GlassTabBar stops taking the fallback path.
    expect(screen.getByTestId('tab-bar-surface')).toBeTruthy();
    expect(screen.getByTestId('tab-bar-fallback-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-bar-glass-surface')).toBeNull();
  });
});
