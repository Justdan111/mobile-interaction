import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding, { SLIDES } from '../../app/onboarding';
import { ThemeProvider } from '../../lib/theme';
import { ONBOARDING_KEY } from '../../lib/storage';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace, back: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Onboarding /></ThemeProvider>);

// Under this project's Jest setup, NativeWind's `className` is NOT resolved
// to an inline `style` (that requires the full Metro/CSS-interop pipeline,
// which Jest doesn't run — see components/ui/Toggle.tsx for the pattern
// components use when they need a testable *resolved* colour: an explicit
// `style` prop). So `className` survives as a literal string prop here,
// and checking which utility class is present is the direct, honest way to
// assert which segment is filled.
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
    // Prove slide 1's content is actually gone, not just that slide 2 appeared
    // alongside it (e.g. a broken implementation that renders every slide).
    expect(screen.queryByText(SLIDES[0].title)).toBeNull();
  });

  it('offers Get started on the final slide', async () => {
    await wrap();
    fireEvent.press(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText(SLIDES[1].title)).toBeTruthy());
    fireEvent.press(screen.getByText('Next'));
    await waitFor(() => expect(screen.getByText('Get started')).toBeTruthy());
    // Prove "Next" is really gone on the last slide, not just that
    // "Get started" happens to also be present.
    expect(screen.queryByText('Next')).toBeNull();
  });

  it('always offers Skip', async () => {
    await wrap();
    expect(screen.getByText('Skip')).toBeTruthy();
  });

  // A mutant that rewires Skip's onPress to a no-op passes every test above
  // — nothing here presses it. Prove both halves of what it must do: persist
  // the flag (so onboarding doesn't reappear next launch) and navigate.
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
