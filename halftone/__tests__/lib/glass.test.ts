/**
 * `expo-glass-effect` throws at module evaluation where it is not linked (Expo
 * Go). Requiring `lib/glass` must swallow that and fall back, while still
 * passing a working module through.
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
