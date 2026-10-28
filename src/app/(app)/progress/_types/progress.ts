export const EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト", "ショルダープレス"] as const;

export type Exercise = (typeof EXERCISES)[number];

export type PersonalBest = {
  label: string;
  date: string;
  value: number;
  highlight?: boolean;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type ProgressData = {
  exercise: Exercise;
  estimatedOneRepMax: number;
  trendRate: number;
  chart: ChartPoint[];
  personalBests: PersonalBest[];
  aiComment: string;
};

export type ProgressScreenProps = {
  data?: ProgressData;
  dataByExercise?: Record<Exercise, ProgressData>;
  userName?: string;
};

export type ExerciseSelectorProps = {
  exercise: Exercise;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (exercise: Exercise) => void;
  desktop?: boolean;
};

export type OneRepMaxCardProps = {
  estimatedOneRepMax: number;
  trendRate: number;
  desktop?: boolean;
};

export type ProgressViewProps = {
  data: ProgressData;
  exercise: Exercise;
  showExercisePicker: boolean;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
};
