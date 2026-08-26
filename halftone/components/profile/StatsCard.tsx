import React from 'react';
import { Text, View } from 'react-native';
import { PillButton } from '../ui/PillButton';
import { Icon } from '../ui/icons';
import { useTheme } from '../../lib/theme';
import { RATING_STAR_COLOR } from '../../lib/tokens';
import type { Profile } from '../../data/types';

export function StatsCard({ profile, onResume }: { profile: Profile; onResume: () => void }) {
  const { t } = useTheme();
  return (
    <View className="rounded-3xl bg-card p-4">
      <Text className="text-muted text-[12px]">Status</Text>
      <View className="mt-0.5 flex-row items-center gap-1.5">
        <Text className="text-ink text-[17px] font-semibold">{profile.status}</Text>
        <Icon name="chevronRight" size={17} color={t.muted} />
      </View>

      <View className="mt-4 rounded-2xl bg-chip p-4">
        <View className="flex-row items-center">
          <Text className="text-ink flex-1 text-[18px] font-bold">{profile.role}</Text>
          <Icon name="star" size={16} color={RATING_STAR_COLOR} filled />
          <Text className="text-ink ml-1.5 text-[15px] font-semibold">
            {profile.rating.toString().replace('.', ',')}
          </Text>
        </View>

        <View className="mt-3 flex-row gap-2.5">
          <View className="flex-1 rounded-xl bg-card p-3">
            <Text className="text-muted text-[11px]">Happy Clients</Text>
            <Text className="text-ink mt-1 text-[17px] font-bold">{profile.happyClients}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-card p-3">
            <Text className="text-muted text-[11px]">Completed Projects</Text>
            <Text className="text-ink mt-1 text-[17px] font-bold">{profile.completedProjects}</Text>
          </View>
        </View>

        <View className="mt-3">
          <PillButton label="Go to Resume" onPress={onResume} variant="ghost" />
        </View>
      </View>
    </View>
  );
}
