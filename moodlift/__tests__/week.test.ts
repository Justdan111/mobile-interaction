import { weekStrip, isOnDay, dateKey } from '../lib/week';

describe('weekStrip', () => {
  it('returns seven days starting on Monday', () => {
    // 2025-12-12 is a Friday.
    const week = weekStrip(new Date(2025, 11, 12));
    expect(week).toHaveLength(7);
    expect(week.map((d) => d.weekday)).toEqual([
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
    ]);
    expect(week[0].date).toBe('2025-12-08');
    expect(week[6].date).toBe('2025-12-14');
  });

  // getDay() is 0 on Sunday, so a naive "step back getDay()-1" lands a week out.
  it('treats Sunday as the end of its week, not the start', () => {
    const week = weekStrip(new Date(2025, 11, 14)); // a Sunday
    expect(week[0].date).toBe('2025-12-08');
    expect(week[6].date).toBe('2025-12-14');
  });

  it('handles a Monday', () => {
    const week = weekStrip(new Date(2025, 11, 8));
    expect(week[0].date).toBe('2025-12-08');
  });

  it('crosses a month boundary', () => {
    const week = weekStrip(new Date(2026, 0, 1)); // Thursday 1 Jan 2026
    expect(week[0].date).toBe('2025-12-29');
    expect(week[6].date).toBe('2026-01-04');
  });

  it('marks exactly one day as today when today is in the strip', () => {
    const today = new Date(2025, 11, 12);
    const week = weekStrip(today, today);
    expect(week.filter((d) => d.isToday).map((d) => d.date)).toEqual(['2025-12-12']);
  });

  it('marks no day as today when the strip is another week', () => {
    const week = weekStrip(new Date(2025, 11, 12), new Date(2026, 2, 3));
    expect(week.filter((d) => d.isToday)).toHaveLength(0);
  });

  it('reports the day of month alongside the key', () => {
    const week = weekStrip(new Date(2025, 11, 12));
    expect(week.map((d) => d.day)).toEqual([8, 9, 10, 11, 12, 13, 14]);
  });
});

describe('isOnDay', () => {
  it('matches a timestamp to its own day', () => {
    expect(isOnDay('2025-12-12T17:00:00', '2025-12-12')).toBe(true);
  });

  it('rejects a neighbouring day', () => {
    expect(isOnDay('2025-12-12T23:59:00', '2025-12-13')).toBe(false);
    expect(isOnDay('2025-12-13T00:01:00', '2025-12-12')).toBe(false);
  });
});

describe('dateKey', () => {
  it('zero-pads month and day', () => {
    expect(dateKey(new Date(2026, 0, 4))).toBe('2026-01-04');
  });
});
