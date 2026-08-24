/**
 * `lib/glass.ts` exists to handle a specific risk carried over from Task 1:
 * `expo-glass-effect` has no config plugin, so it can't be autolinked in
 * Expo Go, and on iOS its `GlassView`/`GlassContainer` modules call
 * `requireNativeViewManager` at *module evaluation* time — a bare
 * `import { GlassView } from 'expo-glass-effect'` would throw before
 * `isLiquidGlassAvailable()` ever gets a chance to route around it. This
 * file proves the guard actually guards: that requiring the wrapper when
 * the underlying package throws does NOT propagate the throw, and instead
 * falls back to a plain View and an always-false availability check — and,
 * for contrast, that a working module is passed through rather than always
 * falling back regardless of what's actually available.
 */

describe('lib/glass', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('expo-glass-effect');
  });

  it('falls back to View and isLiquidGlassAvailable() === false when requiring expo-glass-effect throws', () => {
    jest.resetModules();
    jest.doMock('expo-glass-effect', () => {
      throw new Error('ExpoGlassEffect native module not found');
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GlassView, GlassContainer, isLiquidGlassAvailable } = require('../../lib/glass');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { View } = require('react-native');

    expect(GlassView).toBe(View);
    expect(GlassContainer).toBe(View);
    expect(isLiquidGlassAvailable()).toBe(false);
  });

  it('falls back the same way when the module resolves but is missing expected exports', () => {
    jest.resetModules();
    jest.doMock('expo-glass-effect', () => ({}));

    const { GlassView, GlassContainer, isLiquidGlassAvailable } = require('../../lib/glass');
    const { View } = require('react-native');

    expect(GlassView).toBe(View);
    expect(GlassContainer).toBe(View);
    expect(isLiquidGlassAvailable()).toBe(false);
  });

  it('passes the real module through when it loads successfully, rather than always falling back', () => {
    jest.resetModules();
    const RealGlassView = () => null;
    const RealGlassContainer = () => null;
    jest.doMock('expo-glass-effect', () => ({
      GlassView: RealGlassView,
      GlassContainer: RealGlassContainer,
      isLiquidGlassAvailable: () => true,
      isGlassEffectAPIAvailable: () => true,
    }));

    const { GlassView, GlassContainer, isLiquidGlassAvailable } = require('../../lib/glass');

    expect(GlassView).toBe(RealGlassView);
    expect(GlassContainer).toBe(RealGlassContainer);
    expect(isLiquidGlassAvailable()).toBe(true);
  });
});
