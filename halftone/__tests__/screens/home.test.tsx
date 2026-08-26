import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../../app/(tabs)/index';
import { ThemeProvider } from '../../lib/theme';
import { projects } from '../../data/projects';
import { greeting } from '../../lib/format';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), Link: ({ children }: never) => children }));

const wrap = () => render(<ThemeProvider><Home /></ThemeProvider>);

describe('Home', () => {
  it('greets the user', async () => {
    await wrap();
    expect(screen.getByText(/Good (morning|afternoon|evening)!/)).toBeTruthy();
  });

  // The regex above would still pass if the greeting were hardcoded to one
  // branch. Pin the hour and prove all three branches are actually wired to
  // `greeting()` rather than a fixed string.
  describe('greeting is time-derived', () => {
    const cases: Array<[number, string]> = [
      [9, 'Good morning!'],
      [15, 'Good afternoon!'],
      [20, 'Good evening!'],
    ];

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each(cases)('for hour %s shows "%s"', async (hour, expected) => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(hour);
      await wrap();
      expect(screen.getByText(new RegExp(expected))).toBeTruthy();
      expect(greeting(hour)).toBe(expected); // sanity: matches the pure function's own branch
    });
  });

  it('lists projects from the data source', async () => {
    await wrap();
    expect(screen.getByText(projects[0].title)).toBeTruthy();
  });

  // A component hardcoding a couple of matching titles would pass the test
  // above. Prove every project in the data module actually renders.
  it('renders every project title from data/projects.ts', async () => {
    await wrap();
    for (const p of projects) {
      expect(screen.getByText(p.title)).toBeTruthy();
    }
  });

  it('shows a formatted pay range, not raw numbers', async () => {
    await wrap();
    expect(screen.getByText('$500 - $600')).toBeTruthy();
  });

  it('filters the feed by the search query', async () => {
    await wrap();
    fireEvent.changeText(screen.getByPlaceholderText('Search for project'), 'sustainable');
    await waitFor(() => expect(screen.getByText(/Sustainable City Design/)).toBeTruthy());
    expect(screen.queryByText('Graphic design for new advertising campaign')).toBeNull();
  });

  it('reports no results rather than an empty screen', async () => {
    await wrap();
    fireEvent.changeText(screen.getByPlaceholderText('Search for project'), 'zzzznothing');
    await waitFor(() => expect(screen.getByText('No projects match that search.')).toBeTruthy());
  });

  describe('saving a project', () => {
    // p-graphic-ad starts unsaved and p-website-dev starts saved (see
    // data/projects.ts). Using a project that starts unsaved — rather than
    // the brief's `getAllByLabelText(/save/i)[0]` — matters: that regex also
    // matches "saved" inside "Remove ... from saved", so with the
    // already-saved website-dev project present it would find a match
    // *before any press*, passing even if onToggleSave were a no-op.
    const unsavedTitle = 'Graphic design for new advertising campaign';
    const alreadySavedTitle = 'Website Development';

    it('toggles a project between saved and unsaved', async () => {
      await wrap();
      expect(screen.getByLabelText(`Save ${unsavedTitle}`)).toBeTruthy();

      fireEvent.press(screen.getByLabelText(`Save ${unsavedTitle}`));
      await waitFor(() =>
        expect(screen.getByLabelText(`Remove ${unsavedTitle} from saved`)).toBeTruthy()
      );
      expect(screen.queryByLabelText(`Save ${unsavedTitle}`)).toBeNull();

      fireEvent.press(screen.getByLabelText(`Remove ${unsavedTitle} from saved`));
      await waitFor(() => expect(screen.getByLabelText(`Save ${unsavedTitle}`)).toBeTruthy());
    });

    it('toggling one project does not affect another', async () => {
      await wrap();
      expect(screen.getByLabelText(`Remove ${alreadySavedTitle} from saved`)).toBeTruthy();

      fireEvent.press(screen.getByLabelText(`Save ${unsavedTitle}`));
      await waitFor(() =>
        expect(screen.getByLabelText(`Remove ${unsavedTitle} from saved`)).toBeTruthy()
      );

      // The already-saved project's state is untouched by toggling a
      // different one — catches a mutant that toggles global/shared state.
      expect(screen.getByLabelText(`Remove ${alreadySavedTitle} from saved`)).toBeTruthy();
    });
  });
});

/**
 * Walks up from a node collecting each ancestor's displayed type name, so a
 * test can assert what a element is or is not rendered inside.
 */
function ancestorNames(node: any): string[] {
  const names: string[] = [];
  let current = node?.parent;
  while (current) {
    const t = current.type;
    const name = typeof t === 'string' ? t : t?.displayName ?? t?.name;
    if (name) names.push(name);
    current = current.parent;
  }
  return names;
}

describe('Home pinned header', () => {
  // The greeting, the search field and the art rail used to be the FlatList's
  // ListHeaderComponent, so they scrolled away with the projects. They are a
  // fixed sibling above the list now — which means none of them may have a
  // virtualized list among their ancestors.
  it('renders the search field outside the scrolling list', async () => {
    await wrap();
    const names = ancestorNames(screen.getByPlaceholderText('Search for project'));
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((n) => /VirtualizedList|FlatList|ScrollView/.test(n))).toBe(false);
  });

  it('renders the greeting outside the scrolling list', async () => {
    await wrap();
    const names = ancestorNames(screen.getByText(/Good (morning|afternoon|evening)!/));
    expect(names.some((n) => /VirtualizedList|FlatList|ScrollView/.test(n))).toBe(false);
  });

  // The Projects heading was chosen to keep scrolling with the cards, so it
  // stays inside the list — the counterpart assertion that proves the split is
  // where it was meant to be and not simply "everything moved out".
  it('keeps the Projects heading inside the scrolling list', async () => {
    await wrap();
    const names = ancestorNames(screen.getByText('Projects'));
    expect(names.some((n) => /VirtualizedList|FlatList|ScrollView/.test(n))).toBe(true);
  });
});
