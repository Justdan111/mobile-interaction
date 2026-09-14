import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getMood, type Mood, type MoodId } from '../data/moods';

export type MoodState = {
  /** The chosen mood, or null before the user has told us anything. */
  moodId: MoodId | null;
  /** The resolved mood, or null. Saves every consumer calling getMood. */
  mood: Mood | null;
  setMood: (id: MoodId) => void;
  clearMood: () => void;
};

const MoodContext = createContext<MoodState | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [moodId, setMoodId] = useState<MoodId | null>(null);

  const setMood = useCallback((id: MoodId) => setMoodId(id), []);
  const clearMood = useCallback(() => setMoodId(null), []);

  const value = useMemo<MoodState>(
    () => ({ moodId, mood: moodId ? getMood(moodId) : null, setMood, clearMood }),
    [moodId, setMood, clearMood]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood(): MoodState {
  const ctx = useContext(MoodContext);
  // Failing loudly beats silently rendering the no-mood state everywhere,
  // which is what a null-object default would do.
  if (!ctx) throw new Error('useMood must be used inside a <MoodProvider>');
  return ctx;
}
