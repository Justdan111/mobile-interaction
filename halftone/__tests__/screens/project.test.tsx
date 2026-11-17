import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ProjectDetail from '../../app/project/[id]';
import { ThemeProvider } from '../../lib/theme';
import { projects } from '../../data/projects';

const target = projects[0];

// Mutable so tests can route a different id. Jest only allows `mock`-prefixed
// identifiers inside a jest.mock factory.
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

  // The tests above always route projects[0], so prove the id param is used.
  it('renders the project named by the route id, not a fixed one', async () => {
    const other = projects[1];
    mockId = other.id;
    await wrap();
    expect(screen.getByText(other.title)).toBeTruthy();
    expect(screen.queryByText(target.title)).toBeNull();
  });

  // A stale link must degrade to a message, not a crash or a blank screen.
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

  // Find done and not-done tasks rather than assuming fixture order.
  it('shows a check mark only for the tasks that are done', async () => {
    const done = target.tasks.find((t) => t.done);
    const notDone = target.tasks.find((t) => !t.done);
    expect(done).toBeTruthy();
    expect(notDone).toBeTruthy();
    await wrap();
    expect(screen.getByTestId(`task-done-${done!.id}`)).toBeTruthy();
    expect(screen.queryByTestId(`task-done-${notDone!.id}`)).toBeNull();
  });
});
