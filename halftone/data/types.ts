export type ID = string;
export type ISODate = string;      // 'YYYY-MM-DD'
export type ISODateTime = string;  // full ISO 8601

export type Employer = { id: ID; name: string };

export type ProjectTask = { id: ID; title: string; due: ISODate; done: boolean };

export type Project = {
  id: ID;
  title: string;
  payMin: number;
  payMax: number;
  currency: 'USD';
  location: string;
  experience: string;
  commitment: 'Full time' | 'Part time' | 'Contract';
  employer: Employer;
  postedAt: ISODate;
  /** Start of the project deadline window. */
  deadline: ISODate;
  /** Set only for multi-day windows; renders as a joined pill in the calendar. */
  deadlineEnd?: ISODate;
  saved: boolean;
  description: string;
  tasks: ProjectTask[];
};

export type Member = { id: ID; name: string; role: string; online: boolean };

export type TeamFile = {
  id: ID;
  name: string;
  size: string;
  kind: 'pdf' | 'fig' | 'img' | 'doc';
  at: ISODate;
};

export type Team = {
  id: ID;
  name: string;
  projectId: ID;
  members: Member[];
  muted: boolean;
  files: TeamFile[];
};

export type Voice = { durationSec: number; seed: string };

export type Message = {
  id: ID;
  threadId: ID;
  /** 'me' marks the current user. */
  senderId: ID;
  body?: string;
  voice?: Voice;
  at: ISODateTime;
  read: boolean;
};

export type ProposalStatus = 'sent' | 'viewed' | 'accepted' | 'declined';

export type Proposal = {
  id: ID;
  projectId: ID;
  direction: 'incoming' | 'outgoing';
  counterpartId: ID;
  counterpartName: string;
  role: string;
  status: ProposalStatus;
  at: ISODateTime;
  threadId: ID;
  rate: number;
  note: string;
};

export type Profile = {
  name: string;
  age: number;
  phone: string;
  role: string;
  rating: number;
  happyClients: number;
  completedProjects: number;
  status: string;
};

export type MarkKind = 'today' | 'task' | 'project';
export type Mark = { date: ISODate; kind: MarkKind; label: string; projectId: ID };

export type AgendaItem = {
  id: ID;
  date: ISODate;
  kind: 'Deadline' | 'Task';
  projectName: string;
  title: string;
  projectId: ID;
};

export type ThreadPreview = {
  threadId: ID;
  senderName: string;
  text: string;
  at: ISODateTime;
  unread: number;
};
