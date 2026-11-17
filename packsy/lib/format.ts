/**
 * Dates in the comps are wall-clock times at the parcel's location, so they are
 * stored as zone-less ISO strings ("2026-03-28T14:11") and formatted by hand.
 * Going through `Date` would shift them into the device's timezone, and Hermes'
 * Intl support varies by build.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Parts = { y: number; m: number; d: number; hh: number; mm: number };

export function parse(iso: string): Parts {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(iso);
  if (!match) throw new Error(`Not a wall-clock ISO date: ${iso}`);
  const [, y, m, d, hh = '0', mm = '0'] = match;
  return { y: +y, m: +m, d: +d, hh: +hh, mm: +mm };
}

/** "Mar 28, 2026" */
export function formatDate(iso: string): string {
  const p = parse(iso);
  return `${MONTHS[p.m - 1]} ${p.d}, ${p.y}`;
}

/** "Apr 01, 2026" — the zero-padded form the comp uses for the expected-by line. */
export function formatDatePadded(iso: string): string {
  const p = parse(iso);
  return `${MONTHS[p.m - 1]} ${String(p.d).padStart(2, '0')}, ${p.y}`;
}

/** "Mar 28, 2026, 2:11 PM" */
export function formatDateTime(iso: string): string {
  const p = parse(iso);
  const h12 = p.hh % 12 === 0 ? 12 : p.hh % 12;
  const ampm = p.hh < 12 ? 'AM' : 'PM';
  return `${formatDate(iso)}, ${h12}:${String(p.mm).padStart(2, '0')} ${ampm}`;
}
