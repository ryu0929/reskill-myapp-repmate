import type { FormEvent, RefObject } from "react";
import type { ChatMessage } from "@/lib/chat-types";
import type { TrainingRecordItem } from "@/lib/_types/training-record";

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
  title: string;
  detail: string;
};

export type ReportScreenProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

export type TrainingRecordDraft = {
  weight: string;
  reps: string;
  sets: string;
};

export type RecordDraftCardProps = {
  draft: TrainingRecordDraft;
  isSaving: boolean;
  onChange: (field: keyof TrainingRecordDraft, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export type ReportViewProps = {
  goal?: GoalSummary | null;
  exercise: Exercise;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  isSavingRecord: boolean;
  isDeletingGoal: boolean;
  isGoalDeleteConfirming: boolean;
  isLoadingRecords: boolean;
  isRecordPanelOpen: boolean;
  showExercisePicker: boolean;
  records: TrainingRecordItem[];
  recordDraft: TrainingRecordDraft | null;
  editingRecordId: string | null;
  editWeight: string;
  editReps: string;
  chatAreaRef: RefObject<HTMLDivElement | null>;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
  onInputChange: (value: string) => void;
  onRecordDraftChange: (
    field: keyof TrainingRecordDraft,
    value: string,
  ) => void;
  onSaveRecord: () => void;
  onCancelRecord: () => void;
  onOpenRecordPanel: () => void;
  onCloseRecordPanel: () => void;
  onStartEditRecord: (record: TrainingRecordItem) => void;
  onEditWeightChange: (value: string) => void;
  onEditRepsChange: (value: string) => void;
  onSaveRecordEdit: () => void;
  onCancelRecordEdit: () => void;
  onDeleteRecord: (recordId: string) => void;
  onAddRecord: () => void;
  onRequestGoalDelete: () => void;
  onCancelGoalDelete: () => void;
  onDeleteGoal: () => void;
  onSubmit: (event?: FormEvent) => void;
};

export type ReportSidePanelProps = Pick<
  ReportViewProps,
  | "goal"
  | "records"
  | "isDeletingGoal"
  | "isGoalDeleteConfirming"
  | "isLoadingRecords"
  | "editingRecordId"
  | "editWeight"
  | "editReps"
  | "onStartEditRecord"
  | "onEditWeightChange"
  | "onEditRepsChange"
  | "onSaveRecordEdit"
  | "onCancelRecordEdit"
  | "onDeleteRecord"
  | "onAddRecord"
  | "onRequestGoalDelete"
  | "onCancelGoalDelete"
  | "onDeleteGoal"
>;

export type TrainingRecordListProps = Pick<
  ReportViewProps,
  | "records"
  | "isLoadingRecords"
  | "editingRecordId"
  | "editWeight"
  | "editReps"
  | "onEditWeightChange"
  | "onEditRepsChange"
> & {
  onStartEdit: (record: TrainingRecordItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (recordId: string) => void;
};

export type ReportGoalSectionProps = Pick<
  ReportViewProps,
  | "goal"
  | "isDeletingGoal"
  | "isGoalDeleteConfirming"
  | "onRequestGoalDelete"
  | "onCancelGoalDelete"
  | "onDeleteGoal"
>;

export type UseTrainingRecordsParams = {
  exercise: Exercise;
  showToast: (message: string) => void;
};
