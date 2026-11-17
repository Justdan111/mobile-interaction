import React from 'react';
import { Text } from 'react-native';
import { act, render, screen, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { SwipeableRow, type SwipeAction } from '../../components/ui/SwipeableRow';
import { ThemeProvider } from '../../lib/theme';

/**
 * Reanimated and the swipe gesture are mocked, so the shake is not observable
 * here. These cover the contract around it: pressing an action taps the phone,
 * and its effect and the row's close are ordered rather than simultaneous.
 *
 * The action Pressables mount regardless of swipe state, so a press exercises
 * the real handler.
 */

const action = (over: Partial<SwipeAction> = {}): SwipeAction => ({
  key: 'mute',
  label: 'On',
  a11yLabel: 'Mute Design',
  icon: 'bell',
  color: '#0A84FF',
  onPress: jest.fn(),
  ...over,
});

const wrap = (a: SwipeAction) =>
  render(
    <ThemeProvider>
      <SwipeableRow actions={[a]}>
        <Text>row body</Text>
      </SwipeableRow>
    </ThemeProvider>
  );

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Haptics, 'impactAsync').mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('SwipeableRow action feedback', () => {
  it('taps the phone the moment the action is pressed', async () => {
    await wrap(action());
    await fireEvent.press(screen.getByLabelText('Mute Design'));
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('does not wait for the timers to fire the haptic', async () => {
    await wrap(action());
    await fireEvent.press(screen.getByLabelText('Mute Design'));
    // No timer advance at all — the tap must already have happened.
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });
});

describe('SwipeableRow action timing', () => {
  // The effect lands a beat after the press, so the icon changes while the
  // shake is running and before the row closes.
  it('defers the action rather than firing it immediately', async () => {
    const onPress = jest.fn();
    await wrap(action({ onPress }));

    await fireEvent.press(screen.getByLabelText('Mute Design'));
    expect(onPress).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires the action exactly once, however long the timers run', async () => {
    const onPress = jest.fn();
    await wrap(action({ onPress }));
    await fireEvent.press(screen.getByLabelText('Mute Design'));
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('holds the row open past the effect, so the settled icon can be read', async () => {
    const onPress = jest.fn();
    await wrap(action({ onPress }));
    await fireEvent.press(screen.getByLabelText('Mute Design'));

    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    // The effect has landed while the row is still open. If the close were
    // simultaneous there would be no window in which this is true.
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Mute Design')).toBeTruthy();
  });

  it('survives unmounting mid-choreography without firing into a dead row', async () => {
    const onPress = jest.fn();
    const r = await wrap(action({ onPress }));
    await fireEvent.press(screen.getByLabelText('Mute Design'));
    await act(async () => {
      r.unmount();
    });
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(onPress).not.toHaveBeenCalled();
  });
});
