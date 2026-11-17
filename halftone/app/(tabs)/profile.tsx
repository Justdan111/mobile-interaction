import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { StatsCard } from '../../components/profile/StatsCard';
import { SettingsRow } from '../../components/profile/SettingsRow';
import { Toggle } from '../../components/ui/Toggle';
import { profile } from '../../data/profile';
import { useTheme } from '../../lib/theme';
import { useTabBarScroll } from '../../components/tabs/TabBarChrome';

export default function Profile() {
  const tabBarScroll = useTabBarScroll();
  const router = useRouter();
  const { mode, setPreference, t } = useTheme();
  const isDark = mode === 'dark';

  // The header plate is pale in both themes, so force a dark status bar while
  // focused and restore it on blur, or every other tab inherits it.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
      return () => setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark])
  );

  return (
    <SafeAreaView className="flex-1 bg-page" edges={[]}>
      <ScrollView
        {...tabBarScroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader profile={profile} />

        <View className="px-4 pt-4">
          <StatsCard profile={profile} onResume={() => {}} />
        </View>

        <View className="mx-4 mt-4 overflow-hidden rounded-3xl bg-card">
          <SettingsRow icon="heart" label="Saved projects" onPress={() => router.push('/')} />
          <SettingsRow icon="shield" label="Support" onPress={() => {}} />
          <SettingsRow icon="lock" label="Password" onPress={() => {}} />
          <SettingsRow icon="bell" label="Notification" onPress={() => {}} />
          <SettingsRow
            icon="moon"
            label="Dark Mode"
            last
            right={
              <Toggle
                accessibilityLabel="Dark Mode"
                value={isDark}
                onChange={(next) => setPreference(next ? 'dark' : 'light')}
                tint={t.success}
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
