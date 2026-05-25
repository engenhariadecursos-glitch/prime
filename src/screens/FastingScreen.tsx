import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore, FASTING_PHASES, FastingPreset } from '../store';
import { scheduleFastingMilestone, cancelAllNotifications } from '../utils/notifications';
import ProgressRing from '../components/ProgressRing';
import PhaseCard from '../components/PhaseCard';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

const FREE_PRESETS: FastingPreset[] = [12, 16, 18, 24];
const PREMIUM_PRESETS: FastingPreset[] = [36, 48, 72, 96, 120];
const ALL_PRESETS: FastingPreset[] = [...FREE_PRESETS, ...PREMIUM_PRESETS];

const PRESET_LABELS: Record<number, string> = {
  12: '12h',
  16: '16h',
  18: '18h',
  24: '24h',
  36: '36h',
  48: '48h',
  72: '3 dias',
  96: '4 dias',
  120: '5 dias',
};

const PRESET_DESCRIPTIONS: Record<number, string> = {
  12: 'Iniciante — Ótimo para começar',
  16: 'Clássico 16:8 — Mais popular',
  18: 'Avançado — Cetose garantida',
  24: 'OMAD — Uma refeição por dia',
  36: 'Extendido — Autofagia profunda',
  48: '2 dias — Renovação celular',
  72: '3 dias — Transformação completa',
  96: '4 dias — Elite',
  120: '5 dias — Nível máximo',
};

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}m restantes`;
}

export default function FastingScreen({ navigation }: any) {
  const { activeFasting, startFasting, stopFasting, isPremium, getCurrentPhase } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState<FastingPreset>(16);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [tick, setTick] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (activeFasting) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const el = now - activeFasting.startTime;
        const rem = activeFasting.targetHours * 3600 * 1000 - el;
        setElapsed(el);
        setRemaining(rem);
        setTick((t) => t + 1);
      }, 1000);
      startPulse();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeFasting]);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
  const phaseColors = currentPhase?.color as [string, string] || ['#FF6B35', '#C9A84C'];
  const elapsedHours = elapsed / (3600 * 1000);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jejum</Text>
          {activeFasting && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Ativo</Text>
            </View>
          )}
        </View>

        {activeFasting ? (
          <>
            {/* Active Timer */}
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
                    <Text style={styles.timerPhaseEmoji}>{currentPhase?.icon || '⚡'}</Text>
                    <Text style={styles.timerTime}>{formatTime(elapsed)}</Text>
                    <Text style={styles.timerLabel}>decorrido</Text>
                    <Text style={styles.timerRemaining}>{formatCountdown(remaining)}</Text>
                  </View>
                </ProgressRing>
              </Animated.View>
            </View>

            {/* Phase info */}
            {currentPhase && (
              <LinearGradient
                colors={phaseColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.phaseInfoCard}
              >
                <Text style={styles.phaseInfoIcon}>{currentPhase.icon}</Text>
                <View style={styles.phaseInfoText}>
                  <Text style={styles.phaseInfoName}>{currentPhase.name}</Text>
                  <Text style={styles.phaseInfoDesc}>{currentPhase.description}</Text>
                </View>
              </LinearGradient>
            )}

            {/* Progress milestones */}
            <Text style={styles.phasesTitle}>Jornada do Jejum</Text>
            {FASTING_PHASES.map((phase) => {
              const isActive = elapsedHours >= phase.startHour && elapsedHours < phase.endHour;
              const isCompleted = elapsedHours >= phase.endHour;
              const isRelevant = phase.startHour <= activeFasting.targetHours;
              if (!isRelevant && !isActive && !isCompleted) return null;
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  isActive={isActive}
                  isCompleted={isCompleted}
                />
              );
            })}

            {/* Stop button */}
            <TouchableOpacity onPress={handleStop} style={styles.stopButton} activeOpacity={0.85}>
              <View style={styles.stopButtonInner}>
                <Text style={styles.stopButtonText}>⏹ Encerrar Jejum</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Preset Selection */}
            <Text style={styles.presetTitle}>Escolha a duração</Text>

            <Text style={styles.presetGroupLabel}>Gratuito</Text>
            <View style={styles.presetsGrid}>
              {FREE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setSelectedPreset(preset)}
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

            <View style={styles.premiumPresetsHeader}>
              <Text style={styles.presetGroupLabel}>Premium</Text>
              {!isPremium && (
                <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
                  <Text style={styles.unlockText}>🔒 Desbloquear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.presetsGrid}>
              {PREMIUM_PRESETS.map((preset) => {
                const locked = !isPremium;
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => {
                      if (locked) {
                        navigation.navigate('Premium');
                        return;
                      }
                      setSelectedPreset(preset);
                    }}
                    style={[
                      styles.presetCard,
                      selectedPreset === preset && styles.presetCardSelected,
                      locked && styles.presetCardLocked,
                    ]}
                    activeOpacity={0.85}
                  >
                    {selectedPreset === preset && !locked && (
                      <LinearGradient
                        colors={['#7C4DFF', '#9C6FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    {locked && (
                      <View style={styles.lockedOverlay}>
                        <Text style={styles.lockedEmoji}>🔒</Text>
                      </View>
                    )}
                    <Text style={[styles.presetLabel, selectedPreset === preset && !locked && styles.presetLabelSelected, locked && styles.lockedPresetLabel]}>
                      {PRESET_LABELS[preset]}
                    </Text>
                    <Text style={[styles.presetDesc, locked && styles.lockedPresetDesc]} numberOfLines={2}>
                      {PRESET_DESCRIPTIONS[preset]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected preset info */}
            <View style={styles.selectedInfo}>
              <LinearGradient
                colors={['rgba(255,107,53,0.1)', 'rgba(201,168,76,0.05)']}
                style={styles.selectedInfoInner}
              >
                <Text style={styles.selectedInfoTitle}>
                  ⚡ Jejum de {PRESET_LABELS[selectedPreset]} selecionado
                </Text>
                <Text style={styles.selectedInfoDesc}>
                  {PRESET_DESCRIPTIONS[selectedPreset]}
                </Text>
                <Text style={styles.selectedInfoPhase}>
                  Fases: {FASTING_PHASES.filter(p => p.startHour < selectedPreset).map(p => p.name).join(' → ')}
                </Text>
              </LinearGradient>
            </View>

            {/* Start button */}
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

            {/* Phase guide */}
            <Text style={styles.phasesTitle}>Guia de Fases</Text>
            {FASTING_PHASES.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fastingMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.fasting,
    marginRight: 5,
  },
  activeBadgeText: {
    color: colors.fasting,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  timerInner: { alignItems: 'center' },
  timerPhaseEmoji: { fontSize: 32, marginBottom: spacing.xs },
  timerTime: {
    fontSize: 42,
    fontWeight: fontWeight.black,
    color: colors.text,
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
  },
  timerRemaining: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  phaseInfoCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  phaseInfoIcon: { fontSize: 36, marginRight: spacing.md },
  phaseInfoText: { flex: 1 },
  phaseInfoName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  phaseInfoDesc: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  phasesTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  stopButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  stopButtonInner: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.full,
    padding: spacing.md,
    alignItems: 'center',
  },
  stopButtonText: {
    color: colors.danger,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  presetTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  presetGroupLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  premiumPresetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  unlockText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetCard: {
    width: (width - spacing.md * 2 - spacing.sm * 3) / 4,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 80,
    justifyContent: 'center',
  },
  presetCardSelected: {
    borderColor: 'transparent',
  },
  presetCardLocked: {
    opacity: 0.6,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lockedEmoji: { fontSize: 12 },
  presetLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  presetLabelSelected: { color: '#fff' },
  lockedPresetLabel: { color: colors.textMuted },
  presetDesc: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 13,
  },
  presetDescSelected: { color: 'rgba(255,255,255,0.8)' },
  lockedPresetDesc: { color: colors.textMuted },
  selectedInfo: {
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  selectedInfoInner: { padding: spacing.md },
  selectedInfoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectedInfoDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  selectedInfoPhase: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  startButtonWrapper: { marginBottom: spacing.xl },
  startButton: {
    borderRadius: radius.full,
    padding: spacing.md + 2,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
});
