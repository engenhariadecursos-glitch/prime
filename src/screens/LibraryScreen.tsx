import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';
import { EBOOKS, EbookData, EbookChapter, EBOOK_CATEGORIES, CATEGORY_GRADIENTS } from '../data/ebooks';
import { colors, spacing, radius, fontSize, fontWeight } from '../theme';

const { width } = Dimensions.get('window');

function EbookCover({ ebook, size = 'medium' }: { ebook: EbookData; size?: 'small' | 'medium' | 'large' }) {
  const dim = size === 'small' ? 80 : size === 'large' ? 140 : 100;
  return (
    <LinearGradient
      colors={ebook.gradientColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.ebookCover, { width: dim, height: dim * 1.4 }]}
    >
      <Text style={[styles.ebookCoverEmoji, { fontSize: size === 'small' ? 28 : 40 }]}>
        {ebook.emoji}
      </Text>
    </LinearGradient>
  );
}

function EbookCard({ ebook, onPress, progress }: {
  ebook: EbookData;
  onPress: () => void;
  progress?: { currentChapter: number; totalChapters: number; progress: number };
}) {
  const { isPremium } = useAppStore();
  const locked = ebook.isPremium && !isPremium;
  const pct = progress?.progress ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>
      <LinearGradient
        colors={['#1A1A26', '#12121A']}
        style={styles.cardInner}
      >
        <EbookCover ebook={ebook} size="medium" />
        <View style={styles.cardContent}>
          <View style={styles.cardBadgeRow}>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: (CATEGORY_GRADIENTS[ebook.category] || CATEGORY_GRADIENTS.default)[0] + '22' }
            ]}>
              <Text style={[
                styles.categoryBadgeText,
                { color: (CATEGORY_GRADIENTS[ebook.category] || CATEGORY_GRADIENTS.default)[0] }
              ]}>
                {EBOOK_CATEGORIES.find(c => c.id === ebook.category)?.emoji}{' '}
                {EBOOK_CATEGORIES.find(c => c.id === ebook.category)?.label}
              </Text>
            </View>
            {ebook.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRIME</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{locked ? '🔒 ' : ''}{ebook.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{ebook.subtitle}</Text>
          <Text style={styles.cardAuthor}>{ebook.author}</Text>

          <View style={styles.cardMeta}>
            <Text style={styles.metaItem}>📖 {ebook.totalChapters} cap.</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaItem}>⏱ {ebook.estimatedMinutes} min</Text>
          </View>

          {pct > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.progressPct}>{Math.round(pct)}%</Text>
            </View>
          )}
        </View>

        {locked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ChapterRow({ chapter, index, isRead, isBookmarked, onPress, onBookmark }: {
  chapter: EbookChapter;
  index: number;
  isRead: boolean;
  isBookmarked: boolean;
  onPress: () => void;
  onBookmark: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chapterRow}>
      <View style={[styles.chapterNum, isRead && styles.chapterNumRead]}>
        {isRead
          ? <Text style={styles.chapterCheck}>✓</Text>
          : <Text style={styles.chapterNumText}>{index + 1}</Text>
        }
      </View>
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterTitle, isRead && styles.chapterTitleRead]} numberOfLines={2}>
          {chapter.title}
        </Text>
        <Text style={styles.chapterMeta}>⏱ {chapter.readingMinutes} min de leitura</Text>
      </View>
      <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
          {isBookmarked ? '🔖' : '○'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function LibraryScreen({ navigation }: any) {
  const { isPremium, isBookmarked, toggleBookmark, ebookProgress, updateEbookProgress } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedEbook, setSelectedEbook] = useState<EbookData | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'todos'
    ? EBOOKS
    : EBOOKS.filter((e) => e.category === activeCategory);

  const handleEbookPress = (ebook: EbookData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ebook.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    setSelectedEbook(ebook);
    setSelectedChapterIndex(null);
  };

  const handleChapterPress = (ebook: EbookData, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChapterIndex(index);
    updateEbookProgress(ebook.id, index, ebook.totalChapters);
  };

  const handleNextChapter = () => {
    if (!selectedEbook || selectedChapterIndex === null) return;
    const next = selectedChapterIndex + 1;
    if (next < selectedEbook.chapters.length) {
      setSelectedChapterIndex(next);
      updateEbookProgress(selectedEbook.id, next, selectedEbook.totalChapters);
    } else {
      setSelectedChapterIndex(null);
    }
  };

  const closeReader = () => {
    setSelectedEbook(null);
    setSelectedChapterIndex(null);
  };

  const totalRead = EBOOKS.filter(e => {
    const p = ebookProgress[e.id];
    return p && p.progress >= 100;
  }).length;

  const inProgress = EBOOKS.filter(e => {
    const p = ebookProgress[e.id];
    return p && p.progress > 0 && p.progress < 100;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Biblioteca</Text>
            <Text style={styles.headerSub}>{EBOOKS.length} guias premium</Text>
          </View>
          <View style={styles.headerBadge}>
            <LinearGradient colors={['#C9A84C', '#E5C76B']} style={styles.headerBadgeGrad}>
              <Text style={styles.headerBadgeText}>📚 Elite</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Upgrade banner */}
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
                <Text style={styles.heroBannerTitle}>Biblioteca Prime Completa</Text>
                <Text style={styles.heroBannerSub}>
                  Desbloqueie {EBOOKS.filter(e => e.isPremium).length} guias exclusivos
                </Text>
              </View>
              <Text style={styles.heroBannerArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Lendo', value: inProgress.toString(), emoji: '📖' },
            { label: 'Disponíveis', value: (isPremium ? EBOOKS.length : EBOOKS.filter(e => !e.isPremium).length).toString(), emoji: '📚' },
            { label: 'Concluídos', value: totalRead.toString(), emoji: '✅' },
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

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {EBOOK_CATEGORIES.map((cat) => (
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
                {cat.emoji} {cat.label}
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
            progress={ebookProgress[ebook.id]}
          />
        ))}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Full-screen reader modal */}
      <Modal
        visible={!!selectedEbook}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeReader}
      >
        {selectedEbook && (
          <LinearGradient colors={['#0A0A0F', '#0D0D1A']} style={styles.fill}>
            <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
              {/* Reader header */}
              <View style={styles.readerHeader}>
                <TouchableOpacity
                  onPress={selectedChapterIndex !== null ? () => setSelectedChapterIndex(null) : closeReader}
                  style={styles.readerBackBtn}
                >
                  <Text style={styles.readerBackText}>
                    {selectedChapterIndex !== null ? '← Capítulos' : '✕'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.readerHeaderTitle} numberOfLines={1}>
                  {selectedChapterIndex !== null
                    ? selectedEbook.chapters[selectedChapterIndex]?.title
                    : selectedEbook.title}
                </Text>
                <View style={{ width: 60 }} />
              </View>

              {/* Chapter list view */}
              {selectedChapterIndex === null && (
                <ScrollView contentContainerStyle={styles.chapterListPad}>
                  {/* Book info */}
                  <View style={styles.readerBookInfo}>
                    <EbookCover ebook={selectedEbook} size="large" />
                    <View style={styles.readerBookMeta}>
                      <Text style={styles.readerBookTitle}>{selectedEbook.title}</Text>
                      <Text style={styles.readerBookSubtitle}>{selectedEbook.subtitle}</Text>
                      <Text style={styles.readerBookAuthor}>{selectedEbook.author}</Text>
                      <View style={styles.readerBookStats}>
                        <Text style={styles.readerBookStat}>📖 {selectedEbook.totalChapters} capítulos</Text>
                        <Text style={styles.readerBookStat}>⏱ {selectedEbook.estimatedMinutes} min</Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress bar */}
                  {ebookProgress[selectedEbook.id] && (
                    <View style={styles.readerProgressSection}>
                      <View style={styles.readerProgressRow}>
                        <Text style={styles.readerProgressLabel}>Progresso da leitura</Text>
                        <Text style={styles.readerProgressPct}>
                          {Math.round(ebookProgress[selectedEbook.id].progress)}%
                        </Text>
                      </View>
                      <View style={styles.readerProgressBar}>
                        <View
                          style={[
                            styles.readerProgressFill,
                            { width: `${ebookProgress[selectedEbook.id].progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Chapter list */}
                  <Text style={styles.chaptersLabel}>CAPÍTULOS</Text>
                  <View style={styles.chaptersList}>
                    {selectedEbook.chapters.map((chapter, idx) => {
                      const progress = ebookProgress[selectedEbook.id];
                      const isRead = progress ? idx < progress.currentChapter : false;
                      const bookmarkKey = `ebook-${selectedEbook.id}-ch-${chapter.id}`;
                      return (
                        <ChapterRow
                          key={chapter.id}
                          chapter={chapter}
                          index={idx}
                          isRead={isRead}
                          isBookmarked={isBookmarked(bookmarkKey)}
                          onPress={() => handleChapterPress(selectedEbook, idx)}
                          onBookmark={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            toggleBookmark(bookmarkKey);
                          }}
                        />
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              {/* Chapter content view */}
              {selectedChapterIndex !== null && selectedEbook.chapters[selectedChapterIndex] && (
                <ScrollView contentContainerStyle={styles.chapterContentPad}>
                  {(() => {
                    const chapter = selectedEbook.chapters[selectedChapterIndex];
                    const bookmarkKey = `ebook-${selectedEbook.id}-ch-${chapter.id}`;
                    return (
                      <>
                        <View style={styles.chapterContentHeader}>
                          <Text style={styles.chapterContentNum}>
                            Capítulo {selectedChapterIndex + 1} de {selectedEbook.totalChapters}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              toggleBookmark(bookmarkKey);
                            }}
                            style={styles.chapterBookmarkBtn}
                          >
                            <Text style={styles.chapterBookmarkText}>
                              {isBookmarked(bookmarkKey) ? '🔖 Salvo' : '○ Salvar'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.chapterContentTitle}>{chapter.title}</Text>
                        <Text style={styles.chapterReadTime}>⏱ {chapter.readingMinutes} min de leitura</Text>

                        <View style={styles.chapterDivider} />

                        {chapter.content.map((paragraph, i) => (
                          <Text key={i} style={styles.chapterParagraph}>{paragraph}</Text>
                        ))}

                        {chapter.keyInsights && chapter.keyInsights.length > 0 && (
                          <View style={styles.keyInsightsCard}>
                            <LinearGradient
                              colors={selectedEbook.gradientColors as [string, string]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.keyInsightsHeader}
                            >
                              <Text style={styles.keyInsightsTitle}>⚡ Principais Insights</Text>
                            </LinearGradient>
                            <View style={styles.keyInsightsList}>
                              {chapter.keyInsights.map((insight, i) => (
                                <View key={i} style={styles.keyInsightRow}>
                                  <Text style={styles.keyInsightDot}>•</Text>
                                  <Text style={styles.keyInsightText}>{insight}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        <View style={styles.chapterNavRow}>
                          {selectedChapterIndex < selectedEbook.chapters.length - 1 ? (
                            <TouchableOpacity onPress={handleNextChapter} style={styles.nextChapterBtn}>
                              <LinearGradient
                                colors={selectedEbook.gradientColors as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextChapterGrad}
                              >
                                <Text style={styles.nextChapterText}>Próximo capítulo →</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() => setSelectedChapterIndex(null)}
                              style={styles.nextChapterBtn}
                            >
                              <LinearGradient
                                colors={['#00D4AA', '#007AFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextChapterGrad}
                              >
                                <Text style={styles.nextChapterText}>✓ Livro concluído!</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          )}
                        </View>
                      </>
                    );
                  })()}
                </ScrollView>
              )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerBadge: { borderRadius: radius.full, overflow: 'hidden' },
  headerBadgeGrad: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerBadgeText: {
    color: '#000',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
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
  heroBannerArrow: { fontSize: 28, color: 'rgba(255,255,255,0.7)' },
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
  statGrad: { padding: spacing.md, alignItems: 'center' },
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
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInner: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  ebookCover: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ebookCoverEmoji: {},
  cardContent: { flex: 1 },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  premiumBadge: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  premiumBadgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardAuthor: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaItem: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressBar: {
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
  progressPct: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    width: 30,
    textAlign: 'right',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  lockIcon: { fontSize: 20 },
  // Reader styles
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readerBackBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readerBackText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  readerHeaderTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  chapterListPad: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  readerBookInfo: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  readerBookMeta: { flex: 1 },
  readerBookTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 26,
  },
  readerBookSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  readerBookAuthor: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  readerBookStats: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  readerBookStat: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  readerProgressSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readerProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  readerProgressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  readerProgressPct: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.bold,
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
  chaptersLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  chaptersList: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  chapterNum: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  chapterNumRead: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderColor: colors.primary,
  },
  chapterNumText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  chapterCheck: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.black,
  },
  chapterInfo: { flex: 1 },
  chapterTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
    lineHeight: 18,
  },
  chapterTitleRead: { color: colors.textSecondary },
  chapterMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  bookmarkIcon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  bookmarkIconActive: { color: colors.primary },
  // Chapter content
  chapterContentPad: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  chapterContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chapterContentNum: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chapterBookmarkBtn: {
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterBookmarkText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  chapterContentTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
    color: colors.text,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  chapterReadTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  chapterDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  chapterParagraph: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  keyInsightsCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyInsightsHeader: {
    padding: spacing.md,
  },
  keyInsightsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  keyInsightsList: {
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    gap: spacing.sm,
  },
  keyInsightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  keyInsightDot: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginTop: 1,
  },
  keyInsightText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  chapterNavRow: {
    marginTop: spacing.lg,
  },
  nextChapterBtn: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  nextChapterGrad: {
    padding: spacing.md,
    alignItems: 'center',
  },
  nextChapterText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
