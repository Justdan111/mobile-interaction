import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MonthGrid } from '../../components/calendar/MonthGrid';
import { Legend } from '../../components/calendar/Legend';
import { MARK_FILL, MARK_LEGEND } from '../../components/calendar/markPalette';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';
import type { Mark } from '../../data/types';

const TODAY = '2023-08-01';
const MARKS: Mark[] = [
  { date: '2023-08-05', kind: 'task', label: 'Mockups', projectId: 'p1' },
  { date: '2023-08-23', kind: 'project', label: 'Delivery', projectId: 'p1' },
  { date: '2023-08-24', kind: 'project', label: 'Delivery', projectId: 'p1' },
];

const grid = () =>
  render(
    <ThemeProvider>
      <MonthGrid year={2023} month={7} marks={MARKS} todayIso={TODAY} />
    </ThemeProvider>
  );

// Jest renders in light mode: ThemeProvider falls back to the light palette
// because the mocked useColorScheme returns no preference.
const light = tokens.light;

/** Every View in a rendered tree that paints a flat background colour. */
function backgroundColors(node: any, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out;
  const style = node.props?.style;
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  if (flat && typeof flat.backgroundColor === 'string') out.push(flat.backgroundColor);
  for (const child of node.children ?? []) backgroundColors(child, out);
  return out;
}

describe('MonthGrid fills', () => {
  it('fills today with the neutral mark colour', async () => {
    await grid();
    expect(screen.getByLabelText('1, today').props.style.backgroundColor).toBe(light[MARK_FILL.today]);
  });

  it('fills a task deadline and a project deadline with different colours', async () => {
    await grid();
    const task = screen.getByLabelText('5, task deadline').props.style.backgroundColor;
    const project = screen.getByLabelText('23, project deadline').props.style.backgroundColor;
    expect(task).toBe(light[MARK_FILL.task]);
    expect(project).toBe(light[MARK_FILL.project]);
    expect(task).not.toBe(project);
  });

  it('leaves an unmarked day unfilled', async () => {
    await grid();
    expect(screen.getByLabelText('14').props.style.backgroundColor).toBe('transparent');
  });

  // The grid filled today with `chip` while the legend showed `muted` for it,
  // and nothing caught the drift because the two lists lived in separate files.
  // This is the assertion that would have.
  it('agrees with the legend on every mark colour', async () => {
    await grid();
    const gridFills = {
      today: screen.getByLabelText('1, today').props.style.backgroundColor,
      task: screen.getByLabelText('5, task deadline').props.style.backgroundColor,
      project: screen.getByLabelText('23, project deadline').props.style.backgroundColor,
    };

    const legend = await render(<ThemeProvider><Legend /></ThemeProvider>);
    const dots = backgroundColors(legend.toJSON());

    for (const [i, entry] of MARK_LEGEND.entries()) {
      expect(dots[i]).toBe(gridFills[entry.kind as keyof typeof gridFills]);
    }
  });
});

describe('MonthGrid day labels', () => {
  // The visible number is padded to match the comp; the accessibility label is
  // not, so a screen reader says "five" and the screen's current-date test —
  // which matches `^<day>(,|$)` — keeps working on single-digit days.
  it('shows a padded day but labels it unpadded', async () => {
    await grid();
    expect(screen.getByText('05')).toBeTruthy();
    expect(screen.queryByText('5')).toBeNull();
    expect(screen.getByLabelText('5, task deadline')).toBeTruthy();
  });

  it('leaves two-digit days alone', async () => {
    await grid();
    expect(screen.getByText('23')).toBeTruthy();
  });
});

describe('MonthGrid joined ranges', () => {
  // 23 and 24 are one project window and must read as a single pill: the left
  // day rounds only its left edge, the right day only its right.
  it('rounds only the outer edges of a joined range', async () => {
    await grid();
    const start = screen.getByLabelText('23, project deadline').props.style;
    const end = screen.getByLabelText('24, project deadline').props.style;

    expect(start.borderTopLeftRadius).toBeGreaterThan(0);
    expect(start.borderTopRightRadius).toBeUndefined();
    expect(end.borderTopRightRadius).toBeGreaterThan(0);
    expect(end.borderTopLeftRadius).toBeUndefined();
  });

  it('fully rounds a standalone marked day', async () => {
    await grid();
    expect(screen.getByLabelText('5, task deadline').props.style.borderRadius).toBeGreaterThan(0);
  });

  // Butting the cells up at exactly 0 was not enough: seven flex:1 columns
  // leave a fractional remainder, and a dark seam opened between two filled
  // days. Joined cells overlap so no rounding can put a gap between them.
  it('overlaps joined days so no seam can open between them', async () => {
    await grid();
    expect(screen.getByLabelText('23, project deadline').props.style.marginHorizontal).toBeLessThan(0);
    expect(screen.getByLabelText('24, project deadline').props.style.marginHorizontal).toBeLessThan(0);
  });

  it('still insets a standalone day so circles do not touch', async () => {
    await grid();
    expect(screen.getByLabelText('5, task deadline').props.style.marginHorizontal).toBeGreaterThan(0);
    expect(screen.getByLabelText('1, today').props.style.marginHorizontal).toBeGreaterThan(0);
  });
});

describe('MonthGrid speech labels', () => {
  // Today is not a deadline. A single `, ${kind} deadline` template reads out
  // "1, today deadline", which is what the brief's code produced.
  it('does not call today a deadline', async () => {
    await grid();
    expect(screen.getByLabelText('1, today')).toBeTruthy();
    expect(screen.queryByLabelText('1, today deadline')).toBeNull();
  });

  it('still calls a task and a project day deadlines', async () => {
    await grid();
    expect(screen.getByLabelText('5, task deadline')).toBeTruthy();
    expect(screen.getByLabelText('23, project deadline')).toBeTruthy();
  });
});
