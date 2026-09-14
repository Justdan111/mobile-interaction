import { metricsFor, goalProgress, weekEnding } from '../lib/activity';
import { GOALS } from '../data/goals';

const DAY = '2025-12-12';

describe('metricsFor', () => {
  it('is deterministic', () => {
    expect(metricsFor(DAY)).toEqual(metricsFor(DAY));
  });

  it('sums its hourly buckets to the reported step total', () => {
    const m = metricsFor(DAY);
    expect(m.hourly).toHaveLength(24);
    expect(m.hourly.reduce((a, b) => a + b, 0)).toBe(m.steps);
  });

  it('gives different days different totals', () => {
    expect(metricsFor('2025-12-12').steps).not.toBe(metricsFor('2025-12-13').steps);
  });

  it('produces plausible daily step counts', () => {
    for (const d of ['2025-12-12', '2026-01-04', '2026-09-14']) {
      const { steps } = metricsFor(d);
      expect(steps).toBeGreaterThan(1500);
      expect(steps).toBeLessThan(20000);
    }
  });

  it('keeps people asleep — the small hours carry almost nothing', () => {
    const { hourly, steps } = metricsFor(DAY);
    const night = hourly.slice(0, 5).reduce((a, b) => a + b, 0);
    expect(night).toBeLessThan(steps * 0.04);
  });

  // The point of one solved series: calories and minutes are consequences of
  // the steps, not numbers typed next to them.
  it('derives calories and active minutes from the same series', () => {
    const a = metricsFor('2025-12-12');
    const b = metricsFor('2025-12-13');
    const busier = a.steps > b.steps ? a : b;
    const quieter = a.steps > b.steps ? b : a;
    expect(busier.calories).toBeGreaterThan(quieter.calories);
    expect(busier.activeMinutes).toBeGreaterThanOrEqual(quieter.activeMinutes);
  });

  it('reports whole numbers — no screen should have to round', () => {
    const m = metricsFor(DAY);
    for (const v of [m.steps, m.calories, m.activeMinutes, ...m.hourly]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('weekEnding', () => {
  it('returns seven consecutive days ending on the given date', () => {
    const week = weekEnding(DAY);
    expect(week).toHaveLength(7);
    expect(week[6].date).toBe(DAY);
    expect(week[0].date).toBe('2025-12-06');
  });

  it('agrees with metricsFor for every day in the week', () => {
    for (const day of weekEnding(DAY)) {
      expect(day.steps).toBe(metricsFor(day.date).steps);
    }
  });
});

describe('goalProgress', () => {
  it('reads the step goal from the same series the charts use', () => {
    const goal = GOALS.find((g) => g.source === 'steps')!;
    expect(goalProgress(goal, DAY).current).toBe(metricsFor(DAY).steps);
  });

  it('clamps the ratio to 0..1 even past target', () => {
    for (const g of GOALS) {
      const { ratio } = goalProgress(g, DAY);
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(1);
    }
  });

  it('reports the goal its own target, not a shared one', () => {
    for (const g of GOALS) {
      expect(goalProgress(g, DAY).target).toBe(g.target);
    }
  });

  it('counts session goals in sessions, not steps', () => {
    const goal = GOALS.find((g) => g.source === 'sessions')!;
    const { current, target } = goalProgress(goal, DAY);
    expect(current).toBeLessThanOrEqual(target);
    expect(current).not.toBe(metricsFor(DAY).steps);
  });
});
