import { View } from 'react-native';
import type { ComponentType } from 'react';
import type { GlassContainerProps, GlassViewProps } from 'expo-glass-effect';

/**
 * On iOS, `expo-glass-effect` calls `requireNativeViewManager` at module
 * evaluation time, which throws in Expo Go where the native module is not
 * linked — before `isLiquidGlassAvailable()` ever gets to return false. This
 * module is the guard: it loads the package inside a try/catch and falls back
 * to a plain View. Everything else imports glass APIs from here.
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
