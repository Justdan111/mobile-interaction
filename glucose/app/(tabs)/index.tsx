import { useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TraceChart } from '@/components/charts/TraceChart';
import { InfoIcon, TrendTriangle } from '@/components/icons';
import { InfoSheet } from '@/components/ui/InfoSheet';
import { useAppState } from '@/state/app-state';
import { todayLabel } from '@/data/readings';
import { formatValue } from '@/lib/glucose';

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const [infoOpen, setInfoOpen] = useState(false);
  const {
    unit,
    readings,
    current,
    trend,
    todayAverage,
    todayCv,
    hba1c,
  } = useAppState();

  const summary = useMemo(
    () => [
      { label: 'Average', value: formatValue(todayAverage, unit), unit },
      { label: 'HbA1c', value: hba1c.toFixed(1), unit: '%' },
      { label: 'CV', value: String(Math.round(todayCv)), unit: '%' },
    ],
    [todayAverage, hba1c, todayCv, unit],
  );

  // mmol/L runs to four glyphs plus a point, so the display size has to give.
  const readingSize = unit === 'mg/dL' ? 138 : 108;

  return (
    <Screen>
      <ScreenHeader title="Dashboard." subtitle={todayLabel} />

      {/* The reading owns the screen: everything else is annotation. */}
      <View className="mt-[71px] px-5">
        <View className="flex-row items-baseline">
          <Text
            className="font-inter-bold text-chalk"
            style={{
              fontSize: readingSize,
              lineHeight: readingSize,
              letterSpacing: unit === 'mg/dL' ? -19 : -8,
            }}
          >
            {formatValue(current, unit)}
          </Text>
          <Text
            className="ml-[21px] font-inter-medium text-[34px] text-chalk"
            style={{ letterSpacing: -0.5 }}
          >
            {unit}
          </Text>
        </View>
        <View className="absolute right-[24px] top-[43px]">
          <TrendTriangle direction={trend} />
        </View>
      </View>

      <View className="mt-[40px] px-5">
        <TraceChart readings={readings} unit={unit} width={width - 40} />
      </View>

      <View className="mt-[42px] px-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-[22px] leading-[26px] text-chalk">
            Summary
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="What these figures mean"
            hitSlop={14}
            onPress={() => {
              Haptics.selectionAsync();
              setInfoOpen(true);
            }}
            className="active:opacity-60"
          >
            <InfoIcon />
          </Pressable>
        </View>
        <View className="mt-[9px] h-[1px] bg-rule" />

        {/* Three columns on a 39% grid — the trailing stat lands where the
            comp puts it, well short of the right margin. */}
        <View className="mt-5 flex-row">
          {summary.map((stat, i) => (
            <View
              key={stat.label}
              className={['w-[42%]', 'w-[39%]', ''][i] || undefined}
            >
              <Text className="font-inter text-[11px] leading-[14px] text-mist">
                {stat.label}
              </Text>
              <View className="mt-1.5 flex-row items-baseline">
                <Text
                  className="font-inter-bold text-[32px] leading-[36px] text-chalk"
                  style={{ letterSpacing: -1 }}
                >
                  {stat.value}
                </Text>
                <Text className="ml-1.5 font-inter text-[12px] text-mist">
                  {stat.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <InfoSheet visible={infoOpen} onClose={() => setInfoOpen(false)} />
    </Screen>
  );
}
