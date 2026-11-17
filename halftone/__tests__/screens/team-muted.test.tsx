import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Team from '../../app/team/[id]';
import { ThemeProvider } from '../../lib/theme';
import { teams as realTeams } from '../../data/teams';

/**
 * Every fixture team is unmuted, so this suite mocks the data module with a
 * muted copy of one team to exercise `useState(!team.muted)`.
 */
const MUTED_TEAM = { ...realTeams.find((t) => t.name === 'Website Development')!, muted: true };

jest.mock('../../data/teams', () => ({
  teams: [{ ...jest.requireActual('../../data/teams').teams.find((t: { name: string }) => t.name === 'Website Development'), muted: true }],
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: jest.requireActual('../../data/teams').teams.find((t: { name: string }) => t.name === 'Website Development').id,
  }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

describe('Team detail — muted team', () => {
  it('starts with notifications off', async () => {
    expect(MUTED_TEAM.muted).toBe(true);
    await render(<ThemeProvider><Team /></ThemeProvider>);
    expect(screen.getByRole('switch').props.accessibilityState.checked).toBe(false);
  });
});
