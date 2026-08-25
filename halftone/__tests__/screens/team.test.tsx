import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Team from '../../app/team/[id]';
import { ThemeProvider } from '../../lib/theme';
import { teams } from '../../data/teams';

const team = teams.find((t) => t.name === 'Website Development')!;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: require('../../data/teams').teams.find((t: { name: string }) => t.name === 'Website Development').id,
  }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

const wrap = () => render(<ThemeProvider><Team /></ThemeProvider>);

describe('Team detail', () => {
  it('shows the team name and derived member count', async () => {
    await wrap();
    expect(screen.getByText(team.name)).toBeTruthy();
    expect(screen.getByText(`${team.members.length} members`)).toBeTruthy();
  });

  it('lists every member with their role', async () => {
    await wrap();
    for (const m of team.members) {
      expect(screen.getByText(m.name)).toBeTruthy();
      expect(screen.getAllByText(m.role).length).toBeGreaterThan(0);
    }
  });

  it('switches to the Files segment', async () => {
    await wrap();
    await fireEvent.press(screen.getByText('Files'));
    expect(screen.queryByText(team.members[1].name)).toBeNull();
    expect(screen.getByText(team.files[0].name)).toBeTruthy();
  });

  it('toggles notifications', async () => {
    await wrap();
    const toggle = screen.getByRole('switch');
    const before = toggle.props.accessibilityState.checked;
    await fireEvent.press(toggle);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(!before);
  });

  it('offers a chat shortcut for each member', async () => {
    await wrap();
    expect(screen.getAllByLabelText(/Message /).length).toBe(team.members.length);
  });

  // Every fixture team is unmuted, so the negative case — a muted team starting
  // with notifications off — lives in team-muted.test.tsx, where jest.mock can
  // supply one without editing data/teams.ts.
  it('starts an unmuted team with notifications on', async () => {
    await wrap();
    expect(team.muted).toBe(false);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(true);
  });

  // The employer is pulled out into its own leading group, so guard the thing
  // that split can silently break: every member still renders, exactly once,
  // in data order.
  it('keeps members in data order with the employer first', async () => {
    await wrap();
    const labels = screen.getAllByLabelText(/Message /).map((n) => n.props.accessibilityLabel);
    expect(labels).toEqual(team.members.map((m) => `Message ${m.name}`));
  });

  // Comp shows rounded-square member avatars here, against the circles used in
  // the chat thread — so the radius has to be a real prop, not Avatar's default.
  it('renders member avatars as rounded squares, not circles', async () => {
    await wrap();
    const avatar = screen.getByLabelText(`${team.members[1].name} avatar`);
    expect(avatar.props.style.borderRadius).toBe(12);
  });
});
