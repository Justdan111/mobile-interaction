import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { shouldCollapse } from '../../lib/tabBarCollapse';

/**
 * Carries how collapsed the floating tab bar should be, from whichever tab
 * screen is scrolling to the bar itself. A shared value rather than state:
 * this changes every frame, and `setState` would re-render all five screens.
 */
type TabBarChromeValue = {
  /** 0 = full bar with the focused tab's label; 1 = icons only. */
  collapse: SharedValue<number>;
  /** The one thing a shared value cannot drive: mounting the focused label. */
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
        // Unavailable on this platform — assume motion is fine.
      });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const reportScroll = useCallback(
    (offset: number) => {
      // Snapping between two sizes with no transition is worse than not moving.
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

/** Falls back to a private value outside the provider, so the bar sits full size. */
export function useTabBarCollapseValue(): SharedValue<number> {
  const ctx = useContext(TabBarChromeContext);
  const standalone = useSharedValue(0);
  return ctx?.collapse ?? standalone;
}

/** For components that must render differently rather than animate. */
export function useTabBarCollapsed(): boolean {
  return useContext(TabBarChromeContext)?.collapsed ?? false;
}

/** Spread onto a tab screen's scroll view: `<FlatList {...useTabBarScroll()} />`. */
export function useTabBarScroll() {
  const ctx = useContext(TabBarChromeContext);
  return {
    scrollEventThrottle: 16,
    onScroll: (e: { nativeEvent: { contentOffset: { y: number } } }) =>
      ctx?.reportScroll(e.nativeEvent.contentOffset.y),
  };
}
