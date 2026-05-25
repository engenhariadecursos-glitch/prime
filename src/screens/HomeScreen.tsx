import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { EBOOKS } from '../data/ebooks';
import { WORKOUTS } from '../data/workouts';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const WEEKLY_CHALLENGES = [
  { id: '1', emoji: '⚡', title: 'Jejum de 16h', desc: 'Complete 3x esta semana', progress: 2, total: 3, isPremium: false },
  { id: '2', emoji: '💧', title: 'Hidratação Total', desc: '2.5L de água por 7 dias', progress: 5, total: 7, isPremium: false },
  { id: '3', emoji: '🏆', title: 'Desafio 36h', desc: 'Jejum estendido avançado', progress: 0, total: 1, isPremium: true },
  { id: '4', emoji: '💪', title: 'Semana Intensa', desc: '5 treinos em 7 dias', progress: 3, total: 5, isPremium: true },
];

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const {
    user, activeFasting, isPremium, trialDaysLeft,
    getCurrentPhase, hydrationToday, hydrationGoal, streak,
  } = useAppStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const elapsedHours = activeFasting
    ? (Date.now() - activeFasting.startTime) / (1000 * 60 * 60)
    : 0;
  const progress = activeFasting
    ? Math.min(elapsedHours / activeFasting.targetHours, 1)
    : 0;
  const currentPhase = getCurrentPhase();

  const formatElapsed = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  };

  const hydrationPercent = Math.min((hydrationToday / hydrationGoal) * 100, 100);

  // Pick a featured workout (first free, fasting-compatible one)
  const nextWorkout = WORKOUTS.find(w => !w.isPremium && w.fastingCompatible) || WORKOUTS[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'Atleta'} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {streak.current > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak.current}d</Text>
              </View>
            )}
            {!isPremium ? (
              <TouchableOpacity onPress={() => navigation.navigate('Premium')} style={styles.trialBadge}>
                <LinearGradient
                  colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
                  style={styles.trialBadgeInner}
                >
                  <Text style={styles.trialText}>✨ {trialDaysLeft}d grátis</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.premiumBadge}>
                <LinearGradient colors={['#C9A84C', '#E5C76B']} style={styles.premiumBadgeInner}>
                  <Text style={styles.premiumBadgeText}>⭐ PRIME</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Jejum Atual */}
        <SectionHeader title="Jejum Atual" action="Ver detalhes" onAction={() => navigation.navigate('Jejum')} />
        <TouchableOpacity onPress={() => navigation.navigate('Jejum')} activeOpacity={0.9}>
          {activeFasting ? (
            <LinearGradient
              colors={(currentPhase?.color as [string, string]) || ['#FF6B35', '#C9A84C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fastingCard}
            >
              <View style={styles.fastingCardRow}>
                <View>
                  <Text style={styles.fastingCardLabel}>Jejum ativo</Text>
                  <Text style={styles.fastingCardTime}>{formatElapsed(elapsedHours)}</Text>
                  <Text style={styles.fastingCardTarget}>Meta: {activeFasting.targetHours}h</Text>
                </View>
                <View style={styles.fastingProgress}>
                  <Text style={styles.fastingProgressPct}>{Math.round(progress * 100)}%</Text>
                  <Text style={styles.fastingProgressLabel}>concluído</Text>
                </View>
              </View>
              {currentPhase && (
                <View style={styles.phaseTag}>
                  <Text style={styles.phaseTagText}>{currentPhase.icon} {currentPhase.name}</Text>
                </View>
              )}
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient colors={['#1A1A26', '#12121A']} style={[styles.fastingCard, styles.fastingCardEmpty]}>
              <Text style={styles.fastingEmptyEmoji}>⚡</Text>
              <Text style={styles.fastingEmptyTitle}>Nenhum jejum ativo</Text>
              <Text style={styles.fastingEmptyDesc}>Toque para iniciar seu próximo jejum</Text>
              {streak.current > 0 && (
                <View style={styles.streakCardRow}>
                  <Text style={styles.streakCardText}>🔥 {streak.current} dias consecutivos · Melhor: {streak.longest}d</Text>
                </View>
              )}
              <View style={styles.startFastingButton}>
                <LinearGradient
                  colors={['#FF6B35', '#C9A84C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startFastingGrad}
                >
                  <Text style={styles.startFastingText}>Iniciar Jejum</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          )}
        </TouchableOpacity>

        {/* Próximo Treino */}
        <SectionHeader title="Próximo Treino" action="Ver todos" onAction={() => navigation.navigate('Treinos')} />
        <TouchableOpacity
          onPress={() => navigation.navigate('Treinos')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#150A2A', '#1A1226']} style={styles.workoutCard}>
            <View style={styles.workoutCardRow}>
              <View style={styles.workoutEmoji}>
                <Text style={{ fontSize: 32 }}>{nextWorkout.emoji}</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{nextWorkout.title}</Text>
                <Text style={styles.workoutMeta}>
                  {nextWorkout.duration} · {nextWorkout.exercises} exercícios · {nextWorkout.level}
                </Text>
                {nextWorkout.fastingCompatible && (
                  <View style={styles.fastingCompatTag}>
                    <Text style={styles.fastingCompatText}>⚡ Compatível com jejum</Text>
                  </View>
                )}
              </View>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Hidratação */}
        <SectionHeader title="Hidratação Hoje" />
        <View style={styles.hydrationCard}>
          <LinearGradient colors={['#050A1A', '#0A1525']} style={styles.hydrationInner}>
            <View style={styles.hydrationRow}>
              <Text style={styles.hydrationEmoji}>💧</Text>
              <View style={styles.hydrationInfo}>
                <Text style={styles.hydrationValue}>{hydrationToday}ml</Text>
                <Text style={styles.hydrationGoalText}>Meta: {hydrationGoal}ml</Text>
              </View>
              <Text style={[
                styles.hydrationPercent,
                hydrationPercent >= 100 && styles.hydrationPercentDone,
              ]}>
                {Math.round(hydrationPercent)}%
              </Text>
            </View>
            <View style={styles.hydrationBar}>
              <View style={[styles.hydrationFill, { width: `${hydrationPercent}%` }]} />
            </View>
            <View style={styles.hydrationButtons}>
              {[150, 250, 350, 500].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  style={styles.hydrationBtn}
                  onPress={() => useAppStore.getState().logHydration(ml)}
                >
                  <Text style={styles.hydrationBtnText}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Biblioteca Premium */}
        <SectionHeader title="Biblioteca" action="Ver tudo" onAction={() => navigation.navigate('Biblioteca')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksRow}>
          {EBOOKS.slice(0, 4).map((book, i) => (
            <TouchableOpacity
              key={book.id}
              onPress={() => navigation.navigate('Biblioteca')}
              style={styles.bookCard}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={book.gradientColors as [string, string]}
                style={styles.bookCover}
              >
                {book.isPremium && !isPremium && (
                  <View style={styles.bookLock}>
                    <Text style={{ fontSize: 14 }}>🔒</Text>
                  </View>
                )}
                <Text style={{ fontSize: 28 }}>{book.emoji}</Text>
              </LinearGradient>
              <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.bookMeta}>{book.estimatedMinutes} min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Desafios da Semana */}
        <SectionHeader title="Desafios da Semana" />
        {WEEKLY_CHALLENGES.map((challenge) => {
          const isLocked = challenge.isPremium && !isPremium;
          const pct = (challenge.progress / challenge.total) * 100;
          return (
            <TouchableOpacity
              key={challenge.id}
              style={styles.challengeCard}
              onPress={() => isLocked && navigation.navigate('Premium')}
              activeOpacity={0.85}
            >
              <View style={styles.challengeRow}>
                <View style={[styles.challengeEmoji, isLocked && styles.challengeLocked]}>
                  <Text style={{ fontSize: 24 }}>{isLocked ? '🔒' : challenge.emoji}</Text>
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeTitle, isLocked && styles.lockedText]}>
                    {challenge.title}
                  </Text>
                  <Text style={styles.challengeDesc}>{challenge.desc}</Text>
                  {!isLocked && (
                    <View style={styles.challengeProgressRow}>
                      <View style={styles.challengeBar}>
                        <View style={[styles.challengeFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.challengeCount}>{challenge.progress}/{challenge.total}</Text>
                    </View>
                  )}
                </View>
                {isLocked && (
                  <View style={styles.premiumTag}>
                    <Text style={styles.premiumTagText}>PRIME</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakBadge: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  streakText: {
    color: colors.fasting,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  trialBadge: {
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  trialBadgeInner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trialText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  premiumBadge: { borderRadius: radius.full, overflow: 'hidden' },
  premiumBadgeInner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  sectionAction: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  fastingCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  fastingCardEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fastingCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  fastingCardLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  fastingCardTime: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
  fastingCardTarget: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  fastingProgress: { alignItems: 'flex-end' },
  fastingProgressPct: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: '#fff',
  },
  fastingProgressLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  phaseTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  phaseTagText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: radius.full,
  },
  fastingEmptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  fastingEmptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fastingEmptyDesc: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  streakCardRow: {
    backgroundColor: 'rgba(255,107,53,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  streakCardText: {
    color: colors.fasting,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  startFastingButton: { borderRadius: radius.full, overflow: 'hidden' },
  startFastingGrad: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  startFastingText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  workoutCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.2)',
  },
  workoutCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutEmoji: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(124,77,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  workoutInfo: { flex: 1 },
  workoutTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fastingCompatTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  fastingCompatText: {
    color: colors.fasting,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  arrowText: {
    fontSize: 28,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  hydrationCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  hydrationInner: { padding: spacing.md },
  hydrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hydrationEmoji: { fontSize: 28, marginRight: spacing.md },
  hydrationInfo: { flex: 1 },
  hydrationValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  hydrationGoalText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  hydrationPercent: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.info,
  },
  hydrationPercentDone: { color: colors.success },
  hydrationBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  hydrationFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: radius.full,
  },
  hydrationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hydrationBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  hydrationBtnText: {
    color: colors.info,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  booksRow: { marginBottom: spacing.sm },
  bookCard: {
    width: 120,
    marginRight: spacing.md,
  },
  bookCover: {
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  bookLock: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.full,
    padding: 4,
  },
  bookTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 16,
  },
  bookMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  challengeCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeEmoji: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  challengeLocked: { opacity: 0.5 },
  challengeInfo: { flex: 1 },
  challengeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  lockedText: { color: colors.textMuted },
  challengeDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  challengeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  challengeBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  challengeCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  premiumTag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  premiumTagText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
});
