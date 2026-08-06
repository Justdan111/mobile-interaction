import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

/**
 * The vector half of the onboarding scene: the vermilion sun and the pine
 * leaning in from the right edge. The ridges behind them are a rendered ink
 * wash, composited underneath this by the screen.
 *
 * Both live in one 320×300 viewBox so the sun and the pine keep their
 * relationship to each other however the art is scaled.
 */
export function SumiLandscape({
  width,
  height,
  sun = true,
  pine = true,
}: {
  width: number;
  height: number;
  /** Drawn *under* the ridge wash, so the peak can eclipse the disc. */
  sun?: boolean;
  /** Drawn over it — the pine is the nearest thing in the scene. */
  pine?: boolean;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 300">
      <Defs>
        <RadialGradient id="sun" cx="0.42" cy="0.36" r="0.72">
          <Stop offset="0" stopColor="#E88B5C" />
          <Stop offset="0.55" stopColor="#CF6238" />
          <Stop offset="1" stopColor="#A8452A" />
        </RadialGradient>
        <RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0.6" stopColor="#C25E36" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#C25E36" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {sun ? (
        <G>
          <Circle cx="206" cy="70" r="66" fill="url(#halo)" />
          <Circle cx="206" cy="70" r="31" fill="url(#sun)" opacity={0.88} />
        </G>
      ) : null}

      {/* Pine leaning in from the right edge. The ridges behind it are a
          rendered wash (see assets/img/ink-mountain.png) rather than vector
          paths — a filled path reads as a paper cut-out at any curve. */}
      {pine ? (
        <G opacity={0.6}>
          <Path
            d="M290 292 C 288 258, 289 224, 293 192 C 295 174, 297 160, 301 148"
            stroke="#211F1B"
            strokeWidth={2.6}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M291 226 C 283 221, 276 215, 268 211 M294 198 C 302 194, 310 190, 318 189 M296 170 C 289 165, 282 161, 276 159 M299 150 C 306 146, 312 143, 318 142"
            stroke="#211F1B"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <G fill="#211F1B">
            <Path d="M256 212 C 270 203, 292 201, 308 207 C 294 216, 270 219, 256 212 Z" />
            <Path d="M276 186 C 290 176, 314 174, 320 180 C 309 190, 289 194, 276 186 Z" />
            <Path d="M262 160 C 276 150, 300 148, 314 154 C 300 164, 277 168, 262 160 Z" />
            <Path d="M282 134 C 294 125, 314 123, 320 128 C 311 137, 294 140, 282 134 Z" />
            <Path d="M292 112 C 300 105, 314 103, 320 107 C 313 114, 301 117, 292 112 Z" />
          </G>
        </G>
      ) : null}
    </Svg>
  );
}
