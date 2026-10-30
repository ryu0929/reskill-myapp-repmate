import type { FormEvent, RefObject } from "react";
import type { ChatMessage } from "@/lib/chat-types";

export const EXERCISES = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "ショルダープレス",
] as const;

export type Exercise = (typeof EXERCISES)[number];

export type GoalSummary = {
  id: string;
  exercise: string;
  name: string;
  statusLabel: string;
  description: string;
};

export type GoalProposal = {
  id: string;
  title: string;
  description: string;
};

export type ConsultScreenProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

export type ExerciseSelectorProps = {
  exercise: Exercise;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (exercise: Exercise) => void;
  desktop?: boolean;
};

export type GoalProposalCardProps = {
  proposal: GoalProposal;
  selected: boolean;
  onSelect: () => void;
};

export type GoalChangeActionsProps = {
  onChangeGoal: () => void;
  onRestartConsultation: () => void;
  compact?: boolean;
};

export type ConfiguredGoalViewProps = {
  goal: GoalSummary;
  isDeletingGoal: boolean;
  isGoalDeleteConfirming: boolean;
  onChangeGoal: () => void;
  onRestartConsultation: () => void;
  onRequestGoalDelete: () => void;
  onCancelGoalDelete: () => void;
  onDeleteGoal: () => void;
  desktop?: boolean;
};

export type ConsultViewProps = {
  exercise: Exercise;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  showExercisePicker: boolean;
  chatAreaRef: RefObject<HTMLDivElement | null>;
  goal?: GoalSummary | null;
  proposals: GoalProposal[];
  selectedProposalId: string | null;
  isGeneratingGoals: boolean;
  isSavingGoal: boolean;
  isDeletingGoal: boolean;
  isGoalDeleteConfirming: boolean;
  isChangingGoal: boolean;
  isReconsulting: boolean;
  isGoalComposerOpen: boolean;
  canGenerateGoals: boolean;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
  onInputChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
  onGenerateGoals: () => void;
  onSelectGoal: (proposalId: string) => void;
  onSaveGoal: () => void;
  onChangeGoal: () => void;
  onRestartConsultation: () => void;
  onRequestGoalDelete: () => void;
  onCancelGoalDelete: () => void;
  onDeleteGoal: () => void;
  onCloseGoalComposer: () => void;
};

export type GoalComposerContentProps = Pick<
  ConsultViewProps,
  | "goal"
  | "proposals"
  | "selectedProposalId"
  | "isGeneratingGoals"
  | "isSavingGoal"
  | "isDeletingGoal"
  | "isGoalDeleteConfirming"
  | "isChangingGoal"
  | "isReconsulting"
  | "canGenerateGoals"
  | "onGenerateGoals"
  | "onSelectGoal"
  | "onSaveGoal"
  | "onChangeGoal"
  | "onRestartConsultation"
  | "onRequestGoalDelete"
  | "onCancelGoalDelete"
  | "onDeleteGoal"
>;
