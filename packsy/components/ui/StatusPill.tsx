import React from 'react';
import { Text, View } from 'react-native';
import type { Status } from '../../lib/packages';
import { useColors } from '../../theme/ThemeProvider';
import { Icon } from './icons';

const LABEL: Record<Status, string> = {
  'in-transit': 'In Transit',
  received: 'Received',
  processing: 'Processing',
};

/**
 * `filled` sits on a dark card and carries its own colour (iris, green).
 * `outline` sits on a coloured parcel card (Home's stack) and takes that
 * card's ink, since the card colour changes as the stack is cycled.
 */
export function StatusPill({
  status,
  variant,
  ink,
  surface,
}: {
  status: Status;
  variant: 'filled' | 'outline';
  /** Text and glyph colour. */
  ink: string;
  /** What the pill sits on; used for the glyph's cut-outs in outline mode. */
  surface: string;
}) {
  const C = useColors();
  const fill = variant === 'outline' ? 'transparent' : status === 'received' ? C.goDeep : status === 'in-transit' ? C.iris : C.raised;
  const glyphSurface = variant === 'outline' ? surface : fill;
  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        backgroundColor: fill,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: ink,
        paddingHorizontal: 12,
        height: variant === 'outline' ? 34 : 32,
        gap: 7,
      }}
    >
      {status === 'received' ? (
        <Icon name="check" color={ink} surface={glyphSurface} size={17} />
      ) : (
        <Icon name="bus" color={ink} surface={glyphSurface} size={18} />
      )}
      <Text className="font-medium" style={{ color: ink, fontSize: 13.5 }}>
        {LABEL[status]}
      </Text>
    </View>
  );
}
