import React from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { GlassTabBar, TABS } from '../../components/tabs/GlassTabBar';
import { TabBarChromeProvider } from '../../components/tabs/TabBarChrome';
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
// TabPill's `onPress` is a plain `() => void` (per the brief's interface),
// so this adapter can't forward the real GestureResponderEvent TabPill's own
// Pressable receives. That's fine for our own code, but the slot's `onPress`
// here is `expo-router/ui`'s `handleOnPress` (see TabTrigger.js), which
// calls `event?.isDefaultPrevented()` as a *function* and reads
// `event?.defaultPrevented` before it will actually switch tabs. A bare `{}`
// has neither: `({}).isDefaultPrevented` is `undefined`, and invoking it
// throws `TypeError: event.isDefaultPrevented is not a function` — before
// navigation ever runs. This minimal stand-in satisfies both checks so a
// press reaches `switchTab()` instead of throwing.
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
    // Wraps both the slot and the bar: the screens inside report their scroll
    // position, and the bar reads it. Anything outside this provider simply
    // renders the bar at full size.
    <TabBarChromeProvider>
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
    </TabBarChromeProvider>
  );
}
