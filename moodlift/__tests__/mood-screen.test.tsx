import React from 'react';
import { Text } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import MoodScreen from '../app/mood';
import { MoodProvider, useMood } from '../lib/mood-context';
import { getMood } from '../data/moods';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import type { PanGesture } from 'react-native-gesture-handler';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: (...a: unknown[]) => mockBack(...a) },
}));

/** Reports the committed mood so a test can assert what the CTA actually saved. */
function Committed() {
  const { moodId } = useMood();
  return <Text testID="committed">{moodId ?? 'none'}</Text>;
}

const renderScreen = () =>
  render(
    <MoodProvider>
      <MoodScreen />
      <Committed />
    </MoodProvider>
  );

const cta = () => screen.getByLabelText("Let's find workout");

/**
 * A real horizontal swipe on the card. Negative x moves to the next mood.
 *
 * Wrapped in `act` because the gesture calls back into React state from
 * outside React's own event handling; without it the swipe fires but the
 * re-render is never flushed and the assertion reads the old screen.
 */
const swipe = async (translationX: number) => {
  await act(async () => {
    fireGestureHandler<PanGesture>(getByGestureTestId('mood-swipe'), [
      { state: State.BEGAN, translationX: 0 },
      { state: State.ACTIVE, translationX: translationX / 2 },
      { state: State.ACTIVE, translationX },
      { state: State.END, translationX },
    ]);
  });
};

beforeEach(() => mockBack.mockClear());

describe('Mood picker — browsing', () => {
  it('opens on a mood with nothing yet chosen', async () => {
    await renderScreen();
    expect(screen.getByText(getMood('balanced').blurb)).toBeTruthy();
  });

  it('leaves the CTA inactive until a mood is chosen', async () => {
    await renderScreen();
    expect(cta().props.accessibilityState?.disabled).toBe(true);
  });

  it('rings nothing while you are only browsing', async () => {
    await renderScreen();
    const ringed = ['Calm', 'Balanced', 'Energized'].filter(
      (label) => screen.getByLabelText(label).props.accessibilityState?.selected
    );
    expect(ringed).toHaveLength(0);
  });

  it('does nothing when an inactive CTA is pressed', async () => {
    await renderScreen();
    await fireEvent.press(cta());
    expect(mockBack).not.toHaveBeenCalled();
  });
});

describe('Mood picker — choosing', () => {
  it('rings the mood once its label is tapped', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Balanced'));
    expect(screen.getByLabelText('Balanced').props.accessibilityState?.selected).toBe(true);
  });

  it('activates the CTA once a mood is chosen', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Balanced'));
    expect(cta().props.accessibilityState?.disabled).toBe(false);
  });

  it('commits the chosen mood and returns', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Balanced'));
    await fireEvent.press(cta());
    expect(mockBack).toHaveBeenCalled();
    expect(screen.getByTestId('committed')).toHaveTextContent('balanced');
  });
});

describe('Mood picker — swiping', () => {
  it('moves to the next mood on a swipe left', async () => {
    await renderScreen();
    expect(screen.getByText(getMood('balanced').blurb)).toBeTruthy();

    await swipe(-120);

    expect(screen.getByText(getMood('energized').blurb)).toBeTruthy();
  });

  it('moves to the previous mood on a swipe right', async () => {
    await renderScreen();
    await swipe(120);
    expect(screen.getByText(getMood('calm').blurb)).toBeTruthy();
  });

  it('ignores a drag too short to be a swipe', async () => {
    await renderScreen();
    await swipe(-10);
    expect(screen.getByText(getMood('balanced').blurb)).toBeTruthy();
  });

  it('stops at the end of the scale', async () => {
    await renderScreen();
    for (let i = 0; i < 6; i++) await swipe(-120);
    expect(screen.getByText(getMood('high').blurb)).toBeTruthy();
  });

  // Otherwise the ring would sit on a mood you had already swiped away from.
  it('clears the choice when you swipe on after choosing', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByLabelText('Balanced'));
    expect(cta().props.accessibilityState?.disabled).toBe(false);

    await swipe(-120);

    expect(cta().props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByLabelText('Energized').props.accessibilityState?.selected).toBe(false);
  });
});
