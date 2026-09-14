import React from 'react';
import { Text, View } from 'react-native';
import type { Goal } from '../../data/goals';
import { goalProgress } from '../../lib/activity';
import { formatSteps } from '../../lib/format';
import { Icon } from '../ui/icons';
import { Ring } from '../ui/Ring';

const ACCENT = '#E8724C';
const TRACK = '#2A2A2C';

/**
 * A goal row with its progress ring — `journey-activity.png`.
 *
 * Progress is read from `goalProgress`, the same solved series the charts use,
 * so a goal can never disagree with the chart above it.
 */
export function GoalRow({ goal, date }: { goal: Goal; date: string }) {
  const { current, target, ratio } = goalProgress(goal, date);
  const label = goal.source === 'steps' ? formatSteps(current) : `${current}/${target}`;

  return (
    <View className="mb-2.5 flex-row items-center rounded-3xl bg-card px-4 py-4">
      <View className="flex-1 pr-3">
        <Text className="font-semibold text-[15.5px] text-ink" numberOfLines={2}>
          {goal.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Icon name="clock" color="#8E8E93" size={14} />
          <Text className="ml-1.5 font-body text-[12.5px] text-muted">{goal.cadence}</Text>
          <Text className="mx-2 font-body text-[12.5px] text-muted">|</Text>
          <Icon name="flag" color="#8E8E93" size={14} />
          <Text className="ml-1.5 font-body text-[12.5px] text-muted">{goal.deadline}</Text>
        </View>
      </View>

      <View className="h-[54px] w-[54px] items-center justify-center">
        <Ring ratio={ratio} size={54} strokeWidth={3} track={TRACK} fill={ACCENT} />
        <View className="absolute">
          <Text className="font-semibold text-[11.5px] text-ink">{label}</Text>
        </View>
      </View>
    </View>
  );
}
