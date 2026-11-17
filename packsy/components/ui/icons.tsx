import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'box'
  | 'route'
  | 'gear'
  | 'bell'
  | 'plus'
  | 'minus'
  | 'scan'
  | 'dolly'
  | 'pin-home'
  | 'search'
  | 'filter'
  | 'back'
  | 'chevron-down'
  | 'more'
  | 'check'
  | 'copy'
  | 'bus'
  | 'history'
  | 'person'
  | 'note'
  | 'locate';

export type IconProps = {
  name: IconName;
  /** The glyph colour. */
  color: string;
  /**
   * The colour of whatever the icon sits on. Filled glyphs (house, cube, bell,
   * bus) cut their inner detail out in this colour, so it has to be the real
   * surface — there is deliberately no default.
   */
  surface: string;
  size?: number;
};

/** An eight-toothed gear, built rather than hand-traced so the teeth are even. */
function gearPath(cx: number, cy: number) {
  const teeth = 8;
  const outer = 9.6;
  const inner = 7.4;
  let d = '';
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 4 === 1 || i % 4 === 2 ? outer : inner;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}
const GEAR = gearPath(12, 12);

export function Icon({ name, color, surface, size = 24 }: IconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  const glyph = (() => {
    switch (name) {
      case 'home':
        return (
          <G>
            <Path d="M4 10.2c0-.6.3-1.2.8-1.6l6-4.7a2 2 0 0 1 2.4 0l6 4.7c.5.4.8 1 .8 1.6V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill={color} />
            <Rect x={9.6} y={16.4} width={4.8} height={1.7} rx={0.85} fill={surface} />
          </G>
        );
      case 'box':
        return (
          <G>
            <Path d="M12 2.6 20.6 7.2v9.6L12 21.4 3.4 16.8V7.2z" fill={color} strokeLinejoin="round" stroke={color} strokeWidth={1} />
            <Path d="M3.6 7.3 12 11.8l8.4-4.5M12 11.8v9.4M7.6 4.9l8.6 4.6v3.2" stroke={surface} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
          </G>
        );
      case 'route':
        return (
          <G>
            <Circle cx={6} cy={5.6} r={2.4} {...stroke} strokeWidth={1.7} />
            <Path d="M6 8.2v1.6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v.4" {...stroke} strokeWidth={1.7} />
            <Path d="M18 14.2a2.7 2.7 0 0 1 2.7 2.7c0 1.9-2.7 4.4-2.7 4.4s-2.7-2.5-2.7-4.4a2.7 2.7 0 0 1 2.7-2.7z" fill={color} />
            <Circle cx={18} cy={16.9} r={0.9} fill={surface} />
          </G>
        );
      case 'gear':
        return (
          <G>
            <Path d={GEAR} fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
            <Circle cx={12} cy={12} r={3} fill={surface} />
          </G>
        );
      case 'bell':
        return (
          <G>
            <Path d="M12 3.2a6 6 0 0 0-6 6v3.4l-1.5 2.6c-.3.6.1 1.3.8 1.3h13.4c.7 0 1.1-.7.8-1.3L18 12.6V9.2a6 6 0 0 0-6-6z" fill={color} />
            <Path d="M9.6 18.4a2.4 2.4 0 0 0 4.8 0z" fill={color} />
          </G>
        );
      case 'plus':
        return <Path d="M12 5v14M5 12h14" {...stroke} strokeWidth={1.6} />;
      case 'minus':
        return <Path d="M5 12h14" {...stroke} strokeWidth={1.6} />;
      case 'scan':
        return (
          <G>
            <Path d="M4 8.5V7a3 3 0 0 1 3-3h1.5M15.5 4H17a3 3 0 0 1 3 3v1.5M20 15.5V17a3 3 0 0 1-3 3h-1.5M8.5 20H7a3 3 0 0 1-3-3v-1.5" {...stroke} />
            <Path d="M4 12h16" {...stroke} />
          </G>
        );
      case 'dolly':
        return (
          <G>
            <Path d="M3.5 4.5h2.2l3.1 11.4h10.4" {...stroke} />
            <Circle cx={9.4} cy={18.6} r={1.9} fill={color} />
            <Rect x={10.2} y={5.4} width={7.4} height={7.4} rx={1.2} fill={color} transform="rotate(-14 13.9 9.1)" />
            <Path d="M12.6 6.6l.9 3.6" stroke={surface} strokeWidth={1.2} strokeLinecap="round" />
          </G>
        );
      case 'pin-home':
        return (
          <G>
            <Path d="M12 2.6a7.4 7.4 0 0 0-7.4 7.4c0 5.2 6.2 10.8 6.8 11.3a.9.9 0 0 0 1.2 0c.6-.5 6.8-6.1 6.8-11.3A7.4 7.4 0 0 0 12 2.6z" fill={color} />
            <Path d="M8.6 10.4 12 7.7l3.4 2.7v3.4c0 .4-.3.7-.7.7H9.3a.7.7 0 0 1-.7-.7z" fill={surface} />
          </G>
        );
      case 'search':
        return (
          <G>
            <Circle cx={10.8} cy={10.8} r={6.6} {...stroke} strokeWidth={1.6} />
            <Path d="m15.8 15.8 4.2 4.2" {...stroke} strokeWidth={1.6} />
          </G>
        );
      case 'filter':
        return <Path d="M4.6 4.6h14.8c.8 0 1.3.9.8 1.6L14.6 13v5.6c0 .5-.5.9-1 .7l-2.6-1.1a.8.8 0 0 1-.5-.7V13L3.8 6.2c-.5-.7 0-1.6.8-1.6z" fill={color} />;
      case 'back':
        return <Path d="m14.5 5.5-6.5 6.5 6.5 6.5" {...stroke} strokeWidth={1.6} />;
      case 'chevron-down':
        return <Path d="m5.5 9 6.5 6.5L18.5 9" {...stroke} strokeWidth={1.8} />;
      case 'more':
        return (
          <G>
            <Circle cx={5.5} cy={12} r={1.9} fill={color} />
            <Circle cx={12} cy={12} r={1.9} fill={color} />
            <Circle cx={18.5} cy={12} r={1.9} fill={color} />
          </G>
        );
      case 'check':
        return <Path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} strokeWidth={2} />;
      case 'copy':
        return (
          <G>
            <Rect x={8} y={3} width={12} height={15} rx={2.6} fill={color} />
            <Path d="M6 6.4a2.6 2.6 0 0 0-2 2.5v9.5A2.6 2.6 0 0 0 6.6 21h7.8a2.6 2.6 0 0 0 2.5-2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'bus':
        return (
          <G>
            <Rect x={4.2} y={2.8} width={15.6} height={16.4} rx={3.6} fill={color} />
            <Rect x={6.6} y={6.4} width={10.8} height={5.4} rx={1.2} fill={surface} />
            <Circle cx={8.3} cy={15.2} r={1.25} fill={surface} />
            <Circle cx={15.7} cy={15.2} r={1.25} fill={surface} />
            <Rect x={6} y={18.4} width={3} height={3.2} rx={1.1} fill={color} />
            <Rect x={15} y={18.4} width={3} height={3.2} rx={1.1} fill={color} />
          </G>
        );
      case 'history':
        return (
          <G>
            <Path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.3" {...stroke} />
            <Path d="M4.4 4.4v3.4h3.4" {...stroke} />
            <Path d="M12 8v4.2l2.8 2" {...stroke} />
          </G>
        );
      case 'person':
        return (
          <G>
            <Circle cx={12} cy={7.6} r={3.9} fill={color} />
            <Path d="M4.6 19.4c0-3.5 3.3-6 7.4-6s7.4 2.5 7.4 6c0 .8-.6 1.4-1.4 1.4H6c-.8 0-1.4-.6-1.4-1.4z" fill={color} />
          </G>
        );
      case 'note':
        return (
          <G>
            <Rect x={5} y={3.2} width={14} height={17.6} rx={2.8} fill={color} />
            <Path d="M8.6 8.4h6.8M8.6 12h6.8M8.6 15.6h4" stroke={surface} strokeWidth={1.6} strokeLinecap="round" />
          </G>
        );
      case 'locate':
        return (
          <G>
            <Circle cx={12} cy={12} r={6.2} {...stroke} strokeWidth={1.6} />
            <Circle cx={12} cy={12} r={2.2} fill={color} />
            <Path d="M12 2.5v3.3M12 18.2v3.3M2.5 12h3.3M18.2 12h3.3" {...stroke} strokeWidth={1.6} />
          </G>
        );
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph}
    </Svg>
  );
}
