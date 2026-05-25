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
import { useAppStore } from '../store';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

interface Workout {
  id: string;
  title: string;
  duration: string;
  level: string;
  category: string;
  exercises: number;
  calories: string;
  emoji: string;
  gradient: string[];
  isPremium: boolean;
  description: string;
  tags: string[];
}

const WORKOUTS: Workout[] = [
  {
    id: '1',
    title: 'Hipertrofia Upper',
    duration: '45 min',
    level: 'Intermediário',
    category: 'Força',
    exercises: 8,
    calories: '320 kcal',
    emoji: '💪',
    gradient: ['#150A2A', '#2A1A4A'],
    isPremium: false,
    description: 'Treino focado em peito, costas e ombros para máximo ganho de massa muscular.',
    tags: ['Peito', 'Costas', 'Ombros'],
  },
  {
    id: '2',
    title: 'HIIT Queima Total',
    duration: '30 min',
    level: 'Avançado',
    category: 'Cardio',
    exercises: 10,
    calories: '450 kcal',
    emoji: '🔥',
    gradient: ['#2A0A00', '#4A1A00'],
    isPremium: false,
    description: 'Treino intervalado de alta intensidade para máxima queima de gordura.',
    tags: ['Queima de Gordura', 'Resistência', 'Cardio'],
  },
  {
    id: '3',
    title: 'Lower Hipertrofia',
    duration: '50 min',
    level: 'Intermediário',
    category: 'Força',
    exercises: 9,
    calories: '380 kcal',
    emoji: '🦵',
    gradient: ['#0A1A00', '#1A2A00'],
    isPremium: false,
    description: 'Desenvolvimento completo de glúteos, quadríceps e posteriores.',
    tags: ['Glúteos', 'Quadríceps', 'Isquiotibiais'],
  },
  {
    id: '4',
    title: 'Força Cetogênica',
    duration: '40 min',
    level: 'Avançado',
    category: 'Força',
    exercises: 7,
    calories: '290 kcal',
    emoji: '⚡',
    gradient: ['#0A0520', '#1A0A40'],
    isPremium: true,
    description: 'Protocolo especialmente criado para treinar durante o jejum cetogênico.',
    tags: ['Jejum', 'Cetose', 'Força'],
  },
  {
    id: '5',
    title: 'Full Body Elite',
    duration: '60 min',
    level: 'Elite',
    category: 'Força',
    exercises: 12,
    calories: '520 kcal',
    emoji: '🏆',
    gradient: ['#1A0A00', '#2A1500'],
    isPremium: true,
    description: 'O protocolo de treino mais avançado para atletas de alta performance.',
    tags: ['Completo', 'Elite', 'Alta Performance'],
  },
  {
    id: '6',
    title: 'Mobilidade & Flexibilidade',
    duration: '25 min',
    level: 'Iniciante',
    category: 'Mobilidade',
    exercises: 15,
    calories: '120 kcal',
    emoji: '🧘',
    gradient: ['#00151A', '#00252A'],
    isPremium: true,
    description: 'Rotina de mobilidade para otimizar recuperação e prevenir lesões.',
    tags: ['Recuperação', 'Mobilidade', 'Relaxamento'],
  },
];

const CATEGORIES = ['Todos', 'Força', 'Cardio', 'Mobilidade'];

const LEVEL_COLORS: Record<string, string> = {
  'Iniciante': colors.success,
  'Intermediário': colors.primary,
  'Avançado': colors.fasting,
  'Elite': '#C9A84C',
};

function WorkoutCard({ workout, onPress, isPremiumUser }: { workout: Workout; onPress: () => void; isPremiumUser: boolean }) {
  const locked = workout.isPremium && !isPremiumUser;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>
      <LinearGradient
        colors={workout.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardEmojiContainer}>
            <Text style={styles.cardEmoji}>{locked ? '🔒' : workout.emoji}</Text>
          </View>
          <View style={styles.cardBadges}>
            <View style={[styles.levelBadge, { borderColor: LEVEL_COLORS[workout.level] + '40' }]}>
              <Text style={[styles.levelText, { color: LEVEL_COLORS[workout.level] }]}>
                {workout.level}
              </Text>
            </View>
            {workout.isPremium && (
              <View style={styles.premiumTag}>
                <Text style={styles.premiumTagText}>PRIME</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.cardTitle}>{workout.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{workout.description}</Text>

        <View style={styles.cardTags}>
          {workout.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.metaItem}>⏱ {workout.duration}</Text>
          <Text style={styles.metaItem}>🏋️ {workout.exercises} exercícios</Text>
          <Text style={styles.metaItem}>🔥 {workout.calories}</Text>
        </View>

        {!locked && (
          <View style={styles.startWorkoutBtn}>
            <Text style={styles.startWorkoutText}>Iniciar Treino →</Text>
          </View>
        )}
        {locked && (
          <View style={[styles.startWorkoutBtn, styles.lockedBtn]}>
            <Text style={styles.lockedBtnText}>🔒 Assinar Prime para desbloquear</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function WorkoutScreen({ navigation }: any) {
  const { isPremium } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? WORKOUTS
    : WORKOUTS.filter((w) => w.category === activeCategory);

  const handleWorkoutPress = (workout: Workout) => {
    if (workout.isPremium && !isPremium) {
      navigation.navigate('Premium');
    }
    // Would navigate to workout detail screen
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Treinos</Text>
          <Text style={styles.headerSub}>Programas especializados</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Esta semana', value: '3', unit: 'treinos' },
            { label: 'Total', value: '47', unit: 'treinos' },
            { label: 'Calorias', value: '12.4k', unit: 'kcal' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <LinearGradient
                colors={['#1A1A26', '#12121A']}
                style={styles.statGrad}
              >
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
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            >
              {activeCategory === cat ? (
                <LinearGradient
                  colors={['#7C4DFF', '#9C6FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Workouts */}
        {filtered.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onPress={() => handleWorkoutPress(w)}
            isPremiumUser={isPremium}
          />
        ))}

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
              <Text style={styles.upgradeTitle}>Desbloquear todos os treinos</Text>
              <Text style={styles.upgradeSub}>
                Acesse planos exclusivos, treinos para jejum e muito mais.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = width - spacing.md * 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md },
  header: {
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
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: { color: '#fff', fontWeight: fontWeight.bold },
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardGradient: { padding: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardEmojiContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 28 },
  cardBadges: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
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
    marginBottom: spacing.xs,
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
    gap: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  startWorkoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  startWorkoutText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  lockedBtn: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderColor: 'rgba(201,168,76,0.2)',
  },
  lockedBtnText: {
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
  },
});
