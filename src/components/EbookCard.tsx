import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EbookItem } from '../store';
import { colors, radius, spacing, fontSize, fontWeight } from '../theme';

interface Props {
  ebook: EbookItem;
  onPress: () => void;
  isPremiumUser?: boolean;
}

const CATEGORY_COLORS: Record<string, string[]> = {
  jejum: ['#FF6B35', '#C9A84C'],
  fitness: ['#7C4DFF', '#9C6FFF'],
  nutricao: ['#00D4AA', '#007AFF'],
  mindset: ['#C9A84C', '#E5C76B'],
  default: ['#2A2A3A', '#3A3A4E'],
};

export default function EbookCard({ ebook, onPress, isPremiumUser }: Props) {
  const isLocked = ebook.isPremium && !isPremiumUser;
  const catColors = CATEGORY_COLORS[ebook.category] || CATEGORY_COLORS.default;
  const progress = ebook.readProgress || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={catColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
        <Text style={styles.coverEmoji}>
          {ebook.category === 'jejum'
            ? '⚡'
            : ebook.category === 'fitness'
            ? '💪'
            : ebook.category === 'nutricao'
            ? '🥗'
            : '🧠'}
        </Text>
        {ebook.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRIME</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.category}>{ebook.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {ebook.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {ebook.description}
        </Text>
        {progress > 0 && !isLocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cover: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coverEmoji: {
    fontSize: 48,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 36,
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(201,168,76,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  info: {
    padding: spacing.md,
  },
  category: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    minWidth: 32,
  },
});
