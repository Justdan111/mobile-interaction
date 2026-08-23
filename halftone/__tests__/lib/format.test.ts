import {
  formatPayRange,
  formatDayMonth,
  formatMonthYear,
  formatPostedDate,
  formatClock,
  greeting,
} from '../../lib/format';

describe('formatPayRange', () => {
  it('collapses to a single figure when min equals max', () => {
    expect(formatPayRange(500, 500, 'USD')).toBe('$500');
  });

  it('renders a range when min and max differ', () => {
    expect(formatPayRange(500, 600, 'USD')).toBe('$500 - $600');
  });

  it('leaves a four-digit figure without a thousands separator', () => {
    expect(formatPayRange(9999, 9999, 'USD')).toBe('$9999');
  });

  it('inserts a space thousands separator at and above five digits', () => {
    expect(formatPayRange(10000, 10000, 'USD')).toBe('$10 000');
  });

  it('separates thousands on both ends of a large range', () => {
    expect(formatPayRange(80000, 100000, 'USD')).toBe('$80 000 - $100 000');
  });
});

describe('formatDayMonth', () => {
  it('splits an ISO date into a zero-padded day and an uppercase month code', () => {
    expect(formatDayMonth('2026-08-05')).toEqual({ day: '05', month: 'AUG' });
  });

  it('maps January and December to their own codes, not off by one', () => {
    expect(formatDayMonth('2026-01-01').month).toBe('JAN');
    expect(formatDayMonth('2026-12-31').month).toBe('DEC');
  });
});

describe('formatMonthYear', () => {
  it('names the month for a zero-indexed value', () => {
    expect(formatMonthYear(2026, 0)).toBe('January 2026');
  });

  it('does not overrun the year for December (index 11)', () => {
    expect(formatMonthYear(2026, 11)).toBe('December 2026');
  });
});

describe('formatPostedDate', () => {
  it('drops a leading zero from the day', () => {
    expect(formatPostedDate('2026-08-05')).toBe('August 5, 2026');
  });

  it('renders a two-digit day without alteration', () => {
    expect(formatPostedDate('2026-08-21')).toBe('August 21, 2026');
  });
});

describe('formatClock', () => {
  // Naive (no "Z") datetimes are parsed as local time by `new Date(...)`,
  // and formatClock reads local hours back out — so these assertions hold
  // regardless of the machine's timezone.
  it('renders midnight as 12:00 AM, not 0:00', () => {
    expect(formatClock('2026-08-21T00:00:00')).toBe('12:00 AM');
  });

  it('renders noon as 12:00 PM, not 0:00', () => {
    expect(formatClock('2026-08-21T12:00:00')).toBe('12:00 PM');
  });

  it('renders the hour just after noon in 12-hour form', () => {
    expect(formatClock('2026-08-21T13:05:00')).toBe('1:05 PM');
  });

  it('renders the last minute of the day', () => {
    expect(formatClock('2026-08-21T23:59:00')).toBe('11:59 PM');
  });

  it('pads single-digit minutes', () => {
    expect(formatClock('2026-08-21T09:07:00')).toBe('9:07 AM');
  });
});

describe('greeting', () => {
  it('greets morning up to and including 11:00', () => {
    expect(greeting(0)).toBe('Good morning!');
    expect(greeting(11)).toBe('Good morning!');
  });

  it('greets afternoon from 12:00 up to and including 17:00', () => {
    expect(greeting(12)).toBe('Good afternoon!');
    expect(greeting(17)).toBe('Good afternoon!');
  });

  it('greets evening from 18:00 onward', () => {
    expect(greeting(18)).toBe('Good evening!');
    expect(greeting(23)).toBe('Good evening!');
  });
});
