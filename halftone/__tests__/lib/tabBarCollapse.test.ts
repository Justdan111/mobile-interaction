import {
  COLLAPSE_AFTER,
  DIRECTION_DEAD_ZONE,
  shouldCollapse,
} from '../../lib/tabBarCollapse';

/** Feeds a run of offsets through the rule the way a scroll would. */
function run(offsets: number[], collapsed = false): boolean {
  let state = collapsed;
  let previous = offsets[0];
  for (const offset of offsets.slice(1)) {
    state = shouldCollapse({ offset, previousOffset: previous, collapsed: state });
    previous = offset;
  }
  return state;
}

describe('shouldCollapse near the top', () => {
  it('stays expanded at rest', () => {
    expect(shouldCollapse({ offset: 0, previousOffset: 0, collapsed: false })).toBe(false);
  });

  it('stays expanded while still within the threshold', () => {
    expect(shouldCollapse({ offset: COLLAPSE_AFTER, previousOffset: 0, collapsed: false })).toBe(false);
  });

  // Without this a list can be scrolled to the very top and sit there collapsed,
  // because the last direction seen was downward.
  it('expands again on returning to the top, even while collapsed', () => {
    expect(shouldCollapse({ offset: 4, previousOffset: 400, collapsed: true })).toBe(false);
  });
});

describe('shouldCollapse direction', () => {
  it('collapses on a real downward scroll past the threshold', () => {
    expect(shouldCollapse({ offset: 200, previousOffset: 100, collapsed: false })).toBe(true);
  });

  it('expands on a real upward scroll', () => {
    expect(shouldCollapse({ offset: 100, previousOffset: 200, collapsed: true })).toBe(false);
  });

  it('collapses part-way down a long list and stays there while scrolling on', () => {
    expect(run([0, 60, 200, 400, 800])).toBe(true);
  });

  it('expands again as soon as the user scrolls back up', () => {
    expect(run([0, 200, 600, 400])).toBe(false);
  });
});

describe('shouldCollapse dead zone', () => {
  // A finger resting on a list emits a stream of tiny alternating deltas. With
  // no dead zone the bar changes size on every one of them.
  it('ignores a jitter smaller than the dead zone', () => {
    expect(shouldCollapse({ offset: 300, previousOffset: 300 - DIRECTION_DEAD_ZONE, collapsed: true })).toBe(true);
    expect(shouldCollapse({ offset: 300, previousOffset: 300 + DIRECTION_DEAD_ZONE, collapsed: false })).toBe(false);
  });

  it('holds its state through a run of jitter in both directions', () => {
    const jitter = [300, 302, 299, 303, 300, 301, 298];
    expect(run(jitter, true)).toBe(true);
    expect(run(jitter, false)).toBe(false);
  });

  // The dead zone must not swallow a genuine flick — one point past it counts.
  it('still reacts one point beyond the dead zone', () => {
    expect(
      shouldCollapse({ offset: 300, previousOffset: 300 - (DIRECTION_DEAD_ZONE + 1), collapsed: false })
    ).toBe(true);
    expect(
      shouldCollapse({ offset: 300, previousOffset: 300 + (DIRECTION_DEAD_ZONE + 1), collapsed: true })
    ).toBe(false);
  });
});

describe('shouldCollapse is a pure function of its inputs', () => {
  it('returns the same answer for the same arguments', () => {
    const args = { offset: 250, previousOffset: 100, collapsed: false };
    expect(shouldCollapse(args)).toBe(shouldCollapse(args));
  });

  it('does not collapse on a zero-delta event', () => {
    expect(shouldCollapse({ offset: 500, previousOffset: 500, collapsed: false })).toBe(false);
    expect(shouldCollapse({ offset: 500, previousOffset: 500, collapsed: true })).toBe(true);
  });
});
