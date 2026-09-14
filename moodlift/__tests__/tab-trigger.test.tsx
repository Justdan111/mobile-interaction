import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Trigger } from '../app/(tabs)/_layout';

// expo-router/ui hands each trigger an `isFocused` flag and an `onPress` that
// expects a press event. Both are easy to get wrong invisibly — hardcoding
// isFocused, or calling onPress with no event so expo-router's
// `isDefaultPrevented()` check throws and the tab never switches.
describe('Trigger', () => {
  it('forwards the focused flag it was given', async () => {
    await render(<Trigger icon="home" label="Home" isFocused onPress={() => {}} />);
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(true);
  });

  it('does not invent a focused state', async () => {
    await render(<Trigger icon="home" label="Home" isFocused={false} onPress={() => {}} />);
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(false);
  });

  it('calls onPress with an event expo-router can interrogate', async () => {
    const onPress = jest.fn();
    await render(<Trigger icon="home" label="Home" isFocused={false} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    const event = onPress.mock.calls[0][0];
    expect(typeof event.isDefaultPrevented).toBe('function');
    expect(event.isDefaultPrevented()).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });
});
