import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FastingPreset = 12 | 16 | 18 | 24 | 36 | 48 | 72 | 96 | 120;

export interface FastingSession {
  id: string;
  startTime: number;
  targetHours: FastingPreset;
  endTime?: number;
  completed: boolean;
  elapsedHoursAtEnd?: number;
}

export interface FastingPhase {
  id: string;
  name: string;
  description: string;
  benefit: string;
  startHour: number;
  endHour: number;
  color: string[];
  icon: string;
}

export const FASTING_PHASES: FastingPhase[] = [
  {
    id: 'digestion',
    name: 'Digestão',
    description: 'Seu corpo está processando a última refeição. Insulina elevada, energia vinda da glicose alimentar.',
    benefit: 'Digestão ativa',
    startHour: 0,
    endHour: 4,
    color: ['#4A90D9', '#357ABD'],
    icon: '🍽️',
  },
  {
    id: 'glycogen',
    name: 'Queima de Glicogênio',
    description: 'Os estoques de açúcar no fígado e músculos estão sendo consumidos. O metabolismo começa a trocar de combustível.',
    benefit: 'Esgotamento do glicogênio',
    startHour: 4,
    endHour: 12,
    color: ['#FF9500', '#FF6B35'],
    icon: '🔥',
  },
  {
    id: 'light_ketosis',
    name: 'Cetose Leve',
    description: 'O fígado começa a produzir corpos cetônicos. A gordura corporal passa a ser o combustível principal do organismo.',
    benefit: 'Cetose iniciada',
    startHour: 12,
    endHour: 18,
    color: ['#FF6B35', '#C9A84C'],
    icon: '⚡',
  },
  {
    id: 'deep_ketosis',
    name: 'Cetose Profunda',
    description: 'Cetose máxima ativa. Queima de gordura acelerada, clareza mental progressiva e estabilidade energética superior.',
    benefit: 'Gordura como combustível',
    startHour: 18,
    endHour: 36,
    color: ['#7C4DFF', '#5B2FFF'],
    icon: '💜',
  },
  {
    id: 'autophagy',
    name: 'Autofagia',
    description: 'Células se renovam profundamente. Limpeza celular profunda e regeneração tecidual ativadas pelo Nobel de Medicina 2016.',
    benefit: 'Renovação celular',
    startHour: 36,
    endHour: 72,
    color: ['#00D4AA', '#007AFF'],
    icon: '🔄',
  },
  {
    id: 'mental_clarity',
    name: 'Clareza Mental Máxima',
    description: 'Foco cognitivo absoluto. BDNF e norepinefrina elevados ao máximo. Estado de alta performance e longevidade ativado.',
    benefit: 'Performance cognitiva de elite',
    startHour: 72,
    endHour: 120,
    color: ['#C9A84C', '#E5C76B'],
    icon: '🧠',
  },
];

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: number;
  trialStartDate: number;
  isPremium: boolean;
  subscriptionType?: 'monthly' | 'annual';
  subscriptionExpiry?: number;
}

export interface EbookItem {
  id: string;
  title: string;
  description: string;
  category: string;
  cover: string;
  isPremium: boolean;
  readProgress?: number;
  totalChapters?: number;
  estimatedMinutes?: number;
}

export interface FastingStreak {
  current: number;
  longest: number;
  lastFastDate: string | null;
  totalCompleted: number;
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;

  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;

  activeFasting: FastingSession | null;
  fastingHistory: FastingSession[];
  startFasting: (hours: FastingPreset) => void;
  stopFasting: () => void;
  getCurrentPhase: () => FastingPhase | null;
  getElapsedHours: () => number;

  streak: FastingStreak;
  updateStreak: () => void;

  hydrationToday: number;
  hydrationDate: string;
  hydrationGoal: number;
  logHydration: (ml: number) => void;

  electrolytesToday: number;
  electrolyteDate: string;
  logElectrolytes: () => void;

  isPremium: boolean;
  trialDaysLeft: number;
  setPremium: (v: boolean, type?: 'monthly' | 'annual') => void;

  bookmarks: string[];
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;

  ebookProgress: Record<string, { currentChapter: number; totalChapters: number; progress: number }>;
  updateEbookProgress: (ebookId: string, chapterIndex: number, totalChapters: number) => void;

  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const todayString = () => new Date().toDateString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),

      user: null,
      setUser: (u) => set({ user: u }),

      activeFasting: null,
      fastingHistory: [],
      startFasting: (hours) =>
        set({
          activeFasting: {
            id: Date.now().toString(),
            startTime: Date.now(),
            targetHours: hours,
            completed: false,
          },
        }),
      stopFasting: () => {
        const { activeFasting, fastingHistory } = get();
        if (activeFasting) {
          const elapsed = (Date.now() - activeFasting.startTime) / (1000 * 60 * 60);
          const completed: FastingSession = {
            ...activeFasting,
            endTime: Date.now(),
            completed: true,
            elapsedHoursAtEnd: elapsed,
          };
          set({ activeFasting: null, fastingHistory: [completed, ...fastingHistory] });
          setTimeout(() => get().updateStreak(), 0);
        }
      },
      getCurrentPhase: () => {
        const { activeFasting } = get();
        if (!activeFasting) return null;
        const elapsed = (Date.now() - activeFasting.startTime) / (1000 * 60 * 60);
        return (
          FASTING_PHASES.find((p) => elapsed >= p.startHour && elapsed < p.endHour) ||
          FASTING_PHASES[FASTING_PHASES.length - 1]
        );
      },
      getElapsedHours: () => {
        const { activeFasting } = get();
        if (!activeFasting) return 0;
        return (Date.now() - activeFasting.startTime) / (1000 * 60 * 60);
      },

      streak: { current: 0, longest: 0, lastFastDate: null, totalCompleted: 0 },
      updateStreak: () => {
        const { streak, fastingHistory } = get();
        const today = todayString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        let newCurrent = streak.current;
        if (streak.lastFastDate !== today) {
          newCurrent = streak.lastFastDate === yesterday ? streak.current + 1 : 1;
        }
        const newLongest = Math.max(streak.longest, newCurrent);
        set({
          streak: {
            current: newCurrent,
            longest: newLongest,
            lastFastDate: today,
            totalCompleted: fastingHistory.length + 1,
          },
        });
      },

      hydrationToday: 0,
      hydrationDate: todayString(),
      hydrationGoal: 2500,
      logHydration: (ml) =>
        set((s) => ({
          hydrationToday: s.hydrationToday + ml,
          hydrationDate: todayString(),
        })),

      electrolytesToday: 0,
      electrolyteDate: todayString(),
      logElectrolytes: () =>
        set((s) => ({
          electrolytesToday: s.electrolytesToday + 1,
          electrolyteDate: todayString(),
        })),

      isPremium: false,
      trialDaysLeft: 5,
      setPremium: (v, type) =>
        set((s) => ({
          isPremium: v,
          user: s.user ? { ...s.user, isPremium: v, subscriptionType: type } : null,
        })),

      bookmarks: [],
      toggleBookmark: (key) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(key)
            ? s.bookmarks.filter((b) => b !== key)
            : [...s.bookmarks, key],
        })),
      isBookmarked: (key) => get().bookmarks.includes(key),

      ebookProgress: {},
      updateEbookProgress: (ebookId, chapterIndex, totalChapters) =>
        set((s) => ({
          ebookProgress: {
            ...s.ebookProgress,
            [ebookId]: {
              currentChapter: chapterIndex + 1,
              totalChapters,
              progress: Math.round(((chapterIndex + 1) / totalChapters) * 100),
            },
          },
        })),

      selectedTab: 'Home',
      setSelectedTab: (tab) => set({ selectedTab: tab }),
    }),
    {
      name: 'prime-app-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        user: state.user,
        streak: state.streak,
        fastingHistory: state.fastingHistory,
        activeFasting: state.activeFasting,
        isPremium: state.isPremium,
        trialDaysLeft: state.trialDaysLeft,
        bookmarks: state.bookmarks,
        ebookProgress: state.ebookProgress,
        hydrationToday: state.hydrationToday,
        hydrationDate: state.hydrationDate,
        hydrationGoal: state.hydrationGoal,
        electrolytesToday: state.electrolytesToday,
        electrolyteDate: state.electrolyteDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const today = todayString();
        // Reset daily hydration if new day
        if (state.hydrationDate !== today) {
          state.hydrationToday = 0;
          state.hydrationDate = today;
        }
        // Reset daily electrolytes if new day
        if (state.electrolyteDate !== today) {
          state.electrolytesToday = 0;
          state.electrolyteDate = today;
        }
        // Clear fasts that ran way past their target (safety valve)
        if (state.activeFasting) {
          const elapsed = (Date.now() - state.activeFasting.startTime) / (1000 * 60 * 60);
          if (elapsed > state.activeFasting.targetHours * 2) {
            state.activeFasting = null;
          }
        }
      },
    }
  )
);
