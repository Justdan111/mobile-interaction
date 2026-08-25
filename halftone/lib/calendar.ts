import type { ID, ISODate, Mark, MarkKind } from '../data/types';

export type DayCell = { iso: ISODate | null; day: number | null };

const BLANK: DayCell = { iso: null, day: null };

function iso(year: number, month: number, day: number): ISODate {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Weeks start Sunday. Tail is padded with blanks, never with next-month days. */
export function monthGrid(year: number, month: number): DayCell[] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const total = daysInMonth(year, month);

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(BLANK);
  for (let d = 1; d <= total; d++) cells.push({ iso: iso(year, month, d), day: d });
  while (cells.length % 7 !== 0) cells.push(BLANK);
  return cells;
}

/** Project deadlines outrank task deadlines, which outrank today. */
const PRECEDENCE: MarkKind[] = ['project', 'task'];

export function classifyDay(
  date: ISODate,
  marks: Mark[],
  todayIso: ISODate
): MarkKind | null {
  const onDay = marks.filter((m) => m.date === date);
  for (const kind of PRECEDENCE) {
    if (onDay.some((m) => m.kind === kind)) return kind;
  }
  return date === todayIso ? 'today' : null;
}

export type RangeSegment = { projectId: ID; dates: ISODate[] };

function nextDay(date: ISODate): ISODate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Consecutive project-deadline days for one project become a single segment. */
export function projectRanges(marks: Mark[]): RangeSegment[] {
  const byProject = new Map<ID, ISODate[]>();
  for (const m of marks) {
    if (m.kind !== 'project') continue;
    const list = byProject.get(m.projectId) ?? [];
    list.push(m.date);
    byProject.set(m.projectId, list);
  }

  const segments: RangeSegment[] = [];
  for (const [projectId, rawDates] of byProject) {
    const dates = [...new Set(rawDates)].sort();
    let run: ISODate[] = [];
    for (const date of dates) {
      if (run.length === 0 || nextDay(run[run.length - 1]) === date) {
        run.push(date);
      } else {
        segments.push({ projectId, dates: run });
        run = [date];
      }
    }
    if (run.length > 0) segments.push({ projectId, dates: run });
  }
  return segments;
}

export function rangePosition(
  date: ISODate,
  ranges: RangeSegment[]
): 'single' | 'start' | 'middle' | 'end' | null {
  for (const r of ranges) {
    const i = r.dates.indexOf(date);
    if (i === -1) continue;
    if (r.dates.length === 1) return 'single';
    if (i === 0) return 'start';
    if (i === r.dates.length - 1) return 'end';
    return 'middle';
  }
  return null;
}
