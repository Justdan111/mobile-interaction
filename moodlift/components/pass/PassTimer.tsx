import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatCountdown } from '../../lib/format';
import { Icon } from '../ui/icons';

/** A thin ring that empties as the pass expires. */
function TimerRing({ ratio, color, track }: { ratio: number; color: string; track: string }) {
  const size = 46;
  const r = (size - 3) / 2;
  const c = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={2} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c * Math.min(Math.max(ratio, 0), 1)} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

/**
 * The "Qr-code active: 09:58:47 min" strip.
 *
 * Counts down from a fixed expiry rather than by decrementing a stored number:
 * a tick that decrements drifts whenever a frame is dropped or the app is
 * backgrounded, and would show the wrong time after any pause.
 */
export function PassTimer({
  expiresAt,
  totalMs,
  ink,
  mutedInk,
  surface,
}: {
  expiresAt: number;
  totalMs: number;
  ink: string;
  mutedInk: string;
  surface: string;
}) {
  const [remaining, setRemaining] = useState(() => expiresAt - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(expiresAt - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = remaining <= 0;

  return (
    <View
      className="flex-row items-center justify-between rounded-2xl px-4 py-3"
      style={{ backgroundColor: surface }}
    >
      <View className="flex-1">
        <Text className="font-body text-[13px]" style={{ color: mutedInk }}>
          {expired ? 'Qr-code expired' : 'Qr-code active:'}
        </Text>
        <View className="mt-0.5 flex-row items-baseline">
          <Text
            className="font-semibold text-[19px]"
            style={{ color: ink }}
            accessibilityLabel={`Pass active for ${formatCountdown(remaining)}`}
          >
            {formatCountdown(remaining)}
          </Text>
          <Text className="ml-1.5 font-body text-[13px]" style={{ color: mutedInk }}>
            min
          </Text>
        </View>
      </View>

      <View className="h-[46px] w-[46px] items-center justify-center">
        <TimerRing
          ratio={remaining / totalMs}
          color={ink}
          track={mutedInk}
        />
        <View className="absolute">
          <Icon name="clock" color={ink} size={18} strokeWidth={1.4} />
        </View>
      </View>
    </View>
  );
}
