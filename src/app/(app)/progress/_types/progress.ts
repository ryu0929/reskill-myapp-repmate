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
  userName?: string;
};
