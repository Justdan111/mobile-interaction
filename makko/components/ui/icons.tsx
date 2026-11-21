import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'search'
  | 'plus'
  | 'chat'
  | 'bell'
  | 'filter'
  | 'heart'
  | 'comment'
  | 'send'
  | 'sound'
  | 'muted'
  | 'check'
  | 'chevron-right'
  | 'close';

export type IconProps = {
  name: IconName;
  /** Stroke colour. Required: icons sit on white, black and photo-glass surfaces. */
  color: string;
  size?: number;
  strokeWidth?: number;
  /** Fills the glyph instead of stroking it (heart once liked). */
  filled?: boolean;
};

/** Thin rounded outline icons, drawn on a 24-unit grid. */
export function Icon({ name, color, size = 24, strokeWidth = 1.6, filled = false }: IconProps) {
  const s = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: filled ? color : 'none',
  };

  const glyph = (() => {
    switch (name) {
      case 'home':
        return <Path d="M4.5 10.4c0-.6.3-1.2.8-1.6l5.4-4.3a2 2 0 0 1 2.6 0l5.4 4.3c.5.4.8 1 .8 1.6v8.1a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2z" {...s} />;
      case 'search':
        return (
          <G>
            <Circle cx={11} cy={11} r={6.6} {...s} />
            <Path d="m16 16 4 4" {...s} />
          </G>
        );
      case 'plus':
        return <Path d="M12 5.5v13M5.5 12h13" {...s} />;
      case 'chat':
        return <Path d="M12 4.2c4.4 0 7.8 3.2 7.8 7.3s-3.4 7.3-7.8 7.3c-1.1 0-2.2-.2-3.1-.6l-4 1.2 1.2-3.5A7 7 0 0 1 4.2 11.5c0-4.1 3.4-7.3 7.8-7.3z" {...s} />;
      case 'bell':
        return (
          <G>
            <Path d="M6.4 16.2V11a5.6 5.6 0 0 1 8.6-4.8M17.6 11v5.2l1.4 1.6H5l1.4-1.6" {...s} />
            <Path d="M10 20.2a2.2 2.2 0 0 0 4 0" {...s} />
          </G>
        );
      case 'filter':
        return (
          <G>
            <Path d="M4 7.5h7M16.5 7.5H20M4 16.5h3.5M13 16.5h7" {...s} />
            <Circle cx={13.75} cy={7.5} r={2.6} {...s} fill="none" />
            <Circle cx={10.25} cy={16.5} r={2.6} {...s} fill="none" />
          </G>
        );
      case 'heart':
        return <Path d="M12 19.6s-7.6-4.4-7.6-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.6 2.6c0 5.6-7.6 10-7.6 10z" {...s} />;
      case 'comment':
        return <Path d="M12 4.5c4.2 0 7.5 3 7.5 6.9s-3.3 6.9-7.5 6.9c-1 0-2-.2-2.9-.5L5.3 19l1.1-3.2a6.6 6.6 0 0 1-1.9-4.4c0-3.9 3.3-6.9 7.5-6.9z" {...s} />;
      case 'send':
        return <Path d="M20 4 9.6 14.4M20 4l-6.4 16-4-5.6L4 10.4z" {...s} />;
      case 'sound':
        return (
          <G>
            <Path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z" {...s} />
            <Path d="M15 9.2a4 4 0 0 1 0 5.6M17.6 6.8a7.4 7.4 0 0 1 0 10.4" {...s} fill="none" />
          </G>
        );
      case 'muted':
        return (
          <G>
            <Path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3z" {...s} />
            <Path d="m15.5 10 4 4M19.5 10l-4 4" {...s} fill="none" />
          </G>
        );
      case 'check':
        return <Path d="m6.5 12.4 3.6 3.6 7.4-7.6" {...s} fill="none" />;
      case 'chevron-right':
        return <Path d="m10 6.5 5.5 5.5-5.5 5.5" {...s} fill="none" />;
      case 'close':
        return <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...s} fill="none" />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph}
    </Svg>
  );
}
