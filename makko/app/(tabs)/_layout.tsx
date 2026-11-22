import React from 'react';
import { router } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { CreateButton, MakkoTabBar, TabItem, TABS, type TabDef } from '../../components/tabs/MakkoTabBar';
import { ME } from '../../data/people';

// expo-router/ui's onPress checks `isDefaultPrevented()` before switching
// tabs, but TabItem's onPress has no event to forward.
const PRESS_EVENT_STUB = { isDefaultPrevented: () => false, defaultPrevented: false } as never;

function Trigger({ tab, isFocused, onPress }: TabTriggerSlotProps & { tab: TabDef }) {
  return (
    <TabItem
      tab={tab}
      isFocused={Boolean(isFocused)}
      onPress={() => onPress?.(PRESS_EVENT_STUB)}
      avatar={tab.icon === 'avatar' ? ME.avatar : undefined}
    />
  );
}

export default function TabsLayout() {
  const [feed, search, chat, profile] = TABS;
  const trigger = (t: TabDef) => (
    <TabTrigger key={t.name} name={t.name} href={t.href as never} asChild>
      <Trigger tab={t} />
    </TabTrigger>
  );
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <MakkoTabBar>
          {trigger(feed)}
          {trigger(search)}
          <CreateButton onPress={() => router.push('/create')} />
          {trigger(chat)}
          {trigger(profile)}
        </MakkoTabBar>
      </TabList>
    </Tabs>
  );
}
