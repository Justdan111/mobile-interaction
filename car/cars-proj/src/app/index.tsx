import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { RidgeBackdrop } from '@/components/ridge-backdrop';

const W = 200;
const H = 120;
const MID_Y = 60; // horizontal baseline the line + label sit on
const LINE_START = 6; // left end of the line, under the percentage
const CIRCLE_CX = 130; // the circle keeps this fixed centre — it only grows
const MAX_R = 30;

export default function Loading() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const duration = 2600;
    const startedAt = Date.now();
    let raf: number;

    const tick = () => {
      const t = Math.min(1, (Date.now() - startedAt) / duration);
      setPct(Math.round(t * 100)); // linear count — even movement at every percent
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => router.replace('/onboarding' as Href), 420);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const progress = pct / 100;

  // The circle stays put and only grows; the line sweeps clockwise around it.
  // Everything is LINEAR in progress so every percent advances the same amount:
  // the radius grows a steady step and the dot orbits a steady 3.6°/percent,
  // one full turn from 3 o'clock back through the middle to 3 o'clock at 100%.
  const radius = MAX_R * progress;
  const theta = 2 * Math.PI * progress;
  const dotX = CIRCLE_CX + radius * Math.cos(theta);
  const dotY = MID_Y + radius * Math.sin(theta);

  return (
    <View className="flex-1 items-center justify-center bg-ink">
      <RidgeBackdrop />

      <View style={{ width: W, height: H }}>
        <Text
          className="absolute font-techno text-[19px] text-bone"
          style={{ left: LINE_START, top: MID_Y - 28, letterSpacing: 1 }}>
          {pct}%
        </Text>

        <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Line
            x1={LINE_START}
            y1={MID_Y}
            x2={dotX}
            y2={dotY}
            stroke="#F2F3F5"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Circle
            cx={CIRCLE_CX}
            cy={MID_Y}
            r={radius}
            stroke="#F2F3F5"
            strokeWidth={1.4}
            fill="none"
          />
          <Circle cx={dotX} cy={dotY} r={3.4} fill="#F2F3F5" />
        </Svg>
      </View>
    </View>
  );
}
