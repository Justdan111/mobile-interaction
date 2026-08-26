import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/icons';
import { formatDayMonth } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import type { AgendaItem } from '../../data/types';

export function AgendaCard({ item, onPress }: { item: AgendaItem; onPress: () => void }) {
  const { t } = useTheme();
  const { day, month } = formatDayMonth(item.date);

  return (
    <Pressable onPress={onPress} className="mb-3 flex-row overflow-hidden rounded-3xl bg-card active:opacity-90">
      <View style={{ width: 5, backgroundColor: t.accent }} />
      <View className="w-[74px] items-center justify-center py-4">
        <Text className="font-display text-ink text-[30px]">{day}</Text>
        {/* Comp draws the month abbreviation in accent under the white day. */}
        <Text className="text-accent text-[13px] font-semibold">{month}</Text>
      </View>
      <View className="flex-1 justify-center py-4 pr-3">
        <View className="flex-row gap-2">
          <Chip icon="clock" label="Deadline" />
          {item.kind === 'Task' ? <Chip icon="briefcase" label="Task" /> : null}
        </View>
        <Text className="text-muted mt-2.5 text-[12px]">{item.projectName}</Text>
        <Text className="text-ink mt-0.5 text-[16px] font-semibold leading-[21px]">{item.title}</Text>
      </View>
      <View className="justify-center pr-4">
        <Icon name="chevronRight" size={22} color={t.muted} />
      </View>
    </Pressable>
  );
}
