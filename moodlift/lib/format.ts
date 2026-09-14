import type { Intensity } from '../data/workouts';

export const INTENSITY_LABEL: Record<Intensity, string> = {
  low: 'Low intensity',
  medium: 'Medium intensity',
  high: 'High intensity',
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** `17:00 – 17:45`. En dash, matching the comps. */
export function formatTimeRange(startsAt: string, durationMin: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return `${pad(start.getHours())}:${pad(start.getMinutes())} – ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * `Today, 17:00 – 17:45` / `Tomorrow, 14:00 – 15:00` / `Tue, Dec 16, 14:00 – 15:00`.
 *
 * Compares calendar days, not elapsed hours: a session at 07:00 is still
 * "Today" when read at 09:00, and one at 00:30 tomorrow is "Tomorrow" even
 * though it is only hours away.
 */
export function formatRelativeSlot(
  startsAt: string,
  durationMin: number,
  now: Date = new Date()
): string {
  const start = new Date(startsAt);
  const range = formatTimeRange(startsAt, durationMin);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dayKey(start) === dayKey(now)) return `Today, ${range}`;
  if (dayKey(start) === dayKey(tomorrow)) return `Tomorrow, ${range}`;

  const label = `${WEEKDAYS_SHORT[start.getDay()]}, ${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
  return `${label}, ${range}`;
}

/** `Friday, December 12` — the agenda heading on the calendar screen. */
export function formatDayHeading(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS[dt.getDay()]}, ${MONTHS[m - 1]} ${d}`;
}

/**
 * `09:58:47`. Hours are not wrapped at 24 — a pass valid for longer than a day
 * should say so rather than appearing to have just started.
 */
export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** `3,548`. Fixed to en-US grouping so the figure matches the comps everywhere. */
export function formatSteps(steps: number): string {
  return steps.toLocaleString('en-US');
}

/** `1h 5m` / `45m` — the activity duration on the Home stat card. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
