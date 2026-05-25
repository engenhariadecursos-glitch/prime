import { create } from 'zustand';

export type FastingPreset = 12 | 16 | 18 | 24 | 36 | 48 | 72 | 96 | 120;

export interface FastingSession {
  id: string;
  startTime: number;
  targetHours: FastingPreset;
  endTime?: number;
  completed: boolean;
}

export interface FastingPhase {
  id: string;
  name: string;
  description: string;
  startHour: number;
  endHour: number;
  color: string[];
  icon: string;
}

export const FASTING_PHASES: FastingPhase[] = [
  {
    id: 'glycogen',
    name: 'Queima de Glicogênio',
    description: 'Seu corpo está usando os estoques de açúcar como energia principal.',
    startHour: 0,
    endHour: 12,
    color: ['#FF9500', '#FF6B35'],
    icon: '🔥',
  },
  {
    id: 'light_ketosis',
    name: 'Cetose Leve',
    description: 'O fígado começa a produzir corpos cetônicos. A gordura vira combustível.',
    startHour: 12,
    endHour: 18,
    color: ['#FF6B35', '#C9A84C'],
    icon: '⚡',
  },
  {
    id: 'deep_ketosis',
    name: 'Cetose Profunda',
    description: 'Cetose máxima ativa. Queima de gordura acelerada e clareza mental.',
    startHour: 18,
    endHour: 36,
    color: ['#7C4DFF', '#5B2FFF'],
    icon: '💜',
  },
  {
    id: 'autophagy',
    name: 'Autofagia',
    description: 'Células se renovam. Processo de limpeza celular profunda ativado.',
    startHour: 36,
    endHour: 72,
    color: ['#00D4AA', '#007AFF'],
    icon: '🔄',
  },
  {
    id: 'mental_peak',
    name: 'Pico de Foco Mental',
    description: 'Clareza cognitiva máxima. Norepinefrina e BDNF elevados.',
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
  totalPages?: number;
  downloadUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  duration: string;
  level: string;
  category: string;
  isPremium: boolean;
  exercises: number;
}

export interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;

  // User
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;

  // Fasting
  activeFasting: FastingSession | null;
  fastingHistory: FastingSession[];
  startFasting: (hours: FastingPreset) => void;
  stopFasting: () => void;
  getCurrentPhase: () => FastingPhase | null;

  // Hydration
  hydrationToday: number;
  logHydration: (ml: number) => void;

  // Premium
  isPremium: boolean;
  trialDaysLeft: number;
  setPremium: (v: boolean, type?: 'monthly' | 'annual') => void;

  // UI
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),

  user: null,
  setUser: (u) => set({ user: u }),

  activeFasting: null,
  fastingHistory: [],
  startFasting: (hours) => {
    const session: FastingSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      targetHours: hours,
      completed: false,
    };
    set({ activeFasting: session });
  },
  stopFasting: () => {
    const { activeFasting, fastingHistory } = get();
    if (activeFasting) {
      const completed = {
        ...activeFasting,
        endTime: Date.now(),
        completed: true,
      };
      set({
        activeFasting: null,
        fastingHistory: [completed, ...fastingHistory],
      });
    }
  },
  getCurrentPhase: () => {
    const { activeFasting } = get();
    if (!activeFasting) return null;
    const elapsed = (Date.now() - activeFasting.startTime) / (1000 * 60 * 60);
    return (
      FASTING_PHASES.find(
        (p) => elapsed >= p.startHour && elapsed < p.endHour
      ) || FASTING_PHASES[FASTING_PHASES.length - 1]
    );
  },

  hydrationToday: 0,
  logHydration: (ml) => set((s) => ({ hydrationToday: s.hydrationToday + ml })),

  isPremium: false,
  trialDaysLeft: 5,
  setPremium: (v, type) =>
    set((s) => ({
      isPremium: v,
      user: s.user
        ? { ...s.user, isPremium: v, subscriptionType: type }
        : null,
    })),

  selectedTab: 'Home',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
