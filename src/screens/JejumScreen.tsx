import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { colors, radius } from '../constants/theme';
import { fastingProgress, fastingElapsed, fastingRemaining, formatTime, formatHourMin } from '../utils/dateUtils';
import { scheduleFastingEndNotification, cancelNotification } from '../utils/notifications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GOALS = [12, 16, 18, 24];
const GOAL_LABELS: Record<number, string> = {
  12: 'Leve',
  16: 'Padrão',
  18: 'Intenso',
  24: 'Extremo',
};

const SIZE = 260;
const SW = 18;
const R = (SIZE - SW) / 2;
const CIRC = 2 * Math.PI * R;

export function JejumScreen() {
  const store = useAppStore();
  const { activeFasting, fastingSessions } = store;
  const [selectedGoal, setSelectedGoal] = useState(16);
  const [now, setNow] = useState(Date.now());
  const animProg = useRef(new Animated.Value(0)).current;
  const notifIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = activeFasting
    ? fastingProgress(activeFasting.startTime, activeFasting.goalHours)
    : 0;
  const elapsed = activeFasting ? now - activeFasting.startTime : 0;
  const remaining = activeFasting
    ? fastingRemaining(activeFasting.startTime, activeFasting.goalHours)
    : 0;
  const done = activeFasting ? elapsed >= activeFasting.goalHours * 3600000 : false;

  useEffect(() => {
    Animated.timing(animProg, {
      toValue: Math.min(1, progress),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animProg.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
      const session = fastingSessions.find(
        (f) => f.completed && f.startTime && format(new Date(f.startTime), 'yyyy-MM-dd') === d
      );
      if (session) s++;
      else if (i > 0) break;
    }
    return s;
  })();

  const handleStart = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.startFasting(selectedGoal);
    try {
      const ms = selectedGoal * 3600000;
      const id = await scheduleFastingEndNotification(ms, selectedGoal);
      notifIdRef.current = id;
    } catch (_) {}
  };

  const handleStop = (completed: boolean) => {
    Alert.alert(
      completed ? '🏆 Jejum concluído!' : 'Quebrar jejum?',
      completed
        ? `Parabéns! Você completou ${activeFasting?.goalHours}h de jejum.`
        : 'Tem certeza que quer encerrar o jejum antes do objetivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: completed ? 'Confirmar' : 'Quebrar',
          style: completed ? 'default' : 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            store.stopFasting(completed);
            if (notifIdRef.current) {
              cancelNotification(notifIdRef.current);
              notifIdRef.current = null;
            }
          },
        },
      ]
    );
  };

  const pctNum = Math.round(Math.min(100, progress * 100));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jejum Intermitente</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLbl}>🔥 sequência</Text>
          </View>
        </View>

        <View style={styles.pad}>

          {/* RING TIMER */}
          <View style={styles.ringWrap}>
            <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
              <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
                stroke={done ? colors.green : activeFasting ? colors.orange : colors.surface3}
                strokeWidth={SW}
                strokeDasharray={CIRC}
                strokeDashoffset={strokeDashoffset as any}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.ringCenter}>
              {activeFasting ? (
                <>
                  <Text style={styles.pct}>{pctNum}%</Text>
                  <Text style={[styles.elapsed, done && { color: colors.green }]}>
                    {formatTime(elapsed)}
                  </Text>
                  <Text style={styles.elapsedLbl}>
                    {done ? '✅ Meta atingida!' : 'tempo em jejum'}
                  </Text>
                  {!done && (
                    <Text style={styles.remaining}>
                      faltam {formatHourMin(remaining)}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.idleIcon}>🌙</Text>
                  <Text style={styles.idleText}>Pronto para{'\n'}começar</Text>
                </>
              )}
            </View>
          </View>

          {/* GOAL SELECTOR */}
          {!activeFasting && (
            <View style={styles.goalCard}>
              <Text style={styles.goalTitle}>Objetivo do jejum</Text>
              <View style={styles.goalBtns}>
                {GOALS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.goalBtn, selectedGoal === h && styles.goalBtnActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedGoal(h); }}
                  >
                    <Text style={[styles.goalBtnH, selectedGoal === h && { color: colors.orange }]}>{h}h</Text>
                    <Text style={[styles.goalBtnLbl, selectedGoal === h && { color: colors.orange }]}>
                      {GOAL_LABELS[h]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* INFO DURING FAST */}
          {activeFasting && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <InfoItem label="Objetivo" value={`${activeFasting.goalHours}h`} />
                <InfoItem label="Transcorrido" value={formatHourMin(elapsed)} />
                <InfoItem label="Restante" value={done ? '—' : formatHourMin(remaining)} />
              </View>
              <View style={styles.infoBar}>
                <View style={[styles.infoFill, { width: `${pctNum}%` as any, backgroundColor: done ? colors.green : colors.orange }]} />
              </View>
            </View>
          )}

          {/* ACTION BUTTON */}
          {!activeFasting ? (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.startBtnTxt}>▶  Iniciar Jejum de {selectedGoal}h</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stopBtns}>
              {done && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleStop(true)}>
                  <Text style={styles.completeBtnTxt}>🏆 Concluir Jejum</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.breakBtn} onPress={() => handleStop(false)}>
                <Text style={styles.breakBtnTxt}>Quebrar Jejum</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* HISTORY */}
          {fastingSessions.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Histórico Recente</Text>
              {fastingSessions.slice(0, 7).map((s) => {
                const dur = s.endTime ? s.endTime - s.startTime : 0;
                const d = format(new Date(s.startTime), "dd 'de' MMM", { locale: ptBR });
                return (
                  <View key={s.id} style={[styles.historyItem, s.completed && styles.historyDone]}>
                    <View style={[styles.historyDot, { backgroundColor: s.completed ? colors.green : colors.red }]} />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{d}</Text>
                      <Text style={styles.historyGoal}>Objetivo: {s.goalHours}h</Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={[styles.historyDur, { color: s.completed ? colors.green : colors.red }]}>
                        {formatHourMin(dur)}
                      </Text>
                      <Text style={styles.historyStatus}>{s.completed ? '✅' : '❌'}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  streakBadge: {
    backgroundColor: colors.orangeDim, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1, borderColor: colors.orange,
  },
  streakNum: { fontSize: 18, fontWeight: '800', color: colors.orange },
  streakLbl: { fontSize: 10, color: colors.orange, fontWeight: '600' },
  pad: { padding: 20, gap: 16, alignItems: 'center' },
  ringWrap: { position: 'relative', width: SIZE, height: SIZE, marginVertical: 10 },
  ringCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  pct: { fontSize: 48, fontWeight: '900', color: colors.orange, letterSpacing: -2 },
  elapsed: { fontSize: 24, fontWeight: '800', color: colors.text },
  elapsedLbl: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  remaining: { fontSize: 13, color: colors.muted, marginTop: 4 },
  idleIcon: { fontSize: 48, marginBottom: 8 },
  idleText: { fontSize: 20, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  goalCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    width: '100%', borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  goalTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  goalBtns: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1, backgroundColor: colors.surface2, borderRadius: radius.sm, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  goalBtnActive: { backgroundColor: colors.orangeDim, borderColor: colors.orange },
  goalBtnH: { fontSize: 20, fontWeight: '800', color: colors.text },
  goalBtnLbl: { fontSize: 10, color: colors.muted, fontWeight: '600', marginTop: 2 },
  infoCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg, padding: 16,
    width: '100%', borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  infoRow: { flexDirection: 'row' },
  infoBar: { height: 4, backgroundColor: colors.surface3, borderRadius: 2, overflow: 'hidden' },
  infoFill: { height: '100%', borderRadius: 2 },
  startBtn: {
    backgroundColor: colors.orange, borderRadius: radius.lg, paddingVertical: 18,
    paddingHorizontal: 32, width: '100%', alignItems: 'center',
    shadowColor: colors.orange, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  startBtnTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
  stopBtns: { width: '100%', gap: 10 },
  completeBtn: {
    backgroundColor: colors.green, borderRadius: radius.lg, paddingVertical: 18,
    alignItems: 'center', shadowColor: colors.green, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  completeBtnTxt: { fontSize: 17, fontWeight: '800', color: '#000' },
  breakBtn: {
    backgroundColor: colors.surface2, borderRadius: radius.lg, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  breakBtnTxt: { fontSize: 15, fontWeight: '700', color: colors.red },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
    color: colors.muted, alignSelf: 'flex-start',
  },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    backgroundColor: colors.surface1, borderRadius: radius.sm, padding: 14,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  historyDone: { borderColor: 'rgba(0,229,170,0.2)' },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 13, fontWeight: '700', color: colors.text },
  historyGoal: { fontSize: 11, color: colors.muted },
  historyRight: { alignItems: 'flex-end', gap: 2 },
  historyDur: { fontSize: 14, fontWeight: '800' },
  historyStatus: { fontSize: 14 },
});
