import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import WorkoutsScreen from '../app/(tabs)/workouts';
import { MoodProvider } from '../lib/mood-context';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: jest.fn() },
}));

const renderScreen = () =>
  render(
    <MoodProvider>
      <WorkoutsScreen />
    </MoodProvider>
  );

beforeEach(() => mockPush.mockClear());

describe('Workouts', () => {
  it('lists the catalogue by default', async () => {
    await renderScreen();
    expect(screen.getByText('Yoga for balance')).toBeTruthy();
    expect(screen.getByText('Full body power workout')).toBeTruthy();
  });

  it('narrows the list as you type', async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText('Search name or training'), 'yoga');
    expect(screen.getByText('Yoga for balance')).toBeTruthy();
    expect(screen.queryByText('Full body power workout')).toBeNull();
  });

  it('narrows the list when a chip is chosen', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Low intensity'));
    expect(screen.queryByText('Full body power workout')).toBeNull();
    expect(screen.getByText('Yoga for balance')).toBeTruthy();
  });

  it('marks only the chosen chip selected', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Solo-friendly'));
    expect(screen.getByLabelText('Solo-friendly').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByLabelText('All workout').props.accessibilityState?.selected).toBe(false);
  });

  it('explains an empty result rather than showing a blank page', async () => {
    await renderScreen();
    await fireEvent.changeText(screen.getByLabelText('Search name or training'), 'zzzzzz');
    expect(screen.getByText('Nothing matches that')).toBeTruthy();
  });

  it('opens a workout', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Yoga for balance'));
    expect(mockPush).toHaveBeenCalledWith('/workout/yoga-balance');
  });

  it('sends you to the picker from the mood banner', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Change your mood'));
    expect(mockPush).toHaveBeenCalledWith('/mood');
  });
});
