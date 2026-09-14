import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Icon, type IconName } from '../../components/ui/icons';
import { MascotFor } from '../../components/mascots';
import { useMood } from '../../lib/mood-context';
import { metricsFor, todayKey, weekEnding } from '../../lib/activity';
import { formatDuration, formatSteps } from '../../lib/format';

const USER = { name: 'George Davidson', email: 'george@moodlift.app', streak: 21 };
const ACCENT = '#E8724C';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-3xl bg-card py-4">
      <Text className="font-semibold text-[18px] text-ink">{value}</Text>
      <Text className="mt-1 font-body text-[12.5px] text-muted">{label}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="mb-2.5 flex-row items-center rounded-3xl bg-card px-4 py-4 active:opacity-90"
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-chip">
        <Icon name={icon} color="#FFFFFF" size={18} />
      </View>
      <Text className="ml-3 flex-1 font-medium text-[15px] text-ink">{label}</Text>
      {detail && <Text className="mr-2 font-body text-[13.5px] text-muted">{detail}</Text>}
      <Icon name="chevron-right" color="#8E8E93" size={16} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { mood, clearMood } = useMood();
  const date = todayKey();
  const metrics = metricsFor(date);
  const week = weekEnding(date);

  const weekMinutes = week.reduce((total, d) => total + d.activeMinutes, 0);
  const Mascot = mood ? MascotFor(mood.id) : null;

  return (
    <Screen>
      <Text className="mb-5 font-display text-[26px] text-ink">Profile</Text>

      <View className="mb-5 flex-row items-center">
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: ACCENT }}
        >
          <Text className="font-display text-[22px] text-page">GD</Text>
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-display text-[21px] text-ink">{USER.name}</Text>
          <Text className="mt-0.5 font-body text-[13.5px] text-muted">{USER.email}</Text>
        </View>
      </View>

      {/* The current mood is part of who you are in this app, so it belongs
          here — with a way to clear it and start the question again. */}
      <View
        className="mb-5 flex-row items-center overflow-hidden rounded-3xl px-4 py-3"
        style={{ backgroundColor: mood ? mood.surface : '#1B1B1D' }}
      >
        {mood && Mascot ? (
          <Mascot size={54} fill={mood.mascotFill} ink={mood.mascotInk} />
        ) : (
          <View className="h-[54px] w-[54px] items-center justify-center">
            <Icon name="heart" color="#8E8E93" size={24} />
          </View>
        )}

        <View className="ml-3 flex-1">
          <Text
            className="font-body text-[12.5px]"
            style={{ color: mood ? mood.mutedOnSurface : '#8E8E93' }}
          >
            Today you feel
          </Text>
          <Text
            className="mt-0.5 font-display text-[19px]"
            style={{ color: mood ? mood.onSurface : '#FFFFFF' }}
          >
            {mood ? mood.label : 'Not set yet'}
          </Text>
        </View>

        <Pressable
          onPress={() => (mood ? clearMood() : router.push('/mood'))}
          accessibilityRole="button"
          accessibilityLabel={mood ? 'Clear your mood' : 'Set your mood'}
          hitSlop={8}
          className="rounded-full px-3.5 py-2"
          style={{ backgroundColor: mood ? 'rgba(255,255,255,0.18)' : '#2A2A2C' }}
        >
          <Text
            className="font-display text-[13.5px]"
            style={{ color: mood ? mood.onSurface : '#FFFFFF' }}
          >
            {mood ? 'Clear' : 'Set'}
          </Text>
        </Pressable>
      </View>

      <View className="mb-5 flex-row gap-2.5">
        <Stat label="Day streak" value={String(USER.streak)} />
        <Stat label="Steps today" value={formatSteps(metrics.steps)} />
        <Stat label="This week" value={formatDuration(weekMinutes)} />
      </View>

      <Row icon="intensity" label="My fitness journey" onPress={() => router.push('/journey')} />
      <Row icon="qr" label="Gym pass" onPress={() => router.push('/pass')} />
      <Row icon="calendar" label="My schedule" onPress={() => router.push('/calendar')} />
      <Row icon="bell" label="Notifications" detail="On" />
      <Row icon="person" label="Account" />
    </Screen>
  );
}
