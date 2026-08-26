import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Team from '../../app/team/[id]';
import { ThemeProvider } from '../../lib/theme';
import { teams as realTeams } from '../../data/teams';

/**
 * Every team in data/teams.ts is unmuted, which makes `useState(!team.muted)`
 * and `useState(true)` indistinguishable on the real fixtures. Rather than add
 * a muted team to the shared data purely to give a test a positive case — the
 * mistake Task 11 had to revert — this suite mocks the module with a muted copy
 * of the same team, so the inversion is exercised with nothing else changed.
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
