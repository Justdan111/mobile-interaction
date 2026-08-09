import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MiniBars, type Tone } from '@/components/charts/MiniBars';
import { PencilIcon } from '@/components/icons';
import { AddReadingSheet } from '@/components/ui/AddReadingSheet';
import { EditEntriesSheet } from '@/components/ui/EditEntriesSheet';
import { useAppState } from '@/state/app-state';
import { todayLabel } from '@/data/readings';
import { colors } from '@/theme/colors';

const CARD_HEIGHT = 119;

export default function Events() {
  const { width } = useWindowDimensions();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { days, fortnight, loggedReadings } = useAppState();

  // The bars behind each figure are that band's last six days, so the card
  // shows both where you are and how you got here.
  const recent = days.slice(-6);
  const cards = [
    {
      label: 'Time in target',
      share: fortnight.tir,
      tone: 'violet' as Tone,
      bars: recent.map((d) => d.tir),
    },
    {
      label: 'Above range',
      share: fortnight.above,
      tone: 'clay' as Tone,
      bars: recent.map((d) => d.above),
    },
    {
      label: 'Below range',
      share: fortnight.below,
      tone: 'amber' as Tone,
      bars: recent.map((d) => d.below),
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="Events." subtitle={todayLabel} />

      <View className="mt-[26px] gap-3 px-5">
        {cards.map((card) => (
          <RangeCard key={card.label} {...card} width={width - 40} />
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
            accessibilityLabel={`Edit entries, ${loggedReadings.length} logged`}
            onPress={() => {
              Haptics.selectionAsync();
              setEditOpen(true);
            }}
            className="h-[63px] w-[63px] items-center justify-center rounded-full border border-button-edge active:opacity-70"
          >
            <PencilIcon />
            {loggedReadings.length > 0 ? (
              <View className="absolute right-[3px] top-[3px] h-[19px] min-w-[19px] items-center justify-center rounded-full bg-badge px-1">
                <Text className="font-inter-medium text-[11px] text-badge-ink">
                  {loggedReadings.length}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAddOpen(true);
            }}
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

      <AddReadingSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <EditEntriesSheet visible={editOpen} onClose={() => setEditOpen(false)} />
    </Screen>
  );
}

function RangeCard({
  label,
  share,
  tone,
  bars,
  width,
}: {
  label: string;
  share: number;
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
      className="overflow-hidden"
      // expo-linear-gradient does not reliably pick up a borderRadius that
      // arrives via className, so the radius is set here directly.
      style={{ width, height: CARD_HEIGHT, borderRadius: 22 }}
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
            {Math.round(share * 100)}
          </Text>
          <Text className="font-inter-medium text-[45px] text-chalk">%</Text>
        </View>
      </View>

      {/* Bars hang off the card's floor — their feet are clipped by the edge. */}
      <View className="absolute bottom-0 right-[6px]">
        <MiniBars values={bars} tone={tone} height={CARD_HEIGHT} />
      </View>
    </LinearGradient>
  );
}
