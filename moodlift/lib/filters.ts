import type { Workout } from '../data/workouts';

export type FilterId = 'all' | 'today' | 'low-intensity' | 'solo';

/** The chip row from `.design/comps/workouts-browse.png`. */
export const FILTERS: readonly { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All workout' },
  { id: 'today', label: 'Today' },
  { id: 'low-intensity', label: 'Low intensity' },
  { id: 'solo', label: 'Solo-friendly' },
] as const;

export type FilterState = { query: string; filter: FilterId };

const matchesFilter = (w: Workout, filter: FilterId): boolean => {
  switch (filter) {
    case 'today':
      return new Date(w.startsAt).toDateString() === new Date().toDateString();
    case 'low-intensity':
      return w.intensity === 'low';
    case 'solo':
      return w.solo;
    case 'all':
      return true;
  }
};

/**
 * Narrow the catalogue by search text and the selected chip.
 *
 * Order is left alone — the list arrives already sorted by `matchWorkouts`,
 * and re-sorting here would quietly undo the mood ranking. Pure: the input
 * array is never mutated.
 */
export function applyFilters(
  workouts: readonly Workout[],
  { query, filter }: FilterState
): Workout[] {
  const needle = query.trim().toLowerCase();

  return workouts.filter((w) => {
    if (!matchesFilter(w, filter)) return false;
    if (!needle) return true;
    return `${w.title} ${w.coach} ${w.category}`.toLowerCase().includes(needle);
  });
}
