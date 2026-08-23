import type { ISODate, ISODateTime } from '../data/types';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function formatPayRange(min: number, max: number, currency: 'USD'): string {
  const symbol = currency === 'USD' ? '$' : '';
  const fmt = (n: number) => (n >= 10000 ? n.toLocaleString('en-US').replace(/,/g, ' ') : String(n));
  return min === max ? `${symbol}${fmt(min)}` : `${symbol}${fmt(min)} - ${symbol}${fmt(max)}`;
}

export function formatDayMonth(iso: ISODate): { day: string; month: string } {
  const [, m, d] = iso.split('-');
  return { day: d, month: MONTHS[Number(m) - 1] };
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}

export function formatPostedDate(iso: ISODate): string {
  const [y, m, d] = iso.split('-');
  return `${MONTHS_LONG[Number(m) - 1]} ${Number(d)}, ${y}`;
}

export function formatClock(iso: ISODateTime): string {
  const dt = new Date(iso);
  let h = dt.getHours();
  const min = String(dt.getMinutes()).padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${suffix}`;
}

export function greeting(hour: number): string {
  if (hour < 12) return 'Good morning!';
  if (hour < 18) return 'Good afternoon!';
  return 'Good evening!';
}
