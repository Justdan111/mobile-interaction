import { matchWorkouts } from '../lib/mood-match';
import { WORKOUTS } from '../data/workouts';
import { MOODS, getMood } from '../data/moods';

describe('MOODS', () => {
  it('runs low to high with contiguous ranks', () => {
    expect(MOODS.map((m) => m.id)).toEqual([
      'low',
      'tense',
      'calm',
      'balanced',
      'energized',
      'high',
    ]);
    expect(MOODS.map((m) => m.rank)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('keeps the three blurbs transcribed from the comps verbatim', () => {
    expect(getMood('calm').blurb).toBe(
      'You feel relaxed and grounded. Looking for mindful movement.'
    );
    expect(getMood('balanced').blurb).toBe(
      'You focused. A good moment for controlled, full-body training.'
    );
    expect(getMood('energized').blurb).toBe(
      'You feel active. Time for dynamic workouts and higher intensity.'
    );
  });

  it('gives every mood a distinct surface colour', () => {
    const surfaces = MOODS.map((m) => m.surface);
    expect(new Set(surfaces).size).toBe(MOODS.length);
  });
});

describe('matchWorkouts', () => {
  it('returns every workout regardless of mood', () => {
    for (const m of MOODS) {
      expect(matchWorkouts(WORKOUTS, m.id)).toHaveLength(WORKOUTS.length);
    }
  });

  it('puts workouts tagged for the mood ahead of untagged ones', () => {
    const out = matchWorkouts(WORKOUTS, 'calm');
    const lastTagged = out.map((w) => w.moods.includes('calm')).lastIndexOf(true);
    const firstUntagged = out.map((w) => w.moods.includes('calm')).indexOf(false);
    expect(lastTagged).toBeLessThan(firstUntagged);
  });

  it('orders low-energy moods toward low intensity', () => {
    expect(matchWorkouts(WORKOUTS, 'low')[0].intensity).toBe('low');
  });

  it('orders high-energy moods toward high intensity', () => {
    expect(matchWorkouts(WORKOUTS, 'high')[0].intensity).toBe('high');
  });

  it('falls back to chronological order with no mood', () => {
    const times = matchWorkouts(WORKOUTS, null).map((w) => Date.parse(w.startsAt));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('is a pure function — does not mutate its input', () => {
    const before = WORKOUTS.map((w) => w.id);
    matchWorkouts(WORKOUTS, 'energized');
    expect(WORKOUTS.map((w) => w.id)).toEqual(before);
  });

  it('is stable — the same mood always gives the same order', () => {
    expect(matchWorkouts(WORKOUTS, 'balanced').map((w) => w.id)).toEqual(
      matchWorkouts(WORKOUTS, 'balanced').map((w) => w.id)
    );
  });

  it('gives every mood at least three tagged workouts to recommend', () => {
    for (const m of MOODS) {
      expect(WORKOUTS.filter((w) => w.moods.includes(m.id)).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('handles an empty catalogue', () => {
    expect(matchWorkouts([], 'calm')).toEqual([]);
  });
});
