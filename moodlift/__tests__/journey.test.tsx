import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import JourneyScreen from '../app/journey';
import HomeScreen from '../app/(tabs)/index';
import ProfileScreen from '../app/(tabs)/profile';
import { MoodProvider } from '../lib/mood-context';
import { metricsFor, todayKey, goalProgress } from '../lib/activity';
import { formatSteps, formatDuration } from '../lib/format';
import { GOALS } from '../data/goals';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

const date = todayKey();
const metrics = metricsFor(date);

describe('Journey', () => {
  it('reports the steps the series solved', async () => {
    await render(<JourneyScreen />);
    // The figure appears twice — the chart header and the step goal's ring.
    expect(screen.getAllByText(formatSteps(metrics.steps)).length).toBeGreaterThan(0);
  });

  it('reports the calories and active time from the same day', async () => {
    await render(<JourneyScreen />);
    expect(screen.getByText(String(metrics.calories))).toBeTruthy();
    expect(screen.getByText(formatDuration(metrics.activeMinutes))).toBeTruthy();
  });

  it('shows every goal with the progress the series gives it', async () => {
    await render(<JourneyScreen />);
    for (const goal of GOALS) {
      expect(screen.getByText(goal.title)).toBeTruthy();
      const { current, target } = goalProgress(goal, date);
      const label = goal.source === 'steps' ? formatSteps(current) : `${current}/${target}`;
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('switches to the weekly view', async () => {
    await render(<JourneyScreen />);
    await fireEvent.press(screen.getByLabelText('Progress'));
    expect(screen.getByText('This week')).toBeTruthy();
  });

  it('marks only one tab selected', async () => {
    await render(<JourneyScreen />);
    expect(screen.getByLabelText('Activity').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByLabelText('Progress').props.accessibilityState?.selected).toBe(false);
  });
});

/**
 * The single-series guarantee, asserted across screens rather than within one.
 * Three surfaces show today's step count; if any of them ever computes or
 * hardcodes its own, this is what catches it.
 */
// One case per screen, not a loop: unmounting between renders inside a single
// test detaches `screen`, and every later assertion then reads an empty tree.
describe.each([
  ['Home', HomeScreen],
  ['Journey', JourneyScreen],
  ['Profile', ProfileScreen],
])('one solved series — %s', (_name, Screen) => {
  it('shows the step count the series solved, not its own', async () => {
    await render(
      <MoodProvider>
        <Screen />
      </MoodProvider>
    );
    expect(screen.getAllByText(formatSteps(metrics.steps)).length).toBeGreaterThan(0);
  });
});
