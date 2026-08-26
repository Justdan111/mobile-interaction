import type { ISODate } from '../data/types';

/**
 * The app's single clock. Every "now" read goes through here so tests can pin
 * a date without reaching into the data files.
 */
export function todayIso(now: Date = new Date()): ISODate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function monthOf(iso: ISODate): { year: number; month: number } {
  const [y, m] = iso.split('-').map(Number);
  return { year: y, month: m - 1 };
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * A day-of-month position inside whatever month `now` falls in, clamped so
 * short months stay valid. This is how mock deadlines stay live: the 23rd is
 * always the 23rd of the month the user is actually looking at.
 */
export function dayInCurrentMonth(day: number, now: Date = new Date()): ISODate {
  const year = now.getFullYear();
  const month = now.getMonth();
  const clamped = Math.min(Math.max(day, 1), lastDayOfMonth(year, month));
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`;
}

export function shiftDays(iso: ISODate, n: number): ISODate {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
