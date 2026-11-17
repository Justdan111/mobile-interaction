import React from 'react';
import { processColor } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabPill } from '../../components/tabs/TabPill';
import { TABS, GlassTabBar } from '../../components/tabs/GlassTabBar';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';

// RNTL v14's `render` and `rerender` are both async; await every call.
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const wrapWithInsets = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );

describe('TABS', () => {
  it('declares the five tabs in order', () => {
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

  // The selection state must flip both ways with the prop.
  it('reports selected: false when not focused', async () => {
    await wrap(<TabPill icon="chat" label="Chats" isFocused={false} onPress={() => {}} />);
    expect(screen.getByRole('tab').props.accessibilityState.selected).toBe(false);
  });
});


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

describe('TabPill focused chip legibility (fallback path)', () => {
  // The focused icon shares the label's colour on both surfaces, so it must
  // read against the fallback's light chip as well as the glass accent tint.
  it('paints the focused icon in the same foreground as its label', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused onPress={() => {}} />);
    const labelColor = (screen.getByText('Search').props.style as { color: string }).color;
    expect(focusedIconStroke()).toBe(processColor(labelColor));
  });

  it('does not paint the focused icon in the accent, which is the chip tint', async () => {
    await wrap(<TabPill icon="search" label="Search" isFocused onPress={() => {}} />);
    const stroke = focusedIconStroke();
    expect(stroke).not.toBe(processColor(tokens.light.accent));
    expect(stroke).not.toBe(processColor(tokens.dark.accent));
  });
});

describe('GlassTabBar surface (fallback path — isLiquidGlassAvailable() === false in this Jest env)', () => {
  // The glass-available branch is covered in GlassTabBar.glass-branch.test.tsx.
  it('renders the BlurView fallback surface, not the glass container', async () => {
    await wrapWithInsets(
      <GlassTabBar>
        <TabPill icon="search" label="Search" isFocused onPress={() => {}} />
      </GlassTabBar>
    );
    // jest-expo mocks BlurView as a plain View, so assert the translucent
    // background and border only the fallback sets.
    expect(screen.getByTestId('tab-bar-surface')).toBeTruthy();
    expect(screen.getByTestId('tab-bar-fallback-surface')).toBeTruthy();
    expect(screen.queryByTestId('tab-bar-glass-surface')).toBeNull();
  });
});
