import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Proposals from '../../app/(tabs)/proposals';
import { ThemeProvider } from '../../lib/theme';
import { proposals } from '../../data/proposals';
import { formatPostedDate } from '../../lib/format';
import { STATUS_ICON } from '../../components/proposals/ProposalCard';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Proposals /></ThemeProvider>);
const incoming = proposals.filter((p) => p.direction === 'incoming');

/**
 * Accept/Decline show only while an incoming proposal is still open. One
 * incoming proposal ships already declined — deliberately, so the status-chip
 * branch has real coverage — so the button count is the undecided count, not
 * the incoming count. The brief asserted `incoming.length` and would have
 * failed against its own data.
 */
const undecided = incoming.filter((p) => p.status === 'sent' || p.status === 'viewed');

describe('Proposals', () => {
  it('opens on incoming proposals', async () => {
    await wrap();
    expect(screen.getByText(incoming[0].counterpartName)).toBeTruthy();
  });

  it('shows the project each proposal is against', async () => {
    await wrap();
    expect(screen.getAllByLabelText(/Proposal for /).length).toBe(incoming.length);
  });

  it('offers accept and decline on every undecided incoming proposal', async () => {
    await wrap();
    expect(undecided.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Accept').length).toBe(undecided.length);
    expect(screen.getAllByText('Decline').length).toBe(undecided.length);
  });

  it('shows a status instead of actions on an incoming proposal already settled', async () => {
    await wrap();
    const settled = incoming.filter((p) => p.status === 'declined' || p.status === 'accepted');
    expect(settled.length).toBeGreaterThan(0);
    expect(screen.getByText('Declined')).toBeTruthy();
  });

  it('replaces the actions with a status once accepted', async () => {
    await wrap();
    await fireEvent.press(screen.getAllByText('Accept')[0]);
    expect(screen.getAllByText('Accept').length).toBe(undecided.length - 1);
    expect(screen.getByText('Accepted')).toBeTruthy();
  });

  it('replaces the actions with a status once declined', async () => {
    await wrap();
    const before = screen.getAllByText('Declined').length;
    await fireEvent.press(screen.getAllByText('Decline')[0]);
    expect(screen.getAllByText('Decline').length).toBe(undecided.length - 1);
    expect(screen.getAllByText('Declined').length).toBe(before + 1);
  });

  it('decides only the proposal whose button was pressed', async () => {
    await wrap();
    await fireEvent.press(screen.getAllByText('Accept')[0]);
    // The other undecided proposal keeps both of its actions.
    expect(screen.getAllByText('Decline').length).toBe(undecided.length - 1);
  });

  it('switches to sent proposals', async () => {
    await wrap();
    await fireEvent.press(screen.getByText('Sent'));
    expect(screen.queryByText('Accept')).toBeNull();
  });

  it('lists sent proposals with their own statuses', async () => {
    await wrap();
    await fireEvent.press(screen.getByText('Sent'));
    const outgoing = proposals.filter((p) => p.direction === 'outgoing');
    expect(screen.getAllByLabelText(/Proposal for /).length).toBe(outgoing.length);
    for (const p of outgoing) {
      expect(screen.getByText(p.counterpartName)).toBeTruthy();
    }
  });
});

describe('Proposal card detail', () => {
  // The card grammar matches the feed's, and the feed stamps a posted date.
  // `at` is an ISODateTime, so formatPostedDate must be handed the date half —
  // given the whole string it reads NaN out of "12T09:30:00".
  it('stamps each proposal with a readable date, not NaN', async () => {
    await wrap();
    for (const p of incoming) {
      const expected = formatPostedDate(p.at.slice(0, 10));
      expect(expected).not.toMatch(/NaN|undefined/);
      expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
    }
  });

  // The card used to chip every non-accepted status with a clock, so "Declined"
  // rendered under an icon meaning "still waiting" — the glyph contradicting the
  // word next to it. The invariant, not the literals: a settled status never
  // wears the pending icon, and every status has an icon at all.
  it('never marks a settled status with the pending icon', () => {
    const pending = STATUS_ICON.sent;
    expect(STATUS_ICON.viewed).toBe(pending);
    for (const settled of ['accepted', 'declined'] as const) {
      expect(STATUS_ICON[settled]).toBeTruthy();
      expect(STATUS_ICON[settled]).not.toBe(pending);
    }
  });

  it('gives every status an icon, so a new one cannot render undefined', () => {
    const statuses = new Set(proposals.map((p) => p.status));
    expect(statuses.size).toBeGreaterThan(1);
    for (const status of statuses) expect(STATUS_ICON[status]).toBeTruthy();
  });
});
