/**
 * Decides whether the floating tab bar should be collapsed to icons, given a
 * scroll position and where it was a moment ago. Kept apart from the animation
 * so the rule is plain arithmetic and can be tested on its own.
 */

/** Scroll past this before collapsing, so the bar survives a short list. */
export const COLLAPSE_AFTER = 24;

/**
 * A finger resting on a list emits alternating one- and two-point deltas.
 * Without a dead zone the bar flickers for as long as it is touched.
 */
export const DIRECTION_DEAD_ZONE = 6;

export function shouldCollapse({
  offset,
  previousOffset,
  collapsed,
}: {
  offset: number;
  previousOffset: number;
  collapsed: boolean;
}): boolean {
  // Near the top the bar is always full, or a list scrolled home sits collapsed.
  if (offset <= COLLAPSE_AFTER) return false;

  // Rubber-banding past the end keeps reporting growth after content stops.
  const delta = offset - previousOffset;
  if (Math.abs(delta) <= DIRECTION_DEAD_ZONE) return collapsed;

  return delta > 0;
}
