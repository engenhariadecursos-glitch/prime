import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { saveOnboarding } from '../utils/storage';
import { cancelAllNotifications, scheduleWorkoutReminder, sendMotivational } from '../utils/notifications';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

interface MenuItem {
  icon: string;
  label: string;
  value?: string;
  arrow?: boolean;
  danger?: boolean;
  onPress: () => void;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[styles.menuItem, i < items.length - 1 && styles.menuItemBorder]}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={[styles.menuItemLabel, item.danger && styles.menuItemDanger]}>
              {item.label}
            </Text>
            <View style={styles.menuItemRight}>
              {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
              {item.arrow && <Text style={styles.menuArrow}>›</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { user, isPremium, trialDaysLeft, setHasCompletedOnboarding, setUser, activeFasting, fastingHistory } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await saveOnboarding(false);
            setUser(null);
            setHasCompletedOnboarding(false);
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    await sendMotivational();
    Alert.alert('✓ Notificação enviada!', 'Você receberá uma notificação motivacional em instantes.');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : 'Hoje';

  const totalFasts = fastingHistory.length;
  const longestFast = fastingHistory.reduce((max, s) => {
    const elapsed = s.endTime ? (s.endTime - s.startTime) / (3600 * 1000) : 0;
    return elapsed > max ? elapsed : max;
  }, 0);

  const accountItems: MenuItem[] = [
    { icon: '👤', label: 'Nome', value: user?.name || '—', arrow: false, onPress: () => {} },
    { icon: '📧', label: 'E-mail', value: user?.email || '—', arrow: false, onPress: () => {} },
    { icon: '📅', label: 'Membro desde', value: memberSince, arrow: false, onPress: () => {} },
  ];

  const subscriptionItems: MenuItem[] = isPremium
    ? [
        { icon: '⭐', label: 'Status', value: 'Prime Ativo', arrow: false, onPress: () => {} },
        { icon: '💳', label: 'Gerenciar assinatura', arrow: true, onPress: () => navigation.navigate('Premium') },
        { icon: '🔄', label: 'Restaurar compras', arrow: true, onPress: () => navigation.navigate('Premium') },
      ]
    : [
        { icon: '✨', label: 'Assinar Prime', value: `${trialDaysLeft}d grátis`, arrow: true, onPress: () => navigation.navigate('Premium') },
        { icon: '🔄', label: 'Restaurar compras', arrow: true, onPress: () => navigation.navigate('Premium') },
      ];

  const notificationItems: MenuItem[] = [
    { icon: '💧', label: 'Lembretes de hidratação', value: 'Ativo', arrow: true, onPress: () => {} },
    { icon: '💪', label: 'Lembretes de treino', value: 'Ativo', arrow: true, onPress: async () => await scheduleWorkoutReminder() },
    { icon: '🎯', label: 'Marcos do jejum', value: 'Ativo', arrow: true, onPress: () => {} },
    { icon: '🔔', label: 'Testar notificação', arrow: true, onPress: handleTestNotification },
  ];

  const supportItems: MenuItem[] = [
    { icon: '❓', label: 'Central de ajuda', arrow: true, onPress: () => {} },
    { icon: '⭐', label: 'Avaliar o app', arrow: true, onPress: () => {} },
    { icon: '📢', label: 'Indicar para amigos', arrow: true, onPress: () => {} },
    { icon: '📝', label: 'Termos de uso', arrow: true, onPress: () => {} },
    { icon: '🔒', label: 'Política de privacidade', arrow: true, onPress: () => {} },
  ];

  const dangerItems: MenuItem[] = [
    { icon: '🚪', label: 'Sair da conta', danger: true, onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={isPremium ? ['#C9A84C', '#E5C76B'] : ['#7C4DFF', '#9C6FFF']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.name || 'Atleta'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>

          {isPremium ? (
            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={['#C9A84C', '#E5C76B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBadgeGrad}
              >
                <Text style={styles.premiumBadgeText}>⭐ PRIME</Text>
              </LinearGradient>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Premium')}
              style={styles.upgradeBadge}
            >
              <Text style={styles.upgradeBadgeText}>✨ Assinar Prime · {trialDaysLeft}d grátis</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Jejuns', value: totalFasts.toString(), emoji: '⚡' },
            { label: 'Mais longo', value: longestFast > 0 ? `${Math.round(longestFast)}h` : '—', emoji: '🏆' },
            { label: 'Treinos', value: '47', emoji: '💪' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <LinearGradient colors={['#1A1A26', '#12121A']} style={styles.statGrad}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        <MenuSection title="Minha Conta" items={accountItems} />
        <MenuSection title="Assinatura" items={subscriptionItems} />
        <MenuSection title="Notificações" items={notificationItems} />
        <MenuSection title="Suporte" items={supportItems} />
        <MenuSection title="" items={dangerItems} />

        <Text style={styles.versionText}>Prime Jejum & Fitness v1.0.0</Text>
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: fontWeight.black,
    color: '#000',
  },
  profileName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  premiumBadge: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  premiumBadgeGrad: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  upgradeBadge: {
    backgroundColor: 'rgba(124,77,255,0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.3)',
  },
  upgradeBadgeText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuSection: { marginBottom: spacing.lg },
  menuSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    fontSize: 20,
    width: 32,
    marginRight: spacing.sm,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  menuItemDanger: { color: colors.danger },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuItemValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
});
