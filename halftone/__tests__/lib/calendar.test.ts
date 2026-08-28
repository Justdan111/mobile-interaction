import {
  monthGrid, classifyDay, projectRanges, rangePosition,
} from '../../lib/calendar';
import type { Mark } from '../../data/types';

describe('monthGrid', () => {
  it('always returns whole weeks', () => {
    for (let m = 0; m < 12; m++) {
      expect(monthGrid(2023, m).length % 7).toBe(0);
    }
  });

  it('pads to the correct weekday for the 1st', () => {
    // 1 August 2023 was a Tuesday, so two blanks precede it.
    const grid = monthGrid(2023, 7);
    expect(grid[0].day).toBeNull();
    expect(grid[1].day).toBeNull();
    expect(grid[2].day).toBe(1);
    expect(grid[2].iso).toBe('2023-08-01');
  });

  it('includes every day of the month', () => {
    const days = monthGrid(2023, 7).filter((c) => c.day !== null).map((c) => c.day);
    expect(days).toHaveLength(31);
    expect(days[30]).toBe(31);
  });

  it('handles leap years', () => {
    expect(monthGrid(2024, 1).filter((c) => c.day !== null)).toHaveLength(29);
    expect(monthGrid(2023, 1).filter((c) => c.day !== null)).toHaveLength(28);
  });

  it('pads the tail with blanks, never with next-month days', () => {
    const grid = monthGrid(2023, 7);
    const lastReal = grid.findIndex((c) => c.day === 31);
    for (let i = lastReal + 1; i < grid.length; i++) {
      expect(grid[i].day).toBeNull();
      expect(grid[i].iso).toBeNull();
    }
  });

  it('starts every week on a Sunday', () => {
    const grid = monthGrid(2023, 7);
    for (let i = 0; i < grid.length; i += 7) {
      const cell = grid[i];
      if (cell.iso) expect(new Date(`${cell.iso}T00:00:00Z`).getUTCDay()).toBe(0);
    }
  });
});

describe('classifyDay', () => {
  const marks: Mark[] = [
    { date: '2023-08-05', kind: 'task', label: 'Mockups', projectId: 'p1' },
    { date: '2023-08-23', kind: 'project', label: 'Delivery', projectId: 'p1' },
    { date: '2023-08-01', kind: 'task', label: 'Kickoff', projectId: 'p2' },
  ];
  const today = '2023-08-01';

  it('returns null for an unmarked day', () => {
    expect(classifyDay('2023-08-14', marks, today)).toBeNull();
  });

  it('identifies task days', () => {
    expect(classifyDay('2023-08-05', marks, today)).toBe('task');
  });

  it('identifies project days', () => {
    expect(classifyDay('2023-08-23', marks, today)).toBe('project');
  });

  it('identifies today when nothing else applies', () => {
    expect(classifyDay('2023-08-01', [], today)).toBe('today');
  });

  it('ranks a deadline above today on the same day', () => {
    expect(classifyDay('2023-08-01', marks, today)).toBe('task');
  });

  it('ranks a project deadline above a task on the same day', () => {
    const clash: Mark[] = [
      { date: '2023-08-09', kind: 'task', label: 'T', projectId: 'p1' },
      { date: '2023-08-09', kind: 'project', label: 'P', projectId: 'p1' },
    ];
    expect(classifyDay('2023-08-09', clash, today)).toBe('project');
  });
});

describe('projectRanges', () => {
  const marks: Mark[] = [
    { date: '2023-08-23', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-24', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-28', kind: 'project', label: 'D', projectId: 'p2' },
    { date: '2023-08-05', kind: 'task', label: 'T', projectId: 'p1' },
  ];

  it('joins consecutive days for one project', () => {
    const ranges = projectRanges(marks);
    expect(ranges.find((r) => r.projectId === 'p1')!.dates).toEqual(['2023-08-23', '2023-08-24']);
  });

  it('ignores task marks', () => {
    expect(projectRanges(marks).every((r) => r.dates.every((d) => d !== '2023-08-05'))).toBe(true);
  });

  it('keeps separate projects in separate ranges', () => {
    expect(projectRanges(marks)).toHaveLength(2);
  });

  it('splits a project with a gap into two ranges', () => {
    const gapped: Mark[] = [
      { date: '2023-08-01', kind: 'project', label: 'D', projectId: 'p3' },
      { date: '2023-08-02', kind: 'project', label: 'D', projectId: 'p3' },
      { date: '2023-08-09', kind: 'project', label: 'D', projectId: 'p3' },
    ];
    expect(projectRanges(gapped)).toHaveLength(2);
  });
});

describe('rangePosition', () => {
  const ranges = projectRanges([
    { date: '2023-08-23', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-24', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-28', kind: 'project', label: 'D', projectId: 'p2' },
  ]);

  it('marks the first day of a multi-day range as the start', () => {
    expect(rangePosition('2023-08-23', ranges)).toBe('start');
  });

  it('marks the last day as the end', () => {
    expect(rangePosition('2023-08-24', ranges)).toBe('end');
  });

  it('marks a one-day range as single', () => {
    expect(rangePosition('2023-08-28', ranges)).toBe('single');
  });

  it('marks an interior day as middle', () => {
    const long = projectRanges([
      { date: '2023-08-10', kind: 'project', label: 'D', projectId: 'p9' },
      { date: '2023-08-11', kind: 'project', label: 'D', projectId: 'p9' },
      { date: '2023-08-12', kind: 'project', label: 'D', projectId: 'p9' },
    ]);
    expect(rangePosition('2023-08-11', long)).toBe('middle');
  });

  it('returns null for a day outside every range', () => {
    expect(rangePosition('2023-08-15', ranges)).toBeNull();
  });
});

// February 2015 starts on a Sunday and has 28 days, so it fills exactly four
// weeks. It is the one shape that catches a grid which always pads a tail week.
describe('monthGrid — a month that fills whole weeks exactly', () => {
  it('adds no leading blanks when the 1st is a Sunday', () => {
    const grid = monthGrid(2015, 1);
    expect(grid[0].day).toBe(1);
    expect(grid[0].iso).toBe('2015-02-01');
  });

  it('adds no trailing blanks either', () => {
    const grid = monthGrid(2015, 1);
    expect(grid).toHaveLength(28);
    expect(grid[27].day).toBe(28);
  });
});

// The shared fixtures are pre-sorted and duplicate-free, so neither the sort
// nor the dedup inside projectRanges is exercised by them — both pass with the
// line deleted. Real marks come from data/marks.ts in no guaranteed order.
describe('projectRanges — input hygiene', () => {
  const unsorted: Mark[] = [
    { date: '2023-08-25', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-23', kind: 'project', label: 'D', projectId: 'p1' },
    { date: '2023-08-24', kind: 'project', label: 'D', projectId: 'p1' },
  ];

  it('joins a run given out of order into one ascending range', () => {
    const ranges = projectRanges(unsorted);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].dates).toEqual(['2023-08-23', '2023-08-24', '2023-08-25']);
  });

  it('positions an out-of-order run by date, not by input order', () => {
    const ranges = projectRanges(unsorted);
    expect(rangePosition('2023-08-23', ranges)).toBe('start');
    expect(rangePosition('2023-08-24', ranges)).toBe('middle');
    expect(rangePosition('2023-08-25', ranges)).toBe('end');
  });

  it('treats a day marked twice as one day, not a two-day range', () => {
    const duplicated: Mark[] = [
      { date: '2023-08-28', kind: 'project', label: 'Delivery', projectId: 'p2' },
      { date: '2023-08-28', kind: 'project', label: 'Handover', projectId: 'p2' },
    ];
    const ranges = projectRanges(duplicated);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].dates).toEqual(['2023-08-28']);
    expect(rangePosition('2023-08-28', ranges)).toBe('single');
  });
});
