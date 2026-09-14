import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/(tabs)/index';
import { ProgressRow } from '../components/home/ProgressRow';
import { MoodProvider, useMood } from '../lib/mood-context';
import { metricsFor, todayKey } from '../lib/activity';
import { formatSteps, formatDuration } from '../lib/format';
import type { MoodId } from '../data/moods';

// Jest hoists jest.mock above the file, so the factory may only close over
// variables whose names begin with `mock`.
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: jest.fn() },
}));

/** Seeds a mood, then renders Home inside the same provider. */
function Harness({ mood }: { mood: MoodId | null }) {
  const { moodId, setMood } = useMood();
  React.useEffect(() => {
    if (mood && moodId !== mood) setMood(mood);
  }, [mood, moodId, setMood]);
  return <HomeScreen />;
}

const renderHome = (mood: MoodId | null) =>
  render(
    <MoodProvider>
      <Harness mood={mood} />
    </MoodProvider>
  );

beforeEach(() => mockPush.mockClear());

describe('Home — no mood chosen', () => {
  it('asks what you want to train', async () => {
    await renderHome(null);
    expect(screen.getByText(/Not sure/)).toBeTruthy();
    expect(screen.getByLabelText('Find my match')).toBeTruthy();
  });

  it('does not show the mood rail', async () => {
    await renderHome(null);
    expect(screen.queryByText('Fits your mood today')).toBeNull();
  });

  it('sends you to the picker', async () => {
    await renderHome(null);
    fireEvent.press(screen.getByLabelText('Find my match'));
    expect(mockPush).toHaveBeenCalledWith('/mood');
  });
});

describe('Home — mood chosen', () => {
  it('swaps the promo card for the mood rail', async () => {
    await renderHome('energized');
    expect(screen.getByText('Fits your mood today')).toBeTruthy();
    expect(screen.queryByText(/Not sure/)).toBeNull();
  });

  it('offers a way back to the picker', async () => {
    await renderHome('energized');
    fireEvent.press(screen.getByLabelText('Change my mood'));
    expect(mockPush).toHaveBeenCalledWith('/mood');
  });

  it('recommends workouts tagged for the chosen mood first', async () => {
    await renderHome('calm');
    // Calm's top match is a low-intensity session, never the power workout.
    expect(screen.queryByText('Full body power workout')).toBeNull();
  });
});

describe('ProgressRow', () => {
  // The single-series guarantee: these tiles must never show a figure that
  // disagrees with the journey screen's.
  it('shows exactly the figures the series reports', async () => {
    const metrics = metricsFor(todayKey());
    await render(<ProgressRow metrics={metrics} />);

    expect(screen.getByText(formatSteps(metrics.steps))).toBeTruthy();
    expect(screen.getByText(String(metrics.calories))).toBeTruthy();
    expect(screen.getByText(formatDuration(metrics.activeMinutes))).toBeTruthy();
  });
});
