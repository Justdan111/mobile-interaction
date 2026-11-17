/**
 * The Map tab's city, generated rather than tiled. The map is a
 * stylised old-town plan (thin pale streets, a few broad dark avenues, one
 * labelled street) that no live map style reproduces, and drawing it as SVG
 * keeps the app runnable in Expo Go with no API key.
 *
 * Seeded, so the city is identical on every launch and pins can be placed
 * against it by hand.
 */
export const WORLD = { width: 900, height: 1300 } as const;

type Pt = [number, number];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Low-frequency wobble so streets bend the way old streets do. */
function wobble(r: () => number) {
  const a1 = r() * 14 + 4;
  const f1 = 0.004 + r() * 0.006;
  const p1 = r() * Math.PI * 2;
  const a2 = r() * 9;
  const f2 = 0.012 + r() * 0.01;
  const p2 = r() * Math.PI * 2;
  return (t: number) => a1 * Math.sin(t * f1 + p1) + a2 * Math.sin(t * f2 + p2);
}

function toPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  // Quadratic smoothing through midpoints: every vertex becomes a gentle bend.
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const mx = (x + pts[i + 1][0]) / 2;
    const my = (y + pts[i + 1][1]) / 2;
    d += `Q${x.toFixed(1)} ${y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d}L${lx.toFixed(1)} ${ly.toFixed(1)}`;
}

export type City = {
  /** All minor streets as one path: thin pale lines. */
  minor: string;
  /** Broad dark avenues, drawn underneath. */
  major: string;
  /** The avenue the street name runs along. */
  labelled: string;
  labelName: string;
};

export function buildCity(seed = 7): City {
  const r = rng(seed);
  const { width: W, height: H } = WORLD;
  const segments: string[] = [];

  // Two families of streets, each slightly rotated from the axes and broken
  // into random runs, so blocks come out irregular rather than gridded.
  const family = (count: number, along: number, across: number, skew: number, horizontal: boolean) => {
    const gap = across / count;
    for (let i = 0; i <= count; i++) {
      const base = i * gap + (r() - 0.5) * gap * 0.5;
      const wob = wobble(r);
      let run: Pt[] = [];
      for (let t = -40; t <= along + 40; t += 30) {
        const off = base + wob(t) + (t - along / 2) * skew;
        const pt: Pt = horizontal ? [t, off] : [off, t];
        run.push(pt);
        // End this run and maybe skip a block: a street that stops at a
        // junction is what makes a plan read as a real neighbourhood.
        if (run.length > 2 && r() < 0.16) {
          segments.push(toPath(run));
          run = [];
          if (r() < 0.55) t += 30 + r() * 90;
        }
      }
      segments.push(toPath(run));
    }
  };

  family(26, W, H, 0.12, true);
  family(19, H, W, -0.18, false);

  // Short connector lanes inside blocks.
  for (let i = 0; i < 190; i++) {
    const x = r() * W;
    const y = r() * H;
    const a = r() * Math.PI;
    const len = 18 + r() * 40;
    segments.push(toPath([[x, y], [x + Math.cos(a) * len, y + Math.sin(a) * len]]));
  }

  const labelled = toPath([[-40, 330], [200, 340], [330, 395], [520, 450], [700, 505], [940, 560]]);
  const avenues = [
    toPath([[60, -40], [90, 150], [150, 240], [200, 340]]),
    toPath([[940, 820], [760, 900], [600, 1010], [470, 1150], [420, 1340]]),
    toPath([[-40, 980], [140, 1000], [260, 1080], [330, 1340]]),
    toPath([[520, 450], [560, 640], [600, 1010]]),
  ];

  return {
    minor: segments.filter(Boolean).join(''),
    major: [labelled, ...avenues].join(''),
    labelled,
    labelName: 'Groove Street',
  };
}
