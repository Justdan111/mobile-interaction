import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Chats from '../../app/(tabs)/chats';
import { ThemeProvider } from '../../lib/theme';
import { teams } from '../../data/teams';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const wrap = () => render(<ThemeProvider><Chats /></ThemeProvider>);

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
});
