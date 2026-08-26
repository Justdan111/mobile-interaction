import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chip } from '../ui/Chip';
import { Icon } from '../ui/icons';
import { TeamTile } from '../halftone/TeamTile';
import { formatPayRange, formatPostedDate } from '../../lib/format';
import { useTheme } from '../../lib/theme';
import type { Project } from '../../data/types';

export function ProjectCard({
  project,
  saved,
  onToggleSave,
  onPress,
}: {
  project: Project;
  saved: boolean;
  onToggleSave: () => void;
  onPress: () => void;
}) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onPress} className="mb-3 rounded-3xl bg-card p-4 active:opacity-90">
      <View className="flex-row items-start gap-3">
        <Text className="text-ink flex-1 text-[17px] font-semibold leading-[23px]">{project.title}</Text>
        <Pressable
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${project.title} from saved` : `Save ${project.title}`}
          onPress={onToggleSave}
        >
          <Icon name="heart" size={23} color={saved ? t.accent : t.muted} filled={saved} />
        </Pressable>
      </View>

      <Text className="text-ink mt-2 text-[20px] font-bold">
        {formatPayRange(project.payMin, project.payMax, project.currency)}
      </Text>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <Chip icon="pin" label={project.location} />
        <Chip icon="briefcase" label={project.experience} />
        <Chip icon="clock" label={project.commitment} />
      </View>

      <View className="mt-4 h-px bg-hairline" />

      <View className="mt-3 flex-row items-center gap-3">
        <TeamTile teamId={project.employer.id} name={project.employer.name} size={38} radius={12} />
        <View className="flex-1">
          <Text className="text-muted text-[12px]">Employer</Text>
          <Text className="text-ink text-[14px] font-semibold">{project.employer.name}</Text>
        </View>
        <Text className="text-muted text-[12px]">{formatPostedDate(project.postedAt)}</Text>
      </View>
    </Pressable>
  );
}
