import { hashSeed, makeRandom } from '../../lib/seed';

export const FIELD_NAMES = ['sphere', 'wave', 'blob', 'orbit'] as const;
export type FieldName = (typeof FIELD_NAMES)[number];

export type Dot = { x: number; y: number; r: number };

export type DotOptions = {
  /** Canvas width and height in px. */
  size: number;
  /** Grid cells per axis. Higher is denser and finer. */
  density: number;
  /** Any string; the same string always yields the same art. */
  seed: string;
  /** Largest dot radius in px. Defaults to half a cell. */
  maxRadius?: number;
  /** Positional wobble as a fraction of cell size. 0 is a rigid grid. */
  jitter?: number;
};

/** Smooth falloff, 1 at the centre of a lobe, 0 at its edge. */
function lobe(nx: number, ny: number, cx: number, cy: number, radius: number): number {
  const d = Math.hypot(nx - cx, ny - cy) / radius;
  return d >= 1 ? 0 : Math.cos((d * Math.PI) / 2) ** 1.6;
}

/**
 * Field intensity in [0, 1] at normalized coords, both in [-1, 1].
 * Each variant is a distinct silhouette from the reference comps.
 * Exported so the four fields can be compared directly, since generateDots
 * layers per-variant noise (grain) that masks intensity differences.
 */
export function intensity(name: FieldName, nx: number, ny: number): number {
  switch (name) {
    case 'sphere': {
      // Two offset lobes with a hollow core — the yin-yang plate.
      const outer = Math.hypot(nx, ny);
      if (outer > 1) return 0;
      const top = lobe(nx, ny, 0.28, -0.34, 0.78);
      const bottom = lobe(nx, ny, -0.28, 0.36, 0.82);
      const core = 1 - lobe(nx, ny, 0, 0, 0.3);
      return Math.min(1, (top + bottom) * core);
    }
    case 'wave': {
      // Stacked sine bands that beat against each other into moiré.
      const a = Math.sin(ny * 7 + Math.sin(nx * 3) * 1.6);
      const b = Math.sin(ny * 11 - nx * 2.2);
      const v = (a * 0.65 + b * 0.35 + 1) / 2;
      const edge = 1 - Math.max(0, Math.abs(nx) - 0.85) / 0.15;
      return Math.max(0, v * Math.min(1, edge));
    }
    case 'blob': {
      // Metaball cluster — organic, asymmetric.
      const centres: Array<[number, number, number]> = [
        [-0.42, -0.28, 0.62],
        [0.36, -0.14, 0.7],
        [-0.1, 0.44, 0.66],
        [0.5, 0.42, 0.44],
      ];
      let sum = 0;
      for (const [cx, cy, r] of centres) sum += lobe(nx, ny, cx, cy, r);
      return Math.min(1, sum * 0.85);
    }
    case 'orbit': {
      // Full disc eclipsed by an offset crescent.
      const disc = lobe(nx, ny, 0, 0, 0.98);
      const eclipse = lobe(nx, ny, 0.46, -0.3, 0.6);
      return Math.max(0, disc - eclipse * 0.95);
    }
  }
}

const MIN_VISIBLE_RADIUS = 0.35;

export function generateDots(name: FieldName, opts: DotOptions): Dot[] {
  const { size, density, seed } = opts;
  const cell = size / density;
  const maxRadius = opts.maxRadius ?? cell / 2;
  const jitter = opts.jitter ?? 0.35;
  const rand = makeRandom(hashSeed(`${seed}:${name}`));

  const dots: Dot[] = [];
  for (let row = 0; row < density; row++) {
    for (let col = 0; col < density; col++) {
      const cxPx = (col + 0.5) * cell;
      const cyPx = (row + 0.5) * cell;
      const nx = (cxPx / size) * 2 - 1;
      const ny = (cyPx / size) * 2 - 1;

      const v = intensity(name, nx, ny);
      // Consume randomness on every cell so the sequence stays aligned
      // regardless of which cells end up visible.
      const wobbleX = (rand() - 0.5) * jitter * cell;
      const wobbleY = (rand() - 0.5) * jitter * cell;
      const grain = 0.88 + rand() * 0.24;

      const r = clamp(v * grain * maxRadius, 0, maxRadius);
      if (r < MIN_VISIBLE_RADIUS) continue;

      dots.push({
        x: clamp(cxPx + wobbleX, 0, size),
        y: clamp(cyPx + wobbleY, 0, size),
        r,
      });
    }
  }
  return dots;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
