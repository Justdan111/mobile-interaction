import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** A parcel-locker cabinet in three-quarter view, drawn so no photo of a
 *  branded locker ships with the app. */
export function Locker({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 64 72">
      <Defs>
        <LinearGradient id="front" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F2EDE4" />
          <Stop offset="1" stopColor="#BDB5A8" />
        </LinearGradient>
        <LinearGradient id="side" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8F877B" />
          <Stop offset="1" stopColor="#6E675D" />
        </LinearGradient>
      </Defs>
      {/* top, side, front */}
      <Path d="M10 10 34 4l20 6-24 6.5z" fill="#FBF8F2" />
      <Path d="M30 16.5 54 10v48l-24 8.5z" fill="url(#side)" />
      <Path d="M10 10l20 6.5v50L10 59z" fill="url(#front)" />
      {/* door seams */}
      <Path d="M10 30.5l20 5.6M10 47l20 6M20 13.2v49.6" stroke="#9D958A" strokeWidth={0.8} fill="none" />
      {/* screen and keypad */}
      <Path d="M22.5 22.2l5.6 1.6v6.4l-5.6-1.6z" fill="#2B3440" />
      <Path d="M23.4 23.4l3.8 1.1v3.8l-3.8-1.1z" fill="#4FA3D9" opacity={0.85} />
      {/* handles */}
      <Rect x={14.6} y={36} width={3.6} height={1.6} rx={0.8} fill="#C79A3F" transform="rotate(16 16.4 36.8)" />
      <Rect x={24.6} y={41} width={3.6} height={1.6} rx={0.8} fill="#C79A3F" transform="rotate(16 26.4 41.8)" />
      <Path d="M34 22l16-4.3M34 40l16-4.4" stroke="#5E584F" strokeWidth={0.8} />
    </Svg>
  );
}
