import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Trigger } from '../../app/(tabs)/_layout';
import { ThemeProvider } from '../../lib/theme';

// expo-router/ui computes `isFocused`; `Trigger` in app/(tabs)/_layout.tsx
// must forward it to TabPill rather than hardcode it.
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
    // The label only renders for the focused tab, which catches a Trigger that
    // forwards `selected` but hardcodes another prop TabPill reads.
    expect(screen.queryByText('Search')).toBeNull();
  });

  it('calls the slot-provided onPress when pressed', async () => {
    const onPress = jest.fn();
    await wrap(<Trigger icon="search" label="Search" isFocused={false} onPress={onPress} />);
    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(screen.getByRole('tab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // expo-router/ui's TabTrigger `handleOnPress` runs these checks before
  // switching tabs:
  //   if (event?.isDefaultPrevented()) return;
  //   if (!shouldHandleMouseEvent(event)) return; // native: !event?.defaultPrevented
  // An event stub without `isDefaultPrevented` throws and the tab never switches.
  it('hands the slot onPress an event object that survives real navigation preconditions', async () => {
    let reachedNavigation = false;
    // Mirrors handleOnPress, including the unguarded `isDefaultPrevented()` call.
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
