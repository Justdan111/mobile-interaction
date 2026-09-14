export type MoodId = 'low' | 'tense' | 'calm' | 'balanced' | 'energized' | 'high';

export type Mood = {
  id: MoodId;
  /** Wheel label, as it reads in the comps. */
  label: string;
  /** Position on the energy scale, 1 (lowest) to 6 (highest). */
  rank: 1 | 2 | 3 | 4 | 5 | 6;
  /** The mood card's background. */
  surface: string;
  /** Text and line work drawn on `surface`. */
  onSurface: string;
  /** The muted wheel labels either side of the selection. */
  mutedOnSurface: string;
  /** The blurb pill sitting on `surface`. */
  blurbSurface: string;
  /** The mascot's body fill. */
  mascotFill: string;
  blurb: string;
};

/**
 * Ordered low energy → high energy; the wheel scrolls in this order.
 *
 * Calm, Balanced and Energized are transcribed from the comps — surface
 * colour, mascot and blurb all come from `.design/comps/mood-*.png`, and the
 * three blurbs are verbatim. The remaining three complete the ramp: it runs
 * dim violet → clay → sage → blue → purple and lands on the brand coral.
 */
export const MOODS: readonly Mood[] = [
  {
    id: 'low',
    label: 'Low energy',
    rank: 1,
    surface: '#4A4660',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.45)',
    blurbSurface: 'rgba(255,255,255,0.14)',
    mascotFill: '#8E86B8',
    blurb: 'Running on empty. Something gentle, and short.',
  },
  {
    id: 'tense',
    label: 'Tense',
    rank: 2,
    surface: '#8B4A3F',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.45)',
    blurbSurface: 'rgba(255,255,255,0.14)',
    mascotFill: '#E8A48C',
    blurb: 'Wound tight. Time to shake it loose and release.',
  },
  {
    id: 'calm',
    label: 'Calm',
    rank: 3,
    surface: '#5F7359',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.45)',
    blurbSurface: 'rgba(255,255,255,0.14)',
    mascotFill: '#F0A8C8',
    blurb: 'You feel relaxed and grounded. Looking for mindful movement.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    rank: 4,
    surface: '#3D5A99',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.45)',
    blurbSurface: 'rgba(255,255,255,0.16)',
    mascotFill: '#8CC08A',
    blurb: 'You focused. A good moment for controlled, full-body training.',
  },
  {
    id: 'energized',
    label: 'Energized',
    rank: 5,
    surface: '#8B4A9C',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.45)',
    blurbSurface: 'rgba(255,255,255,0.16)',
    mascotFill: '#F2C230',
    blurb: 'You feel active. Time for dynamic workouts and higher intensity.',
  },
  {
    id: 'high',
    label: 'High energy',
    rank: 6,
    surface: '#E8724C',
    onSurface: '#FFFFFF',
    mutedOnSurface: 'rgba(255,255,255,0.5)',
    blurbSurface: 'rgba(255,255,255,0.18)',
    mascotFill: '#FFD84D',
    blurb: "Everything's firing. Go hard and spend it.",
  },
] as const;

const BY_ID = new Map(MOODS.map((m) => [m.id, m]));

export function getMood(id: MoodId): Mood {
  const mood = BY_ID.get(id);
  if (!mood) throw new Error(`Unknown mood: ${id}`);
  return mood;
}
