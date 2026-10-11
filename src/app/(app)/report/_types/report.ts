import type { FormEvent, RefObject } from "react";
import type { ChatMessage } from "@/lib/chat-types";

export const EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト", "ショルダープレス"] as const;

export type Exercise = (typeof EXERCISES)[number];

export type GoalSummary = {
  title: string;
  detail: string;
};

export type ReportScreenProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

export type ReportViewProps = {
  goal?: GoalSummary | null;
  exercise: Exercise;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  showExercisePicker: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
  onInputChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};
