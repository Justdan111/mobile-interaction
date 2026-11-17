import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Icon } from '../ui/icons';
import { hashSeed, makeRandom } from '../../lib/seed';
import { ACTION_FOREGROUND_COLOR } from '../../lib/tokens';
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
  iconColor = ACTION_FOREGROUND_COLOR,
  barColor,
  durationColor,
}: {
  voice: Voice;
  /** Circle background behind the play icon — not the waveform's colour. */
  tint: string;
  /**
   * Play-triangle colour. White suits an accent circle; MessageBubble passes a
   * contrasting colour for the white circle on own messages.
   */
  iconColor?: string;
  /**
   * Waveform bar colour. Separate from `tint`: other-sender bars are neutral
   * gray while their circle is accent-tinted.
   */
  barColor: string;
  /**
   * Duration colour. A prop because the bubble fill differs between own and
   * other messages; `muted` on the accent own bubble is about 1.1:1.
   */
  durationColor: string;
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
            fill={barColor}
            opacity={0.85}
          />
        ))}
      </Svg>
      <Text className="text-[12px]" style={{ color: durationColor }}>
        0:{String(voice.durationSec).padStart(2, '0')}
      </Text>
    </View>
  );
}
