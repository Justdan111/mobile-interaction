import {
  formatTimeRange,
  formatRelativeSlot,
  formatDayHeading,
  formatCountdown,
  formatSteps,
  INTENSITY_LABEL,
} from '../lib/format';

describe('formatTimeRange', () => {
  it('renders a 24h range with an en dash', () => {
    expect(formatTimeRange('2025-12-12T17:00:00', 45)).toBe('17:00 – 17:45');
  });

  it('zero-pads and rolls over the hour', () => {
    expect(formatTimeRange('2025-12-12T07:30:00', 45)).toBe('07:30 – 08:15');
    expect(formatTimeRange('2025-12-12T19:30:00', 40)).toBe('19:30 – 20:10');
  });

  it('wraps past midnight', () => {
    expect(formatTimeRange('2025-12-12T23:40:00', 40)).toBe('23:40 – 00:20');
  });
});

describe('formatRelativeSlot', () => {
  const now = new Date('2025-12-12T09:00:00');

  it('says Today for the current day', () => {
    expect(formatRelativeSlot('2025-12-12T17:00:00', 45, now)).toBe('Today, 17:00 – 17:45');
  });

  it('says Tomorrow for the next day', () => {
    expect(formatRelativeSlot('2025-12-13T14:00:00', 60, now)).toBe('Tomorrow, 14:00 – 15:00');
  });

  it('names the date further out', () => {
    expect(formatRelativeSlot('2025-12-16T14:00:00', 60, now)).toBe('Tue, Dec 16, 14:00 – 15:00');
  });

  it('treats a slot earlier today as still today', () => {
    expect(formatRelativeSlot('2025-12-12T07:00:00', 30, now)).toBe('Today, 07:00 – 07:30');
  });
});

describe('formatDayHeading', () => {
  it('renders weekday, month and day', () => {
    // 2025-12-12 really is a Friday. The comps label it "Tue" — their dates
    // are not internally consistent, so the app computes the weekday rather
    // than copying the comp's label.
    expect(formatDayHeading('2025-12-12')).toBe('Friday, December 12');
  });
});

describe('formatCountdown', () => {
  it('renders hh:mm:ss', () => {
    expect(formatCountdown(((9 * 60 + 58) * 60 + 47) * 1000)).toBe('09:58:47');
  });

  it('floors to the second', () => {
    expect(formatCountdown(1999)).toBe('00:00:01');
  });

  it('never goes negative', () => {
    expect(formatCountdown(-5000)).toBe('00:00:00');
    expect(formatCountdown(0)).toBe('00:00:00');
  });

  it('keeps hours past a day rather than wrapping', () => {
    expect(formatCountdown(26 * 3600 * 1000)).toBe('26:00:00');
  });
});

describe('formatSteps', () => {
  it('groups thousands', () => {
    expect(formatSteps(3548)).toBe('3,548');
    expect(formatSteps(972)).toBe('972');
    expect(formatSteps(12045)).toBe('12,045');
  });
});

describe('INTENSITY_LABEL', () => {
  it('reads the way the comps label intensity', () => {
    expect(INTENSITY_LABEL.low).toBe('Low intensity');
    expect(INTENSITY_LABEL.medium).toBe('Medium intensity');
    expect(INTENSITY_LABEL.high).toBe('High intensity');
  });
});
