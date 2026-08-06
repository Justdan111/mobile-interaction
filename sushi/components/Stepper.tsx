import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Text, View } from 'react-native';
import { MinusIcon, PlusIcon } from '@/components/art/MenuIcons';
import { PressableScale } from '@/components/motion';
import { colors } from '@/theme/colors';
import { font } from '@/theme/type';

const brush = require('../assets/img/ink-brush-pill.png');

/**
 * Quantity control sitting on a brushed ink slab. The slab is a bitmap rather
 * than a rounded rect on purpose — its torn edge is the detail that ties the
 * control back to the sumi-e styling of the rest of the screen.
 */
export function Stepper({
  value,
  min = 1,
  max = 20,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) {
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChange(next);
  };

  return (
    <View style={{ width: 214, height: 66, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={brush}
        contentFit="fill"
        style={{ position: 'absolute', inset: 0 }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 152,
        }}
      >
        <PressableScale
          to={0.86}
          hitSlop={12}
          accessibilityLabel="Decrease quantity"
          disabled={value <= min}
          onPress={() => step(-1)}
          style={{ opacity: value <= min ? 0.4 : 1, padding: 4 }}
        >
          <MinusIcon size={22} color={colors.white} />
        </PressableScale>

        <Text
          accessibilityLabel={`Quantity ${value}`}
          style={{
            fontFamily: font.bold,
            fontSize: 18,
            color: colors.white,
            minWidth: 26,
            textAlign: 'center',
          }}
        >
          {value}
        </Text>

        <PressableScale
          to={0.86}
          hitSlop={12}
          accessibilityLabel="Increase quantity"
          disabled={value >= max}
          onPress={() => step(1)}
          style={{ opacity: value >= max ? 0.4 : 1, padding: 4 }}
        >
          <PlusIcon size={22} color={colors.white} />
        </PressableScale>
      </View>
    </View>
  );
}
