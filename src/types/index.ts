export interface CheckIns {
  treino: boolean;
  dieta: boolean;
  agua: boolean;
  jejum: boolean;
  cardio: boolean;
  sono: boolean;
  suplementos: boolean;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  isCheat: boolean;
}

export interface SetLog {
  weight: number;
  reps: number;
  done: boolean;
}

export interface DayData {
  date: string;
  checkins: CheckIns;
  meals: Meal[];
  waterMl: number;
  workoutDone: boolean;
  splitId: string | null;
  sets: Record<string, SetLog[]>;
  weight: number | null;
  notes: string;
}

export interface FastingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  goalHours: number;
  completed: boolean;
}

export interface ActiveFasting {
  startTime: number;
  goalHours: number;
  notificationId?: string;
}

export interface InBodyMeasurement {
  id: number;
  date: string;
  weight: number;
  muscle: number;
  fatPct: number;
  bmi: number | null;
  visc: number | null;
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  type: 'front' | 'side' | 'back';
  weight: number | null;
}

export interface AppState {
  userName: string;
  days: Record<string, DayData>;
  inbody: InBodyMeasurement[];
  currentSplitIdx: number;
  prs: Record<string, number>;
  fastingSessions: FastingSession[];
  activeFasting: ActiveFasting | null;
  photos: ProgressPhoto[];
  waterGoalMl: number;
  calorieGoal: number;
  proteinGoal: number;
  weightGoal: number;
  onboardingDone: boolean;
}

export type CheckInKey = keyof CheckIns;
