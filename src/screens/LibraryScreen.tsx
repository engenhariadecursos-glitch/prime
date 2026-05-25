import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore, EbookItem } from '../store';
import EbookCard from '../components/EbookCard';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const EBOOKS: EbookItem[] = [
  {
    id: '1',
    title: 'Guia Completo do Jejum Intermitente',
    description: 'Tudo que você precisa saber para começar o jejum de forma segura e eficaz.',
    category: 'jejum',
    cover: '',
    isPremium: false,
    readProgress: 45,
    totalPages: 87,
  },
  {
    id: '2',
    title: 'Hipertrofia em 90 Dias',
    description: 'Programa completo de musculação para ganho de massa muscular comprovado.',
    category: 'fitness',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 142,
  },
  {
    id: '3',
    title: 'Nutrição Cetogênica para Atletas',
    description: 'Como combinar a dieta cetogênica com alta performance física e mental.',
    category: 'nutricao',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 95,
  },
  {
    id: '4',
    title: 'Mindset de Campeão',
    description: 'A psicologia por trás de atletas e executivos de elite. Discipline your mind.',
    category: 'mindset',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 118,
  },
  {
    id: '5',
    title: 'Jejum Prolongado: Guia Avançado',
    description: 'Protocolo detalhado para jejuns de 24h a 120h com segurança máxima.',
    category: 'jejum',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 73,
  },
  {
    id: '6',
    title: 'Plano Nutricional Anti-inflamatório',
    description: 'Alimentação que combate inflamação, otimiza hormônios e acelera resultados.',
    category: 'nutricao',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 110,
  },
  {
    id: '7',
    title: 'Treino em Estado de Jejum',
    description: 'Como maximizar resultados treinando em estado de jejum e cetose.',
    category: 'fitness',
    cover: '',
    isPremium: true,
    readProgress: 0,
    totalPages: 68,
  },
  {
    id: '8',
    title: 'Longevidade e Autofagia',
    description: 'A ciência da renovação celular e como o jejum ativa seus mecanismos de cura.',
    category: 'mindset',
    cover: '',
    isPremium: false,
    readProgress: 12,
    totalPages: 94,
  },
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'jejum', label: '⚡ Jejum' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'nutricao', label: '🥗 Nutrição' },
  { id: 'mindset', label: '🧠 Mindset' },
];

export default function LibraryScreen({ navigation }: any) {
  const { isPremium } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedEbook, setSelectedEbook] = useState<EbookItem | null>(null);

  const filtered = activeCategory === 'todos'
    ? EBOOKS
    : EBOOKS.filter((e) => e.category === activeCategory);

  const freeBooks = EBOOKS.filter((e) => !e.isPremium);
  const premiumBooks = EBOOKS.filter((e) => e.isPremium);

  const handleEbookPress = (ebook: EbookItem) => {
    if (ebook.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    setSelectedEbook(ebook);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Biblioteca</Text>
          <Text style={styles.headerSub}>{EBOOKS.length} guias premium</Text>
        </View>

        {/* Hero banner */}
        {!isPremium && (
          <TouchableOpacity onPress={() => navigation.navigate('Premium')} activeOpacity={0.88}>
            <LinearGradient
              colors={['#7C4DFF', '#9C6FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroBanner}
            >
              <Text style={styles.heroBannerEmoji}>📚</Text>
              <View style={styles.heroBannerText}>
                <Text style={styles.heroBannerTitle}>Biblioteca Prime</Text>
                <Text style={styles.heroBannerSub}>
                  Desbloqueie {premiumBooks.length} guias exclusivos
                </Text>
              </View>
              <Text style={styles.heroBannerArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Lendo', value: freeBooks.filter(e => (e.readProgress || 0) > 0).length.toString(), emoji: '📖' },
            { label: 'Disponíveis', value: isPremium ? EBOOKS.length.toString() : freeBooks.length.toString(), emoji: '📚' },
            { label: 'Concluídos', value: '1', emoji: '✅' },
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

        {/* Filter categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
            >
              {activeCategory === cat.id && (
                <LinearGradient
                  colors={['#C9A84C', '#E5C76B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.filterText, activeCategory === cat.id && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ebook list */}
        {filtered.map((ebook) => (
          <EbookCard
            key={ebook.id}
            ebook={ebook}
            onPress={() => handleEbookPress(ebook)}
            isPremiumUser={isPremium}
          />
        ))}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Ebook Reader Modal */}
      <Modal
        visible={!!selectedEbook}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {selectedEbook && (
          <LinearGradient colors={['#0A0A0F', '#0D0D1A']} style={styles.readerContainer}>
            <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
              <View style={styles.readerHeader}>
                <TouchableOpacity onPress={() => setSelectedEbook(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.readerTitle} numberOfLines={1}>
                  {selectedEbook.title}
                </Text>
                <View style={{ width: 36 }} />
              </View>

              <ScrollView style={styles.readerContent} contentContainerStyle={styles.readerContentPad}>
                <Text style={styles.readerCategory}>
                  {selectedEbook.category.toUpperCase()}
                </Text>
                <Text style={styles.readerBookTitle}>{selectedEbook.title}</Text>
                <Text style={styles.readerDescription}>{selectedEbook.description}</Text>

                <View style={styles.readerDivider} />

                <Text style={styles.readerBodyTitle}>Introdução</Text>
                <Text style={styles.readerBody}>
                  Este guia foi elaborado por especialistas em medicina do esporte e nutrição para
                  fornecer um protocolo científico e seguro. Cada capítulo combina evidências
                  clínicas com aplicações práticas para maximizar seus resultados.{'\n\n'}
                  O jejum intermitente é muito mais do que uma dieta — é um estilo de vida que
                  transforma não apenas o corpo, mas também a mente e a relação com a alimentação.
                  Milhares de estudos confirmam seus benefícios para longevidade, composição
                  corporal e performance cognitiva.{'\n\n'}
                  Neste material, você encontrará protocolos detalhados, receitas, estratégias de
                  implementação e ferramentas para acompanhar seu progresso. Prepare-se para uma
                  transformação completa.
                </Text>

                <View style={styles.readerDivider} />

                <Text style={styles.readerBodyTitle}>Capítulo 1: Fundamentos</Text>
                <Text style={styles.readerBody}>
                  A ciência por trás do jejum intermitente é fascinante. Quando você para de
                  comer, seu corpo passa por uma série de adaptações metabólicas profundas que
                  favorecem a queima de gordura, a regeneração celular e a longevidade.{'\n\n'}
                  Os primeiros estudos sérios sobre jejum foram publicados na década de 1940, mas
                  foi nas últimas duas décadas que a pesquisa explodiu. Em 2016, o cientista
                  japonês Yoshinori Ohsumi ganhou o Prêmio Nobel por desvendar os mecanismos da
                  autofagia — o processo de limpeza celular ativado pelo jejum.
                </Text>

                <View style={styles.readerProgressSection}>
                  <Text style={styles.readerProgressLabel}>
                    Progresso: {selectedEbook.readProgress || 0}% de {selectedEbook.totalPages} páginas
                  </Text>
                  <View style={styles.readerProgressBar}>
                    <View
                      style={[
                        styles.readerProgressFill,
                        { width: `${selectedEbook.readProgress || 12}%` },
                      ]}
                    />
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
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
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  heroBannerEmoji: { fontSize: 32, marginRight: spacing.md },
  heroBannerText: { flex: 1 },
  heroBannerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginBottom: 2,
  },
  heroBannerSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  heroBannerArrow: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.7)',
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
  filterChipActive: { borderColor: 'transparent' },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  filterTextActive: { color: '#000', fontWeight: fontWeight.bold },
  readerContainer: { flex: 1 },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  readerTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  readerContent: { flex: 1 },
  readerContentPad: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  readerCategory: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  readerBookTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.text,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  readerDescription: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  readerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  readerBodyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  readerBody: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  readerProgressSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readerProgressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  readerProgressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  readerProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
