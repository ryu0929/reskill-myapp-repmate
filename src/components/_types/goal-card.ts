import type { ReactNode } from "react";

export type GoalCardProps = {
  exercise: string;
  description: string;
  action?: ReactNode;
  desktop?: boolean;
};
