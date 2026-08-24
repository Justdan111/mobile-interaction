import React from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { GlassTabBar, TABS } from '../../components/tabs/GlassTabBar';
import { TabPill } from '../../components/tabs/TabPill';
import type { IconName } from '../../components/ui/icons';

export type TriggerProps = TabTriggerSlotProps & { icon: IconName; label: string };

// Named export (in addition to the default layout below) purely so this
// adapter's prop-forwarding can be unit-tested directly: expo-router/ui's
// `TabTrigger` computes `isFocused` from real router state, which is that
// library's own tested responsibility, not ours. What IS ours to get wrong
// is this glue — silently hardcoding `isFocused` instead of forwarding what
// the slot handed it, the same class of bug this project shipped last task
// (a `Segmented` and `Toggle` that ignored their own props). See
// __tests__/tabs/TabsLayoutTrigger.test.tsx.
export const Trigger = React.forwardRef<React.ComponentRef<typeof TabPill>, TriggerProps>(
  ({ icon, label, isFocused, onPress }, _ref) => (
    <TabPill
      icon={icon}
      label={label}
      isFocused={Boolean(isFocused)}
      onPress={() => onPress?.({} as never)}
    />
  )
);
Trigger.displayName = 'Trigger';

export default function TabsLayout() {
  return (
    <Tabs>
      {/* TabSlot renders before TabList so the bar draws over the screen
          content — it is a floating pill, not a docked bar. */}
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
  );
}
