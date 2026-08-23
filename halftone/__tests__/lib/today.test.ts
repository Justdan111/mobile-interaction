import { todayIso, dayInCurrentMonth, shiftDays, monthOf } from '../../lib/today';

describe('todayIso', () => {
  it('formats an injected date as YYYY-MM-DD', () => {
    expect(todayIso(new Date('2026-08-21T09:20:00Z'))).toBe('2026-08-21');
  });

  it('defaults to the real clock', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('dayInCurrentMonth', () => {
  it('places a day inside the injected month', () => {
    expect(dayInCurrentMonth(5, new Date('2026-08-21T00:00:00Z'))).toBe('2026-08-05');
    expect(dayInCurrentMonth(24, new Date('2026-08-21T00:00:00Z'))).toBe('2026-08-24');
  });

  it('clamps past the end of a short month', () => {
    // February 2027 has 28 days.
    expect(dayInCurrentMonth(30, new Date('2027-02-10T00:00:00Z'))).toBe('2027-02-28');
  });

  it('respects a leap February', () => {
    expect(dayInCurrentMonth(30, new Date('2028-02-10T00:00:00Z'))).toBe('2028-02-29');
  });

  it('clamps a day below 1 up to the 1st', () => {
    expect(dayInCurrentMonth(0, new Date('2026-08-21T00:00:00Z'))).toBe('2026-08-01');
  });

  it('always lands in the same month it was given', () => {
    for (let m = 0; m < 12; m++) {
      const now = new Date(Date.UTC(2027, m, 15));
      for (const d of [1, 5, 9, 23, 24, 31]) {
        expect(dayInCurrentMonth(d, now).slice(0, 7)).toBe(todayIso(now).slice(0, 7));
      }
    }
  });
});

describe('shiftDays', () => {
  it('moves forward across a month boundary', () => {
    expect(shiftDays('2026-08-30', 3)).toBe('2026-09-02');
  });

  it('moves backward across a year boundary', () => {
    expect(shiftDays('2027-01-01', -1)).toBe('2026-12-31');
  });
});

describe('monthOf', () => {
  it('returns a zero-indexed month', () => {
    expect(monthOf('2026-08-21')).toEqual({ year: 2026, month: 7 });
  });
});
