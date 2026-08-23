import React from 'react';
import { render } from '@testing-library/react-native';
import { processColor } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Halftone } from '../../components/halftone/Halftone';
import { Avatar } from '../../components/halftone/Avatar';
import { generateDots } from '../../components/halftone/fields';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';

// @testing-library/react-native v14's `render` is async (it returns a
// Promise that resolves to the render result — confirmed by reading
// node_modules/@testing-library/react-native/dist/render.js, which declares
// `async function render`). Every call here is awaited, matching the idiom
// already established in __tests__/lib/theme.test.tsx.
//
// This version also has no `UNSAFE_root` / `findAllByType` API (that is a
// classic react-test-renderer API; this library's `test-renderer` dependency
// exposes `root` — a TestInstance — with a `queryAll(predicate)` method
// instead). Element type names (e.g. 'RNSVGCircle', 'RNSVGRect') are the
// native host component names react-native-svg registers, confirmed by
// inspecting a rendered tree's toJSON() output directly.

// Mock the leaf module react-native's `useColorScheme` delegates to, so the
// theme-reactivity test below can drive the resolved mode deterministically
// (same technique as __tests__/lib/theme.test.tsx).
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
import mockUseColorSchemeImport from 'react-native/Libraries/Utilities/useColorScheme';
const mockUseColorScheme = mockUseColorSchemeImport as jest.Mock;

describe('Halftone', () => {
  it('renders a circle for every generated dot', async () => {
    const variant = 'sphere';
    const size = 200;
    const seed = 'test';
    const density = 24;
    const result = await render(<Halftone variant={variant} size={size} seed={seed} density={density} />);

    const circles = result.root!.queryAll((i: { type: string }) => i.type === 'RNSVGCircle');

    // Real correspondence, not a loose smoke check: the rendered circle
    // count must equal generateDots' own output count for these exact
    // inputs, and (per the field's dot-dropping logic) that is well above
    // 50 for this seed/density, so both the brief's threshold and a real
    // regression guard are satisfied by the same assertion.
    const expectedDots = generateDots(variant, { size, density, seed });
    expect(circles.length).toBe(expectedDots.length);
    expect(circles.length).toBeGreaterThan(50);
  });

  it('renders every variant without throwing', async () => {
    for (const v of ['sphere', 'wave', 'blob', 'orbit'] as const) {
      await expect(
        render(<Halftone variant={v} size={120} seed="x" density={16} />)
      ).resolves.not.toThrow();
    }
  });
});

// Avatar calls useTheme(), which throws outside a ThemeProvider by design
// (see __tests__/lib/theme.test.tsx's "throws a useful error outside the
// provider" test), so every render here is wrapped in one.
const renderAvatar = (name: string, size: number) =>
  render(
    <ThemeProvider>
      <Avatar name={name} size={size} />
    </ThemeProvider>
  );

describe('Avatar', () => {
  it('gives different people different art', async () => {
    const a = (await renderAvatar('Alice Johnson', 40)).toJSON();
    const b = (await renderAvatar('Eric Thompson', 40)).toJSON();
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
  });

  it('gives the same person the same art every time', async () => {
    const a = (await renderAvatar('Alice Johnson', 40)).toJSON();
    const b = (await renderAvatar('Alice Johnson', 40)).toJSON();
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  describe('theme reactivity', () => {
    beforeEach(async () => {
      await AsyncStorage.clear();
      mockUseColorScheme.mockReset();
    });

    it('recolors its plate ground when the theme mode changes', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const light = await renderAvatar('Alice Johnson', 40);
      const lightGround = light.root!.queryAll((i: { type: string }) => i.type === 'RNSVGRect')[0];

      mockUseColorScheme.mockReturnValue('dark');
      const dark = await renderAvatar('Alice Johnson', 40);
      const darkGround = dark.root!.queryAll((i: { type: string }) => i.type === 'RNSVGRect')[0];

      // Ties the assertion to the actual token values (not hand-copied hex):
      // the plate's background fill must be the processed colour of the
      // light/dark `card` token respectively, and those two must differ.
      expect(lightGround.props.fill.payload).toBe(processColor(tokens.light.card));
      expect(darkGround.props.fill.payload).toBe(processColor(tokens.dark.card));
      expect(lightGround.props.fill.payload).not.toBe(darkGround.props.fill.payload);
    });
  });
});
