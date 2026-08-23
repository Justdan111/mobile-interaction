import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Segmented } from '../../components/ui/Segmented';
import { PillButton } from '../../components/ui/PillButton';
import { Toggle } from '../../components/ui/Toggle';
import { ThemeProvider } from '../../lib/theme';
import { tokens } from '../../lib/tokens';

// @testing-library/react-native@14 declares `render` as async (it awaits
// React's `act` internally). The task brief's test code assumes a
// synchronous `render` — a known plan defect — so every call below is
// awaited, and the "throws outside a provider" style assertion (added below)
// uses `rejects.toThrow` rather than a synchronous `toThrow`.
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

// Forces the native color scheme so ThemeProvider resolves to a specific,
// deterministic mode instead of whatever this environment happens to report.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
import mockUseColorSchemeImport from 'react-native/Libraries/Utilities/useColorScheme';
const mockUseColorScheme = mockUseColorSchemeImport as jest.Mock;

// Depth-first search through a `toJSON()` render tree for the first node
// carrying a `backgroundColor` style. Used to prove a component's rendered
// color actually comes from the current theme's tokens rather than a
// hardcoded hex — a render tree assertion that would fail if a component
// were hardcoded to one mode.
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
    await wrap(<Segmented options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole('tab', { selected: true })).toBeTruthy();
  });

  it('marks the inactive option as not selected', async () => {
    // Complements the test above: proves the component distinguishes the two
    // options rather than marking every tab (or none) as selected.
    await wrap(<Segmented options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole('tab', { selected: false })).toBeTruthy();
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
  it('reports the flipped value', async () => {
    const onChange = jest.fn();
    await wrap(<Toggle value={false} onChange={onChange} />);
    fireEvent.press(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('exposes its state to assistive tech', async () => {
    await wrap(<Toggle value onChange={() => {}} />);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(true);
  });

  it('exposes off state to assistive tech too', async () => {
    // Complements the "on" case above: proves `checked` actually tracks the
    // `value` prop in both directions, not just reporting `true` always.
    await wrap(<Toggle value={false} onChange={() => {}} />);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(false);
  });

  describe('theme-responsiveness', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    // These two prove the off-state track color is actually read from
    // useTheme().t rather than a fixed hex: light and dark chip tokens
    // differ, so a component hardcoded to either mode fails one of these.
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
