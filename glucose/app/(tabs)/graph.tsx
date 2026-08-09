import { useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FortnightChart } from '@/components/charts/FortnightChart';
import { TraceChart } from '@/components/charts/TraceChart';
import { PlusIcon } from '@/components/icons';
import { Sheet, SheetRow } from '@/components/ui/Sheet';
import { CheckIcon } from '@/components/icons';
import { useAppState, type GraphMode, type GraphRange } from '@/state/app-state';
import { colors } from '@/theme/colors';
import { formatValue, project } from '@/lib/glucose';

const MODES: { key: GraphMode; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'prediction', label: 'Prediction' },
];

const RANGES: GraphRange[] = [7, 14];

/**
 * The badge wording tracks the consensus time-in-range thresholds. It grades the
 * percentage as displayed, so a value that reads 50% can never be badged as if
 * it were 49.
 */
function gradeFor(tir: number): string {
  const percent = Math.round(tir * 100);
  if (percent >= 70) return 'Great';
  if (percent >= 50) return 'Good';
  if (percent >= 30) return 'Fair';
  return 'Low';
}

export default function Graph() {
  const { width } = useWindowDimensions();
  const [rangeOpen, setRangeOpen] = useState(false);
  const {
    unit,
    target,
    readings,
    days,
    fortnight,
    graphMode,
    setGraphMode,
    graphRange,
    setGraphRange,
    selectedDay,
    selectDay,
  } = useAppState();

  const projection = useMemo(
    () => project(readings, target, 12),
    [readings, target],
  );

  const isPrediction = graphMode === 'prediction';
  const projected = projection[projection.length - 1]?.mgdl ?? 0;

  // Overview leads with time in range; prediction leads with where the trace
  // is heading in the next hour.
  const headline = isPrediction
    ? { value: formatValue(projected, unit), unit, badge: 'in 1h' }
    : {
        value: String(Math.round(fortnight.tir * 100)),
        unit: '%',
        badge: gradeFor(fortnight.tir),
      };

  const headlineSize = headline.value.length > 3 ? 104 : 140;

  return (
    <Screen>
      <ScreenHeader
        title="Graph."
        subtitle={`${graphRange}-DAY SUMMARY`}
      />

      <View className="mt-6 flex-row items-center gap-2 px-5">
        {MODES.map(({ key, label }) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: graphMode === key }}
            onPress={() => {
              Haptics.selectionAsync();
              setGraphMode(key);
            }}
            className={`h-[30px] justify-center rounded-full px-3 active:opacity-80 ${
              graphMode === key
                ? 'bg-chip-active'
                : 'border border-chip-edge bg-chip'
            }`}
          >
            <Text
              className={`font-inter-medium text-[13px] ${
                graphMode === key ? 'text-chalk' : 'text-mist'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change chart range"
          onPress={() => {
            Haptics.selectionAsync();
            setRangeOpen(true);
          }}
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

      {/* Overview keeps the comp's composition exactly: only the numeral is
          centred, and the "%" hangs off its bottom-right. A unit as wide as
          "mg/dL" cannot hang off the same way without landing on the digits, so
          prediction sets it on the baseline instead. */}
      <View className="mt-[41px] items-center" style={{ paddingLeft: isPrediction ? 0 : 23 }}>
        <View className={isPrediction ? 'flex-row items-baseline' : undefined}>
          <Text
            className="font-inter-bold text-chalk"
            style={{
              fontSize: headlineSize,
              lineHeight: headlineSize,
              letterSpacing: -9,
            }}
          >
            {headline.value}
          </Text>

          {isPrediction ? (
            <Text className="ml-3 font-inter-medium text-[30px] text-chalk">
              {headline.unit}
            </Text>
          ) : (
            <Text className="absolute -right-[52px] bottom-[10px] font-inter-medium text-[42px] text-chalk">
              {headline.unit}
            </Text>
          )}

          {/* Hangs off the numeral's right shoulder, clipping its top corner
              rather than sitting on top of the digit. */}
          <View
            className="absolute top-[19px] rounded-full bg-badge px-2.5 py-[3px]"
            style={isPrediction ? { right: -6 } : { right: -28 }}
          >
            <Text className="font-inter-medium text-[13px] text-badge-ink">
              {headline.badge}
            </Text>
          </View>
        </View>
      </View>

      {isPrediction ? (
        <View className="mt-[45px] px-5">
          <View className="rounded-[26px] border border-panel-edge bg-chip px-4 pb-4 pt-5">
            <TraceChart
              readings={readings}
              projection={projection}
              unit={unit}
              width={width - 72}
              height={150}
            />
          </View>
          <Text className="mt-3 font-inter text-[12px] leading-[17px] text-smoke">
            Dashed line projects the last hour's trend forward, easing toward the
            middle of your target band. It is a projection of the curve, not a
            clinical forecast.
          </Text>
        </View>
      ) : (
        <View className="mt-[45px] px-5">
          <FortnightChart
            days={days}
            selected={selectedDay}
            onSelect={selectDay}
            width={width - 40}
          />
        </View>
      )}

      <Sheet
        visible={rangeOpen}
        onClose={() => setRangeOpen(false)}
        title="Chart range."
        subtitle="How much history the summary covers."
      >
        {RANGES.map((r) => (
          <SheetRow
            key={r}
            label={`${r} days`}
            detail={
              r === 7 ? 'The current week' : 'The standard reporting period'
            }
            selected={graphRange === r}
            onPress={() => {
              Haptics.selectionAsync();
              setGraphRange(r);
              selectDay(null);
              setRangeOpen(false);
            }}
            accessory={graphRange === r ? <CheckIcon /> : null}
          />
        ))}
        <View className="h-1" />
      </Sheet>
    </Screen>
  );
}
