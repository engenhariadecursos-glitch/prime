import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import {
  AppState, DayData, CheckIns, Meal, SetLog,
  FastingSession, ActiveFasting, InBodyMeasurement, ProgressPhoto
} from '../types';
import { SPLIT_ORDER } from '../constants/splits';

const TODAY = () => format(new Date(), 'yyyy-MM-dd');

const DEFAULT_CHECKINS: CheckIns = {
  treino: false, dieta: false, agua: false,
  jejum: false, cardio: false, sono: false, suplementos: false,
};

const DEFAULT_DAY = (date: string): DayData => ({
  date,
  checkins: { ...DEFAULT_CHECKINS },
  meals: [],
  waterMl: 0,
  workoutDone: false,
  splitId: null,
  sets: {},
  weight: null,
  notes: '',
});

export interface Store extends AppState {
  getToday: () => DayData;
  toggleCheckin: (key: keyof CheckIns) => void;
  logSet: (exerciseId: string, setIdx: number, log: SetLog) => void;
  markWorkoutDone: (splitId: string) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  setWater: (ml: number) => void;
  addWater: (ml: number) => void;
  setDayWeight: (weight: number) => void;
  startFasting: (goalHours: number) => void;
  stopFasting: (completed: boolean) => void;
  addInBody: (m: Omit<InBodyMeasurement, 'id'>) => void;
  addPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  removePhoto: (id: string) => void;
  nextSplit: () => void;
  prevSplit: () => void;
  updatePR: (exerciseId: string, weight: number) => void;
  computeStreak: () => number;
  updateGoals: (goals: {
    userName?: string;
    weightGoal?: number;
    calorieGoal?: number;
    proteinGoal?: number;
    waterGoalMl?: number;
  }) => void;
  resetAllData: () => void;
  setOnboardingDone: () => void;
  updateMeal: (mealId: string, updates: Partial<Meal>) => void;
  userName: string;
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      days: {},
      inbody: [
        { id: 1, date: '2026-01-06', weight: 88.7, muscle: 36.1, fatPct: 29.2, bmi: null, visc: null },
        { id: 2, date: '2026-03-09', weight: 84.0, muscle: 37.0, fatPct: 23.1, bmi: 30.1, visc: 8 },
      ],
      currentSplitIdx: 1,
      prs: { benchpress: 70, squat: 80, deadlift: 100, latpull: 60 },
      fastingSessions: [],
      activeFasting: null,
      photos: [],
      waterGoalMl: 3000,
      calorieGoal: 2200,
      proteinGoal: 175,
      weightGoal: 76,
      onboardingDone: true,
      userName: 'Júlio Cezar',

      getToday: () => {
        const d = TODAY();
        return get().days[d] ?? DEFAULT_DAY(d);
      },

      toggleCheckin: (key) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return {
          days: {
            ...s.days,
            [d]: {
              ...day,
              checkins: { ...day.checkins, [key]: !day.checkins[key] },
            },
          },
        };
      }),

      logSet: (exerciseId, setIdx, log) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        const prevSets = day.sets[exerciseId] ?? [];
        const newSets = [...prevSets];
        newSets[setIdx] = log;
        return {
          days: {
            ...s.days,
            [d]: { ...day, sets: { ...day.sets, [exerciseId]: newSets } },
          },
        };
      }),

      markWorkoutDone: (splitId) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        const nextIdx = (SPLIT_ORDER.indexOf(splitId) + 1) % SPLIT_ORDER.length;
        return {
          days: {
            ...s.days,
            [d]: { ...day, workoutDone: true, splitId },
          },
          currentSplitIdx: nextIdx,
        };
      }),

      addMeal: (meal) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return {
          days: { ...s.days, [d]: { ...day, meals: [...day.meals, meal] } },
        };
      }),

      removeMeal: (mealId) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return {
          days: { ...s.days, [d]: { ...day, meals: day.meals.filter((m) => m.id !== mealId) } },
        };
      }),

      setWater: (ml) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return { days: { ...s.days, [d]: { ...day, waterMl: ml } } };
      }),

      addWater: (ml) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return { days: { ...s.days, [d]: { ...day, waterMl: day.waterMl + ml } } };
      }),

      setDayWeight: (weight) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return { days: { ...s.days, [d]: { ...day, weight } } };
      }),

      startFasting: (goalHours) => set({ activeFasting: { startTime: Date.now(), goalHours } }),

      stopFasting: (completed) => set((s) => {
        if (!s.activeFasting) return {};
        const session: FastingSession = {
          id: Date.now().toString(),
          startTime: s.activeFasting.startTime,
          endTime: Date.now(),
          goalHours: s.activeFasting.goalHours,
          completed,
        };
        return {
          fastingSessions: [session, ...s.fastingSessions],
          activeFasting: null,
        };
      }),

      addInBody: (m) => set((s) => ({
        inbody: [...s.inbody, { ...m, id: s.inbody.length + 1 }],
      })),

      addPhoto: (photo) => set((s) => ({
        photos: [{ ...photo, id: Date.now().toString() }, ...s.photos],
      })),

      removePhoto: (id) => set((s) => ({
        photos: s.photos.filter((p) => p.id !== id),
      })),

      nextSplit: () => set((s) => ({
        currentSplitIdx: (s.currentSplitIdx + 1) % SPLIT_ORDER.length,
      })),

      prevSplit: () => set((s) => ({
        currentSplitIdx: (s.currentSplitIdx - 1 + SPLIT_ORDER.length) % SPLIT_ORDER.length,
      })),

      updatePR: (exerciseId, weight) => set((s) => {
        const current = s.prs[exerciseId] ?? 0;
        if (weight > current) {
          return { prs: { ...s.prs, [exerciseId]: weight } };
        }
        return {};
      }),

      computeStreak: () => {
        const { days } = get();
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
          const day = days[d];
          if (day?.workoutDone) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        return streak;
      },

      updateGoals: (goals) => set((s) => ({ ...s, ...goals })),

      resetAllData: () => set({
        days: {},
        fastingSessions: [],
        activeFasting: null,
        photos: [],
        prs: { benchpress: 0, squat: 0, deadlift: 0, latpull: 0 },
        currentSplitIdx: 0,
      }),

      setOnboardingDone: () => set({ onboardingDone: true }),

      updateMeal: (mealId, updates) => set((s) => {
        const d = TODAY();
        const day = s.days[d] ?? DEFAULT_DAY(d);
        return {
          days: {
            ...s.days,
            [d]: {
              ...day,
              meals: day.meals.map((m) => m.id === mealId ? { ...m, ...updates } : m),
            },
          },
        };
      }),
    }),
    {
      name: 'prime-fit-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
