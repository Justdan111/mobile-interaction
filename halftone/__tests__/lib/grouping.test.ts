import { groupMessages } from '../../lib/grouping';
import type { Message } from '../../data/types';

const people = { a: 'Alice', b: 'Tom', me: 'You' };
const msg = (id: string, senderId: string, at: string): Message => ({
  id, threadId: 'x', senderId, body: id, at, read: true,
});

describe('groupMessages', () => {
  it('groups consecutive messages from one sender', () => {
    const groups = groupMessages(
      [msg('1', 'a', '2023-08-01T10:00:00Z'), msg('2', 'a', '2023-08-01T10:01:00Z')],
      people
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].messages).toHaveLength(2);
  });

  it('starts a new group when the sender changes', () => {
    const groups = groupMessages(
      [msg('1', 'a', '2023-08-01T10:00:00Z'), msg('2', 'b', '2023-08-01T10:01:00Z')],
      people
    );
    expect(groups).toHaveLength(2);
  });

  it('regroups when the sender returns', () => {
    const groups = groupMessages(
      [
        msg('1', 'a', '2023-08-01T10:00:00Z'),
        msg('2', 'b', '2023-08-01T10:01:00Z'),
        msg('3', 'a', '2023-08-01T10:02:00Z'),
      ],
      people
    );
    expect(groups.map((g) => g.senderId)).toEqual(['a', 'b', 'a']);
  });

  it('flags the current user’s own groups', () => {
    const groups = groupMessages([msg('1', 'me', '2023-08-01T10:00:00Z')], people);
    expect(groups[0].isOwn).toBe(true);
    expect(groups[0].senderName).toBe('You');
  });

  it('orders messages oldest first regardless of input order', () => {
    const groups = groupMessages(
      [msg('late', 'a', '2023-08-01T12:00:00Z'), msg('early', 'a', '2023-08-01T09:00:00Z')],
      people
    );
    expect(groups[0].messages.map((m) => m.id)).toEqual(['early', 'late']);
  });

  it('returns nothing for an empty thread', () => {
    expect(groupMessages([], people)).toEqual([]);
  });

  it('names an unknown sender rather than rendering undefined', () => {
    const groups = groupMessages([msg('1', 'ghost', '2023-08-01T10:00:00Z')], people);
    expect(groups[0].senderName).toBe('Unknown');
  });
});
