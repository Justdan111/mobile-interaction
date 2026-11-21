import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Topics from '../app/onboarding/topics';
import { PrefsProvider } from '../lib/prefs';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));

describe('Topics screen', () => {
  it('starts with Lifestyle and Plants picked and toggles a tile on tap', async () => {
    await render(
      <PrefsProvider>
        <Topics />
      </PrefsProvider>
    );
    expect(screen.getByRole('checkbox', { name: 'Lifestyle' }).props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByRole('checkbox', { name: 'Music' }).props.accessibilityState).toMatchObject({ checked: false });

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Music' }));
    expect(screen.getByRole('checkbox', { name: 'Music' }).props.accessibilityState).toMatchObject({ checked: true });

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Lifestyle' }));
    expect(screen.getByRole('checkbox', { name: 'Lifestyle' }).props.accessibilityState).toMatchObject({ checked: false });
  });
});
