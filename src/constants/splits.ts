export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  lastW: number;
  muscle: string;
  icon?: string;
  restSecs?: number;
}

export interface Split {
  id: string;
  name: string;
  icon: string;
  label: string;
  muscle: string;
  exercises: Exercise[];
}

export const SPLITS: Split[] = [
  {
    id: 'A1',
    name: 'Pernas A',
    icon: '🦵',
    label: 'DIA A',
    muscle: 'Quadríceps · Glúteos · Panturrilha',
    exercises: [
      { id: 'squat', name: 'Agachamento Livre', sets: 4, reps: 8, lastW: 80, muscle: 'Quadríceps', restSecs: 120 },
      { id: 'legpress', name: 'Leg Press 45°', sets: 4, reps: 12, lastW: 150, muscle: 'Quadríceps · Glúteos', restSecs: 90 },
      { id: 'rdl', name: 'Terra Romeno', sets: 4, reps: 10, lastW: 60, muscle: 'Isquiotibiais', restSecs: 90 },
      { id: 'legcurl', name: 'Mesa Flexora', sets: 4, reps: 12, lastW: 40, muscle: 'Isquiotibiais', restSecs: 60 },
      { id: 'hipthrust', name: 'Hip Thrust', sets: 4, reps: 12, lastW: 80, muscle: 'Glúteos', restSecs: 90 },
      { id: 'calf', name: 'Elevação de Panturrilha', sets: 4, reps: 15, lastW: 60, muscle: 'Panturrilha', restSecs: 60 },
    ],
  },
  {
    id: 'B',
    name: 'Peito + Bíceps',
    icon: '💪',
    label: 'DIA B',
    muscle: 'Peito · Bíceps · Ombro Anterior',
    exercises: [
      { id: 'benchpress', name: 'Supino Reto', sets: 4, reps: 8, lastW: 70, muscle: 'Peito', restSecs: 120 },
      { id: 'inclpress', name: 'Supino Inclinado (Halter)', sets: 4, reps: 10, lastW: 24, muscle: 'Peito Superior', restSecs: 90 },
      { id: 'chestfly', name: 'Crucifixo', sets: 4, reps: 12, lastW: 14, muscle: 'Peito', restSecs: 60 },
      { id: 'crossover', name: 'Crossover no Cabo', sets: 4, reps: 15, lastW: 12, muscle: 'Peito', restSecs: 60 },
      { id: 'barbcurl', name: 'Rosca Direta (Barra)', sets: 4, reps: 10, lastW: 30, muscle: 'Bíceps', restSecs: 75 },
      { id: 'hammer', name: 'Rosca Martelo', sets: 4, reps: 12, lastW: 14, muscle: 'Bíceps · Braquial', restSecs: 60 },
      { id: 'conccurl', name: 'Rosca Concentrada', sets: 3, reps: 12, lastW: 12, muscle: 'Bíceps', restSecs: 60 },
      { id: 'scott', name: 'Rosca Scott', sets: 3, reps: 10, lastW: 20, muscle: 'Bíceps', restSecs: 60 },
    ],
  },
  {
    id: 'A2',
    name: 'Pernas B',
    icon: '🦵',
    label: 'DIA A₂',
    muscle: 'Posterior · Glúteos · Isquiotibiais',
    exercises: [
      { id: 'frontsquat', name: 'Agachamento Frontal', sets: 4, reps: 8, lastW: 60, muscle: 'Quadríceps', restSecs: 120 },
      { id: 'hacksquat', name: 'Hack Squat', sets: 4, reps: 10, lastW: 100, muscle: 'Quadríceps', restSecs: 90 },
      { id: 'lunge', name: 'Avanço Caminhando', sets: 4, reps: 12, lastW: 20, muscle: 'Glúteos · Quadríceps', restSecs: 90 },
      { id: 'sldl', name: 'Terra Perna Estendida', sets: 4, reps: 10, lastW: 50, muscle: 'Isquiotibiais', restSecs: 90 },
      { id: 'legext', name: 'Cadeira Extensora', sets: 4, reps: 15, lastW: 50, muscle: 'Quadríceps', restSecs: 60 },
      { id: 'standcalf', name: 'Panturrilha em Pé', sets: 4, reps: 20, lastW: 80, muscle: 'Panturrilha', restSecs: 45 },
    ],
  },
  {
    id: 'C',
    name: 'Costas + Tríceps',
    icon: '🏋️',
    label: 'DIA C',
    muscle: 'Latíssimo · Tríceps · Rombóides',
    exercises: [
      { id: 'latpull', name: 'Puxada Frontal', sets: 4, reps: 10, lastW: 60, muscle: 'Latíssimo', restSecs: 90 },
      { id: 'barbrow', name: 'Remada Curvada (Barra)', sets: 4, reps: 8, lastW: 60, muscle: 'Costas', restSecs: 120 },
      { id: 'cablerow', name: 'Remada Sentado no Cabo', sets: 4, reps: 12, lastW: 55, muscle: 'Costas Média', restSecs: 75 },
      { id: 'deadlift', name: 'Levantamento Terra', sets: 3, reps: 6, lastW: 100, muscle: 'Costas · Posterior', restSecs: 180 },
      { id: 'pushdown', name: 'Tríceps Corda', sets: 4, reps: 12, lastW: 30, muscle: 'Tríceps', restSecs: 60 },
      { id: 'skull', name: 'Tríceps Testa', sets: 4, reps: 10, lastW: 24, muscle: 'Tríceps', restSecs: 75 },
      { id: 'ohtricep', name: 'Extensão Overhead', sets: 3, reps: 12, lastW: 20, muscle: 'Tríceps Longo', restSecs: 60 },
      { id: 'dips', name: 'Mergulho (Tríceps)', sets: 3, reps: 12, lastW: 0, muscle: 'Tríceps', restSecs: 60 },
    ],
  },
];

export const SPLIT_ORDER = ['A1', 'B', 'A2', 'C'];
