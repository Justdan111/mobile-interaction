import { View } from 'react-native';
import type { ComponentType } from 'react';
import type { GlassContainerProps, GlassViewProps } from 'expo-glass-effect';

/**
 * `expo-glass-effect` was pulled from app.json's `plugins` array in Task 1:
 * it ships no config plugin, and its presence there crashes `expo start`.
 * The package is still a normal dependency and its JS API is importable, but
 * that only covers the module resolving — it says nothing about the native
 * module being present at runtime.
 *
 * On iOS specifically, `GlassView.ios.tsx` and `GlassContainer.ios.tsx` call
 * `requireNativeViewManager('ExpoGlassEffect', ...)` at module *evaluation*
 * time (top level, not inside a function), and `isLiquidGlassAvailable.ios.ts`
 * calls `requireNativeModule('ExpoGlassEffect')` the first time it runs. Both
 * throw if the native module isn't linked — which is exactly the situation in
 * Expo Go, since there is no config plugin to autolink it there. A bare
 * `import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'`
 * would then throw at import time, before `isLiquidGlassAvailable()` ever
 * gets a chance to return `false` and route around it.
 *
 * This module is the guard: it loads the real package inside a try/catch and
 * falls back to a plain `View` and an always-false availability check if the
 * native module isn't there. Everything else in the app imports glass APIs
 * from here, never directly from `expo-glass-effect`.
 */
type GlassModule = {
  GlassView: ComponentType<GlassViewProps>;
  GlassContainer: ComponentType<GlassContainerProps>;
  isLiquidGlassAvailable: () => boolean;
};

function loadGlassModule(): GlassModule {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-glass-effect');
    if (!mod?.GlassView || !mod?.GlassContainer || typeof mod?.isLiquidGlassAvailable !== 'function') {
      throw new Error('expo-glass-effect module shape unexpected');
    }
    return {
      GlassView: mod.GlassView,
      GlassContainer: mod.GlassContainer,
      isLiquidGlassAvailable: mod.isLiquidGlassAvailable,
    };
  } catch {
    return {
      GlassView: View,
      GlassContainer: View,
      isLiquidGlassAvailable: () => false,
    };
  }
}

const glass = loadGlassModule();

export const GlassView = glass.GlassView;
export const GlassContainer = glass.GlassContainer;
export const isLiquidGlassAvailable = glass.isLiquidGlassAvailable;
