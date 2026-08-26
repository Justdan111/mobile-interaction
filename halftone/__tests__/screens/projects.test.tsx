import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Projects from '../../app/(tabs)/projects';
import { ThemeProvider } from '../../lib/theme';
import { formatMonthYear } from '../../lib/format';
import { todayIso } from '../../lib/today';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Projects /></ThemeProvider>);

const goToCalendar = async () => {
  await wrap();
  await fireEvent.press(screen.getByText('Calendar'));
};

describe('My projects', () => {
  it('opens on the active projects list', async () => {
    await wrap();
    expect(screen.getByText('My projects')).toBeTruthy();
    expect(screen.getByRole('tab', { selected: true })).toBeTruthy();
  });

  it('opens the calendar on the real current month', async () => {
    await goToCalendar();
    const now = new Date();
    const expected = formatMonthYear(now.getFullYear(), now.getMonth());
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('marks the real current date', async () => {
    await goToCalendar();
    const today = Number(todayIso().slice(8, 10));
    // Ruling R5 — MonthGrid appends ", <kind> deadline" to a day that also
    // carries a mark, so on the 5th, 9th, 23rd or 24th an exact-string match
    // would fail. Match the day number and whatever follows it.
    expect(screen.getByLabelText(new RegExp('^' + today + '(,|$)'))).toBeTruthy();
  });

  it('renders the weekday header', async () => {
    await goToCalendar();
    expect(screen.getAllByText('S')).toHaveLength(2);
    expect(screen.getByText('W')).toBeTruthy();
  });

  it('explains all three mark colours in the legend', async () => {
    await goToCalendar();
    expect(screen.getByText("Today's date")).toBeTruthy();
    expect(screen.getByText('Task deadline')).toBeTruthy();
    expect(screen.getByText('Project deadline')).toBeTruthy();
  });

  it('lists agenda items derived from project data', async () => {
    await goToCalendar();
    expect(screen.getByText('Design UI mockups for checkout process')).toBeTruthy();
  });

  it('toggles a project between saved and unsaved', async () => {
    // Ruling R6 — the heart on this list drives real state, same as home.
    await wrap();
    await fireEvent.press(screen.getAllByLabelText(/save/i)[0]);
    expect(screen.getAllByLabelText(/Remove .* from saved/i).length).toBeGreaterThan(0);
  });

  it('steps to the next month', async () => {
    await goToCalendar();
    const before = screen.getByLabelText(/Showing /).props.accessibilityLabel;
    await fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByLabelText(/Showing /).props.accessibilityLabel).not.toBe(before);
  });
});
