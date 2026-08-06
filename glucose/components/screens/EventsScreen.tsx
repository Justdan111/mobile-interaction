import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MiniBars, type Tone } from '@/components/charts/MiniBars';
import { PencilIcon } from '@/components/icons';
import { colors } from '@/theme/colors';
import { events, today } from '@/data/readings';

const CARD_HEIGHT = 119;

export function EventsScreen({ width }: { width: number }) {
  return (
    <View className="flex-1" style={{ width }}>
      <ScreenHeader title="Events." subtitle={today.label} />

      <View className="mt-[26px] gap-3 px-5">
        {events.map((event) => (
          <RangeCard key={event.label} {...event} width={width - 40} />
        ))}
      </View>

      <View className="mt-[41px] px-5">
        <Text className="font-inter-medium text-[22px] leading-[26px] text-chalk">
          Actions
        </Text>
        <View className="mt-[9px] h-[1px] bg-rule" />

        <View className="mt-9 flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit entries"
            onPress={() => Haptics.selectionAsync()}
            className="h-[63px] w-[63px] items-center justify-center rounded-full border border-button-edge active:opacity-70"
          >
            <PencilIcon />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            className="h-[63px] flex-1 items-center justify-center rounded-full border border-button-edge bg-button active:opacity-70"
          >
            <Text
              className="font-inter-medium text-[16px] text-chalk"
              style={{ letterSpacing: 0.9 }}
            >
              ADD INFORMATION
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function RangeCard({
  label,
  value,
  unit,
  tone,
  bars,
  width,
}: {
  label: string;
  value: string;
  unit: string;
  tone: Tone;
  bars: number[];
  width: number;
}) {
  return (
    <LinearGradient
      colors={[colors.cardTop, colors.cardMid, colors.cardEnd]}
      locations={[0, 0.6, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="overflow-hidden rounded-[22px]"
      style={{ width, height: CARD_HEIGHT }}
    >
      {/* A lit hairline along the top edge is what makes the card read as glass. */}
      <View className="absolute left-0 right-0 top-0 h-[1px] bg-card-edge" />

      <View className="px-5 pt-4">
        <Text className="font-inter text-[14px] leading-[18px] text-mist">
          {label}
        </Text>
        <View className="mt-[9px] flex-row items-baseline">
          <Text
            className="font-inter-bold text-[60px] leading-[60px] text-chalk"
            style={{ letterSpacing: -5 }}
          >
            {value}
          </Text>
          <Text className="font-inter-medium text-[45px] text-chalk">
            {unit}
          </Text>
        </View>
      </View>

      {/* Bars hang off the card's floor — their feet are clipped by the edge. */}
      <View className="absolute bottom-0 right-[6px]">
        <MiniBars values={bars} tone={tone} height={CARD_HEIGHT} />
      </View>
    </LinearGradient>
  );
}
