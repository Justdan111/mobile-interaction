import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Onboarding, { SLIDES } from '../../app/onboarding';
import { ThemeProvider } from '../../lib/theme';

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: jest.fn(), back: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Onboarding /></ThemeProvider>);

describe('Onboarding', () => {
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
});
