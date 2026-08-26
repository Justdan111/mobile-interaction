import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'search' | 'mail' | 'chat' | 'target' | 'smiley' | 'heart'
  | 'chevronRight' | 'chevronLeft' | 'filter' | 'bell' | 'exit'
  | 'mic' | 'clip' | 'play' | 'star' | 'lock' | 'shield' | 'moon'
  | 'edit' | 'pin' | 'briefcase' | 'clock' | 'check' | 'checkDouble' | 'close' | 'phone';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number; filled?: boolean };

export function Icon({ name, size = 24, color, strokeWidth = 1.8, filled = false }: Props) {
  const s = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'search' && (<><Circle cx={11} cy={11} r={7} {...s} /><Line x1={16.5} y1={16.5} x2={21} y2={21} {...s} /></>)}
      {name === 'mail' && (<><Rect x={2.5} y={5} width={19} height={14} rx={3} {...s} /><Polyline points="3.5,7 12,13 20.5,7" {...s} /></>)}
      {name === 'chat' && (<><Path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" {...s} /><Circle cx={8.5} cy={11} r={1} fill={color} /><Circle cx={12} cy={11} r={1} fill={color} /><Circle cx={15.5} cy={11} r={1} fill={color} /></>)}
      {name === 'target' && (<><Circle cx={11.5} cy={12.5} r={8} {...s} /><Circle cx={11.5} cy={12.5} r={3.4} {...s} /><Line x1={14} y1={10} x2={21} y2={3} {...s} /></>)}
      {name === 'smiley' && (<><Circle cx={12} cy={12} r={9} {...s} /><Circle cx={9} cy={10} r={1} fill={color} /><Circle cx={15} cy={10} r={1} fill={color} /><Path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" {...s} /></>)}
      {name === 'heart' && (<Path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" {...s} fill={filled ? color : 'none'} />)}
      {name === 'chevronRight' && <Polyline points="9,5 16,12 9,19" {...s} />}
      {name === 'chevronLeft' && <Polyline points="15,5 8,12 15,19" {...s} />}
      {name === 'filter' && (<><Line x1={4} y1={8} x2={20} y2={8} {...s} /><Line x1={4} y1={16} x2={20} y2={16} {...s} /><Circle cx={15} cy={8} r={2.4} {...s} /><Circle cx={9} cy={16} r={2.4} {...s} /></>)}
      {name === 'bell' && (<><Path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" {...s} /><Path d="M10 18.5a2 2 0 0 0 4 0" {...s} /></>)}
      {name === 'exit' && (<><Path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" {...s} /><Polyline points="16,8 20,12 16,16" {...s} /><Line x1={20} y1={12} x2={10} y2={12} {...s} /></>)}
      {name === 'mic' && (<><Rect x={9} y={3} width={6} height={11} rx={3} {...s} /><Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" {...s} /><Line x1={12} y1={18} x2={12} y2={21} {...s} /></>)}
      {name === 'clip' && <Path d="M16.5 7.5 9 15a2.8 2.8 0 0 0 4 4l7-7a5 5 0 0 0-7-7L5 13a7 7 0 0 0 10 10l5-5" {...s} />}
      {name === 'play' && <Path d="M9 6.5 18 12l-9 5.5Z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />}
      {name === 'star' && <Path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9 6.7 19.7l1.1-5.9L3.5 9.7l5.9-.8Z" {...s} fill={filled ? color : 'none'} />}
      {name === 'lock' && (<><Rect x={5} y={10.5} width={14} height={9.5} rx={2.5} {...s} /><Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...s} /></>)}
      {name === 'shield' && (<><Path d="M12 3.5 19 6v6c0 4.2-3 7.2-7 8.5-4-1.3-7-4.3-7-8.5V6Z" {...s} /><Polyline points="9,12 11,14 15,10" {...s} /></>)}
      {name === 'moon' && <Path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" {...s} />}
      {name === 'edit' && (<><Path d="M4.5 19.5h4l10-10a2.6 2.6 0 0 0-4-4l-10 10Z" {...s} /><Line x1={14.5} y1={6.5} x2={17.5} y2={9.5} {...s} /></>)}
      {name === 'pin' && (<><Path d="M12 21s6.5-6.2 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 14.8 12 21 12 21Z" {...s} /><Circle cx={12} cy={10.5} r={2.4} {...s} /></>)}
      {name === 'briefcase' && (<><Rect x={3} y={7.5} width={18} height={12} rx={2.5} {...s} /><Path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" {...s} /></>)}
      {name === 'clock' && (<><Circle cx={12} cy={12} r={8.5} {...s} /><Polyline points="12,7 12,12 15.5,14" {...s} /></>)}
      {name === 'check' && <Polyline points="5,12.5 10,17.5 19,7" {...s} />}
      {name === 'checkDouble' && (<><Polyline points="1,12.5 6,17.5 15,7" {...s} /><Polyline points="7,12.5 12,17.5 21,7" {...s} /></>)}
      {/* Counterpart to `check`: a settled-but-negative status, so a declined
          proposal is not chipped with the clock that means "still waiting". */}
      {/* A handset, for a phone number. `pin` is a map pin and says "location". */}
      {name === 'phone' && <Path d="M7.5 4h3l1.4 3.5-2 1.5a10.5 10.5 0 0 0 5.1 5.1l1.5-2L20 13.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 5.5 6.2 2 2 0 0 1 7.5 4Z" {...s} />}
      {name === 'close' && (<><Polyline points="6,6 18,18" {...s} /><Polyline points="18,6 6,18" {...s} /></>)}
    </Svg>
  );
}
