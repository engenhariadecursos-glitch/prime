import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, fontSize, fontWeight } from '../theme';

interface Props {
  onUpgrade: () => void;
  feature?: string;
}

export default function PremiumGate({ onUpgrade, feature }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A26', '#2A1A4A']}
        style={styles.card}
      >
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.title}>Recurso Premium</Text>
        <Text style={styles.description}>
          {feature
            ? `${feature} está disponível apenas para assinantes Prime.`
            : 'Este recurso está disponível apenas para assinantes Prime.'}
        </Text>
        <TouchableOpacity onPress={onUpgrade} activeOpacity={0.85}>
          <LinearGradient
            colors={['#7C4DFF', '#9C6FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>✨ Assinar Prime</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.trialNote}>5 dias grátis · Cancele quando quiser</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.3)',
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  trialNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
