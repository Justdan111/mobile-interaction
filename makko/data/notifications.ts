export type NotificationKind = { id: string; label: string; emoji: string; perDay: number };

/** Daily notification budgets, one per kind; the ruler edits the selected one. */
export const NOTIFICATION_KINDS: NotificationKind[] = [
  { id: 'likes', label: 'Like\nnotifications', emoji: '👍', perDay: 27 },
  { id: 'comments', label: 'Comment\nnotifications', emoji: '💬', perDay: 15 },
  { id: 'messages', label: 'Message\nnotifications', emoji: '💌', perDay: 40 },
];

export const RULER_MIN = 0;
export const RULER_MAX = 60;
