import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Chip } from '../../components/ui/Chip';
import { PillButton } from '../../components/ui/PillButton';
import { TeamTile } from '../../components/halftone/TeamTile';
import { Icon } from '../../components/ui/icons';
import { projects } from '../../data/projects';
import { formatPayRange, formatPostedDate, formatDayMonth } from '../../lib/format';
import { useTheme } from '../../lib/theme';

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTheme();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-page">
        <Text className="text-muted text-[15px]">That project is no longer listed.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-page" edges={['top']}>
      <ScreenHeader title="Project" back />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="text-ink text-[24px] font-bold leading-[31px]">{project.title}</Text>
        <Text className="text-ink mt-2 text-[22px] font-bold">
          {formatPayRange(project.payMin, project.payMax, project.currency)}
        </Text>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <Chip icon="pin" label={project.location} />
          <Chip icon="briefcase" label={project.experience} />
          <Chip icon="clock" label={project.commitment} />
        </View>

        <View className="mt-5 flex-row items-center gap-3 rounded-3xl bg-card p-4">
          <TeamTile teamId={project.employer.id} name={project.employer.name} size={44} radius={14} />
          <View className="flex-1">
            <Text className="text-muted text-[12px]">Employer</Text>
            <Text className="text-ink text-[15px] font-semibold">{project.employer.name}</Text>
          </View>
          <Text className="text-muted text-[12px]">{formatPostedDate(project.postedAt)}</Text>
        </View>

        <Text className="font-display text-ink mt-7 text-[22px]">About</Text>
        <Text className="text-muted mt-2 text-[15px] leading-[23px]">{project.description}</Text>

        <Text className="font-display text-ink mt-7 text-[22px]">Milestones</Text>
        <View className="mt-3 rounded-3xl bg-card">
          {project.tasks.map((task, i) => {
            const { day, month } = formatDayMonth(task.due);
            return (
              <View
                key={task.id}
                className={`flex-row items-center gap-3 p-4 ${i > 0 ? 'border-t border-hairline' : ''}`}
              >
                <View className="items-center">
                  <Text className="font-display text-ink text-[18px]">{day}</Text>
                  <Text className="text-muted text-[10px]">{month}</Text>
                </View>
                <Text className="text-ink flex-1 text-[15px]">{task.title}</Text>
                {task.done ? <Icon name="check" size={18} color={t.success} /> : null}
              </View>
            );
          })}
        </View>

        <View className="mt-8">
          <PillButton label="Send proposal" onPress={() => router.push('/proposals')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
