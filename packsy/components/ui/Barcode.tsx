import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { widths } from '../../lib/code128';

/**
 * A Code 128 rendering of `value`, stretched to `width`. Bars are drawn in
 * `bar` on a transparent ground, so the comp's white-on-black look is just
 * `bar="#FFFFFF"` over the dark page.
 */
export function Barcode({ value, width, height, bar }: { value: string; width: number; height: number; bar: string }) {
  const rects = useMemo(() => {
    const w = widths(value);
    const total = w.reduce((a, b) => a + b, 0);
    const unit = width / total;
    const out: { x: number; w: number }[] = [];
    let x = 0;
    w.forEach((m, i) => {
      if (i % 2 === 0) out.push({ x: x * unit, w: m * unit });
      x += m;
    });
    return out;
  }, [value, width]);

  return (
    <Svg width={width} height={height} accessibilityLabel={`Barcode ${value}`}>
      {rects.map((r, i) => (
        <Rect key={i} x={r.x} y={0} width={r.w} height={height} fill={bar} />
      ))}
    </Svg>
  );
}
