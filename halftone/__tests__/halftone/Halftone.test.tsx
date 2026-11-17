import React from 'react';
import { render } from '@testing-library/react-native';
import { processColor } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Halftone } from '../../components/halftone/Halftone';
import { Avatar } from '../../components/halftone/Avatar';
import { TeamTile } from '../../components/halftone/TeamTile';
import { ThemeProvider } from '../../lib/theme';
import { tokens, TILE_GROUNDS, PLATE_COLORS } from '../../lib/tokens';
import { generateDots, FIELD_NAMES } from '../../components/halftone/fields';
import { hashSeed } from '../../lib/seed';

// RNTL v14's `render` is async and has no `findAllByType`; query host nodes
// ('RNSVGCircle', 'RNSVGRect') through `root.queryAll` instead.

// Mock the leaf module react-native's `useColorScheme` delegates to, so the
// theme-reactivity test can drive the resolved mode.
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

    // Exact guard against dropped or duplicated dots.
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

// Avatar calls useTheme(), which throws outside a ThemeProvider.
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

      // Tied to the actual `card` token values, which differ between modes.
      expect(lightGround.props.fill.payload).toBe(processColor(tokens.light.card));
      expect(darkGround.props.fill.payload).toBe(processColor(tokens.dark.card));
      expect(lightGround.props.fill.payload).not.toBe(darkGround.props.fill.payload);
    });
  });

  describe('unsigned-shift regression (plate lookup)', () => {
    // hashSeed('Bob Smith') has its top bit set, so a signed `>>` would produce
    // a negative index and an `undefined` plate colour.
    it("uses the unsigned-shift plate colour for a name whose hash's top bit is set", async () => {
      const name = 'Bob Smith';
      const h = hashSeed(name);
      expect(h).toBeGreaterThanOrEqual(0x80000000); // confirms the fixture qualifies

      const expectedPlate = PLATE_COLORS[(h >>> 3) % PLATE_COLORS.length];
      const rendered = await renderAvatar(name, 40);
      const dot = rendered.root!.queryAll((i: { type: string }) => i.type === 'RNSVGCircle')[0];

      expect(dot.props.fill.payload).toBe(processColor(expectedPlate));
    });
  });
});

// TeamTile does not call useTheme, so no ThemeProvider is needed.
describe('TeamTile', () => {
  // 'team-alpha' and 'team-bravo' hash to different grounds and different
  // variants.
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
    expect(defaultRadius).not.toBe(explicitRadius);
  });

  describe('unsigned-shift regression (ground + variant lookup)', () => {
    // hashSeed('team-charlie') has its top bit set, so a signed `>>` would
    // produce a negative index and an `undefined` ground or variant.
    const ID = 'team-charlie';
    const SIZE = 48;
    const DENSITY = 16; // matches TeamTile's Math.max(16, Math.round(size / 3)) for size=48

    it("selects the unsigned-shift ground colour for a teamId whose hash's top bit is set", async () => {
      const h = hashSeed(ID);
      expect(h).toBeGreaterThanOrEqual(0x80000000); // confirms the fixture qualifies

      const expectedGround = TILE_GROUNDS[h % TILE_GROUNDS.length];
      const rendered = await render(<TeamTile teamId={ID} name="Charlie" size={SIZE} />);
      const ground = rendered.root!.queryAll((i: { type: string }) => i.type === 'RNSVGRect')[0];

      expect(ground.props.fill.payload).toBe(processColor(expectedGround));
    });

    it("selects the unsigned-shift field variant for a teamId whose hash's top bit is set", async () => {
      const h = hashSeed(ID);
      expect(h).toBeGreaterThanOrEqual(0x80000000); // confirms the fixture qualifies

      const expectedVariant = FIELD_NAMES[(h >>> 5) % FIELD_NAMES.length];
      const rendered = await render(<TeamTile teamId={ID} name="Charlie" size={SIZE} />);
      const circles = rendered.root!.queryAll((i: { type: string }) => i.type === 'RNSVGCircle');
      const actualDots = circles.map((c) => ({ x: c.props.cx, y: c.props.cy, r: c.props.r }));

      const expectedDots = generateDots(expectedVariant, { size: SIZE, density: DENSITY, seed: ID });
      expect(actualDots).toEqual(expectedDots);
    });
  });
});
