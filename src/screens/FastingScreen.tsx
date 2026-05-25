import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore, FASTING_PHASES, FastingPreset } from '../store';
import { scheduleFastingMilestone, cancelAllNotifications } from '../utils/notifications';
import ProgressRing from '../components/ProgressRing';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

const FREE_PRESETS: FastingPreset[] = [12, 16, 18, 24];
const PREMIUM_PRESETS: FastingPreset[] = [36, 48, 72, 96, 120];

const PRESET_LABELS: Record<number, string> = {
  12: '12h', 16: '16h', 18: '18h', 24: '24h',
  36: '36h', 48: '48h', 72: '3 dias', 96: '4 dias', 120: '5 dias',
};

const PRESET_DESCRIPTIONS: Record<number, string> = {
  12: 'Iniciante · Comece aqui',
  16: 'Clássico 16:8 · Popular',
  18: 'Cetose garantida',
  24: 'OMAD · Uma refeição',
  36: 'Autofagia inicia',
  48: '2 dias · Renovação',
  72: '3 dias · Transformação',
  96: '4 dias · Elite',
  120: '5 dias · Máximo',
};

function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m restantes`;
  return `${m}m restantes`;
}

function HydrationBar({ today, goal }: { today: number; goal: number }) {
  const pct = Math.min((today / goal) * 100, 100);
  const store = useAppStore.getState();
  return (
    <View style={hydrStyles.container}>
      <View style={hydrStyles.header}>
        <Text style={hydrStyles.label}>💧 Hidratação</Text>
        <Text style={hydrStyles.value}>{today}ml / {goal}ml</Text>
      </View>
      <View style={hydrStyles.bar}>
        <View style={[hydrStyles.fill, { width: `${pct}%` }]} />
      </View>
      <View style={hydrStyles.buttons}>
        {[150, 250, 350, 500].map((ml) => (
          <TouchableOpacity
            key={ml}
            style={hydrStyles.btn}
            onPress={() => {
              useAppStore.getState().logHydration(ml);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={hydrStyles.btnText}>+{ml}ml</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ElectrolyteCard() {
  const { electrolytesToday, logElectrolytes } = useAppStore();
  return (
    <View style={electStyles.container}>
      <View style={electStyles.header}>
        <Text style={electStyles.label}>⚗️ Eletrólitos</Text>
        <Text style={electStyles.count}>{electrolytesToday}/3 hoje</Text>
      </View>
      <Text style={electStyles.desc}>Sódio · Potássio · Magnésio</Text>
      <TouchableOpacity
        style={electStyles.btn}
        onPress={() => {
          logElectrolytes();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={electStyles.btnText}>✓ Registrar dose</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FastingScreen({ navigation }: any) {
  const {
    activeFasting, startFasting, stopFasting,
    isPremium, getCurrentPhase, streak,
    hydrationToday, hydrationGoal,
  } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState<FastingPreset>(16);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (activeFasting) {
      const update = () => {
        const el = Date.now() - activeFasting.startTime;
        const rem = activeFasting.targetHours * 3600 * 1000 - el;
        setElapsed(el);
        setRemaining(rem);
      };
      update();
      intervalRef.current = setInterval(update, 1000);
      startPulse();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeFasting]);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleStart = async () => {
    if (PREMIUM_PRESETS.includes(selectedPreset) && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startFasting(selectedPreset);
    await scheduleFastingMilestone(Date.now(), selectedPreset);
  };

  const handleStop = () => {
    Alert.alert(
      'Encerrar Jejum',
      'Tem certeza que deseja encerrar o jejum atual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            stopFasting();
            await cancelAllNotifications();
          },
        },
      ]
    );
  };

  const progress = activeFasting
    ? Math.min(elapsed / (activeFasting.targetHours * 3600 * 1000), 1)
    : 0;
  const currentPhase = getCurrentPhase();
  const phaseColors = (currentPhase?.color ?? ['#FF6B35', '#C9A84C']) as [string, string];
  const elapsedHours = elapsed / (3600 * 1000);

  const relevantPhases = activeFasting
    ? FASTING_PHASES.filter((p) => p.startHour < activeFasting.targetHours + 1)
    : FASTING_PHASES;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Jejum</Text>
            {streak.current > 0 && (
              <Text style={styles.streakText}>🔥 {streak.current} dias seguidos</Text>
            )}
          </View>
          {activeFasting && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Ativo</Text>
            </View>
          )}
        </View>

        {activeFasting ? (
          <>
            {/* Timer Ring */}
            <View style={styles.timerSection}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <ProgressRing
                  progress={progress}
                  size={240}
                  strokeWidth={14}
                  colors={phaseColors}
                  backgroundColor="rgba(255,255,255,0.06)"
                >
                  <View style={styles.timerInner}>
                    <Text style={styles.timerPhaseEmoji}>{currentPhase?.icon ?? '⚡'}</Text>
                    <Text style={styles.timerTime}>{formatElapsed(elapsed)}</Text>
                    <Text style={styles.timerLabel}>decorrido</Text>
                    <Text style={styles.timerRemaining}>{formatRemaining(remaining)}</Text>
                    <Text style={styles.timerTarget}>{activeFasting.targetHours}h meta</Text>
                  </View>
                </ProgressRing>
              </Animated.View>
            </View>

            {/* Phase Info Card */}
            {currentPhase && (
              <LinearGradient
                colors={phaseColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.phaseCard}
              >
                <Text style={styles.phaseCardIcon}>{currentPhase.icon}</Text>
                <View style={styles.phaseCardText}>
                  <Text style={styles.phaseCardName}>{currentPhase.name}</Text>
                  <Text style={styles.phaseCardDesc}>{currentPhase.description}</Text>
                  <View style={styles.phaseCardBenefit}>
                    <Text style={styles.phaseCardBenefitText}>✦ {currentPhase.benefit}</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Hydration + Electrolytes */}
            <HydrationBar today={hydrationToday} goal={hydrationGoal} />
            <ElectrolyteCard />

            {/* Fasting Journey */}
            <Text style={styles.sectionTitle}>Jornada do Jejum</Text>
            <View style={styles.phasesList}>
              {relevantPhases.map((phase) => {
                const isActive = elapsedHours >= phase.startHour && elapsedHours < phase.endHour;
                const isCompleted = elapsedHours >= phase.endHour;
                const isLocked = phase.startHour >= activeFasting.targetHours;
                if (isLocked) return null;
                return (
                  <View
                    key={phase.id}
                    style={[
                      styles.phaseRow,
                      isActive && styles.phaseRowActive,
                      isCompleted && styles.phaseRowDone,
                    ]}
                  >
                    {isActive && (
                      <LinearGradient
                        colors={phase.color as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={styles.phaseRowIcon}>
                      {isCompleted ? '✅' : phase.icon}
                    </Text>
                    <View style={styles.phaseRowInfo}>
                      <Text style={[styles.phaseRowName, isActive && styles.phaseRowNameActive]}>
                        {phase.name}
                      </Text>
                      <Text style={[styles.phaseRowHours, isActive && styles.phaseRowHoursActive]}>
                        {phase.startHour}h — {phase.endHour}h
                      </Text>
                    </View>
                    {isActive && (
                      <View style={styles.phaseBadge}>
                        <Text style={styles.phaseBadgeText}>ATUAL</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Stop Button */}
            <TouchableOpacity onPress={handleStop} style={styles.stopButton} activeOpacity={0.85}>
              <View style={styles.stopButtonInner}>
                <Text style={styles.stopButtonText}>⏹  Encerrar Jejum</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Streak Display */}
            {streak.totalCompleted > 0 && (
              <LinearGradient
                colors={['rgba(201,168,76,0.12)', 'rgba(201,168,76,0.04)']}
                style={styles.streakCard}
              >
                <View style={styles.streakRow}>
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{streak.current}</Text>
                    <Text style={styles.streakLabel}>dias seguidos</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{streak.longest}</Text>
                    <Text style={styles.streakLabel}>recorde</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakItem}>
                    <Text style={styles.streakValue}>{streak.totalCompleted}</Text>
                    <Text style={styles.streakLabel}>jejuns feitos</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Preset Selection */}
            <Text style={styles.presetTitle}>Escolha a duração</Text>

            <Text style={styles.presetGroupLabel}>GRATUITO</Text>
            <View style={styles.presetsGrid}>
              {FREE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={async () => {
                    setSelectedPreset(preset);
                    await Haptics.selectionAsync();
                  }}
                  style={[
                    styles.presetCard,
                    selectedPreset === preset && styles.presetCardSelected,
                  ]}
                  activeOpacity={0.85}
                >
                  {selectedPreset === preset && (
                    <LinearGradient
                      colors={['#FF6B35', '#C9A84C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.presetLabel, selectedPreset === preset && styles.presetLabelSelected]}>
                    {PRESET_LABELS[preset]}
                  </Text>
                  <Text style={[styles.presetDesc, selectedPreset === preset && styles.presetDescSelected]} numberOfLines={2}>
                    {PRESET_DESCRIPTIONS[preset]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.premiumHeader}>
              <Text style={styles.presetGroupLabel}>PRIME</Text>
              {!isPremium && (
                <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
                  <Text style={styles.unlockText}>🔒 Desbloquear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.presetsGrid}>
              {PREMIUM_PRESETS.map((preset) => {
                const locked = !isPremium;
                const isSelected = selectedPreset === preset && !locked;
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={async () => {
                      if (locked) { navigation.navigate('Premium'); return; }
                      setSelectedPreset(preset);
                      await Haptics.selectionAsync();
                    }}
                    style={[
                      styles.presetCard,
                      isSelected && styles.presetCardSelected,
                      locked && styles.presetCardLocked,
                    ]}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['#7C4DFF', '#9C6FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    {locked && (
                      <View style={styles.lockIcon}>
                        <Text style={{ fontSize: 10 }}>🔒</Text>
                      </View>
                    )}
                    <Text style={[
                      styles.presetLabel,
                      isSelected && styles.presetLabelSelected,
                      locked && styles.presetLabelLocked,
                    ]}>
                      {PRESET_LABELS[preset]}
                    </Text>
                    <Text style={[styles.presetDesc, locked && styles.presetDescLocked]} numberOfLines={2}>
                      {PRESET_DESCRIPTIONS[preset]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Preset Info */}
            <LinearGradient
              colors={['rgba(255,107,53,0.1)', 'rgba(201,168,76,0.05)']}
              style={styles.selectedInfo}
            >
              <Text style={styles.selectedInfoTitle}>
                ⚡ Jejum de {PRESET_LABELS[selectedPreset]}
              </Text>
              <Text style={styles.selectedInfoDesc}>{PRESET_DESCRIPTIONS[selectedPreset]}</Text>
              <Text style={styles.selectedInfoPhases}>
                Fases: {FASTING_PHASES.filter((p) => p.startHour < selectedPreset).map((p) => p.name).join(' → ')}
              </Text>
            </LinearGradient>

            {/* Start Button */}
            <TouchableOpacity onPress={handleStart} activeOpacity={0.9} style={styles.startButtonWrapper}>
              <LinearGradient
                colors={
                  PREMIUM_PRESETS.includes(selectedPreset) && !isPremium
                    ? ['#7C4DFF', '#9C6FFF']
                    : ['#FF6B35', '#C9A84C']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>
                  {PREMIUM_PRESETS.includes(selectedPreset) && !isPremium
                    ? '🔒 Assinar Prime'
                    : '⚡ Iniciar Jejum'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Phase Guide */}
            <Text style={styles.sectionTitle}>Guia de Fases</Text>
            <View style={styles.phasesList}>
              {FASTING_PHASES.map((phase) => (
                <View key={phase.id} style={styles.phaseRow}>
                  <Text style={styles.phaseRowIcon}>{phase.icon}</Text>
                  <View style={styles.phaseRowInfo}>
                    <Text style={styles.phaseRowName}>{phase.name}</Text>
                    <Text style={styles.phaseRowHours}>{phase.startHour}h — {phase.endHour}h · {phase.benefit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const hydrStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  value: { fontSize: fontSize.sm, color: colors.info, fontWeight: fontWeight.bold },
  bar: { height: 6, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm },
  fill: { height: '100%', backgroundColor: colors.info, borderRadius: radius.full },
  buttons: { flexDirection: 'row', gap: spacing.xs },
  btn: {
    flex: 1, paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: radius.sm, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,122,255,0.2)',
  },
  btnText: { color: colors.info, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});

const electStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: { flex: 1 },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  count: { fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.bold },
  desc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  btn: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  btnText: { color: colors.success, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});

const CARD_W = (width - spacing.md * 2 - spacing.sm * 3) / 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  streakText: { fontSize: fontSize.sm, color: colors.primary, marginTop: 2 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.fastingMuted,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,107,53,0.3)',
  },
  activeDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.fasting, marginRight: 5 },
  activeBadgeText: { color: colors.fasting, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  timerSection: { alignItems: 'center', paddingVertical: spacing.xl },
  timerInner: { alignItems: 'center' },
  timerPhaseEmoji: { fontSize: 30, marginBottom: 6 },
  timerTime: { fontSize: 40, fontWeight: fontWeight.black, color: colors.text, letterSpacing: -1 },
  timerLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  timerRemaining: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium, marginTop: 4 },
  timerTarget: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  phaseCard: {
    borderRadius: radius.xl, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md,
  },
  phaseCardIcon: { fontSize: 36, marginRight: spacing.md },
  phaseCardText: { flex: 1 },
  phaseCardName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: '#fff', marginBottom: 4 },
  phaseCardDesc: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: spacing.xs },
  phaseCardBenefit: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  phaseCardBenefitText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },

  phasesList: { gap: spacing.xs, marginBottom: spacing.sm },
  phaseRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  phaseRowActive: { borderWidth: 0 },
  phaseRowDone: { opacity: 0.6 },
  phaseRowIcon: { fontSize: 22, marginRight: spacing.sm, width: 30, textAlign: 'center' },
  phaseRowInfo: { flex: 1 },
  phaseRowName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  phaseRowNameActive: { color: '#fff', fontWeight: fontWeight.bold },
  phaseRowHours: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  phaseRowHoursActive: { color: 'rgba(255,255,255,0.7)' },
  phaseBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  phaseBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.black, letterSpacing: 0.5 },

  stopButton: { marginTop: spacing.md, marginBottom: spacing.sm },
  stopButtonInner: {
    borderWidth: 1.5, borderColor: colors.danger,
    borderRadius: radius.full, padding: spacing.md, alignItems: 'center',
  },
  stopButtonText: { color: colors.danger, fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  streakCard: {
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakItem: { flex: 1, alignItems: 'center' },
  streakValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.primary },
  streakLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  streakDivider: { width: 1, height: 32, backgroundColor: colors.border },

  presetTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.lg },
  presetGroupLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    color: colors.textMuted, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: spacing.sm,
  },
  premiumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.md },
  unlockText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  presetCard: {
    width: CARD_W, backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.sm, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', overflow: 'hidden', minHeight: 78, justifyContent: 'center',
  },
  presetCardSelected: { borderColor: 'transparent' },
  presetCardLocked: { opacity: 0.55 },
  lockIcon: { position: 'absolute', top: 4, right: 4 },
  presetLabel: { fontSize: fontSize.md, fontWeight: fontWeight.black, color: colors.textSecondary, marginBottom: 2 },
  presetLabelSelected: { color: '#fff' },
  presetLabelLocked: { color: colors.textMuted },
  presetDesc: { fontSize: 9, color: colors.textMuted, textAlign: 'center', lineHeight: 13 },
  presetDescSelected: { color: 'rgba(255,255,255,0.8)' },
  presetDescLocked: { color: colors.textMuted },

  selectedInfo: {
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,107,53,0.15)',
  },
  selectedInfoTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  selectedInfoDesc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm },
  selectedInfoPhases: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },

  startButtonWrapper: { marginBottom: spacing.xl },
  startButton: { borderRadius: radius.full, padding: spacing.md + 2, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.black, letterSpacing: 0.5 },
});
