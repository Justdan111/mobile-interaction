import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Chat from '../../app/chat/[id]';
import { ThemeProvider } from '../../lib/theme';
import { teams } from '../../data/teams';
import { messages } from '../../data/messages';

const team = teams.find((t) => t.name === 'Website Development')!;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: require('../../data/teams').teams.find((t: { name: string }) => t.name === 'Website Development').id,
  }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

const wrap = () => render(<ThemeProvider><Chat /></ThemeProvider>);

describe('Chat thread', () => {
  it('titles the thread with the team name', async () => {
    await wrap();
    expect(screen.getByText('Website Development')).toBeTruthy();
  });

  it('shows the online member count', async () => {
    await wrap();
    expect(screen.getByText(/Online: \d+/)).toBeTruthy();
  });

  it('renders the messages in the thread', async () => {
    await wrap();
    const first = messages.find((m) => m.threadId === team.id && m.body)!;
    expect(screen.getByText(first.body!)).toBeTruthy();
  });

  it('appends a sent message to the thread', async () => {
    await wrap();
    const input = screen.getByLabelText('Message');
    await fireEvent.changeText(input, 'Shipping today');
    await fireEvent(input, 'submitEditing');
    expect(screen.getByText('Shipping today')).toBeTruthy();
  });

  it('ignores an empty send', async () => {
    await wrap();
    const before = screen.getAllByText(/./).length;
    const input = screen.getByLabelText('Message');
    await fireEvent.changeText(input, '   ');
    await fireEvent(input, 'submitEditing');
    expect(screen.getAllByText(/./).length).toBe(before);
  });
});

/**
 * The grouping/rendering rules (name on the first bubble only, avatar beside
 * the last bubble, own vs. other fill) are the actual point of this screen.
 * The brief's own screen test never exercises any of them — a component
 * that showed the sender name on every bubble, or hung the avatar off the
 * first bubble instead of the last, would still pass every test above. This
 * block walks the rendered tree in document order to pin those three things
 * down against the real fixture data (Alice Johnson's 3-message opening
 * group in the Website Development thread).
 */
describe('Chat thread — grouping in the rendered tree', () => {
  // Depth-first, document-order walk collecting just the markers relevant to
  // grouping: rendered text, and any node's className/accessibilityLabel
  // that identifies an avatar or a message-bubble container.
  function markers(node: any, out: string[] = []): string[] {
    if (node == null) return out;
    if (Array.isArray(node)) {
      node.forEach((n) => markers(n, out));
      return out;
    }
    const label: string | undefined = node.props?.accessibilityLabel;
    if (typeof label === 'string' && label.endsWith(' avatar')) {
      out.push(`AVATAR:${label}`);
    }
    const className: string | undefined = node.props?.className;
    if (typeof className === 'string' && className.includes('rounded-2xl') && !className.includes('bg-chip')) {
      const isOwn = className.includes('self-end');
      out.push(`BUBBLE:${isOwn ? 'own' : 'other'}`);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach((c: any) => {
        if (typeof c === 'string') out.push(`TEXT:${c}`);
        else markers(c, out);
      });
    }
    return out;
  }

  it('shows the sender name only on the first bubble of a group', async () => {
    const r = await wrap();
    const flat = markers(r.toJSON());
    // Alice Johnson opens the thread with 3 consecutive messages (msg-web-1/2/3)
    // — one group. Her name label must appear exactly once, not once per bubble.
    const nameOccurrences = flat.filter((m) => m === 'TEXT:Alice Johnson').length;
    expect(nameOccurrences).toBe(1);
  });

  it('places the avatar beside the last bubble of a group, not the first', async () => {
    const r = await wrap();
    const flat = markers(r.toJSON());
    const avatarIndex = flat.indexOf('AVATAR:Alice Johnson avatar');
    const firstBodyIndex = flat.indexOf('TEXT:Hi team!👋');
    const secondBodyIndex = flat.indexOf('TEXT:Excited to join the project!');
    const nextGroupIndex = flat.indexOf('TEXT:You'); // first bubble of the next (own) group

    expect(avatarIndex).toBeGreaterThan(-1);
    // The avatar must come after both non-last bubbles of Alice's group...
    expect(avatarIndex).toBeGreaterThan(firstBodyIndex);
    expect(avatarIndex).toBeGreaterThan(secondBodyIndex);
    // ...and before the following group starts, i.e. it sits with the
    // group's last (voice) bubble, not the first.
    expect(avatarIndex).toBeLessThan(nextGroupIndex);
  });

  it('fills own bubbles and other bubbles differently, matching the fixture counts', async () => {
    const r = await wrap();
    const flat = markers(r.toJSON());
    const own = flat.filter((m) => m === 'BUBBLE:own').length;
    const other = flat.filter((m) => m === 'BUBBLE:other').length;
    // Website Development seed data: 4 messages from 'me', 4 from others.
    expect(own).toBe(4);
    expect(other).toBe(4);
  });
});
