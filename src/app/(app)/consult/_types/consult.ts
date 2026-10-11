import type { FormEvent, RefObject } from "react";
import type { ChatMessage } from "@/lib/chat-types";

export const EXERCISES = ["ベンチプレス", "スクワット", "デッドリフト", "ショルダープレス"] as const;

export type Exercise = (typeof EXERCISES)[number];

export type GoalSummary = {
  name: string;
  statusLabel: string;
  description: string;
};

export type ConsultScreenProps = {
  goal?: GoalSummary | null;
  userName?: string;
};

export type ConsultViewProps = {
  exercise: Exercise;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  showExercisePicker: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
  goal?: GoalSummary | null;
  onExerciseToggle: () => void;
  onExerciseChange: (exercise: Exercise) => void;
  onInputChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
};
