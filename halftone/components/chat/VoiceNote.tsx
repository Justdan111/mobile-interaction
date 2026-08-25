import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Icon } from '../ui/icons';
import { hashSeed, makeRandom } from '../../lib/seed';
import type { Voice } from '../../data/types';

const BARS = 26;

/** Seeded so a given note always draws the same waveform. */
function useBars(seed: string) {
  return useMemo(() => {
    const rand = makeRandom(hashSeed(seed));
    return Array.from({ length: BARS }, () => 0.25 + rand() * 0.75);
  }, [seed]);
}

export function VoiceNote({
  voice,
  tint,
  iconColor = '#FFFFFF',
}: {
  voice: Voice;
  tint: string;
  /**
   * Play-triangle colour. Defaults to white, which is correct against an
   * accent-tinted circle (other messages) but invisible against a
   * white-tinted one (own messages) — see MessageBubble, which passes a
   * contrasting colour for that case. Comp 6's own voice note shows an
   * accent-coloured triangle on a white circle, not a white-on-white one.
   */
  iconColor?: string;
}) {
  const bars = useBars(voice.seed);
  const width = BARS * 5;

  return (
    <View className="flex-row items-center gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: tint }}>
        <Icon name="play" size={16} color={iconColor} />
      </View>
      <Svg width={width} height={26} accessibilityLabel="Voice message waveform">
        {bars.map((h, i) => (
          <Rect
            key={i}
            x={i * 5}
            y={13 - (h * 22) / 2}
            width={2.5}
            height={h * 22}
            rx={1.25}
            fill={tint}
            opacity={0.85}
          />
        ))}
      </Svg>
      <Text className="text-muted text-[12px]">
        0:{String(voice.durationSec).padStart(2, '0')}
      </Text>
    </View>
  );
}
