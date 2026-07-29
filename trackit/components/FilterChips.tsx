import { useEffect } from 'react';
import { ScrollView, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, GUTTER } from '@/theme/colors';
import { font } from '@/theme/type';
import { PressableScale, SlideIn } from './motion';

const HEIGHT = 40;
/** Gap between one chip arriving and the next, matching Home's quick actions. */
const STAGGER = 55;
const AnimatedText = Animated.createAnimatedComponent(Text);

function Chip<T extends string>({
  label,
  active,
  onPress,
}: {
  label: T;
  active: boolean;
  onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const on = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    const to = Number(active);
    on.value = reduceMotion ? to : withTiming(to, { duration: 220 });
  }, [active, reduceMotion, on]);

  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.card, colors.chipActive]),
  }));
  const fg = useAnimatedStyle(() => ({
    color: interpolateColor(on.value, [0, 1], [colors.ink, colors.brandPill]),
  }));

  return (
    <PressableScale onPress={onPress} to={0.94}>
      <Animated.View
        style={[
          {
            height: HEIGHT,
            borderRadius: HEIGHT / 2,
            paddingHorizontal: 19,
            alignItems: 'center',
            justifyContent: 'center',
          },
          bg,
        ]}
      >
        <AnimatedText style={[{ fontSize: 14.5, fontFamily: font.medium }, fg]}>{label}</AnimatedText>
      </Animated.View>
    </PressableScale>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  delay = 0,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  /** When the first chip arrives; the rest follow one STAGGER apart. */
  delay?: number;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 9 }}
    >
      {options.map((o, i) => (
        <SlideIn key={o} from="right" delay={delay + i * STAGGER} distance={70}>
          <Chip label={o} active={o === value} onPress={() => onChange(o)} />
        </SlideIn>
      ))}
    </ScrollView>
  );
}
