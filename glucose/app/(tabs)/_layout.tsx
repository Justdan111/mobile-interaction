import { Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BarsIcon, LayersIcon, PulseIcon } from '@/components/icons';
import { colors } from '@/theme/colors';

const INACTIVE = '#6E6B76';

const TABS = [
  { name: 'index', href: '/', label: 'Dashboard', Icon: PulseIcon },
  { name: 'graph', href: '/graph', label: 'Graph', Icon: BarsIcon },
  { name: 'events', href: '/events', label: 'Events', Icon: LayersIcon },
] as const;

/**
 * The headless tabs from `expo-router/ui` rather than the stock bar: the app is
 * unlit black, and every ready-made tab bar brings its own background with it.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <Tabs>
      <TabSlot />

      <TabList
        style={{
          backgroundColor: colors.void,
          borderTopWidth: 1,
          borderTopColor: '#17171A',
          paddingTop: 10,
          paddingHorizontal: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          gap: 8,
        }}
      >
        {TABS.map(({ name, href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname === href;
          return (
            <TabTrigger
              key={name}
              name={name}
              href={href}
              onPress={() => Haptics.selectionAsync()}
              style={{ flex: 1 }}
            >
              <View
                className={`h-[52px] items-center justify-center rounded-2xl ${
                  active ? 'bg-chip-active/45' : ''
                }`}
              >
                <Icon size={21} color={active ? colors.chalk : INACTIVE} />
                <Text
                  className="mt-1 font-inter-medium text-[11px]"
                  style={{ color: active ? colors.chalk : INACTIVE }}
                >
                  {label}
                </Text>
              </View>
            </TabTrigger>
          );
        })}
      </TabList>
    </Tabs>
  );
}
