/**
 * Two-column masonry: each item goes into whichever column is currently
 * shorter, ties to the left. Heights are passed in, so this stays a pure
 * function of the feed order.
 */
export type Placed<T> = { item: T; column: 0 | 1; top: number; height: number };

export function masonry<T>(items: T[], heightOf: (item: T) => number, gap: number): {
  placed: Placed<T>[];
  height: number;
} {
  const bottoms: [number, number] = [0, 0];
  const placed = items.map((item) => {
    const column: 0 | 1 = bottoms[1] < bottoms[0] ? 1 : 0;
    const height = heightOf(item);
    const top = bottoms[column];
    bottoms[column] = top + height + gap;
    return { item, column, top, height };
  });
  return { placed, height: Math.max(0, Math.max(...bottoms) - gap) };
}
