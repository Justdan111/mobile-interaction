import type { ID, Message } from '../data/types';

export type MessageGroup = {
  senderId: ID;
  senderName: string;
  isOwn: boolean;
  messages: Message[];
};

export function groupMessages(
  messages: Message[],
  people: Record<ID, string>
): MessageGroup[] {
  const sorted = [...messages].sort((a, b) => a.at.localeCompare(b.at));
  const groups: MessageGroup[] = [];

  for (const m of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.senderId === m.senderId) {
      last.messages.push(m);
      continue;
    }
    groups.push({
      senderId: m.senderId,
      senderName: m.senderId === 'me' ? 'You' : (people[m.senderId] ?? 'Unknown'),
      isOwn: m.senderId === 'me',
      messages: [m],
    });
  }
  return groups;
}
