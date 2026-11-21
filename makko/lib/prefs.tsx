import React, { createContext, useContext, useMemo, useState } from 'react';
import { NOTIFICATION_KINDS } from '../data/notifications';

type Prefs = {
  interests: Set<string>;
  toggleInterest: (id: string) => void;
  perDay: Record<string, number>;
  setPerDay: (kind: string, n: number) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

/** Onboarding answers, held for the session. */
export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [interests, setInterests] = useState<Set<string>>(() => new Set(['lifestyle', 'plants']));
  const [perDay, setPerDayState] = useState<Record<string, number>>(() =>
    Object.fromEntries(NOTIFICATION_KINDS.map((k) => [k.id, k.perDay]))
  );

  const value = useMemo<Prefs>(
    () => ({
      interests,
      toggleInterest: (id) =>
        setInterests((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      perDay,
      setPerDay: (kind, n) => setPerDayState((prev) => (prev[kind] === n ? prev : { ...prev, [kind]: n })),
    }),
    [interests, perDay]
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs outside PrefsProvider');
  return ctx;
}
