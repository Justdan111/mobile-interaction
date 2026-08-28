import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react-native';
import Chats from '../../app/(tabs)/chats';
import { ThemeProvider } from '../../lib/theme';
import { teams } from '../../data/teams';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Chats /></ThemeProvider>);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

/** Runs the shake-then-close choreography SwipeableRow schedules on a press. */
const settle = async () => {
  await act(async () => {
    jest.advanceTimersByTime(800);
  });
};

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

  // The action's effect is deliberately deferred a beat so its icon shakes
  // before it changes underneath — see SwipeableRow. Pressing and asserting in
  // the same tick therefore proves nothing; the timers have to be run.
  it('flips the mute action label when pressed', async () => {
    await wrap();
    const first = screen.getAllByLabelText(/Mute .*/)[0];
    await fireEvent.press(first);
    await settle();
    expect(screen.getAllByLabelText(/Unmute/).length).toBeGreaterThan(0);
  });

  it('does not fire the action before the shake has begun', async () => {
    await wrap();
    const before = screen.queryAllByLabelText(/Unmute/).length;
    await fireEvent.press(screen.getAllByLabelText(/Mute .*/)[0]);
    // Still inside the deferral window: nothing has changed yet.
    await act(async () => {
      jest.advanceTimersByTime(60);
    });
    expect(screen.queryAllByLabelText(/Unmute/).length).toBe(before);
    await settle();
    expect(screen.queryAllByLabelText(/Unmute/).length).toBeGreaterThan(before);
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
    // other than 'me'; the other two teams' single seeded message is read,
    // so this exercises both sides of the unread/read-tick binary — it must
    // fail whether the branch gets stuck always showing ticks (no badge
    // would render) or always showing badges (three badges, not one).
    await wrap();
    const badges = screen.getAllByText(/^\d+$/);
    expect(badges.length).toBe(1);
    expect(badges[0].props.children).toBe(1);
    expect(screen.getAllByLabelText('read tick').length).toBe(2);
  });

  it('draws the read tick as a double check, not a single check', async () => {
    // Comp fidelity: a single-check glyph reused for the read tick would
    // pass every other assertion in this file (they only check whether a
    // tick renders, not its shape), so this test looks at the actual SVG
    // polylines drawn inside the tick.
    await wrap();
    const ticks = screen.getAllByLabelText('read tick');
    for (const tick of ticks) {
      expect(countHostNodesByType(tick.toJSON(), 'RNSVGPath')).toBe(2);
    }
  });
});

describe('Chats mute state on the row', () => {
  // Before this, muting a thread changed a Set and nothing else: the row that
  // was muted looked exactly like one that was not, so the whole action was
  // invisible the moment it slid shut. This is the assertion that would have
  // caught that.
  it('marks the row as muted and unmarks it again', async () => {
    await wrap();
    const name = teams[0].name;
    expect(screen.queryByLabelText(`${name} is muted`)).toBeNull();

    await fireEvent.press(screen.getByLabelText(`Mute ${name}`));
    await settle();
    expect(screen.getByLabelText(`${name} is muted`)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText(`Unmute ${name}`));
    await settle();
    expect(screen.queryByLabelText(`${name} is muted`)).toBeNull();
  });

  it('mutes only the row whose action was pressed', async () => {
    await wrap();
    await fireEvent.press(screen.getByLabelText(`Mute ${teams[0].name}`));
    await settle();
    expect(screen.getByLabelText(`${teams[0].name} is muted`)).toBeTruthy();
    expect(screen.queryByLabelText(`${teams[1].name} is muted`)).toBeNull();
  });
});
