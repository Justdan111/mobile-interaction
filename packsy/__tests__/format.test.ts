import { formatDate, formatDatePadded, formatDateTime } from '../lib/format';

describe('format', () => {
  it('formats wall-clock dates without shifting timezones', () => {
    expect(formatDate('2026-03-28T23:59')).toBe('Mar 28, 2026');
    expect(formatDatePadded('2026-04-01')).toBe('Apr 01, 2026');
  });
  it('uses a 12-hour clock', () => {
    expect(formatDateTime('2026-03-29T10:39')).toBe('Mar 29, 2026, 10:39 AM');
    expect(formatDateTime('2026-03-28T00:05')).toBe('Mar 28, 2026, 12:05 AM');
    expect(formatDateTime('2026-03-28T12:00')).toBe('Mar 28, 2026, 12:00 PM');
  });
  it('rejects anything that is not a zone-less ISO date', () => {
    expect(() => formatDate('28/03/2026')).toThrow();
  });
});
