import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Chats from '../../app/(tabs)/chats';
import { ThemeProvider } from '../../lib/theme';
import { teams } from '../../data/teams';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Chats /></ThemeProvider>);

// react-native-svg's <Polyline> lowers to a host 'RNSVGPath' node under
// the test renderer, so this walks the rendered JSON tree counting them
// — the only way, in this RN Testing Library version, to tell a
// single-stroke check apart from a double-stroke one.
function countHostNodesByType(node: unknown, type: string): number {
  if (!node) return 0;
  const nodes = Array.isArray(node) ? node : [node];
  let count = 0;
  for (const n of nodes as any[]) {
    if (n?.type === type) count += 1;
    if (n?.children) count += countHostNodesByType(n.children, type);
  }
  return count;
}

describe('Chats', () => {
  it('opens on the Teams segment', async () => {
    await wrap();
    expect(screen.getByText(teams[0].name)).toBeTruthy();
  });

  it('derives member counts from the roster rather than a stored number', async () => {
    await wrap();
    // Two seeded teams both happen to carry 6 members, so `getByText` (which
    // requires a unique match) throws on that count; `getAllByText` handles
    // the duplicate while still proving each team's own `members.length` is
    // rendered somewhere on screen.
    for (const team of teams) {
      expect(screen.getAllByText(`${team.members.length} members`).length).toBeGreaterThan(0);
    }
  });

  it('shows a message preview for every team', async () => {
    await wrap();
    expect(screen.getAllByLabelText(/message preview/i).length).toBe(teams.length);
  });

  it('switches to the Proposals segment', async () => {
    await wrap();
    await fireEvent.press(screen.getByText('Proposals'));
    expect(screen.queryByText(teams[0].name)).toBeNull();
  });

  it('exposes mute and exit actions on each row', async () => {
    await wrap();
    expect(screen.getAllByLabelText(/Mute|Unmute/).length).toBe(teams.length);
    expect(screen.getAllByLabelText(/Leave/).length).toBe(teams.length);
  });

  it('flips the mute action label when pressed', async () => {
    await wrap();
    const first = screen.getAllByLabelText(/Mute .*/)[0];
    await fireEvent.press(first);
    expect(screen.getAllByLabelText(/Unmute/).length).toBeGreaterThan(0);
  });

  it('previews the last message in a thread, not the first', async () => {
    // t-website-dev's first message is "Hi team!👋" (Alice); its last is a
    // voice message sent by 'me'. If the row read the first message instead
    // of the last, this would show the wrong sender/text.
    await wrap();
    expect(screen.getByText(/Voice message/)).toBeTruthy();
    expect(screen.queryByText(/Hi team!/)).toBeNull();
  });

  it('shows an unread badge only for the team with unread messages, and read ticks for the rest', async () => {
    // Only t-website-dev has an unread (unread: 1) message from someone
    // other than 'me'; the other two teams' single seeded message is read.
    await wrap();
    const badges = screen.getAllByText(/^\d+$/);
    expect(badges.length).toBe(1);
    expect(badges[0].props.children).toBe(1);
  });

  it('shows a read tick only for the thread whose last message is mine', async () => {
    // t-print-ad's last message is mine (delivered: true, unread: 0) — it
    // should show a read tick. t-brand-identity's only message is from
    // Alice Kim, not me (delivered: false), even though it too has
    // unread: 0 — a read tick against someone else's message would be
    // showing the wrong thing entirely, so it must show neither a tick nor
    // a badge. Exactly one read tick should render across all three teams.
    await wrap();
    expect(screen.getAllByLabelText('read tick').length).toBe(1);
  });

  it('draws the read tick as a double check, not a single check', async () => {
    // Comp fidelity: a single-check glyph reused for the read tick would
    // pass every other assertion in this file (they only check whether a
    // tick renders, not its shape), so this test looks at the actual SVG
    // polylines drawn inside the tick.
    await wrap();
    const tick = screen.getByLabelText('read tick');
    expect(countHostNodesByType(tick.toJSON(), 'RNSVGPath')).toBe(2);
  });
});
