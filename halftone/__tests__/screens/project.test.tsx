import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProjectDetail from '../../app/project/[id]';
import { ThemeProvider } from '../../lib/theme';
import { projects } from '../../data/projects';

const target = projects[0];

// Mutable so later tests can route a different id (or one that matches no
// project) without a fresh jest.mock factory per test. Jest's hoisting only
// allows referencing identifiers prefixed with "mock" from inside a
// jest.mock factory, hence the naming.
let mockId: string = target.id;
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: mockId }),
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

const wrap = () => render(<ThemeProvider><ProjectDetail /></ThemeProvider>);

describe('ProjectDetail', () => {
  afterEach(() => {
    mockId = target.id;
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('shows the project title and employer', async () => {
    await wrap();
    expect(screen.getByText(target.title)).toBeTruthy();
    expect(screen.getByText(target.employer.name)).toBeTruthy();
  });

  it('lists every task on the project', async () => {
    await wrap();
    for (const t of target.tasks) expect(screen.getByText(t.title)).toBeTruthy();
  });

  it('offers an apply action', async () => {
    await wrap();
    expect(screen.getByText('Send proposal')).toBeTruthy();
  });

  // The three tests above always mock the route id to projects[0], so they
  // would pass even if the screen ignored the id param and hardcoded
  // projects[0] directly. Route a *different* id and prove the screen
  // renders that project's own content — and that the first project's
  // title is nowhere on screen.
  it('renders the project named by the route id, not a fixed one', async () => {
    const other = projects[1];
    mockId = other.id;
    await wrap();
    expect(screen.getByText(other.title)).toBeTruthy();
    expect(screen.queryByText(target.title)).toBeNull();
  });

  // An id with no match in data/projects.ts is a real navigation path (a
  // stale link, a removed listing) — confirm it degrades to a message
  // instead of crashing or rendering blank.
  it('shows a fallback for a route id with no matching project', async () => {
    mockId = 'does-not-exist';
    await wrap();
    expect(screen.getByText('That project is no longer listed.')).toBeTruthy();
  });

  it('pressing "Send proposal" navigates to /proposals', async () => {
    await wrap();
    fireEvent.press(screen.getByText('Send proposal'));
    expect(mockPush).toHaveBeenCalledWith('/proposals');
  });
});
