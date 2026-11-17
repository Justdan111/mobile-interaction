import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../../lib/theme';

// Mock only the leaf module react-native's `useColorScheme` delegates to;
// replacing the whole package trips up react-native's own jest-preset mocks.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
import mockUseColorSchemeImport from 'react-native/Libraries/Utilities/useColorScheme';

const mockUseColorScheme = mockUseColorSchemeImport as jest.Mock;

function Probe() {
  const { mode, preference, toggle, hydrated } = useTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="pref">{preference}</Text>
      <Text testID="hydrated">{String(hydrated)}</Text>
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
    mockUseColorScheme.mockReset();
  });

  // Only checks the initial state; the "follows the system color scheme" tests
  // cover the real behaviour.
  it('starts on the system preference', async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('pref')).toHaveTextContent('system'));
  });

  // Only checks the type contract; the "follows the system color scheme" tests
  // cover the real behaviour.
  it('resolves to a concrete mode', async () => {
    renderProbe();
    await waitFor(() =>
      expect(['light', 'dark']).toContain(screen.getByTestId('mode').props.children)
    );
  });

  describe('follows the system color scheme', () => {
    it('resolves to dark when the system reports dark', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      renderProbe();
      await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('dark'));
    });

    it('resolves to light when the system reports light', async () => {
      mockUseColorScheme.mockReturnValue('light');
      renderProbe();
      await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('light'));
    });
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

  describe('hydration', () => {
    it('is not hydrated until the storage read settles, then hydrates', async () => {
      // `render` drains the mocked read before resolving, so hold the read open to
      // observe the not-yet-hydrated window.
      let resolveRead: (value: string | null) => void = () => {};
      const pendingRead = new Promise<string | null>((resolve) => {
        resolveRead = resolve;
      });
      // `mockReturnValueOnce` applies to this call only, so nothing leaks.
      (AsyncStorage.getItem as jest.Mock).mockReturnValueOnce(pendingRead);

      await renderProbe();
      expect(screen.getByTestId('hydrated')).toHaveTextContent('false');

      await act(async () => {
        resolveRead(null);
        await pendingRead;
      });

      await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
    });

    it('hydrates even when the persisted value is corrupt', async () => {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'not-a-real-preference');
      renderProbe();
      await waitFor(() => expect(screen.getByTestId('hydrated')).toHaveTextContent('true'));
      // isPreference rejected the corrupt value, so the default is kept.
      expect(screen.getByTestId('pref')).toHaveTextContent('system');
    });
  });

  it('throws a useful error outside the provider', async () => {
    // `render` is async, so the throw surfaces as a rejected promise.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<Probe />)).rejects.toThrow(/ThemeProvider/);
    spy.mockRestore();
  });
});
