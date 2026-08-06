import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FortnightChart } from '@/components/charts/FortnightChart';
import { PlusIcon } from '@/components/icons';
import { colors } from '@/theme/colors';
import {
  fortnight,
  fortnightAxis,
  fortnightHeadline,
  fortnightMedian,
} from '@/data/readings';

const TABS = ['Overview', 'Prediction'];

export function GraphScreen({ width }: { width: number }) {
  const [active, setActive] = useState(0);

  return (
    <View className="flex-1" style={{ width }}>
      <ScreenHeader title="Graph." subtitle="14-DAY SUMMARY" />

      <View className="mt-6 flex-row items-center gap-2 px-5">
        {TABS.map((tab, i) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === i }}
            onPress={() => {
              Haptics.selectionAsync();
              setActive(i);
            }}
            className={`h-[30px] justify-center rounded-full px-3 active:opacity-80 ${
              active === i
                ? 'bg-chip-active'
                : 'border border-chip-edge bg-chip'
            }`}
          >
            <Text
              className={`font-inter-medium text-[13px] ${
                active === i ? 'text-chalk' : 'text-mist'
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add view"
          onPress={() => Haptics.selectionAsync()}
          className="h-[30px] w-[39px] items-center justify-center rounded-full border border-chip-edge bg-chip active:opacity-80"
        >
          <PlusIcon />
        </Pressable>
      </View>

      {/* A violet bloom sits behind the headline, the way it does in the comp. */}
      <View className="absolute left-0 top-[190px]">
        <Svg width={width} height={280}>
          <Defs>
            <RadialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#5B3A9E" stopOpacity={0.4} />
              <Stop offset="0.55" stopColor="#2A1745" stopOpacity={0.22} />
              <Stop offset="1" stopColor={colors.void} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={width} height={280} fill="url(#bloom)" />
        </Svg>
      </View>

      {/* Only the numeral is centred; the unit and badge hang off it, exactly
          as they do in the comp. */}
      <View className="mt-[41px] items-center pl-[23px]">
        <View>
          <Text
            className="font-inter-bold text-[140px] leading-[140px] text-chalk"
            style={{ letterSpacing: -9 }}
          >
            {fortnightHeadline.value}
          </Text>
          <View className="absolute right-0 top-[19px] rounded-full bg-badge px-2.5 py-[3px]">
            <Text className="font-inter-medium text-[13px] text-badge-ink">
              {fortnightHeadline.badge}
            </Text>
          </View>
          <Text className="absolute -right-[52px] bottom-[10px] font-inter-medium text-[42px] text-chalk">
            {fortnightHeadline.unit}
          </Text>
        </View>
      </View>

      <View className="mt-[45px] px-5">
        <FortnightChart
          values={fortnight}
          axis={fortnightAxis}
          median={fortnightMedian}
          width={width - 40}
        />
      </View>
    </View>
  );
}
