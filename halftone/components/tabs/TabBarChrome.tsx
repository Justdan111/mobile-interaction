import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { shouldCollapse } from '../../lib/tabBarCollapse';

/**
 * Carries how collapsed the floating tab bar should be, from whichever tab
 * screen is scrolling to the bar itself.
 *
 * A shared value rather than React state on purpose: this changes on every
 * scroll frame, and routing that through `setState` would re-render all five
 * tab screens for an animation the UI thread can run on its own.
 */
type TabBarChromeValue = {
  /** 0 = full bar with the focused tab's label; 1 = icons only. */
  collapse: SharedValue<number>;
  /**
   * The same state as a plain boolean, for the one thing a shared value cannot
   * drive: mounting and unmounting the focused tab's label. It flips at most a
   * couple of times per scroll gesture, not per frame.
   */
  collapsed: boolean;
  /** Feed a scroll offset in. Safe to call from a plain onScroll handler. */
  reportScroll: (offset: number) => void;
  /** True when the user has asked the system to reduce motion. */
  reduceMotion: boolean;
};

const TabBarChromeContext = createContext<TabBarChromeValue | null>(null);

const COLLAPSE_DURATION = 220;

export function TabBarChromeProvider({ children }: { children: React.ReactNode }) {
  const collapse = useSharedValue(0);
  // Kept off the shared value because the decision needs plain JS numbers and
  // runs on the JS thread, where the scroll events arrive anyway.
  const previousOffset = React.useRef(0);
  const collapsedRef = React.useRef(false);
  const [collapsed, setCollapsed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduceMotion(enabled);
      })
      .catch(() => {
        // Unavailable on this platform — assume motion is fine, which is the
        // same behaviour as before this setting was honoured at all.
      });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const reportScroll = useCallback(
    (offset: number) => {
      // With reduce motion on, the bar simply never collapses. Snapping it
      // between two sizes with no transition would be worse than not moving.
      if (reduceMotion) {
        collapse.value = 0;
        if (collapsedRef.current) {
          collapsedRef.current = false;
          setCollapsed(false);
        }
        return;
      }
      const next = shouldCollapse({
        offset,
        previousOffset: previousOffset.current,
        collapsed: collapsedRef.current,
      });
      previousOffset.current = offset;
      if (next === collapsedRef.current) return;
      collapsedRef.current = next;
      setCollapsed(next);
      collapse.value = withTiming(next ? 1 : 0, { duration: COLLAPSE_DURATION });
    },
    [collapse, reduceMotion]
  );

  return (
    <TabBarChromeContext.Provider value={{ collapse, collapsed, reportScroll, reduceMotion }}>
      {children}
    </TabBarChromeContext.Provider>
  );
}

export function useTabBarChrome(): TabBarChromeValue {
  const ctx = useContext(TabBarChromeContext);
  if (!ctx) throw new Error('useTabBarChrome must be used inside a TabBarChromeProvider');
  return ctx;
}

/**
 * The collapse driver, or a private one that never moves when there is no
 * provider — so the bar can be rendered on its own in a test and simply sits
 * at its full size. Both hooks run unconditionally either way.
 */
export function useTabBarCollapseValue(): SharedValue<number> {
  const ctx = useContext(TabBarChromeContext);
  const standalone = useSharedValue(0);
  return ctx?.collapse ?? standalone;
}

/**
 * Whether the bar is currently collapsed, for components that must render
 * differently rather than animate. Returns false outside the provider so a
 * screen or a pill can still be rendered on its own in a test.
 */
export function useTabBarCollapsed(): boolean {
  return useContext(TabBarChromeContext)?.collapsed ?? false;
}

/**
 * Spread onto a tab screen's scroll view so the bar reacts to it:
 * `<FlatList {...useTabBarScroll()} />`.
 *
 * Returns a no-op outside the provider so a screen can still be rendered on
 * its own in a test without being wrapped in the tab layout.
 */
export function useTabBarScroll() {
  const ctx = useContext(TabBarChromeContext);
  return {
    scrollEventThrottle: 16,
    onScroll: (e: { nativeEvent: { contentOffset: { y: number } } }) =>
      ctx?.reportScroll(e.nativeEvent.contentOffset.y),
  };
}
