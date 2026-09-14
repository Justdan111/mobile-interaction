export type GoalSource = 'steps' | 'sessions';

export type Goal = {
  id: string;
  title: string;
  /** e.g. "3x per week", "Every day" — shown beside the clock icon. */
  cadence: string;
  /** e.g. "Jan 26", "Never" — shown beside the flag icon. */
  deadline: string;
  /** What counts toward this goal. */
  source: GoalSource;
  target: number;
};

/** The two goals shown in journey-activity.png, plus one more to fill the list. */
export const GOALS: readonly Goal[] = [
  {
    id: 'yoga-balance',
    title: 'Feel more balanced with yoga',
    cadence: '3x per week',
    deadline: 'Jan 26',
    source: 'sessions',
    target: 3,
  },
  {
    id: 'daily-steps',
    title: '5,000 steps per day',
    cadence: 'Every day',
    deadline: 'Never',
    source: 'steps',
    target: 5000,
  },
] as const;
