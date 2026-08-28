import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Profile from '../../app/(tabs)/profile';
import { ThemeProvider, THEME_STORAGE_KEY } from '../../lib/theme';
import { profile } from '../../data/profile';
import { PROFILE_PLATE_COLOR, PROFILE_PLATE_INK, tokens } from '../../lib/tokens';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  // The screen scopes its status-bar override to focus. Running the effect for
  // real keeps that path exercised rather than stubbed away.
  useFocusEffect: (effect: () => undefined | (() => void)) =>
    require('react').useEffect(effect, [effect]),
}));

const wrap = () => render(<ThemeProvider><Profile /></ThemeProvider>);

describe('Profile', () => {
  beforeEach(async () => AsyncStorage.clear());

  it('shows the profile details', async () => {
    await wrap();
    expect(screen.getByText(profile.name)).toBeTruthy();
    expect(screen.getByText(`${profile.age} years`)).toBeTruthy();
    expect(screen.getByText(profile.phone)).toBeTruthy();
  });

  it('shows the stats from the data source', async () => {
    await wrap();
    expect(screen.getByText(String(profile.happyClients))).toBeTruthy();
    expect(screen.getByText(String(profile.completedProjects))).toBeTruthy();
    expect(screen.getByText(profile.rating.toString().replace('.', ','))).toBeTruthy();
  });

  it('lists every settings row', async () => {
    await wrap();
    for (const label of ['Saved projects', 'Support', 'Password', 'Notification', 'Dark Mode']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it('persists the theme when Dark Mode is switched', async () => {
    await wrap();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Dark Mode'));
    });
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toMatch(/^(light|dark)$/);
    });
  });

  it('reflects the current mode in the switch state', async () => {
    await wrap();
    const before = screen.getByLabelText('Dark Mode').props.accessibilityState.checked;
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Dark Mode'));
    });
    expect(screen.getByLabelText('Dark Mode').props.accessibilityState.checked).toBe(!before);
  });
});

/** WCAG relative luminance, for the contrast guard below. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('Profile header plate', () => {
  // The plate is fixed art direction, not a themed surface, so it must not be
  // mode-keyed: it stays pale lavender with dark ink in both themes.
  it('paints one fixed plate colour rather than a themed surface', async () => {
    await wrap();
    const heading = screen.getByText('Profile');
    expect(heading.props.style.color).toBe(PROFILE_PLATE_INK);
    expect(PROFILE_PLATE_COLOR).not.toBe(tokens.light.page);
    expect(PROFILE_PLATE_COLOR).not.toBe(tokens.dark.page);
  });

  // Four separate defects in this build have been a foreground drawn on a
  // surface it cannot be read against. The plate and its ink are both fixed, so
  // their contrast is a constant and can simply be asserted.
  it('keeps its ink legible against it', () => {
    expect(contrast(PROFILE_PLATE_INK, PROFILE_PLATE_COLOR)).toBeGreaterThan(4.5);
  });
});

describe('Dark Mode switch wiring', () => {
  // The label used to sit on a plain View wrapping the Toggle, so the node the
  // name resolved to had neither the checked state nor the press handler.
  it('puts the name, the state and the press target on one control', async () => {
    await wrap();
    const control = screen.getByLabelText('Dark Mode');
    expect(control.props.accessibilityRole).toBe('switch');
    expect(typeof control.props.accessibilityState.checked).toBe('boolean');
    expect(control).toBe(screen.getByRole('switch'));
  });
});
