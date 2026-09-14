import type { MoodId } from './moods';

export type Category = 'gym' | 'yoga' | 'fitness' | 'run' | 'swim' | 'cycle' | 'dance' | 'tennis';
export type Intensity = 'low' | 'medium' | 'high';

/**
 * Key into `data/photos.ts`. Workouts name their photo rather than requiring it
 * directly, so the catalogue stays a plain data module that tests can import
 * without pulling the asset pipeline in behind it.
 */
export type PhotoKey =
  | 'power'
  | 'relax'
  | 'cycling'
  | 'balance'
  | 'gym'
  | 'functional'
  | 'dance'
  | 'tennis'
  | 'mobility'
  | 'stretch'
  | 'intervals'
  | 'recovery'
  | 'swim'
  | 'circuit'
  | 'pilates'
  | 'hiit';

export type Workout = {
  id: string;
  title: string;
  coach: string;
  category: Category;
  intensity: Intensity;
  /** ISO local timestamp. */
  startsAt: string;
  durationMin: number;
  photo: PhotoKey;
  /** Which moods this workout suits. Drives `matchWorkouts`. */
  moods: MoodId[];
  /** Display chips, as they read in the comps. */
  tags: string[];
  solo: boolean;
};

/**
 * Sessions are anchored to the current week rather than to the comps' fixed
 * December dates, so "Today" and "Tomorrow" stay truthful whenever the app is
 * opened. Resolved once at module load, so ordering is stable within a run.
 */
const TODAY = new Date();

function at(offsetDays: number, time: string): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offsetDays);
  const [h, m] = time.split(':');
  d.setHours(Number(h), Number(m), 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}:00`;
}

export const WORKOUTS: readonly Workout[] = [
  {
    id: 'full-body-power',
    title: 'Full body power workout',
    coach: 'Anna Sedon',
    category: 'gym',
    intensity: 'high',
    startsAt: at(0, '17:00'),
    durationMin: 45,
    photo: 'power',
    moods: ['energized', 'high'],
    tags: ['Energizing', 'Medium–High', 'Solo'],
    solo: true,
  },
  {
    id: 'yoga-deep-relaxation',
    title: 'Yoga for deep relaxation',
    coach: 'Maya Lindqvist',
    category: 'yoga',
    intensity: 'low',
    startsAt: at(0, '20:00'),
    durationMin: 50,
    photo: 'relax',
    moods: ['low', 'tense', 'calm'],
    tags: ['Calming', 'Low', 'Solo'],
    solo: true,
  },
  {
    id: 'cycling-cardio',
    title: 'Cycling for cardio',
    coach: 'Marco Reyes',
    category: 'cycle',
    intensity: 'medium',
    startsAt: at(1, '14:00'),
    durationMin: 60,
    photo: 'cycling',
    moods: ['balanced', 'energized'],
    tags: ['Energizing', 'Medium–High', 'Strength'],
    solo: false,
  },
  {
    id: 'yoga-balance',
    title: 'Yoga for balance',
    coach: 'Anna Sedon',
    category: 'yoga',
    intensity: 'low',
    startsAt: at(0, '07:30'),
    durationMin: 45,
    photo: 'balance',
    moods: ['calm', 'balanced'],
    tags: ['Grounding', 'Low', 'Solo'],
    solo: true,
  },
  {
    id: 'full-body-gym',
    title: 'Full body gym',
    coach: 'Daniel Moore',
    category: 'gym',
    intensity: 'medium',
    startsAt: at(0, '12:00'),
    durationMin: 60,
    photo: 'gym',
    moods: ['balanced', 'energized'],
    tags: ['Controlled', 'Medium', 'Strength'],
    solo: false,
  },
  {
    id: 'functional-fitness',
    title: 'Functional fitness',
    coach: 'Ryan Cooper',
    category: 'fitness',
    intensity: 'medium',
    startsAt: at(0, '16:00'),
    durationMin: 60,
    photo: 'functional',
    moods: ['balanced', 'energized'],
    tags: ['Full body', 'Medium', 'Group'],
    solo: false,
  },
  {
    id: 'dance-cardio',
    title: 'Dance cardio',
    coach: 'Sophia Martinez',
    category: 'dance',
    intensity: 'high',
    startsAt: at(0, '18:30'),
    durationMin: 45,
    photo: 'dance',
    moods: ['energized', 'high'],
    tags: ['Energizing', 'High', 'Group'],
    solo: false,
  },
  {
    id: 'tennis-training',
    title: 'Tennis training',
    coach: 'Alex Johnson',
    category: 'tennis',
    intensity: 'medium',
    startsAt: at(0, '19:30'),
    durationMin: 40,
    photo: 'tennis',
    moods: ['balanced', 'energized'],
    tags: ['Skill', 'Medium', 'Group'],
    solo: false,
  },
  {
    id: 'sunrise-mobility',
    title: 'Sunrise mobility flow',
    coach: 'Nina Alvarez',
    category: 'yoga',
    intensity: 'low',
    startsAt: at(1, '06:45'),
    durationMin: 30,
    photo: 'mobility',
    moods: ['low', 'tense', 'calm'],
    tags: ['Gentle', 'Low', 'Solo'],
    solo: true,
  },
  {
    id: 'deep-stretch',
    title: 'Deep stretch & release',
    coach: 'Nina Alvarez',
    category: 'yoga',
    intensity: 'low',
    startsAt: at(1, '19:00'),
    durationMin: 40,
    photo: 'stretch',
    moods: ['low', 'tense', 'calm'],
    tags: ['Release', 'Low', 'Solo'],
    solo: true,
  },
  {
    id: 'threshold-intervals',
    title: 'Threshold intervals',
    coach: 'Marco Reyes',
    category: 'run',
    intensity: 'high',
    startsAt: at(2, '07:00'),
    durationMin: 50,
    photo: 'intervals',
    moods: ['energized', 'high'],
    tags: ['Hard', 'High', 'Solo'],
    solo: true,
  },
  {
    id: 'recovery-run',
    title: 'Easy recovery run',
    coach: 'Lena Fischer',
    category: 'run',
    intensity: 'low',
    startsAt: at(2, '08:30'),
    durationMin: 35,
    photo: 'recovery',
    moods: ['low', 'calm'],
    tags: ['Easy', 'Low', 'Solo'],
    solo: true,
  },
  {
    id: 'open-water-swim',
    title: 'Open water swim',
    coach: 'Lena Fischer',
    category: 'swim',
    intensity: 'medium',
    startsAt: at(2, '12:30'),
    durationMin: 45,
    photo: 'swim',
    moods: ['tense', 'balanced'],
    tags: ['Release', 'Medium', 'Group'],
    solo: false,
  },
  {
    id: 'strength-circuit',
    title: 'Strength circuit',
    coach: 'Daniel Moore',
    category: 'gym',
    intensity: 'high',
    startsAt: at(2, '18:00'),
    durationMin: 55,
    photo: 'circuit',
    moods: ['energized', 'high'],
    tags: ['Strength', 'High', 'Group'],
    solo: false,
  },
  {
    id: 'pilates-core',
    title: 'Pilates core control',
    coach: 'Sophia Martinez',
    category: 'fitness',
    intensity: 'medium',
    startsAt: at(3, '09:00'),
    durationMin: 45,
    photo: 'pilates',
    moods: ['calm', 'balanced'],
    tags: ['Controlled', 'Medium', 'Solo'],
    solo: true,
  },
  {
    id: 'sprint-hiit',
    title: 'Sprint HIIT',
    coach: 'Ryan Cooper',
    category: 'fitness',
    intensity: 'high',
    startsAt: at(3, '18:15'),
    durationMin: 30,
    photo: 'hiit',
    moods: ['energized', 'high'],
    tags: ['Explosive', 'High', 'Group'],
    solo: false,
  },
] as const;
