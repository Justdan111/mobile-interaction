/**
 * Decides whether the floating tab bar should be collapsed to icons, given a
 * scroll position and where it was a moment ago.
 *
 * This lives apart from the animation on purpose. Reanimated is mocked under
 * Jest, so nothing about the bar's movement is observable in a test — but the
 * rule that governs *when* it moves is ordinary arithmetic, and that is the
 * part with edge cases worth pinning down.
 */

/** Scroll past this before collapsing, so the bar survives a short list. */
export const COLLAPSE_AFTER = 24;

/**
 * A scroll must change direction by more than this before the bar reacts. A
 * finger resting on a list emits a stream of one- and two-point deltas in
 * alternating directions; without a dead zone the bar flickers between its two
 * sizes for as long as it is touched.
 */
export const DIRECTION_DEAD_ZONE = 6;

export function shouldCollapse({
  offset,
  previousOffset,
  collapsed,
}: {
  /** Current vertical content offset. */
  offset: number;
  /** The offset at the previous scroll event. */
  previousOffset: number;
  /** Whether the bar is collapsed right now. */
  collapsed: boolean;
}): boolean {
  // Near the top the bar is always its full self, whatever the direction —
  // otherwise a list scrolled to the very top can sit there collapsed.
  if (offset <= COLLAPSE_AFTER) return false;

  // Rubber-banding past the end reports offsets that keep growing after the
  // content has stopped; treat only real movement as a direction.
  const delta = offset - previousOffset;
  if (Math.abs(delta) <= DIRECTION_DEAD_ZONE) return collapsed;

  return delta > 0;
}
