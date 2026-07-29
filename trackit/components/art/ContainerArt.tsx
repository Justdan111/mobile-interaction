import Svg, { ClipPath, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

/**
 * The green shipping container on the featured card — three-quarter view with
 * the cargo doors facing front-left and the corrugated flank receding right.
 *
 * Everything is derived from six corner points, so the corrugation, locking
 * rods and rails all share one perspective. The card clips whatever runs past
 * its right edge, exactly as in the design.
 */

type P = { x: number; y: number };

const A: P = { x: 2, y: 45 }; // door face, far (left) top
const B: P = { x: 78, y: 9.3 }; // near corner, top
const C: P = { x: 78, y: 149.5 }; // near corner, bottom
const D: P = { x: 3, y: 141.5 }; // door face, far (left) bottom
const E: P = { x: 170, y: 65.2 }; // flank, far (right) top
const F: P = { x: 170, y: 127.6 }; // flank, far (right) bottom

const VB_W = 170;
const VB_H = 160;

const mix = (p: P, q: P, k: number): P => ({ x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k });
/** Point at (t along the flank, k down it). */
const flank = (t: number, k: number) => mix(mix(B, E, t), mix(C, F, t), k);
/** Point at (t across the door face, k down it). */
const door = (t: number, k: number) => mix(mix(A, B, t), mix(D, C, t), k);
const pts = (...p: P[]) => p.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(' ');
const seg = (a: P, b: P) => `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;

// Corrugation crowds together as the flank recedes into the distance.
const FLANK_RIBS = Array.from({ length: 36 }, (_, i) => Math.pow((i + 0.5) / 36, 0.68));
// The leaves are pressed too, but into a handful of broad panels rather than
// the fine corrugation of the flank.
const DOOR_RIBS = [0.11, 0.2, 0.29, 0.5, 0.6, 0.7, 0.8, 0.9];

// Two vertical locking rods per leaf.
const RODS = [0.155, 0.268, 0.639, 0.788];
const SEAM = 0.4;

export function ContainerArt({ width = 170, height = 160 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <Defs>
        <LinearGradient id="cFlank" x1="0" y1="0" x2="1" y2="0.3">
          <Stop offset="0" stopColor="#BCEDC3" />
          <Stop offset="0.22" stopColor="#87CE90" />
          <Stop offset="0.68" stopColor="#5AAC64" />
          <Stop offset="1" stopColor="#2E7A39" />
        </LinearGradient>
        <LinearGradient id="cDoor" x1="0.1" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor="#5CA26B" />
          <Stop offset="0.38" stopColor="#6DB77B" />
          <Stop offset="0.78" stopColor="#4A9157" />
          <Stop offset="1" stopColor="#245C2F" />
        </LinearGradient>
        <ClipPath id="cFlankClip">
          <Polygon points={pts(B, E, F, C)} />
        </ClipPath>
        <ClipPath id="cDoorClip">
          <Polygon points={pts(A, B, C, D)} />
        </ClipPath>
      </Defs>

      {/* ── corrugated flank ────────────────────────────────────────────── */}
      <Polygon points={pts(B, E, F, C)} fill="url(#cFlank)" />
      <G clipPath="url(#cFlankClip)">
        {FLANK_RIBS.map((t, i) => {
          const gap = (FLANK_RIBS[i + 1] ?? 1) - t;
          const w = Math.max(0.35, Math.min(1.15, gap * 26)); // narrows with perspective
          return (
            <G key={i}>
              <Path
                d={seg(flank(t, 0.02), flank(t, 0.98))}
                stroke="#124219"
                strokeWidth={w}
                opacity={0.46}
              />
              <Path
                d={seg(
                  flank(Math.max(0, t - gap * 0.42), 0.02),
                  flank(Math.max(0, t - gap * 0.42), 0.98)
                )}
                stroke="#F2FFF4"
                strokeWidth={w * 0.75}
                opacity={0.2}
              />
            </G>
          );
        })}
        {/* top rail runs the length of the flank, bottom rail sits in shadow */}
        <Polygon points={pts(B, E, flank(1, 0.035), flank(0, 0.02))} fill="#E9FFEE" opacity={0.32} />
        <Polygon points={pts(flank(0, 0.965), flank(1, 0.94), F, C)} fill="#12381A" opacity={0.6} />
      </G>

      {/* ── door face ───────────────────────────────────────────────────── */}
      <Polygon points={pts(A, B, C, D)} fill="url(#cDoor)" />
      <G clipPath="url(#cDoorClip)">
        {/* broad pressed panels on each leaf */}
        {DOOR_RIBS.map((t) => (
          <G key={t}>
            <Path
              d={seg(door(t, 0.05), door(t, 0.95))}
              stroke="#1E5326"
              strokeWidth={1}
              opacity={0.14}
            />
            <Path
              d={seg(door(t - 0.014, 0.05), door(t - 0.014, 0.95))}
              stroke="#EFFFF2"
              strokeWidth={0.8}
              opacity={0.09}
            />
          </G>
        ))}

        {/* horizontal press lines */}
        {[0.3, 0.6].map((k) => (
          <Path
            key={k}
            d={seg(door(0, k), door(1, k))}
            stroke="#1C4E24"
            strokeWidth={0.9}
            opacity={0.3}
          />
        ))}

        {/* seam between the two leaves */}
        <Path d={seg(door(SEAM - 0.012, 0), door(SEAM - 0.012, 1))} stroke="#E9FFEE" strokeWidth={1.1} opacity={0.55} />
        <Path d={seg(door(SEAM + 0.012, 0), door(SEAM + 0.012, 1))} stroke="#153F1C" strokeWidth={1.3} opacity={0.55} />

        {/* locking rods with cam keepers and a mid handle */}
        {RODS.map((t) => {
          const s = 0.6 + t * 0.5;
          return (
            <G key={t}>
              <Path
                d={seg(door(t + 0.005, 0.045), door(t + 0.005, 0.955))}
                stroke="#123A19"
                strokeWidth={1.7 * s}
                opacity={0.5}
              />
              <Path
                d={seg(door(t, 0.045), door(t, 0.955))}
                stroke="#DCF0E0"
                strokeWidth={0.85 * s}
                opacity={0.72}
              />
              {[0.16, 0.5, 0.86].map((k) => {
                const q = door(t, k);
                const w = (k === 0.5 ? 2.9 : 2.2) * s;
                const h = (k === 0.5 ? 2.5 : 1.9) * s;
                return (
                  <Rect
                    key={k}
                    x={q.x - w / 2}
                    y={q.y - h / 2}
                    width={w}
                    height={h}
                    rx={0.6}
                    fill="#D8EEDC"
                    stroke="#123A19"
                    strokeWidth={0.35}
                    opacity={0.95}
                  />
                );
              })}
            </G>
          );
        })}

        {/* hinges down the outer edge of the left leaf */}
        {[0.12, 0.3, 0.48, 0.66, 0.84].map((k) => {
          const q = door(0.025, k);
          return (
            <Rect
              key={k}
              x={q.x - 1.2}
              y={q.y - 1.9}
              width={2.9}
              height={3.8}
              rx={0.8}
              fill="#CDE8D2"
              stroke="#123A19"
              strokeWidth={0.35}
              opacity={0.8}
            />
          );
        })}

        {/* head + base rails across the doors */}
        <Polygon points={pts(door(0, 0), door(1, 0), door(1, 0.045), door(0, 0.045))} fill="#D9F2DE" opacity={0.4} />
        <Polygon points={pts(door(0, 0.95), door(1, 0.95), door(1, 1), door(0, 1))} fill="#123A19" opacity={0.6} />
      </G>

      {/* ── roof sliver + corner posts ──────────────────────────────────── */}
      <Polygon
        points={pts(A, B, { x: B.x, y: B.y - 1.4 }, { x: A.x + 0.7, y: A.y - 1.1 })}
        fill="#D8F3DE"
        opacity={0.55}
      />
      {/* near corner post — a narrow bright column, shaded on the door side */}
      <Polygon
        points={pts({ x: B.x - 0.6, y: B.y }, { x: B.x + 0.8, y: B.y }, { x: C.x + 0.8, y: C.y }, { x: C.x - 0.6, y: C.y })}
        fill="#D3EDD9"
        opacity={0.8}
      />
      <Path d={seg({ x: B.x + 1.5, y: B.y }, { x: C.x + 1.5, y: C.y })} stroke="#164320" strokeWidth={0.9} opacity={0.35} />
      <Path d={seg(A, D)} stroke="#C6E9CE" strokeWidth={0.9} opacity={0.35} />

      {/* corner castings on the near post */}
      {[
        { y: B.y + 0.5 },
        { y: C.y - 5.5 },
      ].map((q, i) => (
        <Rect key={i} x={B.x - 2.8} y={q.y} width={4.4} height={4.6} rx={0.9} fill="#F2FFF5" opacity={0.7} />
      ))}
    </Svg>
  );
}
