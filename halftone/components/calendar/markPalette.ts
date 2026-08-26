import type { MarkKind } from '../../data/types';
import type { TokenName } from '../../lib/tokens';

/**
 * The single source for what each calendar mark is coloured, shared by the
 * grid that paints the cells and the legend that explains them.
 *
 * They were separate lists first, and they disagreed: the grid filled today
 * with `chip` while the legend showed `muted` for it — a legend that names the
 * wrong colour is worse than no legend, and nothing in either file would have
 * caught the drift. Reading both from here makes the legend correct by
 * construction.
 */
export const MARK_FILL: Record<MarkKind, TokenName> = {
  today: 'muted',
  task: 'accent',
  project: 'accentDeep',
};

/** Legend copy, ordered as the comp orders it: today, then the two deadlines. */
export const MARK_LEGEND: { kind: MarkKind; label: string }[] = [
  { kind: 'today', label: "Today's date" },
  { kind: 'task', label: 'Task deadline' },
  { kind: 'project', label: 'Project deadline' },
];
