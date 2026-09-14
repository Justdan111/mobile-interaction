import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'dumbbell'
  | 'qr'
  | 'calendar'
  | 'person'
  | 'bell'
  | 'crown'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'filter'
  | 'heart'
  | 'share'
  | 'clock'
  | 'flag'
  | 'plus'
  | 'intensity'
  | 'steps'
  | 'flame';

export type IconProps = {
  name: IconName;
  /** Stroke colour. Required: an icon must never assume the surface behind it. */
  color: string;
  size?: number;
  strokeWidth?: number;
  /** Fill colour, for the few icons drawn solid. Defaults to none. */
  fill?: string;
};

/**
 * A single 24x24 line-icon set drawn to match the comps' stroke weight.
 *
 * `color` has no default on purpose. Every icon in this app sits on a surface
 * chosen by its caller — page, card, sage, or a mood colour — and a baked-in
 * foreground is the defect that has recurred across this repo.
 */
export function Icon({ name, color, size = 24, strokeWidth = 1.6, fill = 'none' }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <Path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" {...common} />
      )}

      {/* A dumbbell on a 45° diagonal. Drawn as five strokes perpendicular to
          the bar rather than rotated rects — at 24px a rotated rect's corner
          radii collapse into a blob. Coordinates are the bar's unit vector
          (0.707, -0.707) stepped out from centre. */}
      {name === 'dumbbell' && (
        <>
          <Line x1="9.5" y1="14.5" x2="14.5" y2="9.5" {...common} />
          <Line x1="7.9" y1="12.9" x2="11.1" y2="16.1" {...common} strokeWidth={strokeWidth * 1.5} />
          <Line x1="6.2" y1="14.6" x2="8.3" y2="16.7" {...common} strokeWidth={strokeWidth * 1.5} />
          <Line x1="12.9" y1="7.9" x2="16.1" y2="11.1" {...common} strokeWidth={strokeWidth * 1.5} />
          <Line x1="15.7" y1="7.3" x2="17.8" y2="9.4" {...common} strokeWidth={strokeWidth * 1.5} />
        </>
      )}

      {name === 'qr' && (
        <>
          <Rect x="3.5" y="3.5" width="7" height="7" rx="1.6" {...common} />
          <Rect x="13.5" y="3.5" width="7" height="7" rx="1.6" {...common} />
          <Rect x="3.5" y="13.5" width="7" height="7" rx="1.6" {...common} />
          <Rect x="13.5" y="13.5" width="3" height="3" rx="0.8" {...common} />
          <Rect x="17.5" y="17.5" width="3" height="3" rx="0.8" {...common} />
        </>
      )}

      {name === 'calendar' && (
        <>
          <Rect x="3.5" y="5" width="17" height="15.5" rx="3" {...common} />
          <Line x1="3.5" y1="9.5" x2="20.5" y2="9.5" {...common} />
          <Line x1="8" y1="3" x2="8" y2="6" {...common} />
          <Line x1="16" y1="3" x2="16" y2="6" {...common} />
        </>
      )}

      {name === 'person' && (
        <>
          <Circle cx="12" cy="8" r="3.6" {...common} />
          <Path d="M4.5 20.5c0-3.9 3.4-6.4 7.5-6.4s7.5 2.5 7.5 6.4" {...common} />
        </>
      )}

      {name === 'bell' && (
        <>
          <Path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10z" {...common} />
          <Path d="M10.2 19a2 2 0 0 0 3.6 0" {...common} />
        </>
      )}

      {name === 'crown' && (
        <Path
          d="M4 17.5 5.2 7.8l4 3.3L12 5.5l2.8 5.6 4-3.3L20 17.5z"
          {...common}
          fill={fill === 'none' ? color : fill}
          stroke={fill === 'none' ? color : common.stroke}
        />
      )}

      {name === 'chevron-right' && <Path d="m9.5 5 7 7-7 7" {...common} />}
      {name === 'chevron-left' && <Path d="m14.5 5-7 7 7 7" {...common} />}

      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="6.5" {...common} />
          <Line x1="16" y1="16" x2="20.5" y2="20.5" {...common} />
        </>
      )}

      {name === 'filter' && (
        <Path d="M3.5 5.5h17l-6.5 7.4v6.1l-4 2v-8.1z" {...common} />
      )}

      {name === 'heart' && (
        <Path
          d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"
          {...common}
        />
      )}

      {name === 'share' && (
        <>
          <Path d="M12 15.5V4m0 0L8.5 7.5M12 4l3.5 3.5" {...common} />
          <Path d="M5 13v5.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13" {...common} />
        </>
      )}

      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Path d="M12 7v5.2l3.2 2" {...common} />
        </>
      )}

      {name === 'flag' && (
        <>
          <Line x1="6" y1="3.5" x2="6" y2="20.5" {...common} />
          <Path d="M6 4.5h11l-2.2 4 2.2 4H6z" {...common} />
        </>
      )}

      {name === 'plus' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}

      {name === 'intensity' && (
        <>
          <Line x1="5" y1="20" x2="5" y2="13" {...common} />
          <Line x1="12" y1="20" x2="12" y2="8" {...common} />
          <Line x1="19" y1="20" x2="19" y2="4" {...common} />
        </>
      )}

      {name === 'steps' && (
        <>
          <Circle cx="13" cy="4.8" r="2" {...common} />
          <Path d="M9 20.5 11.5 14l-2.2-2.4 1.4-3.6 3.3 2.2 2.6.8" {...common} />
          <Path d="M13.6 13.4 16 20.5" {...common} />
        </>
      )}

      {name === 'flame' && (
        <Path
          d="M12 3.5s4.8 3.9 4.8 8.4a4.8 4.8 0 0 1-9.6 0c0-1.7.9-3 1.8-4 .2 1 .8 1.8 1.6 1.8 1.1 0 1.6-1.1 1.4-2.4-.1-1.2 0-2.6 0-3.8z"
          {...common}
        />
      )}
    </Svg>
  );
}
