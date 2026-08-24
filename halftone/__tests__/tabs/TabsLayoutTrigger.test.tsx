import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Trigger } from '../../app/(tabs)/_layout';
import { ThemeProvider } from '../../lib/theme';

// This is the piece expo-router/ui's own `TabTrigger` can't verify for us:
// it computes `isFocused` from real navigation state and hands it to
// whatever `asChild` component we give it — that's expo-router/ui's tested
// responsibility. What's ours is `Trigger`, the small adapter in
// app/(tabs)/_layout.tsx that receives that value and must actually forward
// it to TabPill rather than hardcoding it (the exact class of bug this
// project shipped last task: a Segmented/Toggle that ignored their own
// `value` prop and still passed their tests).
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Trigger (app/(tabs)/_layout adapter)', () => {
  it('marks the tab selected when the slot reports isFocused: true', async () => {
    await wrap(<Trigger icon="search" label="Search" isFocused onPress={() => {}} />);
    expect(screen.getByRole('tab').props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('Search')).toBeTruthy();
  });

  it('marks the tab unselected when the slot reports isFocused: false — proving it is not hardcoded', async () => {
    await wrap(<Trigger icon="search" label="Search" isFocused={false} onPress={() => {}} />);
    expect(screen.getByRole('tab').props.accessibilityState.selected).toBe(false);
    // The expanded label only renders for the focused tab (TabPill's own
    // behaviour) — checking it here too catches a Trigger that forwarded
    // `selected` correctly but hardcoded a different prop TabPill also reads.
    expect(screen.queryByText('Search')).toBeNull();
  });

  it('calls the slot-provided onPress when pressed', async () => {
    const onPress = jest.fn();
    await wrap(<Trigger icon="search" label="Search" isFocused={false} onPress={onPress} />);
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(screen.getByRole('tab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Regression test for a real bug found by reading the installed
  // expo-router/ui source (node_modules/expo-router/build/ui/TabTrigger.js),
  // not by tapping — UI automation to the Simulator window is unavailable in
  // this sandbox (`osascript`/System Events enumerates zero windows for the
  // Simulator process here), so this reproduces the failure without one.
  //
  // In production, the slot's `onPress` prop IS expo-router/ui's
  // `handleOnPress`, which — before switching tabs — runs:
  //   if (event?.isDefaultPrevented()) return;   // called AS A FUNCTION
  //   if (!shouldHandleMouseEvent(event)) return; // native: !event?.defaultPrevented
  // `Trigger` originally called `onPress?.({} as never)`. `({}).isDefaultPrevented`
  // is `undefined`, and invoking it throws `TypeError: event.isDefaultPrevented
  // is not a function` — before `switchTab()` ever runs, meaning every real
  // tab tap would throw and navigation would silently never fire.
  it('hands the slot onPress an event object that survives real navigation preconditions', async () => {
    let reachedNavigation = false;
    // Mirrors the two lines from TabTrigger.js's handleOnPress exactly,
    // including the *unguarded* method call on `isDefaultPrevented` (only
    // `event?.`, not `event?.isDefaultPrevented?.()`) — that unguarded call
    // is precisely what threw against the original `{}` stub.
    const handleOnPressLikeExpoRouterUi = (event: any) => {
      if (event?.isDefaultPrevented()) return;
      if (event?.defaultPrevented) return;
      reachedNavigation = true;
    };
    await wrap(
      <Trigger icon="search" label="Search" isFocused={false} onPress={handleOnPressLikeExpoRouterUi} />
    );
    const { fireEvent } = require('@testing-library/react-native');
    expect(() => fireEvent.press(screen.getByRole('tab'))).not.toThrow();
    expect(reachedNavigation).toBe(true);
  });
});
