import React from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { MoodTabBar, TabItem, TABS } from '../../components/tabs/MoodTabBar';
import type { IconName } from '../../components/ui/icons';

export type TriggerProps = TabTriggerSlotProps & {
  icon: IconName;
  label: string;
  index?: number;
};

/** Where the tab bar picks up Home's cascade. */
const TAB_BAR_CASCADE_START = 17;

// expo-router/ui's own `onPress` calls `event.isDefaultPrevented()` and reads
// `event.defaultPrevented` before it will switch tabs, but TabItem's `onPress`
// is a plain `() => void` with no event to forward. This stand-in satisfies
// both checks so a press reaches `switchTab()` instead of throwing.
const PRESS_EVENT_STUB = {
  isDefaultPrevented: () => false,
  defaultPrevented: false,
} as never;

export const Trigger = React.forwardRef<React.ComponentRef<typeof TabItem>, TriggerProps>(
  ({ icon, label, index, isFocused, onPress }, _ref) => (
    <TabItem
      icon={icon}
      label={label}
      index={index}
      isFocused={Boolean(isFocused)}
      onPress={() => onPress?.(PRESS_EVENT_STUB)}
    />
  )
);
Trigger.displayName = 'Trigger';

export default function TabsLayout() {
  return (
    <Tabs>
      {/* Before TabList, so the bar floats over the content as a pill. */}
      <TabSlot />
      <TabList asChild>
        <MoodTabBar>
          {TABS.map((t, i) => (
            <TabTrigger key={t.name} name={t.name} href={t.href as never} asChild>
              {/* The bar lands after the page content, so the tabs continue
                  the cascade rather than starting their own. */}
              <Trigger icon={t.icon} label={t.label} index={TAB_BAR_CASCADE_START + i} />
            </TabTrigger>
          ))}
        </MoodTabBar>
      </TabList>
    </Tabs>
  );
}
