import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Splash from '../../app/index';
import { ThemeProvider } from '../../lib/theme';
import { ONBOARDING_KEY } from '../../lib/storage';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace, back: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Splash /></ThemeProvider>);

describe('Splash', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockReplace.mockClear();
  });

  // Proves the first-launch branch specifically: with no flag in storage,
  // the splash must route to onboarding, not straight to the tabs. A splash
  // that always routed to onboarding (ignoring storage) would also pass
  // this test alone — the next test is what rules that out.
  it('routes to onboarding when the flag has never been set', async () => {
    await wrap();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'), { timeout: 2500 });
    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
  });

  // Proves the returning-user branch: with the flag set, the splash must
  // skip onboarding entirely. A splash that always routed to onboarding
  // (ignoring storage) fails this test, which is the point of pairing it
  // with the test above.
  it('routes straight to the tabs when the flag is already set', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    await wrap();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), { timeout: 2500 });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  // Proves the splash doesn't hang forever when the storage read itself
  // rejects (e.g. native storage unavailable, corrupt state). Without a
  // try/catch around the read, this rejection becomes an unhandled promise
  // rejection and router.replace is never reached — the user is stuck on
  // the splash indefinitely.
  it('falls through to onboarding when the storage read rejects', async () => {
    // `ThemeProvider` also calls `AsyncStorage.getItem` (for its own
    // preference key) on mount, before the splash's delayed read fires —
    // a plain `mockRejectedValueOnce` would reject *that* call instead and
    // prove nothing about the splash. Reject only the splash's own key.
    const realGetItem = (AsyncStorage.getItem as jest.Mock).getMockImplementation();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
      key === ONBOARDING_KEY
        ? Promise.reject(new Error('storage unavailable'))
        : realGetItem!(key)
    );
    try {
      await wrap();
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'), { timeout: 2500 });
    } finally {
      (AsyncStorage.getItem as jest.Mock).mockImplementation(realGetItem);
    }
  });
});
