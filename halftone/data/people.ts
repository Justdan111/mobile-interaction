import type { ID } from './types';
import { teams } from './teams';
import { proposals } from './proposals';
import { profile } from './profile';

/**
 * The one authoritative sender-id -> display-name lookup, covering every id
 * that appears as `Message.senderId` anywhere in data/messages.ts: team
 * members, proposal counterparts, the current user ('me'), and anyone who
 * appears in a thread without holding any other record.
 *
 * A message's sender is not the same thing as a current team member —
 * someone can speak in a thread without being on that team's roster (a
 * colleague from another team, a former member, an employer contact). This
 * lookup is built from the existing sources rather than duplicating people
 * records that already live in team rosters or proposals; `extraPeople`
 * below holds only what is genuinely additional.
 */

// Genuinely additional: senders who hold no other record in the data model.
const extraPeople: Record<ID, string> = {
  // Tom sends messages in the Website Development thread (data/messages.ts,
  // reproducing comp 6) without being one of the six members on that team's
  // roster (data/teams.ts, reproducing comp 7). The source comps disagree
  // with each other on this point; both halves are reproduced deliberately
  // rather than one being dropped to make the other consistent.
  'm-tom': 'Tom',
};

const fromTeams: Record<ID, string> = Object.fromEntries(
  teams.flatMap((t) => t.members.map((m) => [m.id, m.name] as const))
);

const fromProposals: Record<ID, string> = Object.fromEntries(
  proposals.map((p) => [p.counterpartId, p.counterpartName] as const)
);

export const people: Record<ID, string> = {
  me: profile.name,
  ...fromTeams,
  ...fromProposals,
  ...extraPeople,
};
