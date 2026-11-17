import React from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { PacksyTabBar, TabItem, TABS } from '../../components/tabs/PacksyTabBar';
import type { IconName } from '../../components/ui/icons';

type TriggerProps = TabTriggerSlotProps & { icon: IconName; label: string };

// expo-router/ui's onPress checks `isDefaultPrevented()` / `defaultPrevented`
// before switching tabs, but TabItem's onPress has no event to forward.
const PRESS_EVENT_STUB = { isDefaultPrevented: () => false, defaultPrevented: false } as never;

// TabTrigger's asChild hands its child a ref, which this wrapper drops: the
// bar never needs to measure a tab.
function Trigger({ icon, label, isFocused, onPress }: TriggerProps) {
  return <TabItem icon={icon} label={label} isFocused={Boolean(isFocused)} onPress={() => onPress?.(PRESS_EVENT_STUB)} />;
}

export default function TabsLayout() {
  return (
    <Tabs>
      {/* Before TabList, so the bar floats over the content. */}
      <TabSlot />
      <TabList asChild>
        <PacksyTabBar>
          {TABS.map((t) => (
            <TabTrigger key={t.name} name={t.name} href={t.href as never} asChild>
              <Trigger icon={t.icon} label={t.label} />
            </TabTrigger>
          ))}
        </PacksyTabBar>
      </TabList>
    </Tabs>
  );
}
