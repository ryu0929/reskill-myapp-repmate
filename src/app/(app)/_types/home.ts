export type GoalSummary = {
  name: string;
  statusLabel: string;
  description: string;
};

export type FitnessAppHomeProps = {
  goal?: GoalSummary | null;
  userName?: string;
};
