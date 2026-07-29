import * as React from "react";
import Svg, { Circle, Ellipse, Line, Path, Rect, G } from "react-native-svg";

/**
 * Hand-drawn-style fast-food doodles for the Chompo pattern.
 * The look: a cream body with a bold dark-red OUTLINE and interior texture
 * lines — the classic "fast food seamless pattern" illustration style.
 * Each icon draws in a 0 0 100 100 viewBox.
 */

export type IconProps = {
  size?: number;
  /** Body fill (cream). */
  color?: string;
  /** Outline + interior line colour (dark red). */
  detail?: string;
  opacity?: number;
};

const CREAM = "#F5EDDF";
const OUTLINE = "#A62A1D";

function Frame({
  size = 72,
  opacity = 1,
  children,
}: {
  size?: number;
  opacity?: number;
  children: React.ReactNode;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      {children}
    </Svg>
  );
}

export function Burger({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  const tex = { stroke: detail, strokeWidth: 2.4, strokeLinecap: "round" as const, fill: "none" };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        {/* bottom bun */}
        <Path d="M13 70 L87 70 L87 74 Q87 86 50 86 Q13 86 13 74 Z" {...body} />
        {/* patty */}
        <Path d="M12 58 h76 a6 6 0 0 1 6 6 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 a6 6 0 0 1 6 -6 Z" {...body} />
        <Line x1="26" y1="61" x2="26" y2="67" {...tex} />
        <Line x1="42" y1="61" x2="42" y2="67" {...tex} />
        <Line x1="58" y1="61" x2="58" y2="67" {...tex} />
        <Line x1="74" y1="61" x2="74" y2="67" {...tex} />
        {/* lettuce (wavy bottom edge) */}
        <Path d="M11 48 h78 v6 q-9.75 6 -19.5 0 t-19.5 0 t-19.5 0 t-19.5 0 Z" {...body} />
        {/* top bun */}
        <Path d="M11 48 C11 19 89 19 89 48 Z" {...body} />
        {/* sesame */}
        <Ellipse cx="36" cy="35" rx="2.6" ry="1.7" {...tex} transform="rotate(-22 36 35)" />
        <Ellipse cx="50" cy="30" rx="2.6" ry="1.7" {...tex} transform="rotate(8 50 30)" />
        <Ellipse cx="64" cy="35" rx="2.6" ry="1.7" {...tex} transform="rotate(-12 64 35)" />
      </G>
    </Frame>
  );
}

export function Sandwich({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        {/* top bread (rounded) */}
        <Path d="M15 34 Q15 25 24 25 L76 25 Q85 25 85 34 L85 39 L15 39 Z" {...body} />
        {/* lettuce (wavy) */}
        <Path d="M13 39 h74 v6 q-9.25 6 -18.5 0 t-18.5 0 t-18.5 0 t-18.5 0 Z" {...body} />
        {/* filling slab (tomato / cheese) */}
        <Path d="M15 51 L85 51 L80 59 L20 59 Z" {...body} />
        {/* meat (wavy) */}
        <Path d="M13 59 h74 v6 q-9.25 6 -18.5 0 t-18.5 0 t-18.5 0 t-18.5 0 Z" {...body} />
        {/* bottom bread */}
        <Path d="M15 65 L85 65 L85 70 Q85 79 76 79 L24 79 Q15 79 15 70 Z" {...body} />
      </G>
    </Frame>
  );
}

export function Fries({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  const stick = {
    fill: color,
    stroke: detail,
    strokeWidth: 3.4,
    strokeLinejoin: "round" as const,
  };
  const tex = { stroke: detail, strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        {/* fry sticks */}
        <Rect x="30" y="20" width="7" height="38" rx="3" {...stick} transform="rotate(-8 33 40)" />
        <Rect x="40" y="15" width="7" height="42" rx="3" {...stick} transform="rotate(-2 43 40)" />
        <Rect x="50" y="15" width="7" height="42" rx="3" {...stick} transform="rotate(4 53 40)" />
        <Rect x="60" y="20" width="7" height="38" rx="3" {...stick} transform="rotate(9 63 40)" />
        {/* carton */}
        <Path d="M30 52 L70 52 L64 90 L36 90 Z" {...body} />
        {/* carton band + chevron */}
        <Line x1="32" y1="63" x2="68" y2="63" {...tex} />
        <Path d="M44 72 L50 78 L56 72" {...tex} />
      </G>
    </Frame>
  );
}

export function Pizza({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  const dot = { fill: detail };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        {/* slice (point down) */}
        <Path d="M20 28 L80 28 L50 86 Z" {...body} />
        {/* crust */}
        <Path d="M20 28 L80 28 L77 39 L23 39 Z" {...body} />
        {/* pepperoni */}
        <Circle cx="41" cy="49" r="4" {...dot} />
        <Circle cx="59" cy="49" r="4" {...dot} />
        <Circle cx="50" cy="64" r="3.6" {...dot} />
      </G>
    </Frame>
  );
}

export function Drumstick({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  const tex = { stroke: detail, strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        {/* bone */}
        <Path d="M50 50 L70 72" fill="none" stroke={detail} strokeWidth="7" strokeLinecap="round" />
        <Path d="M50 50 L70 72" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
        <Circle cx="73" cy="74" r="6" {...body} />
        <Circle cx="68" cy="79" r="6" {...body} />
        {/* meat */}
        <Path d="M31 26 C15 38 20 60 39 60 C48 71 65 66 61 53 L48 41 C51 28 43 19 31 26 Z" {...body} />
        {/* texture */}
        <Path d="M32 35 q9 3 14 12" {...tex} />
        <Path d="M27 44 q9 2 15 10" {...tex} />
      </G>
    </Frame>
  );
}

export function Nugget({ size, color = CREAM, detail = OUTLINE, opacity }: IconProps) {
  const body = { fill: color, stroke: detail, strokeWidth: 4, strokeLinejoin: "round" as const };
  const dot = { fill: detail };
  return (
    <Frame size={size} opacity={opacity}>
      <G>
        <Path d="M26 42 Q22 26 38 27 Q54 22 54 40 Q60 52 44 55 Q26 58 26 42 Z" {...body} />
        <Path d="M50 60 Q48 46 62 47 Q78 44 76 60 Q80 73 64 74 Q48 74 50 60 Z" {...body} />
        <Circle cx="38" cy="41" r="1.6" {...dot} />
        <Circle cx="45" cy="44" r="1.6" {...dot} />
        <Circle cx="63" cy="59" r="1.6" {...dot} />
      </G>
    </Frame>
  );
}

export const FOOD_ICONS = [Burger, Sandwich, Fries, Pizza, Drumstick, Nugget];
