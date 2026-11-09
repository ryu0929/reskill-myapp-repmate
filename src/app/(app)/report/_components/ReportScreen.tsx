"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ResponsiveScreen } from "@/components/ResponsiveScreen";
import MobileReportView from "./MobileReportView";
import DesktopReportView from "./DesktopReportView";
import Toast from "@/components/Toast";
import useToast from "@/hooks/useToast";
import useReportChat from "../_hooks/useReportChat";
import useReportGoal from "../_hooks/useReportGoal";
import { EXERCISES } from "../_types/report";
import type {
  Exercise,
  ReportScreenProps,
  ReportViewProps,
  TrainingRecordDraft,
} from "../_types/report";
import useTrainingRecords from "../_hooks/useTrainingRecords";

const ReportScreen = ({ goal = null, userName }: ReportScreenProps) => {
  // チャットや画面表示の状態を管理し、モバイル・PCへ共通データを渡す。
  const router = useRouter();
  const defaultExercise =
    EXERCISES.find((item) => item === goal?.exercise) ?? "スクワット";
  const [exercise, setExercise] = useState<Exercise>(defaultExercise);

  const [isSavingRecord, setIsSavingRecord] = useState(false);

  const [isRecordPanelOpen, setIsRecordPanelOpen] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [recordDraft, setRecordDraft] = useState<TrainingRecordDraft | null>(
    null,
  );

  const {
    messages,
    input,
    isSending,
    mobileChatAreaRef,
    desktopChatAreaRef,
    setInput,
    sendMessage,
    resetChat,
  } = useReportChat({
    exercise,
    onRecordParsed: setRecordDraft,
  });

  const { toastMessage, showToast } = useToast();

  const {
    selectedExerciseGoal,
    isDeletingGoal,
    isGoalDeleteConfirming,
    requestGoalDelete,
    cancelGoalDelete,
    deleteGoal,
  } = useReportGoal({
    initialGoal: goal,
    exercise,
    showToast,
  });

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

  const handleExerciseChange = (next: Exercise) => {
    beginLoadingRecords();
    setExercise(next);
    setShowExercisePicker(false);
    resetChat(next);
    setRecordDraft(null);
    cancelRecordEdit();
    cancelGoalDelete();
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
    onRequestGoalDelete: requestGoalDelete,
    onCancelGoalDelete: cancelGoalDelete,
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
