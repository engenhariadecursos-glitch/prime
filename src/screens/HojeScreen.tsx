import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { CheckInCard } from '../components/CheckInCard';
import { RingProgress } from '../components/RingProgress';
import { colors, spacing, radius, typography } from '../constants/theme';
import { SPLITS, SPLIT_ORDER } from '../constants/splits';
import { greetingText, fastingProgress, formatHourMin } from '../utils/dateUtils';
import { CheckInKey } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HojeScreen() {
  const store = useAppStore();
  const today = store.getToday();
  const checkins = today.checkins;
  const streak = store.computeStreak();
  const split = SPLITS.find((s) => s.id === SPLIT_ORDER[store.currentSplitIdx]) ?? SPLITS[0];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const checkinScore = Object.values(checkins).filter(Boolean).length;
  const totalCheckins = 7;
  const dayScore = Math.round((checkinScore / totalCheckins) * 100);

  const waterProgress = Math.min(1, today.waterMl / store.waterGoalMl);
  const calTotal = today.meals.reduce((s, m) => s + m.calories, 0);
  const calProgress = Math.min(1, calTotal / store.calorieGoal);

  const fasting = store.activeFasting;
  const fastProg = fasting ? fastingProgress(fasting.startTime, fasting.goalHours) : 0;
  const fastElapsed = fasting ? Date.now() - fasting.startTime : 0;

  const lastInBody = store.inbody[store.inbody.length - 1];
  const todayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greetingText()},</Text>
            <Text style={styles.name}>Júlio <Text style={{ color: colors.orange }}>Cezar</Text></Text>
            <Text style={styles.date}>{todayDate}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLbl}>🔥 dias</Text>
          </View>
        </View>

        <View style={styles.pad}>

          {/* SCORE RINGS */}
          <View style={styles.ringsCard}>
            <Text style={styles.sectionLabel}>Score do Dia</Text>
            <View style={styles.ringsRow}>
              <RingProgress
                size={80} strokeWidth={7}
                progress={dayScore / 100}
                gradient
                value={`${dayScore}`}
                unit="%"
                label="Geral"
                sublabel={`${checkinScore}/7`}
              />
              <RingProgress
                size={80} strokeWidth={7}
                progress={waterProgress}
                color={colors.blue}
                value={`${(today.waterMl / 1000).toFixed(1)}`}
                unit="L"
                label="Água"
                sublabel={`/${(store.waterGoalMl / 1000)}L`}
              />
              <RingProgress
                size={80} strokeWidth={7}
                progress={calProgress}
                color={colors.purple}
                value={`${calTotal}`}
                unit="kcal"
                label="Dieta"
                sublabel={`/${store.calorieGoal}`}
              />
              <RingProgress
                size={80} strokeWidth={7}
                progress={fastProg}
                color={colors.green}
                value={fasting ? `${Math.floor(fastElapsed / 3600000)}h` : '—'}
                unit={fasting ? `/${fasting.goalHours}h` : ''}
                label="Jejum"
                sublabel={fasting ? 'ativo' : 'inativo'}
              />
            </View>
          </View>

          {/* TODAY'S WORKOUT */}
          <TouchableOpacity style={styles.workoutCard} activeOpacity={0.9}>
            <View style={styles.workoutBadge}>
              <Text style={styles.workoutBadgeText}>{split.label}</Text>
            </View>
            <Text style={styles.workoutName}>{split.name}</Text>
            <Text style={styles.workoutMuscle}>{split.muscle}</Text>
            <View style={styles.workoutFooter}>
              <Text style={styles.workoutStat}>
                {split.exercises.length} exercícios
              </Text>
              <Text style={styles.workoutStat}>
                {split.exercises.reduce((s, e) => s + e.sets, 0)} sets
              </Text>
              {today.workoutDone && (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneTxt}>✓ Concluído</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* QUICK STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚖️</Text>
              <Text style={styles.statVal}>{lastInBody?.weight ?? '—'}</Text>
              <Text style={styles.statLbl}>kg atual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statVal, { color: colors.orange }]}>{store.weightGoal}</Text>
              <Text style={styles.statLbl}>kg meta</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💪</Text>
              <Text style={[styles.statVal, { color: colors.green }]}>{lastInBody?.muscle ?? '—'}</Text>
              <Text style={styles.statLbl}>kg músculo</Text>
            </View>
          </View>

          {/* FASTING MINI CARD */}
          {fasting && (
            <View style={styles.fastCard}>
              <View style={styles.fastLeft}>
                <Text style={styles.fastIcon}>⏱️</Text>
                <View>
                  <Text style={styles.fastTitle}>Jejum ativo</Text>
                  <Text style={styles.fastSub}>
                    {formatHourMin(fastElapsed)} / {fasting.goalHours}h
                  </Text>
                </View>
              </View>
              <View style={[styles.fastBar]}>
                <View style={[styles.fastFill, { width: `${Math.round(fastProg * 100)}%` as any }]} />
              </View>
            </View>
          )}

          {/* CHECK-IN */}
          <CheckInCard
            checkins={checkins}
            onToggle={(key: CheckInKey) => store.toggleCheckin(key)}
          />

          {/* MOTIVATIONAL */}
          <View style={styles.motivCard}>
            <Text style={styles.motivText}>
              "Disciplina é a ponte entre metas e realizações."
            </Text>
            <Text style={styles.motivAuthor}>— Jim Rohn</Text>
          </View>

        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,106,0,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: colors.text, marginTop: 2 },
  date: { fontSize: 12, color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  streakBadge: {
    backgroundColor: colors.orangeDim,
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  streakNum: { fontSize: 20, fontWeight: '800', color: colors.orange },
  streakLbl: { fontSize: 10, color: colors.orange, fontWeight: '600' },
  pad: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.muted, marginBottom: 14,
  },
  ringsCard: {
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  workoutCard: {
    borderRadius: radius.lg,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  workoutBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  workoutBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  workoutName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  workoutMuscle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  workoutFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  workoutStat: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  doneBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  doneTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: { fontSize: 18, marginBottom: 6 },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: colors.muted, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  fastCard: {
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.green,
    gap: 10,
  },
  fastLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fastIcon: { fontSize: 20 },
  fastTitle: { fontSize: 14, fontWeight: '700', color: colors.green },
  fastSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  fastBar: {
    height: 4,
    backgroundColor: colors.surface3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fastFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 2,
  },
  motivCard: {
    backgroundColor: colors.surface1,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  motivText: { fontSize: 13, color: colors.text, fontStyle: 'italic', lineHeight: 20 },
  motivAuthor: { fontSize: 11, color: colors.muted, marginTop: 6, fontWeight: '600' },
});
