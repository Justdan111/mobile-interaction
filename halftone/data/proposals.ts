import type { Proposal } from './types';
import { shiftDays, todayIso } from '../lib/today';

const at = (daysAgo: number, time: string) => `${shiftDays(todayIso(), -daysAgo)}T${time}Z`;

/**
 * No incoming proposal is seeded 'accepted' (Ruling R4) — the proposals
 * screen accepts one at a time and asserts exactly one "Accepted" result
 * afterward, so a pre-accepted incoming record would break that count.
 */
export const proposals: Proposal[] = [
  {
    id: 'pr-1',
    projectId: 'p-graphic-ad',
    direction: 'incoming',
    counterpartId: 'c-morgan-blake',
    counterpartName: 'Morgan Blake',
    role: 'Graphic Designer',
    status: 'sent',
    at: at(2, '10:15:00'),
    threadId: 'th-pr-1',
    rate: 550,
    note: "I'd love to bring bold, editorial energy to this campaign.",
  },
  {
    id: 'pr-2',
    projectId: 'p-mobile-app',
    direction: 'incoming',
    counterpartId: 'c-devon-wu',
    counterpartName: 'Devon Wu',
    role: 'UI Designer',
    status: 'viewed',
    at: at(1, '09:40:00'),
    threadId: 'th-pr-2',
    rate: 5200,
    note: 'I redesigned two consumer apps with a similar onboarding-to-checkout scope last year.',
  },
  {
    id: 'pr-3',
    projectId: 'p-sustainable-city',
    direction: 'outgoing',
    counterpartId: 'e-urban-development',
    counterpartName: 'Urban Development Co.',
    role: 'Design Consultant',
    status: 'viewed',
    at: at(4, '11:00:00'),
    threadId: 'th-pr-3',
    rate: 90000,
    note: 'Five years leading sustainability-focused urban design work in California.',
  },
  {
    id: 'pr-4',
    projectId: 'p-social-media',
    direction: 'outgoing',
    counterpartId: 'e-pulse-digital',
    counterpartName: 'Pulse Digital',
    role: 'Content Designer',
    status: 'accepted',
    at: at(1, '17:20:00'),
    threadId: 'th-pr-4',
    rate: 24000,
    note: 'Excited to put together a month of launch content for this brand.',
  },
  {
    id: 'pr-5',
    projectId: 'p-print-ad',
    direction: 'incoming',
    counterpartId: 'c-jamie-lee',
    counterpartName: 'Jamie Lee',
    role: 'Print Designer',
    status: 'declined',
    at: at(6, '12:00:00'),
    threadId: 'th-pr-5',
    rate: 4000,
    note: 'Happy to help with the print layout — glad to share samples on request.',
  },
];
