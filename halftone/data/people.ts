import type { ID } from './types';
import { teams } from './teams';
import { proposals } from './proposals';
import { profile } from './profile';



const extraPeople: Record<ID, string> = {
  // Tom sends messages in the Website Development thread (data/messages.ts)
  // without being one of the six members on that team's roster (data/teams.ts).
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
