import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../constants/theme';
import { CheckIns, CheckInKey } from '../types';

const ITEMS: { key: CheckInKey; label: string; icon: string }[] = [
  { key: 'treino', label: 'Treino', icon: '🏋️' },
  { key: 'dieta', label: 'Dieta', icon: '🥗' },
  { key: 'agua', label: 'Água 3L', icon: '💧' },
  { key: 'jejum', label: 'Jejum', icon: '⏱️' },
  { key: 'cardio', label: 'Cardio', icon: '🏃' },
  { key: 'sono', label: 'Sono', icon: '😴' },
  { key: 'suplementos', label: 'Suplement.', icon: '💊' },
];

interface Props {
  checkins: CheckIns;
  onToggle: (key: CheckInKey) => void;
}

export function CheckInCard({ checkins, onToggle }: Props) {
  const score = Object.values(checkins).filter(Boolean).length;
  const pct = Math.round((score / ITEMS.length) * 100);

  const handleToggle = (key: CheckInKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(key);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Check-in Diário</Text>
          <Text style={styles.sub}>Hábitos de hoje</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreNum}>{score}</Text>
          <Text style={styles.scoreDen}>/{ITEMS.length}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>

      <View style={styles.grid}>
        {ITEMS.map((item) => {
          const done = checkins[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, done && styles.itemDone]}
              onPress={() => handleToggle(item.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.label, done && styles.labelDone]}>{item.label}</Text>
              <View style={[styles.check, done && styles.checkDone]}>
                {done && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {pct === 100 && (
        <View style={styles.perfect}>
          <Text style={styles.perfectText}>🏆 Dia perfeito! Incrível!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  sub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  scoreBadge: {
    backgroundColor: colors.orangeDim,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: { fontSize: 20, fontWeight: '800', color: colors.orange },
  scoreDen: { fontSize: 13, color: colors.orange, opacity: 0.7 },
  progressBar: {
    height: 3,
    backgroundColor: colors.surface3,
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  itemDone: {
    backgroundColor: colors.greenDim,
    borderColor: colors.green,
  },
  icon: { fontSize: 20 },
  label: { fontSize: 10, fontWeight: '600', color: colors.muted, textAlign: 'center' },
  labelDone: { color: colors.green },
  check: {
    width: 18, height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.muted2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  checkMark: { fontSize: 10, color: '#000', fontWeight: '800' },
  perfect: {
    marginTop: 12,
    backgroundColor: 'rgba(255,215,64,0.1)',
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,64,0.3)',
  },
  perfectText: { fontSize: 13, fontWeight: '700', color: colors.yellow },
});
