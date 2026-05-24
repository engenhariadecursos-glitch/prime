import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, Dimensions, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { colors, radius } from '../constants/theme';

const { width: W } = Dimensions.get('window');

const STEPS = [
  { icon: '💪', title: 'Bem-vindo ao\nPRIME Fit', subtitle: 'Seu parceiro definitivo de treino e nutrição. Vamos configurar seu perfil em 1 minuto.' },
  { icon: '👤', title: 'Como posso\nte chamar?', subtitle: 'Seu nome personaliza toda a experiência do app.' },
  { icon: '⚖️', title: 'Qual é seu\npeso atual?', subtitle: 'Usaremos para acompanhar sua evolução ao longo do tempo.' },
  { icon: '🎯', title: 'Qual é sua\nmeta de peso?', subtitle: 'Sua meta nos ajuda a calcular calorias e orientar melhor.' },
  { icon: '🥩', title: 'Meta de proteína\ndiária?', subtitle: 'Recomendado: 2g por kg de peso corporal para ganho de massa.' },
  { icon: '🚀', title: 'Tudo pronto,\ncampeão!', subtitle: 'Seu perfil foi configurado. Hora de treinar com inteligência.' },
];

export function OnboardingScreen() {
  const store = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [weightGoal, setWeightGoal] = useState('');
  const [protein, setProtein] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateNext = (nextStep: number) => {
    Animated.spring(slideAnim, {
      toValue: -nextStep * W,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
    setStep(nextStep);
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      animateNext(step + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const w = parseFloat(weight) || 84;
    const wg = parseFloat(weightGoal) || 76;
    const p = parseInt(protein) || Math.round(w * 2);
    store.updateGoals({
      userName: name.trim() || 'Atleta',
      weightGoal: wg,
      proteinGoal: p,
      calorieGoal: 2200,
      waterGoalMl: 3000,
    });
    store.setOnboardingDone();
  };

  const canContinue = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return weight.trim().length > 0 && !isNaN(parseFloat(weight));
    if (step === 3) return weightGoal.trim().length > 0 && !isNaN(parseFloat(weightGoal));
    return true;
  };

  const suggestedProtein = weight ? String(Math.round(parseFloat(weight) * 2)) : '168';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Progress */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: `${((step) / (STEPS.length - 1)) * 100}%` as any }]} />
      </View>

      {/* Slides */}
      <Animated.View style={[styles.slides, { transform: [{ translateX: slideAnim }] }]}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.slide}>
            <View style={styles.slideContent}>
              <Text style={styles.icon}>{s.icon}</Text>
              <Text style={styles.slideTitle}>{s.title}</Text>
              <Text style={styles.slideSub}>{s.subtitle}</Text>

              {i === 1 && (
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Digite seu nome..."
                  placeholderTextColor={colors.muted2}
                  autoFocus={step === 1}
                  selectionColor={colors.orange}
                  returnKeyType="next"
                  onSubmitEditing={canContinue() ? goNext : undefined}
                />
              )}

              {i === 2 && (
                <View style={styles.numWrap}>
                  <TextInput
                    style={styles.numInput}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="84.0"
                    placeholderTextColor={colors.muted2}
                    keyboardType="decimal-pad"
                    autoFocus={step === 2}
                    selectionColor={colors.orange}
                  />
                  <Text style={styles.numUnit}>kg</Text>
                </View>
              )}

              {i === 3 && (
                <>
                  <View style={styles.numWrap}>
                    <TextInput
                      style={styles.numInput}
                      value={weightGoal}
                      onChangeText={setWeightGoal}
                      placeholder="76.0"
                      placeholderTextColor={colors.muted2}
                      keyboardType="decimal-pad"
                      autoFocus={step === 3}
                      selectionColor={colors.orange}
                    />
                    <Text style={styles.numUnit}>kg</Text>
                  </View>
                  {weight && weightGoal && !isNaN(parseFloat(weight)) && !isNaN(parseFloat(weightGoal)) && (
                    <View style={styles.diffBadge}>
                      <Text style={styles.diffTxt}>
                        {(parseFloat(weight) - parseFloat(weightGoal)).toFixed(1)}kg a perder
                      </Text>
                    </View>
                  )}
                </>
              )}

              {i === 4 && (
                <>
                  <View style={styles.numWrap}>
                    <TextInput
                      style={styles.numInput}
                      value={protein}
                      onChangeText={setProtein}
                      placeholder={suggestedProtein}
                      placeholderTextColor={colors.muted2}
                      keyboardType="numeric"
                      autoFocus={step === 4}
                      selectionColor={colors.orange}
                    />
                    <Text style={styles.numUnit}>g/dia</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.suggestionBtn}
                    onPress={() => setProtein(suggestedProtein)}
                  >
                    <Text style={styles.suggestionTxt}>
                      Usar recomendado: {suggestedProtein}g (2× seu peso)
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {i === 5 && (
                <View style={styles.summaryCard}>
                  <SummaryRow icon="👤" label="Nome" value={name || 'Atleta'} />
                  <SummaryRow icon="⚖️" label="Peso atual" value={`${weight || '84'}kg`} />
                  <SummaryRow icon="🎯" label="Meta" value={`${weightGoal || '76'}kg`} />
                  <SummaryRow icon="🥩" label="Proteína" value={`${protein || suggestedProtein}g/dia`} />
                  <SummaryRow icon="💧" label="Água" value="3L/dia" last />
                </View>
              )}
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canContinue() && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={!canContinue()}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnTxt}>
            {step === STEPS.length - 1 ? '🚀 Começar agora' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        {step > 0 && step < STEPS.length - 1 && step !== 1 && (
          <TouchableOpacity onPress={goNext} style={styles.skipBtn}>
            <Text style={styles.skipTxt}>Pular esta etapa</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryBorder]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  progressBar: { height: 3, backgroundColor: colors.surface3, margin: 0 },
  progressFill: { height: '100%', backgroundColor: colors.orange, borderRadius: 2 },
  slides: { flex: 1, flexDirection: 'row', width: W * STEPS.length },
  slide: { width: W, flex: 1, justifyContent: 'center' },
  slideContent: { paddingHorizontal: 32, alignItems: 'center', gap: 12 },
  icon: { fontSize: 80, marginBottom: 8 },
  slideTitle: {
    fontSize: 32, fontWeight: '900', color: colors.text,
    textAlign: 'center', letterSpacing: -1, lineHeight: 38,
  },
  slideSub: {
    fontSize: 15, color: colors.muted, textAlign: 'center',
    lineHeight: 22, paddingHorizontal: 8,
  },
  textInput: {
    width: '100%', backgroundColor: colors.surface2, borderRadius: radius.md,
    padding: 20, fontSize: 22, fontWeight: '700', color: colors.text,
    borderWidth: 2, borderColor: colors.orange, textAlign: 'center',
    marginTop: 8,
  },
  numWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface2, borderRadius: radius.lg,
    borderWidth: 2, borderColor: colors.orange,
    paddingHorizontal: 28, paddingVertical: 16,
    marginTop: 8, gap: 10,
  },
  numInput: {
    fontSize: 56, fontWeight: '900', color: colors.orange,
    letterSpacing: -2, minWidth: 100, textAlign: 'center',
  },
  numUnit: { fontSize: 22, fontWeight: '700', color: colors.muted },
  diffBadge: {
    backgroundColor: colors.greenDim, borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.green,
  },
  diffTxt: { fontSize: 14, fontWeight: '700', color: colors.green },
  suggestionBtn: {
    backgroundColor: colors.orangeDim, borderRadius: 50,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.orange,
  },
  suggestionTxt: { fontSize: 13, color: colors.orange, fontWeight: '600' },
  summaryCard: {
    width: '100%', backgroundColor: colors.surface1,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginTop: 8,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryIcon: { fontSize: 20 },
  summaryLabel: { flex: 1, fontSize: 14, color: colors.muted, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  footer: { padding: 24, paddingBottom: 32, gap: 12, alignItems: 'center' },
  nextBtn: {
    width: '100%', backgroundColor: colors.orange, borderRadius: radius.lg, padding: 20,
    alignItems: 'center',
    shadowColor: colors.orange, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 8,
  },
  nextBtnDisabled: { opacity: 0.35, shadowOpacity: 0 },
  nextBtnTxt: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  skipBtn: { paddingVertical: 4 },
  skipTxt: { fontSize: 13, color: colors.muted2, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface3 },
  dotActive: { width: 22, backgroundColor: colors.orange },
  dotDone: { backgroundColor: colors.green },
});
