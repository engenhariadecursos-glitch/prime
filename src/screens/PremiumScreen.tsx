import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { getSubscriptions, purchaseSubscription, restorePurchases, PRODUCT_IDS } from '../utils/iap';
import { savePremium } from '../utils/storage';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '⏰', title: 'Jejuns até 120 horas', desc: 'Desbloqueie todos os modos de jejum extendido' },
  { icon: '📊', title: 'Analytics Avançados', desc: 'Relatórios completos e insights personalizados' },
  { icon: '📚', title: 'Biblioteca Completa', desc: '8+ guias premium de jejum, fitness e mindset' },
  { icon: '🤖', title: 'Recomendações por IA', desc: 'Planos personalizados baseados no seu perfil' },
  { icon: '💪', title: 'Treinos Avançados', desc: 'Programas exclusivos para todos os objetivos' },
  { icon: '🏆', title: 'Desafios Exclusivos', desc: 'Desafios semanais com comunidade de elite' },
  { icon: '🔔', title: 'Notificações Smart', desc: 'Lembretes inteligentes de hidratação e marcos' },
  { icon: '📈', title: 'Evolução Corporal', desc: 'Rastreamento completo de medidas e fotos' },
];

const TESTIMONIALS = [
  { name: 'Carlos M.', location: 'São Paulo', text: 'Perdi 12kg em 3 meses combinando o jejum do app com os treinos. Melhor investimento da minha vida.', rating: 5 },
  { name: 'Ana L.', location: 'Rio de Janeiro', text: 'A biblioteca de conteúdo é incrível. O guia de nutrição cetogênica mudou completamente minha alimentação.', rating: 5 },
  { name: 'Rafael S.', location: 'Curitiba', text: 'As notificações inteligentes me mantêm no caminho. Completei meu primeiro jejum de 72h com suporte total.', rating: 5 },
];

export default function PremiumScreen({ navigation }: any) {
  const { isPremium, trialDaysLeft, setPremium, user } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [plans, setPlans] = useState([
    { id: 'monthly', productId: PRODUCT_IDS.MONTHLY, price: 'R$ 29,90', period: '/mês', savings: null, label: 'Mensal', badge: null },
    { id: 'annual', productId: PRODUCT_IDS.ANNUAL, price: 'R$ 199,90', period: '/ano', savings: 'Economize 44%', label: 'Anual', badge: 'MAIS POPULAR' },
  ]);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    loadPrices();
    startShimmer();
  }, []);

  const startShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();
  };

  const loadPrices = async () => {
    try {
      const subs = await getSubscriptions();
      if (subs.length > 0) {
        setPlans((prev) =>
          prev.map((p) => {
            const sub = subs.find((s) => s.productId === p.productId);
            if (sub) return { ...p, price: sub.localizedPrice };
            return p;
          })
        );
      }
    } catch {}
  };

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan)!;
      const success = await purchaseSubscription(plan.productId);
      if (success) {
        await savePremium(true);
        setPremium(true, selectedPlan);
        Alert.alert(
          '🎉 Bem-vindo ao Prime!',
          'Sua assinatura foi ativada. Todos os recursos estão desbloqueados!',
          [{ text: 'Começar', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível completar a compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        await savePremium(true);
        setPremium(true);
        Alert.alert('✅ Compra restaurada!', 'Seu acesso Prime foi restaurado com sucesso.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Nenhuma compra encontrada', 'Não encontramos assinaturas ativas para esta conta.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível restaurar as compras.');
    } finally {
      setRestoring(false);
    }
  };

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#0A0A0F', '#12121A']} style={styles.fill}>
          <ScrollView contentContainerStyle={styles.premiumActiveContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.premiumActiveEmoji}>⭐</Text>
            <Text style={styles.premiumActiveTitle}>Você é Prime!</Text>
            <Text style={styles.premiumActiveSubtitle}>
              Todos os recursos estão desbloqueados para você, {user?.name?.split(' ')[0]}.
            </Text>
            {FEATURES.map((f) => (
              <View key={f.icon} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <View style={styles.featureTextGroup}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <Text style={styles.featureCheck}>✓</Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.fill, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#0A0A0F', '#0D0510']} style={styles.fill}>
        <SafeAreaView style={styles.fill} edges={['top']}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Close */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeRow}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Hero */}
            <View style={styles.hero}>
              <LinearGradient
                colors={['rgba(201,168,76,0.1)', 'transparent']}
                style={styles.heroGlow}
              />
              <Text style={styles.heroEmoji}>✨</Text>
              <Text style={styles.heroTitle}>Prime</Text>
              <Text style={styles.heroSubtitle}>
                A plataforma de elite para transformação física e mental.
              </Text>
              <View style={styles.trialBadge}>
                <LinearGradient
                  colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
                  style={styles.trialBadgeInner}
                >
                  <Text style={styles.trialText}>
                    🎁 {trialDaysLeft} dias grátis · Cancele quando quiser
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              {FEATURES.map((feature) => (
                <View key={feature.icon} style={styles.featureRow}>
                  <View style={styles.featureIconContainer}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureTextGroup}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selection */}
            <Text style={styles.planSectionTitle}>Escolha seu plano</Text>
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id as 'monthly' | 'annual')}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                  ]}
                  activeOpacity={0.85}
                >
                  {selectedPlan === plan.id && (
                    <LinearGradient
                      colors={['rgba(201,168,76,0.1)', 'rgba(201,168,76,0.02)']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <LinearGradient
                        colors={['#C9A84C', '#E5C76B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.planBadgeGrad}
                      >
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </LinearGradient>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <View style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioSelected]}>
                      {selectedPlan === plan.id && <View style={styles.planRadioDot} />}
                    </View>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                  </View>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity onPress={handleSubscribe} disabled={loading} activeOpacity={0.9} style={styles.ctaWrapper}>
              <LinearGradient
                colors={['#C9A84C', '#E5C76B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.ctaButton, loading && styles.ctaDisabled]}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Processando...' : `✨ Começar ${trialDaysLeft} dias grátis`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.ctaSub}>
              Após {trialDaysLeft} dias gratuitos, será cobrado automaticamente.
              Cancele a qualquer momento nas configurações.
            </Text>

            {/* Testimonials */}
            <Text style={styles.testimonialSectionTitle}>O que dizem nossos Prime</Text>
            {TESTIMONIALS.map((t, i) => (
              <View key={i} style={styles.testimonialCard}>
                <LinearGradient colors={['#1A1A26', '#12121A']} style={styles.testimonialInner}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialAvatarText}>{t.name[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.testimonialName}>{t.name}</Text>
                      <Text style={styles.testimonialLocation}>{t.location}</Text>
                    </View>
                    <Text style={styles.testimonialStars}>{'⭐'.repeat(t.rating)}</Text>
                  </View>
                  <Text style={styles.testimonialText}>{t.text}</Text>
                </LinearGradient>
              </View>
            ))}

            {/* Restore */}
            <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>
                {restoring ? 'Restaurando...' : 'Restaurar compras anteriores'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.legalText}>
              Ao assinar, você concorda com os Termos de Uso e Política de Privacidade.
              A assinatura é renovada automaticamente. Gerencie na App Store.
            </Text>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md },
  backBtn: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -50,
  },
  heroEmoji: { fontSize: 52, marginBottom: spacing.sm },
  heroTitle: {
    fontSize: 52,
    fontWeight: fontWeight.black,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  trialBadge: {
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  trialBadgeInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  trialText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  featuresSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureIcon: { fontSize: 22 },
  featureTextGroup: { flex: 1 },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  featureCheck: {
    color: colors.success,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  planSectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  planBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  planBadgeGrad: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomLeftRadius: radius.md,
  },
  planBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  planRadioSelected: { borderColor: colors.primary },
  planRadioDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  planLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  planPrice: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  planPeriod: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  savingsBadge: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
  },
  savingsText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  ctaWrapper: { marginBottom: spacing.sm },
  ctaButton: {
    borderRadius: radius.full,
    padding: spacing.md + 4,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: '#000',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
  },
  ctaSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: spacing.xl,
  },
  testimonialSectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  testimonialCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testimonialInner: { padding: spacing.md },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  testimonialAvatarText: {
    color: '#000',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  testimonialName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  testimonialLocation: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  testimonialStars: {
    marginLeft: 'auto' as any,
    fontSize: fontSize.sm,
  },
  testimonialText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  restoreBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  premiumActiveContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  premiumActiveEmoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  premiumActiveTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  premiumActiveSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
});
