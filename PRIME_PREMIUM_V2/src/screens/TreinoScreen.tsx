import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { RestTimerModal } from '../components/RestTimerModal';
import { SPLITS, SPLIT_ORDER, Exercise } from '../constants/splits';
import { colors, radius } from '../constants/theme';
import { SetLog } from '../types';

export function TreinoScreen() {
  const store = useAppStore();
  const split = SPLITS.find((s) => s.id === SPLIT_ORDER[store.currentSplitIdx]) ?? SPLITS[0];
  const today = store.getToday();

  const [restVisible, setRestVisible] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [restExName, setRestExName] = useState('');
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});

  const completedSetsCount = split.exercises.reduce((total, ex) => {
    const logs = today.sets[ex.id] ?? [];
    return total + logs.filter((s) => s.done).length;
  }, 0);
  const totalSets = split.exercises.reduce((t, ex) => t + ex.sets, 0);
  const pct = totalSets > 0 ? completedSetsCount / totalSets : 0;

  const handleSetDone = (ex: Exercise, setIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prev = today.sets[ex.id] ?? [];
    const existing = prev[setIdx];
    const w = parseFloat(weightInputs[`${ex.id}-w`] ?? String(ex.lastW));
    const log: SetLog = { weight: isNaN(w) ? ex.lastW : w, reps: ex.reps, done: !existing?.done };
    store.logSet(ex.id, setIdx, log);
    store.updatePR(ex.id, log.weight);

    if (!existing?.done) {
      setRestExName(ex.name);
      setRestDuration(ex.restSecs ?? 60);
      setRestVisible(true);
    }
  };

  const handleFinishWorkout = () => {
    const done = completedSetsCount >= Math.floor(totalSets * 0.7);
    if (!done) {
      Alert.alert('Tem certeza?', `Você completou apenas ${completedSetsCount}/${totalSets} sets.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Finalizar assim', onPress: () => finishWorkout() },
      ]);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.markWorkoutDone(split.id);
    Alert.alert('🔥 Treino finalizado!', `${split.name} concluído. Próximo: ${SPLITS[(store.currentSplitIdx + 1) % SPLITS.length].name}`, [
      { text: 'Ótimo!' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.splitLabel}>{split.label}</Text>
          <Text style={styles.splitName}>{split.name}</Text>
          <Text style={styles.splitMuscle}>{split.muscle}</Text>
        </View>
        <View style={styles.navBtns}>
          <TouchableOpacity style={styles.navBtn} onPress={() => store.prevSplit()}>
            <Text style={styles.navBtnTxt}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => store.nextSplit()}>
            <Text style={styles.navBtnTxt}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>{completedSetsCount}/{totalSets}</Text>
        <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {split.exercises.map((ex, exIdx) => {
          const logs = today.sets[ex.id] ?? [];
          const exDone = logs.filter((s) => s.done).length;
          const isExpanded = expandedEx === ex.id;
          const allDone = exDone >= ex.sets;

          return (
            <TouchableOpacity
              key={ex.id}
              style={[styles.exCard, allDone && styles.exCardDone]}
              onPress={() => setExpandedEx(isExpanded ? null : ex.id)}
              activeOpacity={0.8}
            >
              {allDone && <View style={styles.exDoneBar} />}
              <View style={styles.exHeader}>
                <View style={[styles.exNum, allDone && styles.exNumDone]}>
                  <Text style={[styles.exNumTxt, allDone && { color: colors.green }]}>
                    {allDone ? '✓' : exIdx + 1}
                  </Text>
                </View>
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMuscle}>{ex.muscle}</Text>
                </View>
                <View style={styles.exRight}>
                  <Text style={styles.exStat}>{ex.sets}×{ex.reps}</Text>
                  <Text style={styles.exWeight}>{ex.lastW}kg</Text>
                  <View style={[styles.exProgress, allDone && styles.exProgressDone]}>
                    <Text style={[styles.exProgressTxt, allDone && { color: colors.green }]}>
                      {exDone}/{ex.sets}
                    </Text>
                  </View>
                </View>
              </View>

              {isExpanded && (
                <View style={styles.exBody}>
                  <View style={styles.weightRow}>
                    <Text style={styles.weightLabel}>Peso (kg)</Text>
                    <TextInput
                      style={styles.weightInput}
                      keyboardType="decimal-pad"
                      placeholder={String(ex.lastW)}
                      placeholderTextColor={colors.muted2}
                      value={weightInputs[`${ex.id}-w`] ?? ''}
                      onChangeText={(v) => setWeightInputs((p) => ({ ...p, [`${ex.id}-w`]: v }))}
                    />
                  </View>

                  <View style={styles.setsGrid}>
                    {Array.from({ length: ex.sets }, (_, i) => {
                      const log = logs[i];
                      const done = log?.done ?? false;
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.setBtn, done && styles.setBtnDone]}
                          onPress={() => handleSetDone(ex, i)}
                        >
                          <Text style={[styles.setBtnTxt, done && styles.setBtnTxtDone]}>
                            {done ? '✓' : `S${i + 1}`}
                          </Text>
                          {done && log?.weight ? (
                            <Text style={styles.setWeight}>{log.weight}kg</Text>
                          ) : (
                            <Text style={styles.setReps}>{ex.reps}r</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.restBtn}
                    onPress={() => {
                      setRestExName(ex.name);
                      setRestDuration(ex.restSecs ?? 60);
                      setRestVisible(true);
                    }}
                  >
                    <Text style={styles.restBtnTxt}>⏱  Descanso ({ex.restSecs ?? 60}s)</Text>
                  </TouchableOpacity>

                  {store.prs[ex.id] > 0 && (
                    <Text style={styles.pr}>🏆 PR: {store.prs[ex.id]}kg</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.finishBtn, today.workoutDone && styles.finishBtnDone]}
          onPress={handleFinishWorkout}
          disabled={today.workoutDone}
        >
          <Text style={styles.finishBtnTxt}>
            {today.workoutDone ? '✓ Treino Concluído' : '🔥 Finalizar Treino'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <RestTimerModal
        visible={restVisible}
        duration={restDuration}
        exerciseName={restExName}
        onClose={() => setRestVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flex: 1 },
  splitLabel: { fontSize: 11, color: colors.orange, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  splitName: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  splitMuscle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: {
    width: 36, height: 36, backgroundColor: colors.surface2, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  navBtnTxt: { fontSize: 20, color: colors.text, fontWeight: '300', lineHeight: 22 },
  progressWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 10,
  },
  progressBar: { flex: 1, height: 3, backgroundColor: colors.surface3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.orange, borderRadius: 2 },
  progressLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  progressPct: { fontSize: 12, color: colors.orange, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  exCard: {
    backgroundColor: colors.surface1, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, marginBottom: 8, overflow: 'hidden',
  },
  exCardDone: { borderColor: `${colors.green}40` },
  exDoneBar: { height: 2, backgroundColor: colors.green, opacity: 0.5 },
  exHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  exNum: {
    width: 32, height: 32, backgroundColor: colors.surface3, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  exNumDone: { backgroundColor: colors.greenDim },
  exNumTxt: { fontSize: 13, fontWeight: '800', color: colors.muted },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: '700', color: colors.text },
  exMuscle: { fontSize: 11, color: colors.muted, marginTop: 2 },
  exRight: { alignItems: 'flex-end', gap: 2 },
  exStat: { fontSize: 12, fontWeight: '700', color: colors.orange },
  exWeight: { fontSize: 11, color: colors.muted },
  exProgress: {
    backgroundColor: colors.surface3, borderRadius: 50,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  exProgressDone: { backgroundColor: colors.greenDim },
  exProgressTxt: { fontSize: 11, fontWeight: '700', color: colors.muted },
  exBody: { padding: 14, paddingTop: 0, gap: 12, borderTopWidth: 1, borderTopColor: colors.border },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  weightInput: {
    flex: 1, backgroundColor: colors.surface3, borderRadius: 10, padding: 10,
    color: colors.text, fontSize: 16, fontWeight: '700',
    borderWidth: 1, borderColor: colors.border, textAlign: 'center',
  },
  setsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  setBtn: {
    flex: 1, minWidth: '22%', backgroundColor: colors.surface3, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 3,
  },
  setBtnDone: { backgroundColor: colors.greenDim, borderColor: `${colors.green}50` },
  setBtnTxt: { fontSize: 14, fontWeight: '800', color: colors.muted2 },
  setBtnTxtDone: { color: colors.green },
  setWeight: { fontSize: 10, color: colors.green, fontWeight: '600' },
  setReps: { fontSize: 10, color: colors.muted2 },
  restBtn: {
    backgroundColor: colors.orangeDim, borderRadius: 10, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: `${colors.orange}30`,
  },
  restBtnTxt: { fontSize: 13, fontWeight: '700', color: colors.orange },
  pr: { fontSize: 12, color: colors.yellow, fontWeight: '700', textAlign: 'center' },
  finishBtn: {
    backgroundColor: colors.orange, borderRadius: radius.lg, padding: 18,
    alignItems: 'center', marginTop: 8, marginBottom: 8,
    shadowColor: colors.orange, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  finishBtnDone: { backgroundColor: colors.green, shadowColor: colors.green },
  finishBtnTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
