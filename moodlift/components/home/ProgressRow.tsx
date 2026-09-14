import React from 'react';
import { Text, View } from 'react-native';
import type { DayMetrics } from '../../lib/activity';
import { formatDuration, formatSteps } from '../../lib/format';
import { Icon, type IconName } from '../ui/icons';
import { Ring } from '../ui/Ring';
import { Entrance } from '../ui/Entrance';

const ACCENT = '#E8724C';
const TRACK = '#2A2A2C';

/** Daily reference points, only for how full each dial looks. */
const STEP_GOAL = 5000;
const CALORIE_GOAL = 600;
const ACTIVE_GOAL = 90;

function StatCard({
  icon,
  ratio,
  value,
  unit,
  index,
}: {
  icon: IconName;
  ratio: number;
  value: string;
  unit: string;
  index: number;
}) {
  return (
    <Entrance index={index} style={{ flex: 1 }}>
      <View className="mr-2.5 rounded-3xl bg-card px-3.5 pb-4 pt-4">
      <View className="h-[46px] w-[46px] items-center justify-center">
        <Ring ratio={ratio} size={46} strokeWidth={3} track={TRACK} fill={ACCENT} />
        <View className="absolute">
          <Icon name={icon} color="#FFFFFF" size={18} strokeWidth={1.5} />
        </View>
      </View>

      <View className="mt-4 flex-row items-baseline">
        <Text className="font-semibold text-[17px] text-ink" numberOfLines={1}>
          {value}
        </Text>
          <Text className="ml-1 font-body text-[13px] text-muted" numberOfLines={1}>
            {unit}
          </Text>
        </View>
      </View>
    </Entrance>
  );
}

/**
 * The three dials under "Your progress".
 *
 * Takes the whole `DayMetrics` rather than three loose numbers, so these can
 * never be handed figures that disagree with the journey screen's.
 */
export function ProgressRow({ metrics, index = 0 }: { metrics: DayMetrics; index?: number }) {
  return (
    <View className="-mr-2.5 flex-row">
      <StatCard
        index={index}
        icon="steps"
        ratio={metrics.steps / STEP_GOAL}
        value={formatSteps(metrics.steps)}
        unit="steps"
      />
      <StatCard
        index={index + 1}
        icon="flame"
        ratio={metrics.calories / CALORIE_GOAL}
        value={String(metrics.calories)}
        unit="kcal"
      />
      <StatCard
        index={index + 2}
        icon="dumbbell"
        ratio={metrics.activeMinutes / ACTIVE_GOAL}
        value={formatDuration(metrics.activeMinutes)}
        unit="activity"
      />
    </View>
  );
}
