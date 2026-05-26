import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../constants/theme';
import { CheckIns, CheckInKey } from '../types';

const ITEMS: { key: CheckInKey; label: string; icon: string }[] = [
  { key: 'treino', label: 'Treino', icon: '🏋️' },
  { key: 'dieta', label: 'Dieta', icon: '🥗' },
  { key: 'agua', label: 'Água 3L', icon: '💧' },
  { key: 'jejum', label: 'Jejum', icon: '⏱️' },
  { key: 'cardio', label: 'Cardio', icon: '🏃' },
  { key: 'sono', label: 'Sono', icon: '😴' },
  { key: 'suplementos', label: 'Suplemt.', icon: '💊' },
];

interface Props {
  checkins: CheckIns;
  onToggle: (key: CheckInKey) => void;
}

function CheckItem({ item, done, onPress }: { item: typeof ITEMS[0]; done: boolean; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, tension: 200, friction: 5 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 5 }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, minWidth: '22%' }}>
      <TouchableOpacity
        style={[styles.item, done && styles.itemDone]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={[styles.label, done && styles.labelDone]}>{item.label}</Text>
        <View style={[styles.check, done && styles.checkDone]}>
          {done && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function CheckInCard({ checkins, onToggle }: Props) {
  const score = Object.values(checkins).filter(Boolean).length;
  const pct = Math.round((score / ITEMS.length) * 100);

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

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>

      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <CheckItem
            key={item.key}
            item={item}
            done={checkins[item.key]}
            onPress={() => onToggle(item.key)}
          />
        ))}
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
    borderWidth: 1,
    borderColor: `${colors.orange}30`,
  },
  scoreNum: { fontSize: 20, fontWeight: '800', color: colors.orange },
  scoreDen: { fontSize: 13, color: colors.orange, opacity: 0.7 },
  progressTrack: {
    height: 2,
    backgroundColor: colors.surface3,
    borderRadius: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  item: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
    minHeight: 72,
    justifyContent: 'center',
  },
  itemDone: {
    backgroundColor: colors.greenDim,
    borderColor: `${colors.green}50`,
  },
  icon: { fontSize: 18 },
  label: { fontSize: 9, fontWeight: '700', color: colors.muted, textAlign: 'center', letterSpacing: 0.2 },
  labelDone: { color: colors.green },
  check: {
    width: 16, height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.muted2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.green, borderColor: colors.green },
  checkMark: { fontSize: 9, color: '#000', fontWeight: '900' },
  perfect: {
    marginTop: 12,
    backgroundColor: 'rgba(255,215,64,0.08)',
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,64,0.25)',
  },
  perfectText: { fontSize: 13, fontWeight: '700', color: '#FFD60A' },
});
