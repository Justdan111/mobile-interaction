import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { TabButton } from '@/components/TabButton';
import { HistoryIcon, HomeIcon, PromosIcon, TrackIcon } from '@/components/art/TabIcons';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={{ flex: 1, backgroundColor: colors.white }}>
      <TabSlot style={{ flex: 1, minHeight: 0 }} />
      <TabList
        style={{
          flexDirection: 'row',
          backgroundColor: colors.white,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom - 12, 12),
        }}
      >
        <TabTrigger name="home" href="/home" asChild>
          <TabButton icon={HomeIcon} label="Home" />
        </TabTrigger>
        <TabTrigger name="track" href="/track" asChild>
          <TabButton icon={TrackIcon} label="Track" />
        </TabTrigger>
        <TabTrigger name="history" href="/history" asChild>
          <TabButton icon={HistoryIcon} label="History" />
        </TabTrigger>
        <TabTrigger name="promos" href="/promos" asChild>
          <TabButton icon={PromosIcon} label="Promos" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
