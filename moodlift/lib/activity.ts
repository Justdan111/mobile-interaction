import type { Goal } from '../data/goals';

/**
 * The one solved activity series.
 *
 * Every figure in the app — the Home stat cards, the dot-matrix steps chart,
 * the calories ring, the workout chart, the goal rings — reads from here.
 * Nothing computes its own number and nothing types one in: duplicated figures
 * that quietly disagree between screens is the failure this exists to prevent.
 */

export type DayMetrics = {
  date: string;
  /** Sum of `hourly`. */
  steps: number;
  calories: number;
  activeMinutes: number;
  /** 24 step counts, midnight to midnight. */
  hourly: number[];
};

/**
 * A small deterministic PRNG seeded from the date, so a given day always
 * solves to the same figures — on every device, in every test run, and across
 * restarts. Math.random here would make the app's own numbers disagree between
 * two renders of the same screen.
 */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/**
 * Relative walking activity by hour. Near-zero overnight, a commute bump
 * morning and evening, a lunchtime rise, and a long active afternoon — so the
 * dot-matrix chart has the shape of a real day rather than noise.
 */
const HOUR_SHAPE = [
  0.01, 0.005, 0.005, 0.005, 0.01, 0.03, 0.09, 0.32, 0.68, 0.55, 0.42, 0.5,
  0.78, 0.62, 0.45, 0.5, 0.66, 0.85, 0.92, 0.7, 0.48, 0.3, 0.14, 0.05,
];

/**
 * These describe ACTIVE calories and exercise minutes, not whole-day totals.
 * Calibrated against the comps, which show 273 kcal alongside 1h 5m of
 * activity — summing every waking hour instead gives ~2,400 kcal and eleven
 * hours, which is a day's existence rather than a day's training.
 */
const STEPS_PER_KCAL = 0.04;
const KCAL_PER_ACTIVE_MIN = 1;
/** Steps in an hour below this are pottering about, not activity. */
const ACTIVE_HOUR_THRESHOLD = 150;
/** Walking cadence, used to turn active steps into minutes. */
const STEPS_PER_MINUTE = 95;

export function metricsFor(date: string): DayMetrics {
  const rand = seededRandom(date);

  // One daily intensity, so a busy day is busy across every hour rather than
  // hour-by-hour noise that averages out to the same total every day.
  const dayFactor = 0.62 + rand() * 0.95;

  const hourly = HOUR_SHAPE.map((weight) => {
    const jitter = 0.75 + rand() * 0.5;
    return Math.round(weight * dayFactor * jitter * 540);
  });

  const steps = hourly.reduce((a, b) => a + b, 0);

  // Only steps taken during genuinely active hours count toward exercise time.
  const activeSteps = hourly.reduce(
    (total, count) => (count >= ACTIVE_HOUR_THRESHOLD ? total + count : total),
    0
  );
  const activeMinutes = Math.round(activeSteps / STEPS_PER_MINUTE);

  const calories = Math.round(steps * STEPS_PER_KCAL + activeMinutes * KCAL_PER_ACTIVE_MIN);

  return { date, steps, calories, activeMinutes, hourly };
}

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  // Constructed in UTC so a day shift can't be eaten by a DST boundary in the
  // device's local zone.
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Seven days of metrics ending on `date`, oldest first. */
export function weekEnding(date: string): DayMetrics[] {
  return Array.from({ length: 7 }, (_, i) => metricsFor(shiftDate(date, i - 6)));
}

export type GoalStatus = { current: number; target: number; ratio: number };

/**
 * Progress toward a goal, read from the same series as everything else.
 *
 * Session goals count completed sessions this week; the count is derived from
 * the week's active minutes rather than stored separately, so it can't drift
 * away from the charts.
 */
export function goalProgress(goal: Goal, date: string): GoalStatus {
  let current: number;

  if (goal.source === 'steps') {
    current = metricsFor(date).steps;
  } else {
    const week = weekEnding(date);
    const sessions = week.filter((d) => d.activeMinutes >= 45).length;
    current = Math.min(sessions, goal.target);
  }

  return {
    current,
    target: goal.target,
    // Clamped: a ring drawn past a full turn reads as an empty one.
    ratio: Math.min(Math.max(current / goal.target, 0), 1),
  };
}

/** Today as the `YYYY-MM-DD` key the series is addressed by. */
export function todayKey(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
