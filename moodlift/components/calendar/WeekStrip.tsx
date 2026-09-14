import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { WeekDay } from '../../lib/week';

const ACCENT = '#E8724C';

/** The Mon–Sun strip from `.design/comps/calendar.png`. */
export function WeekStrip({
  days,
  selected,
  onSelect,
}: {
  days: WeekDay[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4 mb-4"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {days.map((d) => {
        const isSelected = d.date === selected;
        return (
          <Pressable
            key={d.date}
            onPress={() => onSelect(d.date)}
            accessibilityRole="button"
            accessibilityLabel={`${d.weekday} ${d.day}`}
            accessibilityState={{ selected: isSelected }}
            className="mr-2.5 h-[70px] w-[58px] items-center justify-center rounded-2xl"
            style={{ backgroundColor: isSelected ? ACCENT : '#1B1B1D' }}
          >
            <Text
              className="font-body text-[12px]"
              style={{ color: isSelected ? '#1B1B1D' : '#8E8E93' }}
            >
              {d.weekday}
            </Text>
            <Text
              className="mt-0.5 font-display text-[19px]"
              style={{ color: isSelected ? '#1B1B1D' : '#FFFFFF' }}
            >
              {d.day}
            </Text>
            {/* A dot rather than a second colour: the selected pill already
                owns the accent, so "today" needs a mark that survives being
                selected and unselected. */}
            {d.isToday && !isSelected && (
              <View
                className="absolute bottom-2 h-1 w-1 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
