import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { WORKOUTS, WorkoutData, WORKOUT_CATEGORIES, LEVEL_COLORS } from '../data/workouts';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

function MiniVideoThumb({ colors: thumbColors, emoji }: { colors: string[]; emoji: string }) {
  return (
    <LinearGradient
      colors={thumbColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.miniThumb}
    >
      <View style={styles.miniPlayBtn}>
        <Text style={styles.miniPlayIcon}>▶</Text>
      </View>
      <Text style={styles.miniThumbEmoji}>{emoji}</Text>
    </LinearGradient>
  );
}

function WorkoutCard({ workout, onPress }: { workout: WorkoutData; onPress: () => void }) {
  const { isPremium } = useAppStore();
  const locked = workout.isPremium && !isPremium;
  const firstExercise = workout.exerciseList[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
    >
      <LinearGradient
        colors={workout.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Top row: thumb + badges */}
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={styles.cardBadges}>
              <View style={[styles.levelBadge, { borderColor: (LEVEL_COLORS[workout.level] || '#fff') + '50' }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[workout.level] || '#fff' }]}>
                  {workout.level}
                </Text>
              </View>
              {workout.fastingCompatible && (
                <View style={styles.fastingBadge}>
                  <Text style={styles.fastingBadgeText}>⚡ Jejum OK</Text>
                </View>
              )}
              {workout.isPremium && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>PRIME</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>{locked ? '🔒 ' : ''}{workout.title}</Text>
            <Text style={styles.cardSubtitle}>{workout.subtitle}</Text>
          </View>
          {firstExercise && (
            <MiniVideoThumb
              colors={firstExercise.videoPlaceholderColors}
              emoji={workout.emoji}
            />
          )}
        </View>

        {/* Description */}
        <Text style={styles.cardDesc} numberOfLines={2}>{workout.description}</Text>

        {/* Tags */}
        <View style={styles.cardTags}>
          {workout.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Meta */}
        <View style={styles.cardMeta}>
          <Text style={styles.metaItem}>⏱ {workout.duration}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>🏋️ {workout.exercises} exercícios</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>🔥 {workout.calories}</Text>
        </View>

        {/* CTA */}
        {locked ? (
          <View style={[styles.ctaBtn, styles.ctaLocked]}>
            <Text style={styles.ctaLockedText}>🔒 Assinar Prime para desbloquear</Text>
          </View>
        ) : (
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>Ver Treino Completo →</Text>
          </LinearGradient>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function WorkoutScreen({ navigation }: any) {
  const { isPremium, fastingHistory } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('Todos');

  const thisWeek = fastingHistory.filter((s) => {
    if (!s.endTime) return false;
    const diff = (Date.now() - s.endTime) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const filtered = activeCategory === 'Todos'
    ? WORKOUTS
    : WORKOUTS.filter((w) => w.category === activeCategory);

  const handleWorkoutPress = (workout: WorkoutData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (workout.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    navigation.navigate('WorkoutDetail', { workout });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Treinos</Text>
            <Text style={styles.headerSub}>Programas especializados</Text>
          </View>
          <View style={styles.headerBadge}>
            <LinearGradient colors={['#7C4DFF', '#5B2FFF']} style={styles.headerBadgeGrad}>
              <Text style={styles.headerBadgeText}>{WORKOUTS.length} planos</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Esta semana', value: thisWeek.toString(), unit: 'jejuns' },
            { label: 'Programas', value: WORKOUTS.length.toString(), unit: 'disponíveis' },
            { label: 'Premium', value: WORKOUTS.filter(w => w.isPremium).length.toString(), unit: 'exclusivos' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <LinearGradient colors={['#1A1A26', '#12121A']} style={styles.statGrad}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statUnit}>{stat.unit}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {WORKOUT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            >
              {activeCategory === cat && (
                <LinearGradient
                  colors={['#7C4DFF', '#9C6FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fasting tip */}
        {activeCategory === 'Todos' && (
          <View style={styles.tipCard}>
            <LinearGradient
              colors={['rgba(255,107,53,0.12)', 'rgba(201,168,76,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tipGrad}
            >
              <Text style={styles.tipEmoji}>⚡</Text>
              <Text style={styles.tipText}>
                Treinos marcados com <Text style={styles.tipHighlight}>Jejum OK</Text> são otimizados para treinar em estado de jejum
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Workout cards */}
        {filtered.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onPress={() => handleWorkoutPress(w)}
          />
        ))}

        {/* Upgrade banner for non-premium */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Premium')}
            activeOpacity={0.88}
            style={styles.upgradeCard}
          >
            <LinearGradient
              colors={['#7C4DFF', '#9C6FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeGrad}
            >
              <Text style={styles.upgradeEmoji}>🔓</Text>
              <Text style={styles.upgradeTitle}>Desbloquear treinos exclusivos</Text>
              <Text style={styles.upgradeSub}>
                Força em Cetose, Full Body Elite e Mobilidade Avançada. Inicie 5 dias grátis.
              </Text>
              <View style={styles.upgradeCta}>
                <Text style={styles.upgradeCtaText}>Assinar Prime →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerBadge: { borderRadius: radius.full, overflow: 'hidden' },
  headerBadgeGrad: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statGrad: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  statUnit: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  filterRow: { marginBottom: spacing.md },
  filterContent: { paddingRight: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  filterChipActive: { borderColor: 'transparent' },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: { color: '#fff', fontWeight: fontWeight.bold },
  tipCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  tipGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  tipEmoji: { fontSize: 20 },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipHighlight: {
    color: colors.fasting,
    fontWeight: fontWeight.semibold,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardGradient: { padding: spacing.lg },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  cardLeft: { flex: 1 },
  cardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  fastingBadge: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.35)',
  },
  fastingBadgeText: {
    color: colors.fasting,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  premiumTag: {
    backgroundColor: 'rgba(201,168,76,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  premiumTagText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  miniThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniPlayBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radius.lg,
  },
  miniPlayIcon: {
    color: '#fff',
    fontSize: 16,
  },
  miniThumbEmoji: {
    fontSize: 28,
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaItem: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  metaDot: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: fontSize.sm,
  },
  ctaBtn: {
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  ctaLocked: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderColor: 'rgba(201,168,76,0.2)',
  },
  ctaLockedText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  upgradeCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  upgradeGrad: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  upgradeEmoji: { fontSize: 40, marginBottom: spacing.md },
  upgradeTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  upgradeSub: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  upgradeCta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  upgradeCtaText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
