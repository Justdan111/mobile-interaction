import React from 'react';
import { Text, View } from 'react-native';
import { monthGrid, classifyDay, projectRanges, rangePosition } from '../../lib/calendar';
import { useTheme } from '../../lib/theme';
import { ACTION_FOREGROUND_COLOR } from '../../lib/tokens';
import { MARK_FILL } from './markPalette';
import type { Mark, MarkKind } from '../../data/types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL = 40;

/** Horizontal inset on a standalone day, so circles do not touch. */
const CELL_INSET = 2;

/**
 * Days inside a joined range overlap their neighbours by a hair instead of
 * merely butting against them. Seven `flex: 1` columns rarely divide a screen
 * width evenly, and the leftover fraction opened a visible dark seam between
 * two filled cells — which splits the single pill the spec asks a multi-day
 * range to read as. Overlapping absorbs the rounding; half a point is far
 * below a rendered pixel on any of these screens.
 */
const JOINED_OVERLAP = -0.5;

/**
 * What a screen reader appends to the day number. Today is not a deadline, so
 * it does not get the word — a shared `, ${kind} deadline` template reads out
 * "1, today deadline".
 */
const MARK_SPEECH: Record<MarkKind, string> = {
  today: 'today',
  task: 'task deadline',
  project: 'project deadline',
};

export function MonthGrid({
  year,
  month,
  marks,
  todayIso,
}: {
  year: number;
  month: number;
  marks: Mark[];
  todayIso: string;
}) {
  const { t } = useTheme();
  const cells = monthGrid(year, month);
  const ranges = projectRanges(marks);

  const fillFor = (kind: ReturnType<typeof classifyDay>) =>
    kind ? t[MARK_FILL[kind]] : 'transparent';

  return (
    <View className="rounded-3xl bg-card p-3">
      <View className="flex-row">
        {WEEKDAYS.map((d, i) => (
          <View key={`${d}-${i}`} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
            <Text className="text-muted text-[13px] font-medium">{d}</Text>
          </View>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} className="flex-row">
          {cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
            if (!cell.iso) {
              return <View key={`b-${col}`} style={{ flex: 1, height: CELL }} />;
            }
            const kind = classifyDay(cell.iso, marks, todayIso);
            const pos = kind === 'project' ? rangePosition(cell.iso, ranges) : null;

            // A joined range keeps square inner edges so adjacent days read as one pill.
            const radius =
              pos === 'start'
                ? { borderTopLeftRadius: CELL / 2, borderBottomLeftRadius: CELL / 2 }
                : pos === 'end'
                  ? { borderTopRightRadius: CELL / 2, borderBottomRightRadius: CELL / 2 }
                  : pos === 'middle'
                    ? {}
                    : { borderRadius: CELL / 2 };

            return (
              <View key={cell.iso} style={{ flex: 1, height: CELL, justifyContent: 'center' }}>
                <View
                  // Plain number while the cell shows a padded one: a screen
                  // reader should say "five", not "oh five".
                  accessibilityLabel={`${cell.day}${kind ? `, ${MARK_SPEECH[kind]}` : ''}`}
                  style={{
                    height: CELL - 6,
                    marginHorizontal: pos ? JOINED_OVERLAP : CELL_INSET,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: fillFor(kind),
                    ...radius,
                  }}
                >
                  <Text
                    className="text-[15px]"
                    style={{
                      color: kind ? ACTION_FOREGROUND_COLOR : t.ink,
                      fontFamily: kind ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    }}
                  >
                    {String(cell.day).padStart(2, '0')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
