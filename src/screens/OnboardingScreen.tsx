import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { saveOnboarding, saveUser } from '../utils/storage';
import { requestPermissions, scheduleAllReminders } from '../utils/notifications';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string[];
  bullets?: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    emoji: '⚡',
    title: 'Bem-vindo ao Prime',
    subtitle: 'A plataforma premium de jejum, treino e transformação corporal.',
    gradient: ['#0A0A0F', '#1A1A26'],
    bullets: ['Jejum de 12h a 120h', 'Treinos especializados', 'Biblioteca premium', 'IA personalizada'],
  },
  {
    id: 'fasting',
    emoji: '🔥',
    title: 'Jejum que Transforma',
    subtitle: 'Ative a cetose, acelere o metabolismo e desperte a autofagia celular.',
    gradient: ['#1A0A05', '#2A1008'],
    bullets: ['Queima de gordura 3x mais rápida', 'Renovação celular profunda', 'Foco mental elevado', 'Anti-inflamatório natural'],
  },
  {
    id: 'body',
    emoji: '💪',
    title: 'Transformação Real',
    subtitle: 'Combine jejum estratégico com treinos otimizados para resultados extraordinários.',
    gradient: ['#0A0515', '#150A2A'],
    bullets: ['Perda de gordura acelerada', 'Ganho de massa magra', 'Melhora da sensibilidade à insulina', 'Longevidade e vitalidade'],
  },
  {
    id: 'productivity',
    emoji: '🧠',
    title: 'Produtividade Máxima',
    subtitle: 'Jejum ativa mecanismos neurológicos que aumentam foco, criatividade e energia.',
    gradient: ['#050A1A', '#0A1525'],
    bullets: ['BDNF aumentado', 'Clareza mental superior', 'Energia estável sem picos', 'Sono de qualidade'],
  },
  {
    id: 'discipline',
    emoji: '🏆',
    title: 'Disciplina é Liberdade',
    subtitle: 'A consistência separa os comuns dos extraordinários. Prime é para quem quer resultados reais.',
    gradient: ['#0A0800', '#1A1400'],
    bullets: ['Desafios semanais', 'Conquistas e marcos', 'Comunidade de elite', 'Suporte especializado'],
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setHasCompletedOnboarding, setUser, trialDaysLeft } = useAppStore();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      setShowRegister(true);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const user = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        createdAt: Date.now(),
        trialStartDate: Date.now(),
        isPremium: false,
      };
      await saveUser(user);
      setUser(user as any);
      await saveOnboarding(true);
      await requestPermissions();
      await scheduleAllReminders();
      setHasCompletedOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <LinearGradient colors={['#0A0A0F', '#12121A']} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <KeyboardAvoidingView
            style={styles.fill}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.registerContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.registerTitle}>Criar Conta</Text>
              <Text style={styles.registerSubtitle}>
                Comece seus {trialDaysLeft} dias grátis. Sem cobranças imediatas.
              </Text>

              <View style={styles.trialBadge}>
                <LinearGradient
                  colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.05)']}
                  style={styles.trialBadgeInner}
                >
                  <Text style={styles.trialBadgeText}>
                    🎁 {trialDaysLeft} dias grátis · Depois R$ 29,90/mês
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Crie uma senha segura"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#C9A84C', '#E5C76B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.ctaButton, loading && styles.ctaDisabled]}
                >
                  <Text style={styles.ctaText}>
                    {loading ? 'Criando conta...' : '✨ Começar Gratuitamente'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.terms}>
                Ao criar conta, você concorda com nossos{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>.
                {'\n'}Após o período de teste, será cobrado automaticamente. Cancele a qualquer momento.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.fill}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.fill}
      >
        {SLIDES.map((slide, index) => (
          <LinearGradient
            key={slide.id}
            colors={slide.gradient as [string, string]}
            style={styles.slide}
          >
            <SafeAreaView style={styles.slideSafe}>
              <View style={styles.slideContent}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.slideEmoji}>{slide.emoji}</Text>
                </View>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

                {slide.bullets && (
                  <View style={styles.bullets}>
                    {slide.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>✦</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.slideFooter}>
                <View style={styles.dots}>
                  {SLIDES.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === currentSlide && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
                  <LinearGradient
                    colors={
                      index === SLIDES.length - 1
                        ? ['#C9A84C', '#E5C76B']
                        : ['#7C4DFF', '#9C6FFF']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextButton}
                  >
                    <Text style={styles.nextText}>
                      {index === SLIDES.length - 1
                        ? '✨ Começar Agora'
                        : 'Continuar →'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      const prev = currentSlide - 1;
                      setCurrentSlide(prev);
                      scrollRef.current?.scrollTo({ x: prev * width, animated: true });
                    }}
                    style={styles.backButton}
                  >
                    <Text style={styles.backText}>← Voltar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  slide: { width, flex: 1 },
  slideSafe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  slideEmoji: {
    fontSize: 52,
  },
  slideTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  bullets: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginRight: spacing.sm,
  },
  bulletText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    flex: 1,
  },
  slideFooter: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  nextButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    width: width - spacing.lg * 2,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  registerContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  registerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  registerSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  trialBadge: {
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  trialBadgeInner: {
    padding: spacing.md,
    alignItems: 'center',
  },
  trialBadgeText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  ctaButton: {
    borderRadius: radius.full,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: {
    color: '#000',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  terms: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: {
    color: colors.primary,
  },
});
