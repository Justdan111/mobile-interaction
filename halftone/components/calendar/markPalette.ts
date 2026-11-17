import type { MarkKind } from '../../data/types';
import type { TokenName } from '../../lib/tokens';

/**
 * The single source for what each calendar mark is coloured, shared by the
 * grid that paints the cells and the legend that explains them, so the two
 * cannot drift apart.
 */
export const MARK_FILL: Record<MarkKind, TokenName> = {
  today: 'muted',
  task: 'accent',
  project: 'accentDeep',
};

/** Legend copy: today, then the two deadlines. */
export const MARK_LEGEND: { kind: MarkKind; label: string }[] = [
  { kind: 'today', label: "Today's date" },
  { kind: 'task', label: 'Task deadline' },
  { kind: 'project', label: 'Project deadline' },
];
