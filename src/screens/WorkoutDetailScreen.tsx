import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { WorkoutData, Exercise, LEVEL_COLORS } from '../data/workouts';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

function VideoPlaceholder({ exercise }: { exercise: Exercise }) {
  return (
    <LinearGradient
      colors={exercise.videoPlaceholderColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={vpStyles.container}
    >
      <View style={vpStyles.overlay}>
        <Text style={vpStyles.emoji}>{exercise.videoThumb}</Text>
        <View style={vpStyles.playButton}>
          <Text style={vpStyles.playIcon}>▶</Text>
        </View>
        <Text style={vpStyles.label}>{exercise.name}</Text>
        <View style={vpStyles.badge}>
          <Text style={vpStyles.badgeText}>DEMO EM BREVE</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function VariationCard({
  title, name, description, color,
}: { title: string; name: string; description: string; color: string }) {
  return (
    <View style={[varStyles.container, { borderLeftColor: color }]}>
      <Text style={[varStyles.title, { color }]}>{title}</Text>
      <Text style={varStyles.name}>{name}</Text>
      <Text style={varStyles.desc}>{description}</Text>
    </View>
  );
}

function ExerciseModal({
  exercise, visible, onClose,
}: { exercise: Exercise | null; visible: boolean; onClose: () => void }) {
  if (!exercise) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <LinearGradient colors={['#0A0A0F', '#12121A']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={modStyles.header}>
            <TouchableOpacity onPress={onClose} style={modStyles.closeBtn}>
              <Text style={modStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={modStyles.headerTitle} numberOfLines={1}>{exercise.name}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={modStyles.content} showsVerticalScrollIndicator={false}>
            <VideoPlaceholder exercise={exercise} />

            {/* Sets / Reps / Rest */}
            <View style={modStyles.metaRow}>
              <View style={modStyles.metaItem}>
                <Text style={modStyles.metaValue}>{exercise.sets}</Text>
                <Text style={modStyles.metaLabel}>séries</Text>
              </View>
              <View style={modStyles.metaDivider} />
              <View style={modStyles.metaItem}>
                <Text style={modStyles.metaValue}>{exercise.reps}</Text>
                <Text style={modStyles.metaLabel}>reps</Text>
              </View>
              <View style={modStyles.metaDivider} />
              <View style={modStyles.metaItem}>
                <Text style={modStyles.metaValue}>{exercise.restSeconds}s</Text>
                <Text style={modStyles.metaLabel}>descanso</Text>
              </View>
            </View>

            <View style={modStyles.section}>
              <Text style={modStyles.sectionLabel}>EXECUÇÃO</Text>
              <Text style={modStyles.body}>{exercise.description}</Text>
            </View>

            <View style={modStyles.tipsBox}>
              <Text style={modStyles.tipsIcon}>💡</Text>
              <Text style={modStyles.tipsText}>{exercise.tips}</Text>
            </View>

            <Text style={modStyles.varTitle}>Variações</Text>
            <VariationCard
              title="INICIANTE"
              name={exercise.beginnerVariation.name}
              description={exercise.beginnerVariation.description}
              color={colors.success}
            />
            <VariationCard
              title="AVANÇADO"
              name={exercise.advancedVariation.name}
              description={exercise.advancedVariation.description}
              color={colors.fasting}
            />
            <VariationCard
              title="SUBSTITUTO"
              name={exercise.substituteExercise.name}
              description={exercise.substituteExercise.description}
              color={colors.accent}
            />
            {exercise.gymAlternative && (
              <VariationCard
                title="ALTERNATIVA ACADEMIA"
                name={exercise.gymAlternative.name}
                description={exercise.gymAlternative.description}
                color={colors.primary}
              />
            )}

            <View style={modStyles.muscleRow}>
              <Text style={modStyles.muscleLabel}>Músculo principal:</Text>
              <View style={modStyles.muscleBadge}>
                <Text style={modStyles.muscleBadgeText}>{exercise.muscleGroup}</Text>
              </View>
            </View>

            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

export default function WorkoutDetailScreen({ route, navigation }: any) {
  const workout: WorkoutData = route.params.workout;
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleExerciseTap = async (exercise: Exercise) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={workout.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroEmoji}>{workout.emoji}</Text>
            <View style={styles.heroBadges}>
              <View style={[styles.levelBadge, { borderColor: (LEVEL_COLORS[workout.level] || '#fff') + '60' }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[workout.level] || '#fff' }]}>
                  {workout.level}
                </Text>
              </View>
              {workout.fastingCompatible && (
                <View style={styles.fastingBadge}>
                  <Text style={styles.fastingBadgeText}>⚡ Jejum OK</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.heroTitle}>{workout.title}</Text>
          <Text style={styles.heroSubtitle}>{workout.subtitle}</Text>
          <Text style={styles.heroDesc}>{workout.description}</Text>

          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaItem}>⏱ {workout.duration}</Text>
            <Text style={styles.heroMetaItem}>🏋️ {workout.exercises} exercícios</Text>
            <Text style={styles.heroMetaItem}>🔥 {workout.calories}</Text>
          </View>

          <View style={styles.heroTags}>
            {workout.targetMuscles.slice(0, 3).map((m) => (
              <View key={m} style={styles.heroTag}>
                <Text style={styles.heroTagText}>{m}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButtonWrapper}
          activeOpacity={0.9}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
        >
          <LinearGradient
            colors={['#FF6B35', '#C9A84C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>▶  Iniciar Treino</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Exercise List */}
        <Text style={styles.sectionTitle}>Exercícios ({workout.exerciseList.length})</Text>
        <Text style={styles.sectionSub}>Toque em qualquer exercício para ver variações e demonstração</Text>

        {workout.exerciseList.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            onPress={() => handleExerciseTap(exercise)}
            style={styles.exerciseCard}
            activeOpacity={0.85}
          >
            {/* Video Thumbnail Mini */}
            <LinearGradient
              colors={exercise.videoPlaceholderColors as [string, string]}
              style={styles.exerciseThumb}
            >
              <Text style={styles.exerciseThumbEmoji}>{exercise.videoThumb}</Text>
              <View style={styles.exerciseThumbPlay}>
                <Text style={{ color: '#fff', fontSize: 8 }}>▶</Text>
              </View>
            </LinearGradient>

            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseNameRow}>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
                <Text style={styles.exerciseName} numberOfLines={1}>{exercise.name}</Text>
              </View>
              <Text style={styles.exerciseMeta}>
                {exercise.sets} séries · {exercise.reps} reps · {exercise.restSeconds}s descanso
              </Text>
              <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
            </View>

            <View style={styles.exerciseChevron}>
              <Text style={styles.exerciseChevronText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Tips */}
        <LinearGradient
          colors={['rgba(201,168,76,0.08)', 'rgba(201,168,76,0.03)']}
          style={styles.tipsCard}
        >
          <Text style={styles.tipsTitle}>💡 Dicas do Treino</Text>
          {workout.fastingCompatible
            ? <Text style={styles.tipsText}>Este treino é compatível com jejum de até 18h. Mantenha eletrólitos e hidratação em dia.</Text>
            : <Text style={styles.tipsText}>Recomendamos uma refeição 1-2h antes deste treino para garantir energia máxima.</Text>
          }
          <Text style={[styles.tipsText, { marginTop: spacing.xs }]}>
            Aqueça por 5-10 minutos antes de começar. Finalize com 5-10 minutos de mobilidade.
          </Text>
        </LinearGradient>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <ExerciseModal
        exercise={selectedExercise}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const vpStyles = StyleSheet.create({
  container: { height: 200, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.md },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  emoji: { fontSize: 40, marginBottom: spacing.sm },
  playButton: {
    width: 52, height: 52, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  playIcon: { color: '#fff', fontSize: 18, marginLeft: 3 },
  label: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.xs },
  badge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs, letterSpacing: 1 },
});

const varStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3,
  },
  title: { fontSize: fontSize.xs, fontWeight: fontWeight.black, letterSpacing: 1.5, marginBottom: spacing.xs },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 4 },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18 },
});

const modStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: colors.text, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginHorizontal: spacing.sm },
  content: { padding: spacing.md, paddingBottom: spacing.xxxl },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
    borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaValue: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.primary },
  metaLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.border },
  section: { marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
  body: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
  tipsBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  tipsIcon: { fontSize: 18, marginRight: spacing.sm, marginTop: 1 },
  tipsText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  varTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  muscleLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  muscleBadge: { backgroundColor: colors.primaryMuted, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  muscleBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md },

  header: { paddingTop: spacing.sm, marginBottom: spacing.sm },
  backBtn: { paddingVertical: spacing.xs },
  backBtnText: { color: colors.textSecondary, fontSize: fontSize.md },

  hero: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  heroEmoji: { fontSize: 40 },
  heroBadges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
  levelBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  levelText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  fastingBadge: { backgroundColor: 'rgba(255,107,53,0.25)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,107,53,0.4)' },
  fastingBadgeText: { color: colors.fasting, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  heroTitle: { fontSize: fontSize.xxxl, fontWeight: fontWeight.black, color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.sm },
  heroDesc: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)', lineHeight: 20, marginBottom: spacing.md },
  heroMeta: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginBottom: spacing.sm },
  heroMetaItem: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm },
  heroTags: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  heroTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  heroTagText: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs },

  startButtonWrapper: { marginBottom: spacing.lg },
  startButton: { borderRadius: radius.full, padding: spacing.md + 2, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.black },

  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  sectionSub: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },

  exerciseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  exerciseThumb: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  exerciseThumbEmoji: { fontSize: 24 },
  exerciseThumbPlay: {
    position: 'absolute', bottom: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  exerciseInfo: { flex: 1, padding: spacing.sm },
  exerciseNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  exerciseNumber: {
    fontSize: fontSize.xs, fontWeight: fontWeight.black, color: colors.primary,
    width: 20, marginRight: 4,
  },
  exerciseName: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  exerciseMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 },
  exerciseMuscle: { fontSize: fontSize.xs, color: colors.textMuted },
  exerciseChevron: { paddingRight: spacing.sm },
  exerciseChevronText: { fontSize: 24, color: colors.textMuted },

  tipsCard: {
    borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)',
  },
  tipsTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, marginBottom: spacing.sm },
  tipsText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
