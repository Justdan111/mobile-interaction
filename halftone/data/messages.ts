import type { Message } from './types';
import { shiftDays, todayIso } from '../lib/today';

const at = (daysAgo: number, time: string) => `${shiftDays(todayIso(), -daysAgo)}T${time}Z`;

/**
 * Message.threadId matches a team's id directly, or a proposal's threadId —
 * there is no separate thread record (see data/teams.ts, data/proposals.ts).
 * The Website Development thread reproduces the reference comp's exact
 * sequence, including "Tom", who sends messages here without being a member
 * of the team roster in data/teams.ts — that mismatch exists in the source
 * comps themselves and is reproduced deliberately, not a mistake. Every
 * senderId here resolves through the `people` lookup in data/people.ts,
 * which is not the same thing as a team's member roster (see that file's
 * comment on Tom).
 */
export const messages: Message[] = [
  // t-website-dev — reproduces the reference chat-thread comp.
  {
    id: 'msg-web-1',
    threadId: 't-website-dev',
    senderId: 'm-alice-johnson',
    body: 'Hi team!👋',
    at: at(2, '15:28:00'),
    read: true,
  },
  {
    id: 'msg-web-2',
    threadId: 't-website-dev',
    senderId: 'm-alice-johnson',
    body: 'Excited to join the project!',
    at: at(2, '15:31:00'),
    read: true,
  },
  {
    id: 'msg-web-3',
    threadId: 't-website-dev',
    senderId: 'm-alice-johnson',
    voice: { durationSec: 5, seed: 'alice-johnson-voice-1' },
    at: at(2, '15:35:00'),
    read: true,
  },
  {
    id: 'msg-web-4',
    threadId: 't-website-dev',
    senderId: 'me',
    body: 'Hi Alice!',
    at: at(1, '16:03:00'),
    read: true,
  },
  {
    id: 'msg-web-5',
    threadId: 't-website-dev',
    senderId: 'me',
    body: 'Glad to have you on the team)',
    at: at(1, '16:05:00'),
    read: true,
  },
  {
    id: 'msg-web-6',
    threadId: 't-website-dev',
    senderId: 'm-tom',
    body: 'Welcome aboard, Alice! 😉',
    at: at(1, '16:07:00'),
    read: false,
  },
  {
    id: 'msg-web-7',
    threadId: 't-website-dev',
    senderId: 'me',
    body: 'Looking forward to your design concepts.',
    at: at(0, '16:48:00'),
    read: true,
  },
  {
    id: 'msg-web-8',
    threadId: 't-website-dev',
    senderId: 'me',
    voice: { durationSec: 5, seed: 'me-voice-1' },
    at: at(0, '16:50:00'),
    read: true,
  },

  // The two teams outside the reference thread each carry at least one
  // message (Ruling R2 — an empty thread renders no preview row at all).
  // t-brand-identity's only message is from someone else (read, but not
  // 'me' — no read tick belongs on it) and t-print-ad's last message is
  // mine (delivered, unread: 0 — this is where a read tick belongs) so the
  // chats list exercises both branches of the delivered/read-tick gate.
  {
    id: 'msg-brand-1',
    threadId: 't-brand-identity',
    senderId: 'm-alice-kim',
    body: 'Excited to join the project!',
    at: at(3, '13:28:00'),
    read: true,
  },
  {
    id: 'msg-print-1',
    threadId: 't-print-ad',
    senderId: 'm-emilie-laurent',
    body: 'Excited to join the project!',
    at: at(3, '13:28:00'),
    read: true,
  },
  {
    id: 'msg-print-2',
    threadId: 't-print-ad',
    senderId: 'me',
    body: "Sounds great — let's get started.",
    at: at(3, '13:45:00'),
    read: true,
  },

  // Proposal threads — one opening message each, so a proposal's linked
  // conversation is never silent either.
  {
    id: 'msg-pr-1',
    threadId: 'th-pr-1',
    senderId: 'c-morgan-blake',
    body: "Hi! I'd love to bring bold, editorial energy to this campaign.",
    at: at(2, '10:15:00'),
    read: false,
  },
  {
    id: 'msg-pr-2',
    threadId: 'th-pr-2',
    senderId: 'c-devon-wu',
    body: 'Thanks for the look — happy to share past redesign work.',
    at: at(1, '09:40:00'),
    read: true,
  },
  {
    id: 'msg-pr-3',
    threadId: 'th-pr-3',
    senderId: 'e-urban-development',
    body: 'Thanks for applying — we are reviewing consultant proposals this week.',
    at: at(4, '11:00:00'),
    read: true,
  },
  {
    id: 'msg-pr-4',
    threadId: 'th-pr-4',
    senderId: 'e-pulse-digital',
    body: "You're a great fit — welcome to the project!",
    at: at(1, '17:20:00'),
    read: true,
  },
  {
    id: 'msg-pr-5',
    threadId: 'th-pr-5',
    senderId: 'c-jamie-lee',
    body: "Hi! I'd love to help with the print layout — happy to share samples.",
    at: at(6, '12:00:00'),
    read: true,
  },
];
