import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../../lib/theme';

function Probe() {
  const { mode, preference, toggle } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="pref">{preference}</Text>
      <Pressable testID="toggle" onPress={toggle} />
    </>
  );
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );

describe('ThemeProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts on the system preference', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('pref')).toHaveTextContent('system'));
  });

  it('resolves to a concrete mode', async () => {
    renderProbe();
    await waitFor(() =>
      expect(['light', 'dark']).toContain(screen.getByTestId('mode').props.children)
    );
  });

  it('flips mode when toggled', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('mode')).toBeTruthy());
    const before = screen.getByTestId('mode').props.children;
    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle'));
    });
    expect(screen.getByTestId('mode').props.children).not.toBe(before);
  });

  it('persists the choice', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('mode')).toBeTruthy());
    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle'));
    });
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toMatch(/^(light|dark)$/);
    });
  });

  it('restores a persisted choice on next mount', async () => {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('dark'));
    expect(screen.getByTestId('pref')).toHaveTextContent('dark');
  });

  it('throws a useful error outside the provider', async () => {
    // @testing-library/react-native v14's `render` is async (it awaits React's
    // `act` internally), so the thrown error surfaces as a rejected promise
    // rather than a synchronous throw. `toThrow` only catches sync throws, so
    // this needs `rejects.toThrow` instead of `expect(() => render(...))`.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
