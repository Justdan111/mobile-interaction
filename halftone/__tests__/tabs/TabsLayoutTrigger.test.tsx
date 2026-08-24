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
});
