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

  // First launch: no flag in storage routes to onboarding.
  it('routes to onboarding when the flag has never been set', async () => {
    await wrap();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/onboarding'), { timeout: 2500 });
    expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
  });

  // Returning user: with the flag set, onboarding is skipped.
  it('routes straight to the tabs when the flag is already set', async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    await wrap();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'), { timeout: 2500 });
    expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
  });

  // A rejected storage read must still route somewhere, or the splash hangs.
  it('falls through to onboarding when the storage read rejects', async () => {
    // ThemeProvider also reads AsyncStorage on mount, so reject only the
    // splash's own key.
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
