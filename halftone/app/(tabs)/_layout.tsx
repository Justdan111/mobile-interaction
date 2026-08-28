import React from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { GlassTabBar, TABS } from '../../components/tabs/GlassTabBar';
import { TabBarChromeProvider } from '../../components/tabs/TabBarChrome';
import { TabPill } from '../../components/tabs/TabPill';
import type { IconName } from '../../components/ui/icons';

export type TriggerProps = TabTriggerSlotProps & { icon: IconName; label: string };

// Exported so the prop forwarding can be tested directly: silently hardcoding
// `isFocused` instead of passing through what the slot handed us is the easy
// bug here.
// expo-router/ui's own `onPress` calls `event.isDefaultPrevented()` and reads
// `event.defaultPrevented` before it will switch tabs, and TabPill's `onPress`
// is a plain `() => void` with no event to forward. This stand-in satisfies
// both checks so a press reaches `switchTab()` instead of throwing.
const PRESS_EVENT_STUB = { isDefaultPrevented: () => false, defaultPrevented: false } as never;

export const Trigger = React.forwardRef<React.ComponentRef<typeof TabPill>, TriggerProps>(
  ({ icon, label, isFocused, onPress }, _ref) => (
    <TabPill
      icon={icon}
      label={label}
      isFocused={Boolean(isFocused)}
      onPress={() => onPress?.(PRESS_EVENT_STUB)}
    />
  )
);
Trigger.displayName = 'Trigger';

export default function TabsLayout() {
  return (
    // The screens inside report their scroll position; the bar reads it.
    <TabBarChromeProvider>
      <Tabs>
        {/* Before TabList, so the bar draws over the content as a floating pill. */}
        <TabSlot />
        <TabList asChild>
          <GlassTabBar>
            {TABS.map((t) => (
              <TabTrigger key={t.name} name={t.name} href={t.href as never} asChild>
                <Trigger icon={t.icon} label={t.label} />
              </TabTrigger>
            ))}
          </GlassTabBar>
        </TabList>
      </Tabs>
    </TabBarChromeProvider>
  );
}
