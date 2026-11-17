import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding, { SLIDES } from '../../app/onboarding';
import { ThemeProvider } from '../../lib/theme';
import { ONBOARDING_KEY } from '../../lib/storage';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace, back: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Onboarding /></ThemeProvider>);

// NativeWind's `className` is not resolved to a `style` under Jest, so assert
// on which utility class is present.
const isFilled = (testId: string) =>
  (screen.getByTestId(testId).props.className as string).includes('bg-accent');

describe('Onboarding', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockReplace.mockClear();
  });

  it('has three slides', () => {
    expect(SLIDES).toHaveLength(3);
  });

  it('reproduces the headline from the comp', () => {
    expect(SLIDES.map((s) => s.title)).toContain('Perfect Match!');
  });

  it('starts on the first slide', async () => {
    await wrap();
    expect(screen.getByText(SLIDES[0].title)).toBeTruthy();
  });

  it('advances when Next is pressed', async () => {
    await wrap();
    fireEvent.press(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText(SLIDES[1].title)).toBeTruthy());
    // Slide 1's content must be gone, not merely joined by slide 2.
    expect(screen.queryByText(SLIDES[0].title)).toBeNull();
  });

  it('offers Get started on the final slide', async () => {
    await wrap();
    fireEvent.press(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText(SLIDES[1].title)).toBeTruthy());
    fireEvent.press(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Get started')).toBeTruthy());
    expect(screen.queryByText('Next')).toBeNull();
  });

  it('always offers Skip', async () => {
    await wrap();
    expect(screen.getByText('Skip')).toBeTruthy();
  });

  // Skip must both persist the flag (so onboarding doesn't reappear) and
  // navigate.
  it('pressing Skip persists the onboarding flag and routes to the tabs', async () => {
    await wrap();
    fireEvent.press(screen.getByText('Skip'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(ONBOARDING_KEY)).toBe('true')
    );
  });

  describe('progress bar', () => {
    it('fills exactly the segments up to the current slide', async () => {
      await wrap();
      expect([isFilled('progress-0'), isFilled('progress-1'), isFilled('progress-2')]).toEqual([
        true,
        false,
        false,
      ]);
    });

    it('fills one more segment each time Next is pressed', async () => {
      await wrap();
      fireEvent.press(screen.getByText('Next'));
      await waitFor(() => expect(screen.getByText(SLIDES[1].title)).toBeTruthy());
      expect([isFilled('progress-0'), isFilled('progress-1'), isFilled('progress-2')]).toEqual([
        true,
        true,
        false,
      ]);
    });
  });
});
