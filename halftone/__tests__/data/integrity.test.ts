import { projects } from '../../data/projects';
import { teams } from '../../data/teams';
import { messages } from '../../data/messages';
import { proposals } from '../../data/proposals';
import { todayIso } from '../../lib/today';

const dayOf = (iso: string) => Number(iso.slice(8, 10));

describe('mock data integrity', () => {
  it('has unique project ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('points every team at a real project', () => {
    const ids = new Set(projects.map((p) => p.id));
    for (const t of teams) expect(ids.has(t.projectId)).toBe(true);
  });

  it('points every message at a real thread', () => {
    const threadIds = new Set<string>([
      ...teams.map((t) => t.id),
      ...proposals.map((p) => p.threadId),
    ]);
    for (const m of messages) expect(threadIds.has(m.threadId)).toBe(true);
  });

  it('points every proposal at a real project', () => {
    const ids = new Set(projects.map((p) => p.id));
    for (const p of proposals) expect(ids.has(p.projectId)).toBe(true);
  });

  it('gives every message either a body or a voice note', () => {
    for (const m of messages) expect(Boolean(m.body) || Boolean(m.voice)).toBe(true);
  });

  it('keeps task due dates on or before the project deadline', () => {
    for (const p of projects) {
      for (const t of p.tasks) expect(t.due.localeCompare(p.deadline)).toBeLessThanOrEqual(0);
    }
  });

  it('orders every project pay range low to high', () => {
    for (const p of projects) expect(p.payMin).toBeLessThanOrEqual(p.payMax);
  });

  it('reproduces the mark composition from the reference comp', () => {
    const web = projects.find((p) => p.title === 'Website Development')!;
    expect(dayOf(web.deadline)).toBe(23);
    expect(dayOf(web.deadlineEnd!)).toBe(24);
    expect(web.tasks.map((t) => dayOf(t.due)).sort((a, b) => a - b)).toEqual([5, 9]);
  });

  it('anchors every deadline to the current month', () => {
    const thisMonth = todayIso().slice(0, 7);
    for (const p of projects) {
      expect(p.deadline.slice(0, 7)).toBe(thisMonth);
      for (const t of p.tasks) expect(t.due.slice(0, 7)).toBe(thisMonth);
    }
  });

  it('gives every team at least one message', () => {
    // Ruling R2 — threadPreview returns null for an empty thread, and the
    // chats list renders one row per team from that preview.
    for (const t of teams) {
      expect(messages.some((m) => m.threadId === t.id)).toBe(true);
    }
  });

  it('leaves every incoming proposal undecided or declined', () => {
    // Ruling R4 — the proposals screen asserts a single "Accepted" after the
    // user accepts one, so nothing may arrive pre-accepted.
    for (const p of proposals.filter((p) => p.direction === 'incoming')) {
      expect(p.status).not.toBe('accepted');
    }
  });

  it('contains no hardcoded past dates', () => {
    // Anything anchored to 2023 is a literal that escaped the clock.
    for (const p of projects) {
      expect(p.deadline.startsWith('2023')).toBe(false);
    }
  });
});
