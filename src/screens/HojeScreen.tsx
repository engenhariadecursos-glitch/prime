import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { CheckInCard } from '../components/CheckInCard';
import { RingProgress } from '../components/RingProgress';
import { PerfilModal } from '../components/PerfilModal';
import { WeightLogModal } from '../components/WeightLogModal';
import { colors, radius } from '../constants/theme';
import { SPLITS, SPLIT_ORDER } from '../constants/splits';
import { greetingText, fastingProgress, formatHourMin } from '../utils/dateUtils';
import { CheckInKey } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const QUOTES = [
  { text: 'Disciplina é a ponte entre metas e realizações.', author: 'Jim Rohn' },
  { text: 'O corpo conquista o que a mente acredita.', author: 'Napoleon Hill' },
  { text: 'Cada rep te aproxima da versão que você quer ser.', author: 'PRIME Fit' },
  { text: 'Consistência bate intensidade no longo prazo.', author: 'PRIME Fit' },
  { text: 'Descanse apenas quando estiver pronto para vencer.', author: 'PRIME Fit' },
  { text: 'Sua versão futura agradece suas escolhas de hoje.', author: 'PRIME Fit' },
  { text: 'O resultado não mente. Mostre-se todos os dias.', author: 'PRIME Fit' },
];

export function HojeScreen() {
  const router = useRouter();
  const store = useAppStore();
  const today = store.getToday();
  const checkins = today.checkins;
  const streak = store.computeStreak();
  const split = SPLITS.find((s) => s.id === SPLIT_ORDER[store.currentSplitIdx]) ?? SPLITS[0];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [now, setNow] = useState(Date.now());
  const [perfilVisible, setPerfilVisible] = useState(false);
  const [weightVisible, setWeightVisible] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!store.activeFasting) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [store.activeFasting]);

  const checkinScore = Object.values(checkins).filter(Boolean).length;
  const dayScore = Math.round((checkinScore / 7) * 100);
  const waterProgress = Math.min(1, today.waterMl / store.waterGoalMl);
  const calTotal = today.meals.reduce((s, m) => s + m.calories, 0);
  const calProgress = Math.min(1, calTotal / store.calorieGoal);
  const fasting = store.activeFasting;
  const fastProg = fasting ? fastingProgress(fasting.startTime, fasting.goalHours) : 0;
  const fastElapsed = fasting ? now - fasting.startTime : 0;
  const lastInBody = store.inbody[store.inbody.length - 1];
  const todayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const initials = store.userName.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const weightDiff = lastInBody && store.weightGoal
    ? (lastInBody.weight - store.weightGoal).toFixed(1)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greetingText()}</Text>
            <Text style={styles.name}>
              {store.userName.split(' ')[0]}{' '}
              <Text style={{ color: colors.orange }}>
                {store.userName.split(' ').slice(1).join(' ')}
              </Text>
            </Text>
            <Text style={styles.date}>{todayDate}</Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakNum}>{streak}</Text>
                <Text style={styles.streakLbl}>🔥 dias</Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarBtn} onPress={() => setPerfilVisible(true)}>
              <Text style={styles.avatarTxt}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pad}>

          {/* SCORE CARD */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreLabel}>SCORE DO DIA</Text>
              <Text style={styles.scoreNum}>{dayScore}</Text>
              <Text style={styles.scoreUnit}>{checkinScore}/7 check-ins</Text>
              {weightDiff !== null && parseFloat(weightDiff) > 0 && (
                <Text style={styles.scoreDelta}>−{weightDiff}kg para a meta</Text>
              )}
            </View>
            <View style={styles.ringsWrap}>
              <RingProgress
                size={66} strokeWidth={6} progress={waterProgress} color={colors.blue}
                value={`${(today.waterMl / 1000).toFixed(1)}`} unit="L"
                label="Água" sublabel={`/${store.waterGoalMl / 1000}L`}
              />
              <RingProgress
                size={66} strokeWidth={6} progress={calProgress} color={colors.purple}
                value={`${calTotal}`} unit="kcal"
                label="Dieta" sublabel={`/${store.calorieGoal}`}
              />
              <RingProgress
                size={66} strokeWidth={6} progress={fastProg} color={colors.green}
                value={fasting ? `${Math.floor(fastElapsed / 3600000)}h` : '—'}
                unit={fasting ? `/${fasting.goalHours}h` : ''}
                label="Jejum" sublabel={fasting ? 'ativo' : 'off'}
              />
            </View>
          </View>

          {/* WORKOUT CARD — tap to open Treino tab */}
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => router.navigate('/(tabs)/treino')}
            activeOpacity={0.85}
          >
            <View style={styles.workoutTop}>
              <View style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeTxt}>{split.label}</Text>
              </View>
              {today.workoutDone && (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneTxt}>✓ CONCLUÍDO</Text>
                </View>
              )}
              <Text style={styles.workoutArrow}>›</Text>
            </View>
            <Text style={styles.workoutName}>{split.name}</Text>
            <Text style={styles.workoutMuscle}>{split.muscle}</Text>
            <View style={styles.workoutPills}>
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>{split.exercises.length} exercícios</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillTxt}>
                  {split.exercises.reduce((s, e) => s + e.sets, 0)} sets
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* METRICS ROW */}
          <View style={styles.metricsRow}>
            <TouchableOpacity style={styles.metricCard} onPress={() => setWeightVisible(true)}>
              <Text style={styles.metricIcon}>⚖️</Text>
              <Text style={styles.metricVal}>{today.weight ?? lastInBody?.weight ?? '—'}</Text>
              <Text style={styles.metricLbl}>KG HOJE</Text>
            </TouchableOpacity>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🎯</Text>
              <Text style={[styles.metricVal, { color: colors.orange }]}>{store.weightGoal}</Text>
              <Text style={styles.metricLbl}>KG META</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>💪</Text>
              <Text style={[styles.metricVal, { color: colors.green }]}>
                {lastInBody?.muscle ?? '—'}
              </Text>
              <Text style={styles.metricLbl}>MÚSCULO</Text>
            </View>
          </View>

          {/* ACTIVE FASTING CARD — tap to open Jejum tab */}
          {fasting && (
            <TouchableOpacity
              style={styles.fastCard}
              onPress={() => router.navigate('/(tabs)/jejum')}
              activeOpacity={0.85}
            >
              <View style={styles.fastRow}>
                <View style={styles.fastDot} />
                <Text style={styles.fastTitle}>
                  Jejum ativo · {formatHourMin(fastElapsed)} / {fasting.goalHours}h
                </Text>
                <Text style={styles.fastPct}>{Math.round(fastProg * 100)}%</Text>
                <Text style={styles.fastArrow}>›</Text>
              </View>
              <View style={styles.fastTrack}>
                <View style={[styles.fastFill, { width: `${Math.round(fastProg * 100)}%` as any }]} />
              </View>
            </TouchableOpacity>
          )}

          {/* CHECK-IN */}
          <CheckInCard checkins={checkins} onToggle={(key: CheckInKey) => store.toggleCheckin(key)} />

          {/* SHORTCUT BUTTONS */}
          <View style={styles.shortcutRow}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.navigate('/(tabs)/dieta')}
            >
              <Text style={styles.shortcutIcon}>🥗</Text>
              <Text style={styles.shortcutLabel}>Dieta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.navigate('/(tabs)/jejum')}
            >
              <Text style={styles.shortcutIcon}>⏱️</Text>
              <Text style={styles.shortcutLabel}>Jejum</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.navigate('/(tabs)/stats')}
            >
              <Text style={styles.shortcutIcon}>📊</Text>
              <Text style={styles.shortcutLabel}>Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => router.navigate('/(tabs)/livros')}
            >
              <Text style={styles.shortcutIcon}>📚</Text>
              <Text style={styles.shortcutLabel}>Livros</Text>
            </TouchableOpacity>
          </View>

          {/* QUOTE */}
          <View style={styles.quoteCard}>
            <View style={styles.quoteBar} />
            <View style={styles.quoteBody}>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            </View>
          </View>

        </View>
      </Animated.ScrollView>

      <PerfilModal visible={perfilVisible} onClose={() => setPerfilVisible(false)} />
      <WeightLogModal visible={weightVisible} onClose={() => setWeightVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: colors.muted, fontWeight: '500', letterSpacing: 0.2 },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: colors.text, marginTop: 2 },
  date: { fontSize: 12, color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: {
    backgroundColor: colors.orangeDim, borderWidth: 1, borderColor: colors.orange,
    borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center',
  },
  streakNum: { fontSize: 18, fontWeight: '800', color: colors.orange },
  streakLbl: { fontSize: 10, color: colors.orange, fontWeight: '600' },
  avatarBtn: {
    width: 42, height: 42, backgroundColor: colors.orangeDim, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.orange,
  },
  avatarTxt: { fontSize: 14, fontWeight: '900', color: colors.orange },

  pad: { padding: 16, gap: 12 },

  scoreCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 18,
    borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center',
    gap: 16,
  },
  scoreLeft: { flex: 1, gap: 2 },
  scoreLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.muted,
  },
  scoreNum: { fontSize: 58, fontWeight: '900', color: colors.orange, letterSpacing: -3, lineHeight: 62 },
  scoreUnit: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  scoreDelta: { fontSize: 11, color: colors.green, fontWeight: '700', marginTop: 4 },
  ringsWrap: { flexDirection: 'row', gap: 6 },

  workoutCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 20,
    borderWidth: 1, borderColor: colors.border,
  },
  workoutTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  workoutBadge: {
    backgroundColor: colors.orangeDim, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.orange,
  },
  workoutBadgeTxt: { fontSize: 10, fontWeight: '800', color: colors.orange, letterSpacing: 0.8 },
  doneBadge: {
    backgroundColor: colors.greenDim, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.green,
  },
  doneTxt: { fontSize: 9, fontWeight: '800', color: colors.green, letterSpacing: 0.5 },
  workoutArrow: { fontSize: 22, color: colors.muted2, fontWeight: '300', marginLeft: 'auto' },
  workoutName: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginBottom: 4 },
  workoutMuscle: { fontSize: 12, color: colors.muted, marginBottom: 14 },
  workoutPills: { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: colors.surface3, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5,
  },
  pillTxt: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  metricsRow: { flexDirection: 'row', gap: 8 },
  metricCard: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 4,
  },
  metricIcon: { fontSize: 18 },
  metricVal: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  metricLbl: {
    fontSize: 9, color: colors.muted, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  fastCard: {
    backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.green, gap: 10,
  },
  fastRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fastDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green,
  },
  fastTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.green },
  fastPct: { fontSize: 13, fontWeight: '800', color: colors.green },
  fastArrow: { fontSize: 18, color: colors.green, fontWeight: '300' },
  fastTrack: { height: 3, backgroundColor: colors.surface3, borderRadius: 2, overflow: 'hidden' },
  fastFill: { height: '100%', backgroundColor: colors.green, borderRadius: 2 },

  shortcutRow: { flexDirection: 'row', gap: 8 },
  shortcutBtn: {
    flex: 1, backgroundColor: colors.surface1, borderRadius: radius.md, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  shortcutIcon: { fontSize: 22 },
  shortcutLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },

  quoteCard: {
    flexDirection: 'row', gap: 14, backgroundColor: colors.surface1,
    borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  quoteBar: { width: 3, borderRadius: 2, backgroundColor: colors.orange, minHeight: 40 },
  quoteBody: { flex: 1, gap: 6 },
  quoteText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { fontSize: 11, color: colors.muted, fontWeight: '700' },
});
