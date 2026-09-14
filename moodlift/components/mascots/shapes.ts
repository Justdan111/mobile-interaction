/**
 * Head-shape geometry for the mascots.
 *
 * The comps draw each mood as a flat, slightly irregular paper shape. Computing
 * the points rather than hand-plotting them keeps the spikes even and lets a
 * shape be retuned by changing one number instead of thirty coordinates.
 */

export type Point = [number, number];

const rad = (deg: number) => (deg * Math.PI) / 180;

function toPath(points: Point[], close = true): string {
  const [first, ...rest] = points;
  return (
    `M${first[0].toFixed(2)} ${first[1].toFixed(2)}` +
    rest.map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('') +
    (close ? 'Z' : '')
  );
}

/**
 * A star alternating between an outer and inner radius.
 *
 * `jitter` nudges each outer point in or out by up to that fraction, using a
 * fixed sequence rather than Math.random so the shape is identical on every
 * render — an unsteady mascot would be a distracting bug, not charm.
 */
export function starPath(
  spikes: number,
  outer: number,
  inner: number,
  cx: number,
  cy: number,
  rotation = -90,
  jitter = 0
): string {
  const JITTER_SEQ = [0.0, 0.6, -0.35, 0.85, -0.7, 0.25, -0.9, 0.45, 0.1, -0.55];
  const points: Point[] = [];

  for (let i = 0; i < spikes * 2; i++) {
    const isOuter = i % 2 === 0;
    const wobble = isOuter ? JITTER_SEQ[(i / 2) % JITTER_SEQ.length] * jitter : 0;
    const r = (isOuter ? outer : inner) * (1 + wobble);
    const angle = rad(rotation + (180 / spikes) * i);
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  return toPath(points);
}

/** A regular polygon — the Calm mascot's hexagon head. */
export function polygonPath(
  sides: number,
  r: number,
  cx: number,
  cy: number,
  rotation = -90
): string {
  const points: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rad(rotation + (360 / sides) * i);
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return toPath(points);
}

/**
 * A ring of overlapping lobes — the Balanced mascot's clover head. Each lobe is
 * a full circle, so the union reads as one soft shape rather than a flower.
 */
export function cloverPath(
  lobes: number,
  lobeR: number,
  spread: number,
  cx: number,
  cy: number,
  rotation = -90
): string {
  let d = '';
  for (let i = 0; i < lobes; i++) {
    const angle = rad(rotation + (360 / lobes) * i);
    const x = cx + spread * Math.cos(angle);
    const y = cy + spread * Math.sin(angle);
    d +=
      `M${(x - lobeR).toFixed(2)} ${y.toFixed(2)}` +
      `a${lobeR} ${lobeR} 0 1 0 ${lobeR * 2} 0` +
      `a${lobeR} ${lobeR} 0 1 0 ${-lobeR * 2} 0Z`;
  }
  return d;
}

/**
 * A closed blob built from smooth cubic segments, with each radius scaled by
 * `weights` — used for the sagging Low energy head.
 */
export function blobPath(
  weights: number[],
  r: number,
  cx: number,
  cy: number,
  rotation = -90
): string {
  const n = weights.length;
  const pts: Point[] = weights.map((w, i) => {
    const angle = rad(rotation + (360 / n) * i);
    return [cx + r * w * Math.cos(angle), cy + r * w * Math.sin(angle)];
  });

  // Catmull-Rom through the points, converted to cubic Béziers, so the outline
  // stays closed and smooth however the weights are tuned.
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d +=
      `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)},` +
      `${c2[0].toFixed(2)} ${c2[1].toFixed(2)},` +
      `${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d}Z`;
}

/**
 * A capsule outline from p1 to p2 — the mascots' limbs.
 *
 * The comps draw arms as thin unfilled tubes, not single strokes; a stroked
 * line reads as wire and is what makes a limb look detached from the body.
 * Both end caps sweep 0: with the normal taken as (-uy, ux), sweep 1 bulges
 * the cap back into the capsule instead of out past the endpoint.
 */
export function capsulePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * r;
  const ny = (dx / len) * r;

  const f = (n: number) => n.toFixed(2);
  return (
    `M${f(x1 + nx)} ${f(y1 + ny)}` +
    `L${f(x2 + nx)} ${f(y2 + ny)}` +
    `A${r} ${r} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)}` +
    `L${f(x1 - nx)} ${f(y1 - ny)}` +
    `A${r} ${r} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)}Z`
  );
}
