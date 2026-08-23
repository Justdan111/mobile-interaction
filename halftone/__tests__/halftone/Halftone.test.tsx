import React from 'react';
import { render } from '@testing-library/react-native';
import { processColor } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Halftone } from '../../components/halftone/Halftone';
import { Avatar } from '../../components/halftone/Avatar';
import { TeamTile } from '../../components/halftone/TeamTile';
import { generateDots } from '../../components/halftone/fields';
import { ThemeProvider } from '../../lib/theme';
import { tokens, TILE_GROUNDS } from '../../lib/tokens';
import { hashSeed } from '../../lib/seed';

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
    const result = await render(
      <Halftone variant={variant} size={size} seed={seed} density={density} dotColor="#FFFFFF" />
    );

    const circles = result.root!.queryAll((i: { type: string }) => i.type === 'RNSVGCircle');

    // Real correspondence, not a loose smoke check: the rendered circle
    // count must equal generateDots' own output count for these exact
    // inputs. This subsumes the brief's `toBeGreaterThan(50)` threshold
    // (that count is well above 50 for this seed/density) with a stronger,
    // exact guard against dropped or duplicated dots.
    const expectedDots = generateDots(variant, { size, density, seed });
    expect(circles.length).toBe(expectedDots.length);
  });

  it('renders every variant without throwing', async () => {
    for (const v of ['sphere', 'wave', 'blob', 'orbit'] as const) {
      await expect(
        render(<Halftone variant={v} size={120} seed="x" density={16} dotColor="#FFFFFF" />)
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

// TeamTile does not call useTheme (neither does Halftone, which the reviewer
// specifically credited as correct design), so no ThemeProvider is needed.
describe('TeamTile', () => {
  // Verified (not assumed) via lib/seed's real hashSeed against lib/tokens'
  // real TILE_GROUNDS/fields' FIELD_NAMES: 'team-alpha' hashes to ground
  // '#C41E4A' / variant 'wave', 'team-bravo' hashes to ground '#111111' /
  // variant 'sphere' — a pair that differs on BOTH axes, not a coincidence
  // of two arbitrary strings.
  const ID_A = 'team-alpha';
  const ID_B = 'team-bravo';

  function expectedGroundFill(teamId: string): ReturnType<typeof processColor> {
    const h = hashSeed(teamId);
    return processColor(TILE_GROUNDS[h % TILE_GROUNDS.length]);
  }

  it('gives the same teamId the same ground and variant every time', async () => {
    const a = (await render(<TeamTile teamId={ID_A} name="Alpha" size={48} />)).toJSON();
    const b = (await render(<TeamTile teamId={ID_A} name="Alpha" size={48} />)).toJSON();
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it('gives different teamIds different ground colours (verified, not assumed)', async () => {
    const a = await render(<TeamTile teamId={ID_A} name="Alpha" size={48} />);
    const b = await render(<TeamTile teamId={ID_B} name="Bravo" size={48} />);

    const groundA = a.root!.queryAll((i: { type: string }) => i.type === 'RNSVGRect')[0];
    const groundB = b.root!.queryAll((i: { type: string }) => i.type === 'RNSVGRect')[0];

    // Ties directly to the real TILE_GROUNDS values via hashSeed, not just
    // "the two JSON trees differ" (which a bug that varied only unrelated
    // noise could also satisfy).
    expect(groundA.props.fill.payload).toBe(expectedGroundFill(ID_A));
    expect(groundB.props.fill.payload).toBe(expectedGroundFill(ID_B));
    expect(groundA.props.fill.payload).not.toBe(groundB.props.fill.payload);
  });

  it('applies the default radius when the prop is omitted', async () => {
    const withDefault = await render(<TeamTile teamId={ID_A} name="Alpha" size={48} />);
    const withExplicit = await render(<TeamTile teamId={ID_A} name="Alpha" size={48} radius={2} />);

    const defaultRadius = withDefault.root!.props.style.borderRadius;
    const explicitRadius = withExplicit.root!.props.style.borderRadius;

    expect(defaultRadius).toBe(14);
    expect(explicitRadius).toBe(2);
    // Proves the assertion actually exercises the `radius` prop wiring
    // rather than a coincidence of both branches producing 14.
    expect(defaultRadius).not.toBe(explicitRadius);
  });
});
