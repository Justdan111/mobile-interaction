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

  // Pin the hour so every branch is checked, not just whichever one is live.
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
    // Target a project that starts unsaved: `/save/i` also matches "Remove ...
    // from saved" on the already-saved one, before any press.
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
  // The greeting and search field sit above the list, so neither may have a
  // virtualized list among its ancestors.
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

  // The Projects heading scrolls with the cards, so it stays inside the list.
  it('keeps the Projects heading inside the scrolling list', async () => {
    await wrap();
    const names = ancestorNames(screen.getByText('Projects'));
    expect(names.some((n) => /VirtualizedList|FlatList|ScrollView/.test(n))).toBe(true);
  });
});
