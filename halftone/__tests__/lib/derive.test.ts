import { marksFromProjects, agendaFromProjects, threadPreview } from '../../lib/derive';
import type { Project, Message } from '../../data/types';

const project: Project = {
  id: 'p1',
  title: 'Website Development',
  payMin: 80000,
  payMax: 100000,
  currency: 'USD',
  location: 'California',
  experience: '5+ Years EXP',
  commitment: 'Full time',
  employer: { id: 'e1', name: 'Creative Solutions Agency' },
  postedAt: '2023-06-15',
  deadline: '2023-08-23',
  deadlineEnd: '2023-08-24',
  saved: false,
  description: 'Build it.',
  tasks: [
    { id: 't1', title: 'Design UI mockups for checkout process', due: '2023-08-05', done: false },
    { id: 't2', title: 'Wire up payments', due: '2023-08-09', done: false },
  ],
};

describe('marksFromProjects', () => {
  it('marks every day of a multi-day project window', () => {
    const marks = marksFromProjects([project]).filter((m) => m.kind === 'project');
    expect(marks.map((m) => m.date)).toEqual(['2023-08-23', '2023-08-24']);
  });

  it('marks a single-day project window once', () => {
    const single = { ...project, deadlineEnd: undefined };
    const marks = marksFromProjects([single]).filter((m) => m.kind === 'project');
    expect(marks.map((m) => m.date)).toEqual(['2023-08-23']);
  });

  it('marks each task due date', () => {
    const marks = marksFromProjects([project]).filter((m) => m.kind === 'task');
    expect(marks.map((m) => m.date).sort()).toEqual(['2023-08-05', '2023-08-09']);
  });

  it('carries the project id back on every mark', () => {
    for (const m of marksFromProjects([project])) expect(m.projectId).toBe('p1');
  });
});

describe('agendaFromProjects', () => {
  it('includes one entry per task and one per project deadline', () => {
    const items = agendaFromProjects([project]);
    expect(items.filter((i) => i.kind === 'Task')).toHaveLength(2);
    expect(items.filter((i) => i.kind === 'Deadline')).toHaveLength(1);
  });

  it('sorts by date ascending', () => {
    const dates = agendaFromProjects([project]).map((i) => i.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('never invents a title the source does not have', () => {
    const titles = agendaFromProjects([project]).map((i) => i.title);
    expect(titles).toContain('Design UI mockups for checkout process');
    expect(agendaFromProjects([project])[0].projectName).toBe('Website Development');
  });
});

describe('threadPreview', () => {
  const people = { m1: 'Alice', me: 'You' };
  const messages: Message[] = [
    { id: '1', threadId: 'x', senderId: 'm1', body: 'Hi team!', at: '2023-08-01T15:28:00Z', read: true },
    { id: '2', threadId: 'x', senderId: 'm1', body: 'Excited to join the project!', at: '2023-08-01T15:31:00Z', read: false },
    { id: '3', threadId: 'other', senderId: 'm1', body: 'elsewhere', at: '2023-08-02T10:00:00Z', read: false },
  ];

  it('uses the latest message in the thread', () => {
    expect(threadPreview('x', messages, people)!.text).toBe('Excited to join the project!');
  });

  it('ignores messages from other threads', () => {
    expect(threadPreview('x', messages, people)!.at).toBe('2023-08-01T15:31:00Z');
  });

  it('counts unread messages from other people only', () => {
    expect(threadPreview('x', messages, people)!.unread).toBe(1);
  });

  it('describes a voice note rather than showing an empty body', () => {
    const withVoice: Message[] = [
      { id: '4', threadId: 'v', senderId: 'm1', voice: { durationSec: 5, seed: 'a' }, at: '2023-08-03T09:00:00Z', read: true },
    ];
    expect(threadPreview('v', withVoice, people)!.text).toBe('Voice message');
  });

  it('returns null for a thread with no messages', () => {
    expect(threadPreview('empty', messages, people)).toBeNull();
  });

  it('does not count the current user\'s own unread message', () => {
    // Guards against a version of the counter that forgets to exclude 'me'.
    const withOwnUnread: Message[] = [
      { id: 'a', threadId: 'y', senderId: 'm1', body: 'Hello', at: '2023-08-01T09:00:00Z', read: true },
      { id: 'b', threadId: 'y', senderId: 'me', body: 'Reply', at: '2023-08-01T09:05:00Z', read: false },
    ];
    expect(threadPreview('y', withOwnUnread, people)!.unread).toBe(0);
  });

  it('marks delivered true only when the last message is from me', () => {
    const fromMe: Message[] = [
      { id: 'a', threadId: 'z', senderId: 'me', body: 'Sent', at: '2023-08-01T09:00:00Z', read: true },
    ];
    expect(threadPreview('z', fromMe, people)!.delivered).toBe(true);
    expect(threadPreview('x', messages, people)!.delivered).toBe(false);
  });
});

// These fixtures deliberately differ in id/title/dates from `project` above,
// so a derivation that returned a fixed, plausible-looking constant (rather
// than actually reading the given projects) would fail here even though it
// could pass the single-fixture tests above.
describe('marksFromProjects (varies with input)', () => {
  const other: Project = {
    ...project,
    id: 'p2',
    title: 'Second Project',
    deadline: '2023-09-01',
    deadlineEnd: undefined,
    tasks: [{ id: 'tx', title: 'Other task', due: '2023-09-02', done: false }],
  };

  it('derives each project\'s marks from its own fields, not a shared constant', () => {
    const marks = marksFromProjects([project, other]);
    const otherMarks = marks.filter((m) => m.projectId === 'p2');
    expect(otherMarks.map((m) => m.date).sort()).toEqual(['2023-09-01', '2023-09-02']);
    expect(otherMarks.some((m) => m.label === 'Second Project')).toBe(true);
    expect(otherMarks.some((m) => m.label === project.title)).toBe(false);
  });

  it('produces no task marks for a project with no tasks', () => {
    const noTasks = { ...project, id: 'p3', tasks: [] };
    const marks = marksFromProjects([noTasks]);
    expect(marks.filter((m) => m.kind === 'task')).toHaveLength(0);
  });
});

describe('agendaFromProjects (varies with input)', () => {
  it('reflects a second project\'s own title and date rather than a fixed constant', () => {
    const other: Project = { ...project, id: 'p2', title: 'Second Project', deadline: '2023-09-10', tasks: [] };
    const items = agendaFromProjects([project, other]);
    const secondDeadline = items.find((i) => i.projectId === 'p2')!;
    expect(secondDeadline.projectName).toBe('Second Project');
    expect(secondDeadline.date).toBe('2023-09-10');
    expect(secondDeadline.title).toBe('Second Project delivery');
  });
});
