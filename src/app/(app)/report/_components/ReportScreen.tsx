"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import MobileReportView from "./MobileReportView";
import DesktopReportView from "./DesktopReportView";
import Toast from "@/components/Toast";
import useToast from "@/hooks/useToast";
import type { ChatMessage } from "@/lib/chat-types";
import { EXERCISES } from "../_types/report";
import type {
  Exercise,
  GoalSummary,
  ReportScreenProps,
  ReportViewProps,
  TrainingRecordDraft,
} from "../_types/report";
import useTrainingRecords from "../_hooks/useTrainingRecords";

const createId = () => crypto.randomUUID();

const parseTrainingRecord = (message: string): TrainingRecordDraft | null => {
  // 「60kg 10回 3セット」のような文章から、確認カード用の数値を取り出す。
  const weight = message.match(/(\d+(?:\.\d+)?)\s*kg/i)?.[1];
  const reps = message.match(/(\d+)\s*(?:回|レップ(?:ス)?)/)?.[1];
  const sets = message.match(/(\d+)\s*セット(?!目)/)?.[1] ?? "1";

  return weight && reps ? { weight, reps, sets } : null;
};

const welcomeMessage = (exercise: string): ChatMessage => ({
  id: createId(),
  role: "assistant",
  content: `${exercise}のトレーニングを記録しましょう！セットごとに重量とレップス数を教えてください。`,
  createdAt: new Date().toISOString(),
});

const ReportScreen = ({ goal = null, userName }: ReportScreenProps) => {
  // チャットや画面表示の状態を管理し、モバイル・PCへ共通データを渡す。
  const router = useRouter();
  const defaultExercise =
    EXERCISES.find((item) => item === goal?.exercise) ?? "スクワット";
  const [exercise, setExercise] = useState<Exercise>(defaultExercise);
  const [activeGoal, setActiveGoal] = useState<GoalSummary | null>(goal);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    welcomeMessage(defaultExercise),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isGoalDeleteConfirming, setIsGoalDeleteConfirming] = useState(false);
  const [isRecordPanelOpen, setIsRecordPanelOpen] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [recordDraft, setRecordDraft] = useState<TrainingRecordDraft | null>(
    null,
  );

  const { toastMessage, showToast } = useToast();
  const {
    records,
    isLoadingRecords,
    editingRecordId,
    editWeight,
    editReps,
    beginLoadingRecords,
    loadRecords,
    startEditRecord,
    setEditWeight,
    setEditReps,
    saveRecordEdit,
    cancelRecordEdit,
    deleteRecord,
  } = useTrainingRecords({
    exercise,
    showToast,
  });
  const mobileChatAreaRef = useRef<HTMLDivElement>(null);
  const desktopChatAreaRef = useRef<HTMLDivElement>(null);

  const apiMessages = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    const scrollChatToBottom = (element: HTMLDivElement | null) => {
      element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    };

    scrollChatToBottom(mobileChatAreaRef.current);
    scrollChatToBottom(desktopChatAreaRef.current);
  }, [messages, isSending]);

  // AIへの報告と、正規表現による記録候補の作成を同時に行う。
  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    const parsedRecord = parseTrainingRecord(trimmed);
    if (parsedRecord) {
      setRecordDraft(parsedRecord);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          mode: "report",
          messages: [
            ...apiMessages,
            { role: "user" as const, content: trimmed },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Chat API failed");
      }

      const data = (await response.json()) as { reply: string };
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          "申し訳ありません。応答の取得に失敗しました。しばらくしてからもう一度お試しください。",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleExerciseChange = (next: Exercise) => {
    beginLoadingRecords();
    setExercise(next);
    setShowExercisePicker(false);
    setMessages([welcomeMessage(next)]);
    setInput("");
    setRecordDraft(null);
    cancelRecordEdit();
    setIsGoalDeleteConfirming(false);
  };

  const handleRecordDraftChange = (
    field: keyof TrainingRecordDraft,
    value: string,
  ) => {
    setRecordDraft((current) =>
      current ? { ...current, [field]: value } : current,
    );
  };

  // 確認カードの文字列を数値へ変換してから保存APIへ送る。
  const saveRecord = async () => {
    if (!recordDraft || isSavingRecord) return;

    const weight = Number(recordDraft.weight);
    const reps = Number(recordDraft.reps);
    const sets = Number(recordDraft.sets);
    if (!weight || !reps || !sets) {
      showToast("重量・回数・セット数を確認してください");
      return;
    }

    setIsSavingRecord(true);
    try {
      const response = await fetch("/api/training-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise, weight, reps, sets }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "記録を保存できませんでした");
      }

      setRecordDraft(null);
      await loadRecords(exercise);
      setIsRecordPanelOpen(true);
      showToast("トレーニングを記録しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "記録を保存できませんでした",
      );
    } finally {
      setIsSavingRecord(false);
    }
  };

  // 直前セットの値を引き継ぎ、1セット分の確認カードを開く。
  const addRecord = () => {
    const latestRecord = records[records.length - 1];
    if (!latestRecord) return;

    cancelRecordEdit();
    setRecordDraft({
      weight: String(latestRecord.weight),
      reps: String(latestRecord.reps),
      sets: "1",
    });
    setIsRecordPanelOpen(false);
  };

  // 表示中の目標を論理削除し、画面からもすぐに取り除く。
  const deleteGoal = async () => {
    if (!activeGoal || isDeletingGoal) return;

    setIsDeletingGoal(true);
    try {
      const response = await fetch(`/api/goals/${activeGoal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "目標を削除できませんでした");
      }

      setActiveGoal(null);
      setIsGoalDeleteConfirming(false);
      showToast("目標を削除しました");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "目標を削除できませんでした",
      );
    } finally {
      setIsDeletingGoal(false);
    }
  };

  const selectedExerciseGoal =
    activeGoal?.exercise === exercise ? activeGoal : null;

  // refだけは画面ごとに異なるため、それ以外を共通Propsとしてまとめる。
  const viewProps: Omit<ReportViewProps, "chatAreaRef"> = {
    goal: selectedExerciseGoal,
    exercise,
    messages,
    input,
    isSending,
    isSavingRecord,
    isDeletingGoal,
    isGoalDeleteConfirming,
    isLoadingRecords,
    isRecordPanelOpen,
    showExercisePicker,
    records,
    recordDraft,
    editingRecordId,
    editWeight,
    editReps,
    onExerciseToggle: () => setShowExercisePicker((open) => !open),
    onExerciseChange: handleExerciseChange,
    onInputChange: setInput,
    onRecordDraftChange: handleRecordDraftChange,
    onSaveRecord: saveRecord,
    onCancelRecord: () => setRecordDraft(null),
    onOpenRecordPanel: () => setIsRecordPanelOpen(true),
    onCloseRecordPanel: () => setIsRecordPanelOpen(false),
    onStartEditRecord: startEditRecord,
    onEditWeightChange: setEditWeight,
    onEditRepsChange: setEditReps,
    onSaveRecordEdit: saveRecordEdit,
    onCancelRecordEdit: cancelRecordEdit,
    onDeleteRecord: deleteRecord,
    onAddRecord: addRecord,
    onRequestGoalDelete: () => setIsGoalDeleteConfirming(true),
    onCancelGoalDelete: () => setIsGoalDeleteConfirming(false),
    onDeleteGoal: deleteGoal,
    onSubmit: sendMessage,
  };

  return (
    <>
      <ResponsiveScreen
        userName={userName}
        mobile={
          <MobileReportView {...viewProps} chatAreaRef={mobileChatAreaRef} />
        }
        desktop={
          <DesktopReportView {...viewProps} chatAreaRef={desktopChatAreaRef} />
        }
      />
      <Toast message={toastMessage} />
    </>
  );
};

export default ReportScreen;
