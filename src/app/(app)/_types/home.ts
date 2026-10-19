export type GoalSummary = {
  name: string;
  statusLabel: string;
  description: string;
};

export type GrowthReportSummary = {
  exercise: string;
  estimatedOneRepMax: number;
  trendRate: number;
  chart: Array<{
    label: string;
    value: number;
  }>;
};

export type FitnessAppHomeProps = {
  goal?: GoalSummary | null;
  growthReport?: GrowthReportSummary | null;
  userName?: string;
};
