import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors } from '../constants/theme';
import { DayData } from '../types';

interface Props {
  days: Record<string, DayData>;
  last?: number;
}

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function HeatmapGrid({ days, last = 91 }: Props) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = last - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }

  const startDow = parseISO(dates[0]).getDay();
  const padded = Array(startDow).fill(null).concat(dates);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const getCellColor = (date: string | null): string => {
    if (!date) return 'transparent';
    const d = days[date];
    if (!d) return colors.surface3;
    if (d.workoutDone) {
      const score = Object.values(d.checkins).filter(Boolean).length;
      return score >= 5 ? colors.green : score >= 3 ? colors.orange : '#2a2a0a';
    }
    const isToday = date === format(new Date(), 'yyyy-MM-dd');
    return isToday ? colors.surface3 : colors.redDim;
  };

  const stats = dates.reduce(
    (acc, d) => {
      const day = days[d];
      if (day?.workoutDone) acc.done++;
      else if (day) acc.missed++;
      return acc;
    },
    { done: 0, missed: 0 }
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Consistência — 13 semanas</Text>
        <View style={styles.stats}>
          <Text style={[styles.stat, { color: colors.green }]}>{stats.done} treinos</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={[styles.stat, { color: colors.muted }]}>{stats.missed} faltas</Text>
        </View>
      </View>

      <View style={styles.dowRow}>
        {DOW.map((d, i) => (
          <Text key={i} style={styles.dowLabel}>{d}</Text>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.col}>
              {week.map((date, di) => (
                <View
                  key={di}
                  style={[styles.cell, { backgroundColor: getCellColor(date) }]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Menos</Text>
        {[colors.surface3, '#2a2a0a', colors.orange, colors.green].map((c, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
        ))}
        <Text style={styles.legendLabel}>Mais</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stat: { fontSize: 12, fontWeight: '600' },
  dot: { fontSize: 12, color: colors.muted2 },
  dowRow: { flexDirection: 'row', marginBottom: 4, paddingLeft: 2 },
  dowLabel: { width: 14, fontSize: 9, color: colors.muted2, textAlign: 'center', marginRight: 2 },
  grid: { flexDirection: 'row', gap: 2 },
  col: { flexDirection: 'column', gap: 2 },
  cell: { width: 12, height: 12, borderRadius: 3 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' },
  legendLabel: { fontSize: 10, color: colors.muted2 },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
});
