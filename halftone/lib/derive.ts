import type {
  AgendaItem, ID, ISODate, Mark, Message, Project, ThreadPreview,
} from '../data/types';

/** Inclusive list of ISO dates from start to end. Pure string/UTC math — no local timezone drift. */
export function dateRange(start: ISODate, end: ISODate): ISODate[] {
  const out: ISODate[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor.getTime() <= last.getTime()) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export function marksFromProjects(projects: Project[]): Mark[] {
  const marks: Mark[] = [];
  for (const p of projects) {
    for (const date of dateRange(p.deadline, p.deadlineEnd ?? p.deadline)) {
      marks.push({ date, kind: 'project', label: p.title, projectId: p.id });
    }
    for (const t of p.tasks) {
      marks.push({ date: t.due, kind: 'task', label: t.title, projectId: p.id });
    }
  }
  return marks;
}

export function agendaFromProjects(projects: Project[]): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const p of projects) {
    items.push({
      id: `${p.id}:deadline`,
      date: p.deadline,
      kind: 'Deadline',
      projectName: p.title,
      title: `${p.title} delivery`,
      projectId: p.id,
    });
    for (const t of p.tasks) {
      items.push({
        id: t.id,
        date: t.due,
        kind: 'Task',
        projectName: p.title,
        title: t.title,
        projectId: p.id,
      });
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export function threadPreview(
  threadId: ID,
  messages: Message[],
  people: Record<ID, string>
): ThreadPreview | null {
  const inThread = messages.filter((m) => m.threadId === threadId);
  if (inThread.length === 0) return null;

  const sorted = [...inThread].sort((a, b) => a.at.localeCompare(b.at));
  const last = sorted[sorted.length - 1];

  return {
    threadId,
    senderName: people[last.senderId] ?? 'Unknown',
    text: last.body ?? (last.voice ? 'Voice message' : ''),
    at: last.at,
    unread: inThread.filter((m) => !m.read && m.senderId !== 'me').length,
  };
}
