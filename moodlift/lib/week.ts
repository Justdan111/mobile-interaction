const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type WeekDay = {
  /** `YYYY-MM-DD`. */
  date: string;
  /** `Mon`, `Tue`, … */
  weekday: string;
  /** Day of month, as shown under the weekday. */
  day: number;
  isToday: boolean;
};

const pad = (n: number) => String(n).padStart(2, '0');

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * The seven days of the strip, starting on Monday of the week containing
 * `around`.
 *
 * Built in local time from the date parts rather than by adding milliseconds:
 * a 24h step lands on the wrong day across a DST boundary.
 */
export function weekStrip(around: Date = new Date(), today: Date = new Date()): WeekDay[] {
  // `today` is deliberately separate from `around`: paging to another week must
  // not paint a "today" pill on a day that isn't today.
  const todayKey = dateKey(today);

  // getDay() is 0 for Sunday, so Sunday has to step back six days, not one.
  const offsetToMonday = (around.getDay() + 6) % 7;
  const monday = new Date(around.getFullYear(), around.getMonth(), around.getDate() - offsetToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const key = dateKey(d);
    return {
      date: key,
      weekday: WEEKDAYS_SHORT[d.getDay()],
      day: d.getDate(),
      isToday: key === todayKey,
    };
  });
}

/** Whether an ISO timestamp falls on the given `YYYY-MM-DD` day. */
export function isOnDay(startsAt: string, date: string): boolean {
  return dateKey(new Date(startsAt)) === date;
}
