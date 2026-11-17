import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { processColor } from 'react-native';
import { Segmented } from '../../components/ui/Segmented';
import { PillButton } from '../../components/ui/PillButton';
import { Toggle } from '../../components/ui/Toggle';
import { Icon } from '../../components/ui/icons';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';

// RNTL v14's `render` is async, so every call is awaited and the "throws
// outside a provider" assertion uses `rejects.toThrow`.
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

// Forces the native color scheme so ThemeProvider resolves to a specific,
// deterministic mode instead of whatever this environment happens to report.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
import mockUseColorSchemeImport from 'react-native/Libraries/Utilities/useColorScheme';
const mockUseColorScheme = mockUseColorSchemeImport as jest.Mock;

// Depth-first search of a `toJSON()` tree for the first node with a
// `backgroundColor` style.
function findBackgroundColor(node: any): string | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const styleValue = node.props?.style;
  const styles = Array.isArray(styleValue) ? styleValue : [styleValue];
  for (const s of styles) {
    if (s && typeof s === 'object' && typeof s.backgroundColor === 'string') {
      return s.backgroundColor;
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findBackgroundColor(child);
      if (found) return found;
    }
  }
  return undefined;
}

describe('Segmented', () => {
  const options = [
    { key: 'a', label: 'Active projects' },
    { key: 'b', label: 'Calendar' },
  ];

  it('renders every option', async () => {
    await wrap(<Segmented options={options} value="a" onChange={() => {}} />);
    expect(screen.getByText('Active projects')).toBeTruthy();
    expect(screen.getByText('Calendar')).toBeTruthy();
  });

  it('reports the key that was pressed', async () => {
    const onChange = jest.fn();
    await wrap(<Segmented options={options} value="a" onChange={onChange} />);
    fireEvent.press(screen.getByText('Calendar'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('marks the active option as selected for assistive tech', async () => {
    // 'Calendar' is the second option, so this fails if the first is always active.
    await wrap(<Segmented options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Calendar', selected: true })).toBeTruthy();
  });

  it('marks the inactive option as not selected', async () => {
    await wrap(<Segmented options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Active projects', selected: false })).toBeTruthy();
  });
});

describe('PillButton', () => {
  it('fires onPress', async () => {
    const onPress = jest.fn();
    await wrap(<PillButton label="Next" onPress={onPress} />);
    fireEvent.press(screen.getByText('Next'));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Toggle', () => {
  it('reports the flipped value when starting off', async () => {
    const onChange = jest.fn();
    await wrap(<Toggle value={false} onChange={onChange} />);
    fireEvent.press(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reports the flipped value when starting on', async () => {
    // Starts from `value={true}`, so a toggle that always reports `true` fails.
    const onChange = jest.fn();
    await wrap(<Toggle value={true} onChange={onChange} />);
    fireEvent.press(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('exposes its state to assistive tech', async () => {
    await wrap(<Toggle value onChange={() => {}} />);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(true);
  });

  it('exposes off state to assistive tech too', async () => {
    await wrap(<Toggle value={false} onChange={() => {}} />);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(false);
  });

  describe('theme-responsiveness', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    // Light and dark chip tokens differ, so a hardcoded track colour fails one.
    it('uses the light chip token when the theme resolves to light', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const rendered = await wrap(<Toggle value={false} onChange={() => {}} />);
      expect(findBackgroundColor(rendered.toJSON())).toBe(tokens.light.chip);
    });

    it('uses the dark chip token when the theme resolves to dark', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      const rendered = await wrap(<Toggle value={false} onChange={() => {}} />);
      expect(findBackgroundColor(rendered.toJSON())).toBe(tokens.dark.chip);
    });
  });
});

describe('Icon', () => {
  // The `fill` must not be overridden by a spread placed after it, or `filled`
  // is a silent no-op.
  it('fills the star with the given color when filled is true', async () => {
    // react-native-svg normalizes `fill` to a processed `{ payload, type }`.
    const rendered = await render(<Icon name="star" size={20} color="#112233" filled />);
    const path = rendered.root!.queryAll((i: { type: string }) => i.type === 'RNSVGPath')[0];
    expect(path.props.fill.payload).toBe(processColor('#112233'));
  });

  it('leaves the star unfilled when filled is false (the default)', async () => {
    const rendered = await render(<Icon name="star" size={20} color="#112233" />);
    const path = rendered.root!.queryAll((i: { type: string }) => i.type === 'RNSVGPath')[0];
    expect(path.props.fill).toBeNull();
  });
});

describe('bellOff glyph', () => {
  // Counts the drawn paths in a rendered icon.
  const paths = (node: any, n = 0): number => {
    if (node == null) return n;
    if (Array.isArray(node)) return node.reduce((acc, c) => paths(c, acc), n);
    const self = node.type === 'RNSVGPath' ? 1 : 0;
    return (node.children ?? []).reduce((acc: number, c: any) => paths(c, acc), n + self);
  };

  const draw = (name: 'bell' | 'bellOff') =>
    render(<ThemeProvider><Icon name={name} color="#fff" /></ThemeProvider>);

  it('is a distinct glyph from the bell it mutes', async () => {
    const bell = paths((await draw('bell')).toJSON());
    const off = paths((await draw('bellOff')).toJSON());
    expect(bell).toBeGreaterThan(0);
    // The same bell plus the stroke through it.
    expect(off).toBe(bell + 1);
  });
});
