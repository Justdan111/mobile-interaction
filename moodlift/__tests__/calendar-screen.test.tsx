import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CalendarScreen from '../app/(tabs)/calendar';
import { WORKOUTS } from '../data/workouts';
import { weekStrip, isOnDay, dateKey } from '../lib/week';
import { formatDayHeading } from '../lib/format';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: jest.fn() },
}));

const today = dateKey(new Date());
const todaysSessions = WORKOUTS.filter((w) => isOnDay(w.startsAt, today));

beforeEach(() => mockPush.mockClear());

describe('Calendar', () => {
  it('opens on today', async () => {
    await render(<CalendarScreen />);
    expect(screen.getByText(formatDayHeading(today))).toBeTruthy();
  });

  it('shows the whole week, Monday first', async () => {
    await render(<CalendarScreen />);
    const days = weekStrip();
    expect(days[0].weekday).toBe('Mon');
    for (const d of days) expect(screen.getByLabelText(`${d.weekday} ${d.day}`)).toBeTruthy();
  });

  it("lists today's sessions", async () => {
    await render(<CalendarScreen />);
    for (const w of todaysSessions) expect(screen.getByLabelText(w.title)).toBeTruthy();
  });

  it('orders the agenda by start time', async () => {
    await render(<CalendarScreen />);
    // The rendered time ranges, in the order they appear on screen.
    const shown = screen
      .getAllByText(/^\d{2}:\d{2} – \d{2}:\d{2}$/)
      .map((node) => String(node.props.children));
    expect(shown.length).toBe(todaysSessions.length);
    expect(shown).toEqual([...shown].sort());
  });

  it('shows no session that belongs to another day', async () => {
    await render(<CalendarScreen />);
    const otherDay = WORKOUTS.filter((w) => !isOnDay(w.startsAt, today));
    for (const w of otherDay) expect(screen.queryByLabelText(w.title)).toBeNull();
  });

  it('switches the agenda when another day is picked', async () => {
    await render(<CalendarScreen />);
    const days = weekStrip();
    const other = days.find((d) => d.date !== today)!;
    await fireEvent.press(screen.getByLabelText(`${other.weekday} ${other.day}`));
    expect(screen.getByText(formatDayHeading(other.date))).toBeTruthy();
  });

  it('marks only the selected day', async () => {
    await render(<CalendarScreen />);
    const selected = weekStrip().filter(
      (d) => screen.getByLabelText(`${d.weekday} ${d.day}`).props.accessibilityState?.selected
    );
    expect(selected.map((d) => d.date)).toEqual([today]);
  });

  it('toggles joining a session', async () => {
    await render(<CalendarScreen />);
    const first = todaysSessions[0];
    await fireEvent.press(screen.getByLabelText(`Join ${first.title}`));
    expect(screen.getByLabelText(`Leave ${first.title}`)).toBeTruthy();
  });

  it('opens a session', async () => {
    await render(<CalendarScreen />);
    await fireEvent.press(screen.getByLabelText(todaysSessions[0].title));
    expect(mockPush).toHaveBeenCalledWith(`/workout/${todaysSessions[0].id}`);
  });

  it('explains an empty day rather than showing nothing', async () => {
    await render(<CalendarScreen />);
    await fireEvent.changeText(screen.getByLabelText('Search name or training'), 'zzzzzz');
    expect(screen.getByText('Nothing booked')).toBeTruthy();
  });
});
