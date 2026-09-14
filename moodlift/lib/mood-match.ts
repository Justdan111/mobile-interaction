import { getMood, type MoodId } from '../data/moods';
import type { Intensity, Workout } from '../data/workouts';

/**
 * Where each intensity sits on the same 1–6 scale the moods use, so a mood's
 * rank can be compared against a workout's directly. Medium sits at 3.5 —
 * between Calm and Balanced — rather than at an integer, so it never ties with
 * a mood rank and ordering stays deterministic.
 */
const INTENSITY_RANK: Record<Intensity, number> = { low: 1, medium: 3.5, high: 6 };

/**
 * Order a catalogue for a mood.
 *
 * Workouts explicitly tagged for the mood come first; within each group the
 * closer a workout's intensity sits to the mood's rank, the higher it lands,
 * and ties break chronologically. With no mood selected the list is purely
 * chronological — the state Home shows before you've told it anything.
 *
 * Pure: the input array is never mutated.
 */
export function matchWorkouts(
  workouts: readonly Workout[],
  mood: MoodId | null
): Workout[] {
  const byTime = (a: Workout, b: Workout) =>
    Date.parse(a.startsAt) - Date.parse(b.startsAt);

  if (!mood) return [...workouts].sort(byTime);

  const target = getMood(mood).rank;

  return [...workouts].sort((a, b) => {
    const tagged = Number(b.moods.includes(mood)) - Number(a.moods.includes(mood));
    if (tagged !== 0) return tagged;

    const fit =
      Math.abs(INTENSITY_RANK[a.intensity] - target) -
      Math.abs(INTENSITY_RANK[b.intensity] - target);
    if (fit !== 0) return fit;

    return byTime(a, b);
  });
}
