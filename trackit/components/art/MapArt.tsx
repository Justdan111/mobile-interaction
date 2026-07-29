import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * The night-mode chart behind Live tracking: near-black water, slate landmasses
 * and a faint aurora across the top. Coordinates are design points, so the
 * markers laid over it can use the same numbers.
 */

export const MAP_W = 393;
export const MAP_H = 430;

/** The shipping lane the parcel is following, in map coordinates. */
export const ROUTE_D = 'M132 262 C 170 264, 202 274, 233 289 S 292 330, 345 368';

export const ORIGIN = { x: 116, y: 254 };
export const WAYPOINT = { x: 257, y: 300 };

export function MapArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <Defs>
        <RadialGradient id="aurora" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#2F6B45" stopOpacity={0.62} />
          <Stop offset="1" stopColor="#2F6B45" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="auroraB" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#265C3C" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#265C3C" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="#1F1F1F" />

      {/* aurora smeared across the top of the chart */}
      <Ellipse cx={250} cy={10} rx={190} ry={78} fill="url(#aurora)" />
      <Ellipse cx={360} cy={70} rx={120} ry={90} fill="url(#auroraB)" />

      {/* ── landmasses ─────────────────────────────────────────────────── */}
      <G fill="#292929">
        {/* the mainland sweeping across the top of the chart */}
        <Path d="M-20 52 C 40 44, 92 60, 132 58 C 168 56, 190 70, 224 68 C 262 66, 288 82, 322 78 C 356 74, 386 88, 413 84 L413 122 C 380 130, 352 120, 322 126 C 288 133, 262 122, 226 128 C 192 134, 168 122, 134 128 C 96 135, 58 122, -20 132 Z" />
        {/* the long peninsula reaching down to the south-west */}
        <Path d="M228 126 C 250 130, 262 134, 258 142 C 250 154, 210 160, 176 168 C 140 177, 104 186, 66 192 C 34 197, 4 204, -20 210 L-20 188 C 20 180, 62 172, 100 164 C 140 156, 186 144, 214 132 Z" />
        {/* the cape the origin pin sits on */}
        <Path d="M132 182 C 152 178, 164 180, 158 190 C 150 202, 116 210, 84 216 C 52 222, 18 230, -20 238 L-20 218 C 20 210, 60 202, 92 195 C 112 190, 124 186, 132 182 Z" />
      </G>
      <G fill="#232323">
        {/* offshore shelf + islands */}
        <Path d="M292 152 C 312 146, 336 144, 356 152 C 370 158, 362 168, 340 172 C 318 176, 296 170, 292 162 Z" />
        <Path d="M44 262 C 60 256, 84 256, 94 264 C 100 270, 86 278, 66 278 C 50 278, 40 270, 44 262 Z" />
        <Path d="M302 198 C 316 192, 336 192, 344 198 C 350 204, 336 212, 318 210 C 306 209, 298 204, 302 198 Z" />
        <Path d="M-20 394 C 60 384, 140 382, 214 394 C 288 406, 350 392, 413 400 L413 430 L-20 430 Z" />
      </G>

      {/* faint inland roads */}
      <G stroke="#343434" strokeWidth={1} fill="none">
        <Path d="M40 128 C 110 148, 176 148, 236 124" />
        <Path d="M148 128 C 178 146, 208 156, 246 142" />
        <Path d="M224 68 C 244 92, 268 108, 316 124" strokeDasharray="3 4" />
      </G>
    </Svg>
  );
}

/** The tug pulling the container ship along the lane. */
export function TugBoat({ width = 82, height = 60 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 110 80">
      <Defs>
        <RadialGradient id="tbHull" cx="0.3" cy="0.2" r="0.9">
          <Stop offset="0" stopColor="#5E86C6" />
          <Stop offset="1" stopColor="#2E4E86" />
        </RadialGradient>
        <RadialGradient id="tbCabin" cx="0.3" cy="0.2" r="0.9">
          <Stop offset="0" stopColor="#7FA3D8" />
          <Stop offset="1" stopColor="#3D629E" />
        </RadialGradient>
      </Defs>

      {/* hull */}
      <Path d="M10 50 L104 46 96 68 a10 10 0 0 1 -8 5 H28 a12 12 0 0 1 -10 -6 Z" fill="url(#tbHull)" />
      <Path d="M10 50 L104 46 103 52 L11 56 Z" fill="#DDE7F5" />
      {/* bow rail */}
      <Path d="M8 34 L18 50" stroke="#CFDCEE" strokeWidth={3} strokeLinecap="round" />
      <Path d="M8 34 L30 44" stroke="#CFDCEE" strokeWidth={2.2} strokeLinecap="round" />

      {/* deck house */}
      <Path d="M50 20 h34 a6 6 0 0 1 6 6 v20 H44 V26 a6 6 0 0 1 6 -6 z" fill="url(#tbCabin)" />
      <Rect x={52} y={27} width={9} height={8} rx={2} fill="#DCE8F7" />
      <Rect x={66} y={27} width={9} height={8} rx={2} fill="#DCE8F7" />
      <Rect x={80} y={27} width={7} height={8} rx={2} fill="#DCE8F7" />

      {/* wheelhouse + mast */}
      <Path d="M60 6 h18 a5 5 0 0 1 5 5 v9 H55 v-9 a5 5 0 0 1 5 -5 z" fill="#89ABDD" />
      <Rect x={62} y={10} width={16} height={6} rx={2} fill="#E4EDF9" />
      <Path d="M69 6 V0" stroke="#CFDCEE" strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={69} cy={0.5} r={3} fill="#E4EDF9" />
      <Path d="M92 22 V8" stroke="#A9C2E5" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={92} cy={6} r={2.6} fill="#DCE8F7" />

      {/* wake */}
      <Path
        d="M4 70 q8 -5 16 0 t16 0"
        stroke="#8FB4E4"
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}
