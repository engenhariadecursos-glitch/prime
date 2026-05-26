import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../constants/theme';

interface Book {
  title: string;
  author: string;
  pages: string;
}

interface Category {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  books: Book[];
}

const CATEGORIES: Category[] = [
  {
    id: 'fasting',
    icon: '⏱️',
    title: 'Jejum Intermitente',
    subtitle: 'Protocolos e ciência',
    color: colors.green,
    books: [
      { title: 'O Guia Definitivo do Jejum', author: 'Dr. Jason Fung', pages: '312 pág' },
      { title: 'Jejum Limpo', author: 'Gin Stephens', pages: '268 pág' },
      { title: 'A Janela de Alimentação', author: 'Leangains', pages: '184 pág' },
      { title: 'Autofagia e Longevidade', author: 'Dr. Valter Longo', pages: '298 pág' },
    ],
  },
  {
    id: 'masculine',
    icon: '⚡',
    title: 'Performance Masculina',
    subtitle: 'Testosterona e vitalidade',
    color: colors.orange,
    books: [
      { title: 'Testosterone Optimization Therapy', author: 'Jay Campbell', pages: '342 pág' },
      { title: 'O Homem de Alta Performance', author: 'PRIME Fit', pages: '220 pág' },
      { title: 'Maximizando a Testosterona', author: 'Nelson Vergel', pages: '256 pág' },
      { title: 'Força, Músculo e Hormônios', author: 'Dr. Ted Naiman', pages: '188 pág' },
    ],
  },
  {
    id: 'discipline',
    icon: '🧠',
    title: 'Disciplina Mental',
    subtitle: 'Mindset de vencedor',
    color: colors.purple,
    books: [
      { title: 'Não se Pode Comprar Disciplina', author: 'Jocko Willink', pages: '304 pág' },
      { title: 'Atomic Habits', author: 'James Clear', pages: '320 pág' },
      { title: "Can't Hurt Me", author: 'David Goggins', pages: '364 pág' },
      { title: 'O Poder do Hábito', author: 'Charles Duhigg', pages: '296 pág' },
    ],
  },
  {
    id: 'productivity',
    icon: '🚀',
    title: 'Produtividade',
    subtitle: 'Faça mais em menos tempo',
    color: colors.blue,
    books: [
      { title: 'Deep Work', author: 'Cal Newport', pages: '296 pág' },
      { title: 'O Homem mais Rico da Babilônia', author: 'George Clason', pages: '144 pág' },
      { title: '12 Rules for Life', author: 'Jordan Peterson', pages: '448 pág' },
      { title: 'Eat That Frog!', author: 'Brian Tracy', pages: '144 pág' },
    ],
  },
  {
    id: 'nutrition',
    icon: '🥩',
    title: 'Nutrição de Elite',
    subtitle: 'Coma para vencer',
    color: colors.yellow,
    books: [
      { title: 'A Bíblia da Nutrição Anabólica', author: 'Dr. Layne Norton', pages: '282 pág' },
      { title: 'Carnivor Code', author: 'Dr. Paul Saladino', pages: '336 pág' },
      { title: 'Proteína: o Macronutriente Rei', author: 'PRIME Fit', pages: '164 pág' },
      { title: 'The Obesity Code', author: 'Dr. Jason Fung', pages: '296 pág' },
    ],
  },
  {
    id: 'performance',
    icon: '🏆',
    title: 'Alta Performance',
    subtitle: 'Mentalidade de atleta',
    color: colors.teal,
    books: [
      { title: "The Champion's Mind", author: 'Jim Afremow', pages: '254 pág' },
      { title: 'Peak Performance', author: 'Brad Stulberg', pages: '248 pág' },
      { title: 'Relentless', author: 'Tim Grover', pages: '256 pág' },
      { title: 'O Livro do Guerreiro Pacífico', author: 'Dan Millman', pages: '218 pág' },
    ],
  },
];

export function EbookScreen() {
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Biblioteca</Text>
            <Text style={styles.headerSub}>Knowledge is your edge</Text>
          </View>
          <TouchableOpacity style={styles.proBadge} onPress={() => setUpgradeVisible(true)}>
            <Text style={styles.proIcon}>⭐</Text>
            <Text style={styles.proTxt}>PRIME PRO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>ACESSO COMPLETO</Text>
            <Text style={styles.heroTitle}>24 ebooks{'\n'}exclusivos</Text>
            <TouchableOpacity style={styles.heroBtn} onPress={() => setUpgradeVisible(true)}>
              <Text style={styles.heroBtnTxt}>Desbloquear tudo →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEmoji}>📚</Text>
        </View>

        <View style={styles.pad}>
          {CATEGORIES.map((cat) => {
            const isExpanded = expandedId === cat.id;
            return (
              <View key={cat.id} style={styles.categoryCard}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => setExpandedId(isExpanded ? null : cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}15` }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <View style={styles.catInfo}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catSub}>{cat.subtitle} · {cat.books.length} livros</Text>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? '˄' : '˅'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.booksList}>
                    {cat.books.map((book, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.bookRow}
                        onPress={() => setUpgradeVisible(true)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.bookCover, { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}35` }]}>
                          <Text style={styles.bookNum}>{i + 1}</Text>
                        </View>
                        <View style={styles.bookInfo}>
                          <Text style={styles.bookTitle}>{book.title}</Text>
                          <Text style={styles.bookAuthor}>{book.author} · {book.pages}</Text>
                        </View>
                        <View style={styles.lockBadge}>
                          <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      <Modal visible={upgradeVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setUpgradeVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <View style={styles.modalPad}>

              <Text style={styles.modalEmoji}>⭐</Text>
              <Text style={styles.modalTitle}>PRIME Pro</Text>
              <Text style={styles.modalSub}>
                Desbloqueie tudo e acelere sua transformação
              </Text>

              <View style={styles.featuresList}>
                {[
                  { icon: '📚', text: '24 ebooks premium de alta performance' },
                  { icon: '🧠', text: 'Conteúdo exclusivo de nutrição e disciplina' },
                  { icon: '📊', text: 'Análises avançadas e relatórios detalhados' },
                  { icon: '🏆', text: 'Sistema de conquistas e desafios mensais' },
                  { icon: '⚡', text: 'Programas de treino periodizados' },
                  { icon: '🎯', text: 'Suporte prioritário e consultoria' },
                ].map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureIcon}>{f.icon}</Text>
                    <Text style={styles.featureTxt}>{f.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingCards}>
                <TouchableOpacity style={styles.pricingCard} activeOpacity={0.85}>
                  <Text style={styles.pricingPeriod}>Mensal</Text>
                  <Text style={styles.pricingPrice}>R$ 29</Text>
                  <Text style={styles.pricingUnit}>/mês</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pricingCard, styles.pricingCardBest]} activeOpacity={0.85}>
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeTxt}>MELHOR</Text>
                  </View>
                  <Text style={[styles.pricingPeriod, { color: colors.orange }]}>Anual</Text>
                  <Text style={[styles.pricingPrice, { color: colors.orange }]}>R$ 197</Text>
                  <Text style={styles.pricingUnit}>R$ 16/mês</Text>
                  <Text style={styles.pricingSave}>Economize 45%</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.88}>
                <Text style={styles.upgradeBtnTxt}>Começar agora — 7 dias grátis</Text>
              </TouchableOpacity>

              <Text style={styles.upgradeDisclaimer}>
                Cancele quando quiser. Sem compromisso.
              </Text>

            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: colors.muted, marginTop: 2, fontStyle: 'italic' },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.goldDim, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: `${colors.gold}40`,
  },
  proIcon: { fontSize: 12 },
  proTxt: { fontSize: 11, fontWeight: '800', color: colors.gold, letterSpacing: 0.8 },
  heroBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg, padding: 20,
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: `${colors.orange}25`,
  },
  heroLeft: { gap: 8 },
  heroLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.orange,
  },
  heroTitle: { fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5, lineHeight: 28 },
  heroBtn: {
    backgroundColor: colors.orange, borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  heroBtnTxt: { fontSize: 13, fontWeight: '800', color: '#fff' },
  heroEmoji: { fontSize: 56 },
  pad: { padding: 16, gap: 10 },
  categoryCard: {
    backgroundColor: colors.surface1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  catIconWrap: {
    width: 48, height: 48, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  catIcon: { fontSize: 22 },
  catInfo: { flex: 1 },
  catTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  catSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  chevron: { fontSize: 16, color: colors.muted, fontWeight: '700' },
  booksList: { borderTopWidth: 1, borderTopColor: colors.border },
  bookRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bookCover: {
    width: 40, height: 52, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  bookNum: { fontSize: 16, fontWeight: '900', color: colors.muted },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  bookAuthor: { fontSize: 11, color: colors.muted, marginTop: 2 },
  lockBadge: {
    width: 30, height: 30, backgroundColor: colors.surface3, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  lockIcon: { fontSize: 14 },
  modalSafe: { flex: 1, backgroundColor: colors.surface1 },
  modalHeader: { paddingHorizontal: 20, paddingTop: 16, alignItems: 'flex-end' },
  modalClose: { fontSize: 18, color: colors.muted, fontWeight: '600', padding: 4 },
  modalScroll: { flex: 1 },
  modalPad: { padding: 24, alignItems: 'center', gap: 16 },
  modalEmoji: { fontSize: 52 },
  modalTitle: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  modalSub: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  featuresList: { width: '100%', gap: 12, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  featureTxt: { flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '500', lineHeight: 20 },
  pricingCards: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  pricingCard: {
    flex: 1, backgroundColor: colors.surface2, borderRadius: radius.lg, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 2,
  },
  pricingCardBest: { borderColor: `${colors.orange}50`, backgroundColor: colors.orangeDim },
  bestBadge: {
    backgroundColor: colors.orange, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: 6,
  },
  bestBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  pricingPeriod: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  pricingPrice: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  pricingUnit: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  pricingSave: { fontSize: 11, color: colors.green, fontWeight: '700', marginTop: 2 },
  upgradeBtn: {
    backgroundColor: colors.orange, borderRadius: radius.lg, paddingVertical: 18,
    paddingHorizontal: 24, width: '100%', alignItems: 'center', marginTop: 8,
    shadowColor: colors.orange, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  upgradeBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  upgradeDisclaimer: { fontSize: 11, color: colors.muted2, textAlign: 'center' },
});
