import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FastingPhase } from '../store';
import { colors, radius, spacing, fontSize, fontWeight } from '../theme';

interface Props {
  phase: FastingPhase;
  isActive?: boolean;
  isCompleted?: boolean;
}

export default function PhaseCard({ phase, isActive, isCompleted }: Props) {
  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      {isActive ? (
        <LinearGradient
          colors={phase.color as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.icon}>{phase.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.name, styles.activeText]}>{phase.name}</Text>
            <Text style={[styles.description, styles.activeDescription]}>
              {phase.description}
            </Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ATIVO</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.inner}>
          <Text style={[styles.icon, isCompleted && styles.completedIcon]}>
            {isCompleted ? '✅' : phase.icon}
          </Text>
          <View style={styles.textContainer}>
            <Text style={[styles.name, isCompleted && styles.completedText]}>
              {phase.name}
            </Text>
            <Text style={styles.hours}>
              {phase.startHour}h — {phase.endHour}h
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeContainer: {
    borderWidth: 0,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inner: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  completedIcon: {
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  activeText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  activeDescription: {
    color: 'rgba(255,255,255,0.85)',
  },
  completedText: {
    color: colors.success,
  },
  hours: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
});
