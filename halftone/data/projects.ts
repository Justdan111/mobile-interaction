import type { Project } from './types';
import { dayInCurrentMonth, shiftDays, todayIso } from '../lib/today';

const posted = (daysAgo: number) => shiftDays(todayIso(), -daysAgo);

/**
 * Every deadline and task-due date below is a day-of-month position within
 * whatever month the app happens to open in — never a literal date. See
 * lib/today.ts. The Website Development project reproduces the reference
 * comp's exact mark composition (tasks on the 5th/9th, a window on the
 * 23rd-24th); the rest are spread across other days so the calendar shows
 * more than one project marked at a time.
 */
export const projects: Project[] = [
  {
    id: 'p-graphic-ad',
    title: 'Graphic design for new advertising campaign',
    payMin: 500,
    payMax: 600,
    currency: 'USD',
    location: 'Online/Remote',
    experience: '3 Years EXP',
    commitment: 'Full time',
    employer: { id: 'e-creative-minds', name: 'Creative Minds Media' },
    postedAt: posted(14),
    deadline: dayInCurrentMonth(12),
    saved: false,
    description:
      'Design a bold, high-impact advertising campaign for a fast-growing creative agency, spanning print, digital, and out-of-home placements.',
    tasks: [
      {
        id: 't-graphic-1',
        title: 'Concept sketches for the print ad series',
        due: dayInCurrentMonth(10),
        done: false,
      },
      {
        id: 't-graphic-2',
        title: 'Client review of colour and type direction',
        due: dayInCurrentMonth(11),
        done: true,
      },
    ],
  },
  {
    id: 'p-sustainable-city',
    title: 'Sustainable City Design and Implementation',
    payMin: 80000,
    payMax: 100000,
    currency: 'USD',
    location: 'California',
    experience: '5+ Years EXP',
    commitment: 'Full time',
    employer: { id: 'e-urban-development', name: 'Urban Development Co.' },
    postedAt: posted(30),
    deadline: dayInCurrentMonth(19),
    deadlineEnd: dayInCurrentMonth(21),
    saved: false,
    description:
      'Lead the design and phased implementation of a sustainability master plan for a mid-size city district, from zoning through public review.',
    tasks: [
      {
        id: 't-city-1',
        title: 'Draft sustainability framework document',
        due: dayInCurrentMonth(15),
        done: false,
      },
      {
        id: 't-city-2',
        title: 'Present zoning proposal to council',
        due: dayInCurrentMonth(18),
        done: false,
      },
    ],
  },
  {
    id: 'p-website-dev',
    title: 'Website Development',
    payMin: 60000,
    payMax: 75000,
    currency: 'USD',
    location: 'New York',
    experience: '4+ Years EXP',
    commitment: 'Full time',
    employer: { id: 'e-creative-solutions', name: 'Creative Solutions Agency' },
    postedAt: posted(45),
    deadline: dayInCurrentMonth(23),
    deadlineEnd: dayInCurrentMonth(24),
    saved: true,
    description:
      'Build a responsive marketing site with an integrated checkout flow, from UI mockups through payment wiring and launch.',
    tasks: [
      {
        id: 't-web-1',
        title: 'Design UI mockups for checkout process',
        due: dayInCurrentMonth(5),
        done: false,
      },
      {
        id: 't-web-2',
        title: 'Wire up payments integration',
        due: dayInCurrentMonth(9),
        done: false,
      },
    ],
  },
  {
    id: 'p-brand-identity',
    title: 'Brand Identity Design',
    payMin: 40000,
    payMax: 55000,
    currency: 'USD',
    location: 'Remote',
    experience: '2+ Years EXP',
    commitment: 'Contract',
    employer: { id: 'e-visionary-brands', name: 'Visionary Brands Co.' },
    postedAt: posted(20),
    deadline: dayInCurrentMonth(27),
    saved: false,
    description:
      'Develop a full brand identity system — logo suite, colour and type direction, and a usage guideline deck — for a new consumer product line.',
    tasks: [
      {
        id: 't-brand-1',
        title: 'Finalize logo suite',
        due: dayInCurrentMonth(25),
        done: false,
      },
    ],
  },
  {
    id: 'p-print-ad',
    title: 'Print Ad Campaign',
    payMin: 30000,
    payMax: 45000,
    currency: 'USD',
    location: 'Chicago',
    experience: '3+ Years EXP',
    commitment: 'Part time',
    employer: { id: 'e-northgate-print', name: 'Northgate Print House' },
    postedAt: posted(10),
    deadline: dayInCurrentMonth(7),
    saved: false,
    description:
      'Produce a multi-spread print advertising campaign for a regional retail client, including layout, copy pairing, and press-ready files.',
    tasks: [
      {
        id: 't-print-1',
        title: 'Layout revisions for spread ads',
        due: dayInCurrentMonth(6),
        done: false,
      },
    ],
  },
  {
    id: 'p-mobile-app',
    title: 'Mobile App UI Redesign',
    payMin: 45000,
    payMax: 60000,
    currency: 'USD',
    location: 'Austin, TX',
    experience: '3+ Years EXP',
    commitment: 'Full time',
    employer: { id: 'e-bright-loop', name: 'Bright Loop Studio' },
    postedAt: posted(5),
    deadline: dayInCurrentMonth(30),
    saved: false,
    description:
      'Redesign the core flows of an existing consumer mobile app, from onboarding through checkout, with a focus on accessibility and motion.',
    tasks: [
      {
        id: 't-mobile-1',
        title: 'User testing on updated flows',
        due: dayInCurrentMonth(28),
        done: false,
      },
    ],
  },
  {
    id: 'p-social-media',
    title: 'Social Media Content Series',
    payMin: 20000,
    payMax: 28000,
    currency: 'USD',
    location: 'Remote',
    experience: '1+ Years EXP',
    commitment: 'Part time',
    employer: { id: 'e-pulse-digital', name: 'Pulse Digital' },
    postedAt: posted(3),
    deadline: dayInCurrentMonth(2),
    saved: false,
    description:
      'Produce a month of short-form social content — stills and motion — for a lifestyle brand launch across three platforms.',
    tasks: [
      {
        id: 't-social-1',
        title: 'Draft content calendar',
        due: dayInCurrentMonth(1),
        done: false,
      },
    ],
  },
];
