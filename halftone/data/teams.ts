import type { Team } from './types';
import { shiftDays, todayIso } from '../lib/today';

const fileAt = (daysAgo: number) => shiftDays(todayIso(), -daysAgo);

/**
 * Team ids double as their chat thread ids (see data/messages.ts) — there is
 * no separate thread record, so a team and its conversation can never drift
 * apart.
 */
export const teams: Team[] = [
  {
    id: 't-brand-identity',
    name: 'Brand Identity Design',
    projectId: 'p-brand-identity',
    muted: false,
    members: [
      { id: 'm-alice-kim', name: 'Alice Kim', role: 'Creative Director', online: true },
      { id: 'm-marcus-reed', name: 'Marcus Reed', role: 'Brand Strategist', online: false },
      { id: 'm-priya-nair', name: 'Priya Nair', role: 'Graphic Designer', online: true },
      { id: 'm-diego-alvarez', name: 'Diego Alvarez', role: 'Illustrator', online: false },
      { id: 'm-nina-petrov', name: 'Nina Petrov', role: 'Copywriter', online: true },
      { id: 'm-sam-oconnor', name: "Sam O'Connor", role: 'Motion Designer', online: false },
      { id: 'm-layla-hassan', name: 'Layla Hassan', role: 'UX Researcher', online: true },
      { id: 'm-tomas-rivera', name: 'Tomás Rivera', role: 'Print Production', online: false },
      { id: 'm-chloe-bennett', name: 'Chloe Bennett', role: 'Account Manager', online: true },
      { id: 'm-felix-wagner', name: 'Felix Wagner', role: 'Typography Specialist', online: false },
      { id: 'm-zara-ahmed', name: 'Zara Ahmed', role: 'Junior Designer', online: true },
      { id: 'm-owen-clarke', name: 'Owen Clarke', role: 'Client Liaison', online: false },
    ],
    files: [
      { id: 'f-brand-1', name: 'Logo suite v3.fig', size: '4.2 MB', kind: 'fig', at: fileAt(3) },
    ],
  },
  {
    id: 't-print-ad',
    name: 'Print Ad Campaign',
    projectId: 'p-print-ad',
    muted: false,
    members: [
      { id: 'm-emilie-laurent', name: 'Emilie Laurent', role: 'Art Director', online: true },
      { id: 'm-marco-rossi', name: 'Marco Rossi', role: 'Copywriter', online: false },
      { id: 'm-hana-suzuki', name: 'Hana Suzuki', role: 'Print Designer', online: true },
      { id: 'm-ben-carter', name: 'Ben Carter', role: 'Media Buyer', online: false },
      { id: 'm-ines-duarte', name: 'Ines Duarte', role: 'Production Coordinator', online: true },
      { id: 'm-youssef-amin', name: 'Youssef Amin', role: 'Account Executive', online: false },
    ],
    files: [
      { id: 'f-print-1', name: 'Spread layout draft.pdf', size: '1.8 MB', kind: 'pdf', at: fileAt(2) },
    ],
  },
  {
    id: 't-website-dev',
    name: 'Website Development',
    projectId: 'p-website-dev',
    muted: false,
    members: [
      { id: 'm-creative-solutions', name: 'Creative Solutions Agency', role: 'Employer', online: true },
      { id: 'm-alice-johnson', name: 'Alice Johnson', role: 'Design lead', online: true },
      { id: 'm-grace-martinez', name: 'Grace Martinez', role: 'Graphic Designer', online: false },
      { id: 'm-andrew-wilson', name: 'Andrew Wilson', role: 'Construction Manager', online: false },
      { id: 'm-eric-thompson', name: 'Eric Thompson', role: 'Project Manager', online: true },
      { id: 'm-sarah-thompson', name: 'Sarah Thompson', role: 'Lead Architect', online: false },
    ],
    files: [
      { id: 'f-web-1', name: 'Checkout flow mockups.fig', size: '6.1 MB', kind: 'fig', at: fileAt(4) },
      { id: 'f-web-2', name: 'Sitemap.pdf', size: '540 KB', kind: 'pdf', at: fileAt(6) },
    ],
  },
];
